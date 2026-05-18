/**
 * One-time data migration: NYX monorepo DB  →  standalone NYX Automate DB.
 *
 * Copies the Automate-owned slice of the current database into the new
 * Automate Postgres. "Automate users" = every User whose email is NOT a
 * BrandPartner or PortalViewer (i.e. keep signup accounts, drop the people
 * who only exist for the brand-partner portal).
 *
 * Runs against the NYX (full-schema) Prisma client for BOTH connections —
 * the target DB is a strict subset of tables, and we only ever write to
 * tables that exist there.
 *
 *   Dry run (default, no writes):
 *     SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... npx tsx scripts/migrate-automate-to-standalone.ts
 *
 *   Execute:
 *     SOURCE_DATABASE_URL=... TARGET_DATABASE_URL=... npx tsx scripts/migrate-automate-to-standalone.ts --execute
 *
 * SOURCE_DATABASE_URL defaults to DATABASE_URL if unset.
 * Idempotent: re-running skips rows already present (createMany skipDuplicates).
 */
import { PrismaClient } from '@prisma/client';

const SOURCE_URL = process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const TARGET_URL = process.env.TARGET_DATABASE_URL;
const EXECUTE = process.argv.includes('--execute');

if (!SOURCE_URL) throw new Error('SOURCE_DATABASE_URL (or DATABASE_URL) is required');
if (!TARGET_URL) throw new Error('TARGET_DATABASE_URL is required');
if (SOURCE_URL === TARGET_URL) throw new Error('SOURCE and TARGET must be different databases');

const source = new PrismaClient({ datasources: { db: { url: SOURCE_URL } } });
const target = new PrismaClient({ datasources: { db: { url: TARGET_URL } } });

const log = (...a: unknown[]) => console.log(...a);

async function main() {
  log(`\n=== Automate data migration  (${EXECUTE ? 'EXECUTE' : 'DRY RUN'}) ===\n`);

  // 1. Portal-email exclusion set ------------------------------------------------
  const [partners, viewers] = await Promise.all([
    source.brandPartner.findMany({ select: { email: true } }),
    source.portalViewer.findMany({ select: { email: true } }),
  ]);
  const portalEmails = new Set(
    [...partners, ...viewers].map((r) => r.email.toLowerCase()),
  );

  // 2. Partition users -----------------------------------------------------------
  const allUsers = await source.user.findMany();
  const automateUsers = allUsers.filter(
    (u) => !portalEmails.has(u.email.toLowerCase()),
  );
  const userIds = new Set(automateUsers.map((u) => u.id));

  // 3. Owned child rows ----------------------------------------------------------
  const [accounts, sessions, subscriptions, scriptsAll, videosAll] =
    await Promise.all([
      source.account.findMany({ where: { userId: { in: [...userIds] } } }),
      source.session.findMany({ where: { userId: { in: [...userIds] } } }),
      source.subscription.findMany({ where: { userId: { in: [...userIds] } } }),
      source.script.findMany({ where: { userId: { in: [...userIds] } } }),
      source.video.findMany({ where: { userId: { in: [...userIds] } } }),
    ]);

  // Guard: a video whose scriptId points at a non-migrated script gets nulled.
  const scriptIds = new Set(scriptsAll.map((s) => s.id));
  const videos = videosAll.map((v) =>
    v.scriptId && !scriptIds.has(v.scriptId) ? { ...v, scriptId: null } : v,
  );
  const orphanedVideoRefs = videosAll.length - videos.filter((v) => v.scriptId).length
    - videosAll.filter((v) => !v.scriptId).length;

  // 4. Global tables (no user FK) ------------------------------------------------
  const [tiers, gates, auditLogs, revokedTokens, loginAttempts, verificationTokens] =
    await Promise.all([
      source.tier.findMany(),
      source.featureGate.findMany(),
      source.auditLog.findMany(),
      source.revokedToken.findMany(),
      source.loginAttempt.findMany(),
      source.verificationToken.findMany(),
    ]);

  // 5. Report --------------------------------------------------------------------
  log('Source database:');
  log(`  users total ............ ${allUsers.length}`);
  log(`  portal emails excluded . ${portalEmails.size}`);
  log('');
  log('To migrate:');
  log(`  User ................... ${automateUsers.length}`);
  log(`  Account ................ ${accounts.length}`);
  log(`  Session ................ ${sessions.length}`);
  log(`  Subscription ........... ${subscriptions.length}`);
  log(`  Script ................. ${scriptsAll.length}`);
  log(`  Video .................. ${videos.length}` +
      (orphanedVideoRefs > 0 ? `  (${orphanedVideoRefs} had a cross-owner scriptId → nulled)` : ''));
  log(`  Tier ................... ${tiers.length}`);
  log(`  FeatureGate ............ ${gates.length}`);
  log(`  AuditLog ............... ${auditLogs.length}`);
  log(`  RevokedToken ........... ${revokedTokens.length}`);
  log(`  LoginAttempt ........... ${loginAttempts.length}`);
  log(`  VerificationToken ...... ${verificationTokens.length}`);
  log('');

  if (!EXECUTE) {
    log('Dry run — no writes. Re-run with --execute to apply.\n');
    return;
  }

  // 6. Write in FK-safe order ----------------------------------------------------
  const insert = async (name: string, fn: () => Promise<{ count: number }>) => {
    const { count } = await fn();
    log(`  ${name.padEnd(20, '.')} inserted ${count}`);
  };

  log('Writing to target...');
  await insert('User', () =>
    target.user.createMany({ data: automateUsers, skipDuplicates: true }));
  await insert('Account', () =>
    target.account.createMany({ data: accounts, skipDuplicates: true }));
  await insert('Session', () =>
    target.session.createMany({ data: sessions, skipDuplicates: true }));
  await insert('Subscription', () =>
    target.subscription.createMany({ data: subscriptions, skipDuplicates: true }));
  await insert('Script', () =>
    target.script.createMany({ data: scriptsAll, skipDuplicates: true }));
  await insert('Video', () =>
    target.video.createMany({ data: videos, skipDuplicates: true }));
  await insert('Tier', () =>
    target.tier.createMany({ data: tiers, skipDuplicates: true }));
  await insert('FeatureGate', () =>
    target.featureGate.createMany({ data: gates, skipDuplicates: true }));
  await insert('AuditLog', () =>
    target.auditLog.createMany({ data: auditLogs, skipDuplicates: true }));
  await insert('RevokedToken', () =>
    target.revokedToken.createMany({ data: revokedTokens, skipDuplicates: true }));
  await insert('LoginAttempt', () =>
    target.loginAttempt.createMany({ data: loginAttempts, skipDuplicates: true }));
  await insert('VerificationToken', () =>
    target.verificationToken.createMany({ data: verificationTokens, skipDuplicates: true }));

  log('\nMigration complete.\n');
}

main()
  .catch((e) => {
    console.error('\nMigration failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
