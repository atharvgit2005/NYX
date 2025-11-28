# Setup Guide: Avatar & Voice

## 1. HeyGen Avatar ID
To generate videos with your digital twin, you need a **HeyGen Avatar ID**.

### How to get it:
1.  Log in to your [HeyGen](https://app.heygen.com/) account.
2.  Go to **Avatars** > **My Avatars**.
3.  Click on the avatar you want to use.
4.  Look at the URL in your browser address bar. It will look like this:
    `https://app.heygen.com/avatars/2d5b0e6cf361460aa7fc47e3cee4b35c`
5.  Copy the long string of characters at the end (e.g., `2d5b0e6cf361460aa7fc47e3cee4b35c`).
6.  Paste this ID into the **HeyGen Avatar** box in your dashboard.

> **Note:** If you don't have a custom avatar, you can use a public avatar ID.
> Example Public ID: `2d5b0e6cf361460aa7fc47e3cee4b35c` (Monica)

---

## 2. ElevenLabs Voice Cloning
To make the avatar sound like you, you need to clone your voice using **ElevenLabs**.

### How to do it:
1.  **Record Audio:** Record yourself speaking clearly for about **1-2 minutes**.
    -   Read a book passage or a news article.
    -   Avoid background noise.
    -   Save the file as **MP3** or **WAV**.
2.  **Upload to Dashboard:**
    -   Go to the **Avatar** page in your dashboard.
    -   Click the **"Click to upload"** box under "Instant Voice Clone".
    -   Select your audio file.
    -   Click **"Clone Voice Now"**.
3.  **Wait:** The system will upload your audio to ElevenLabs and create a new voice.
4.  **Success:** Once done, your **Voice ID** will be saved automatically.

### Troubleshooting "Invalid UID" Error
If you see an error like `invalid_uid` or `401 Unauthorized`:
1.  Check your `.env.local` file.
2.  Ensure `ELEVENLABS_API_KEY` is correct.
3.  Ensure `HEYGEN_API_KEY` is correct.
4.  If you are using a free trial, you might have run out of credits.
