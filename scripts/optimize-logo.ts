/**
 * One-shot: shrink the comically large NYX logo so it loads instantly.
 * Original: 8000×8000 px / 2.66 MB PNG (used at 32–48 px in the UI).
 * Output:   512×512 PNG, ~30–60 KB, plus a 64×64 favicon-friendly variant.
 *
 * Run:  npx tsx scripts/optimize-logo.ts
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'public/logo/NYX-Logo.png')
const BACKUP = path.join(ROOT, 'public/logo/NYX-Logo-original.png')
const OUT_512 = path.join(ROOT, 'public/logo/NYX-Logo.png') // overwrite in place
const OUT_64 = path.join(ROOT, 'public/logo/NYX-Logo-64.png') // small variant if ever needed

async function main() {
    const stat = await fs.stat(SRC)
    console.log(
        `Source: ${SRC}\n  ${(stat.size / 1024 / 1024).toFixed(2)} MB`,
    )

    // Backup the original (idempotent — skip if already backed up)
    try {
        await fs.access(BACKUP)
        console.log('Backup already exists — skipping.')
    } catch {
        await fs.copyFile(SRC, BACKUP)
        console.log(`Backed up to ${BACKUP}`)
    }

    // 512×512 — comfortably retina-quality at 64 px CSS rendering.
    const buf512 = await sharp(BACKUP)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: false })
        .toBuffer()
    await fs.writeFile(OUT_512, buf512)
    console.log(
        `Wrote ${OUT_512}\n  ${(buf512.length / 1024).toFixed(1)} KB (was ${(stat.size / 1024 / 1024).toFixed(2)} MB)`,
    )

    // 64×64 favicon-friendly
    const buf64 = await sharp(BACKUP)
        .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toBuffer()
    await fs.writeFile(OUT_64, buf64)
    console.log(
        `Wrote ${OUT_64}\n  ${(buf64.length / 1024).toFixed(1)} KB`,
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
