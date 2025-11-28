# Deploying NYX to Vercel

Since you have pushed your code to GitHub, deploying to Vercel is very easy.

## 1. Import Project
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** > **"Project"**.
3.  Select **"Import"** next to your `NYX` repository.

## 2. Configure Environment Variables
You **MUST** add these environment variables during the import process (or in Settings > Environment Variables later) for the app to work.

| Variable Name | Value |
| :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `HEYGEN_API_KEY` | Your HeyGen API Key |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API Key |
| `NEXTAUTH_SECRET` | Generate a random string (e.g., `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://nyx-engine.vercel.app`) |

> **Note:** For `NEXTAUTH_URL`, you can set it to `http://localhost:3000` for local development, but on Vercel, it should match your deployment domain. Vercel automatically handles this for many deployments, but setting it ensures stability.

## 3. Deploy
1.  Click **"Deploy"**.
2.  Wait for the build to complete.
3.  Your app will be live! 🚀
