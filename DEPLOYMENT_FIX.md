# Vercel Deployment & Database Fixes

## 1. Database Configuration (CRITICAL)
Your project was using SQLite (`prisma/dev.db`), which **does not work on Vercel** because Vercel uses ephemeral serverless functions. The file system is reset after every request/deployment.

**Action Required:**
1.  **Create a Postgres Database**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Navigate to your Project > Storage.
    *   Click "Create Database" and select **Vercel Postgres** (or use Neon/Supabase).
    *   Follow the setup steps.
2.  **Get Configuration**:
    *   Once created, Vercel will automatically add environment variables like `POSTGRES_PRISMA_URL` or `DATABASE_URL` to your project settings.
    *   **Ensure** you have an environment variable named `DATABASE_URL` in your Vercel Project Settings > Environment Variables. If Vercel gives you `POSTGRES_PRISMA_URL`, create a new variable `DATABASE_URL` and paste the same value there.
    *   **Supabase Optimization**: If using Supabase, use the **Transaction Pooler (port 6543)** for `DATABASE_URL` and add a new variable `DIRECT_URL` with the **Session Pooler (port 5432)** string for migrations. Update `schema.prisma` to use `directUrl = env("DIRECT_URL")`.

## 2. Google Authentication Fixes
"Google signup not working" is usually due to missing configuration in Production.

**Action Required:**
1.  **Vercel Environment Variables**:
    *   Go to Vercel Project Settings > Environment Variables.
    *   Add `GOOGLE_CLIENT_ID` (copy from your `.env.local`).
    *   Add `GOOGLE_CLIENT_SECRET` (copy from your `.env.local`).
    *   Add `NEXTAUTH_SECRET` (Generate a random string, e.g., `openssl rand -base64 32`).
    *   Add `NEXTAUTH_URL` (Set this to your Vercel domain, e.g., `https://nyx-app.vercel.app`).
2.  **Google Cloud Console**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Select your project.
    *   Go to **APIs & Services > Credentials**.
    *   Edit your "OAuth 2.0 Client ID".
    *   Under **Authorized redirect URIs**, add your **production** callback URL.
    *   Add: `https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/auth/callback/google`
    *   (Replace `<YOUR-VERCEL-DOMAIN>` with your actual app name).

## 3. Redeploy
1.  Push these changes to GitHub (I will do this for you).
2.  Vercel will trigger a new build.
3.  During the build, `prisma generate` will run and detect the new PostgreSQL provider.

## 4. Database Push
After connecting Vercel Postgres, you might need to push your schema structure to the new production database.
Since you can't run terminal commands on Vercel directly for this, usually the build command handles generation, but creating tables happens once.
You can run this locally strictly if you have the production connection string:
`DATABASE_URL="postgres://..." npx prisma db push`
OR enable "Automatically migrate" in Vercel if available, or use the Vercel CLI.
