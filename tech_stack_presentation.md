# 🚀 NYX Engine: Tech Stack Overview

This document explains how the NYX application works in simple terms, perfect for presenting to stakeholders or non-technical audiences.

---

## 1. The "Face" (Frontend)
**What the user sees and interacts with.**

*   **Next.js & React:** The core framework. Think of this as the chassis of the car—it holds everything together and makes the app fast and responsive.
*   **Tailwind CSS:** The styling engine. It ensures the app looks modern, beautiful, and works perfectly on mobile phones and laptops.
*   **Framer Motion & GSAP:** The animation tools. They add the "wow" factor with smooth transitions and effects.

## 2. The "Brain" (AI & Logic)
**How the app thinks and creates content.**

*   **Google Gemini AI:** The creative director.
    *   It analyzes Instagram profiles to understand a brand's "vibe."
    *   It brainstorms viral video ideas.
    *   It writes the actual scripts for the videos.
*   **Node.js Scraper:** The researcher.
    *   It visits Instagram profiles to gather public data (posts, captions) so the AI has something to analyze.

## 3. The "Production Studio" (Video Generation)
**How the final video is made.**

*   **HeyGen API:** The video production team.
    *   It takes the script and an "Avatar ID" and generates a realistic video of a person speaking.
*   **ElevenLabs:** The voice actor.
    *   It provides ultra-realistic AI voices that sound just like a real human, not a robot.

## 4. The "Memory" & Security
**How data is saved and protected.**

*   **LocalStorage:** The short-term memory.
    *   It saves your analysis, scripts, and settings directly in your browser so you don't lose your work if you refresh the page.
*   **NextAuth.js:** The bouncer.
    *   It handles user login and security, ensuring only authorized users can access the dashboard.

## 5. The "Home" (Deployment)
**Where the app lives on the internet.**

*   **Vercel:** The host.
    *   It puts the application on the internet so anyone with the link can access it from anywhere in the world. It ensures the site is fast and always online.

---

### 🔄 How It All Flows Together

1.  **User** enters an Instagram username.
2.  **Scraper** grabs the posts.
3.  **Gemini AI** analyzes the posts and suggests a "Niche" and "Video Ideas."
4.  **User** picks an idea, and **Gemini** writes a script.
5.  **User** clicks "Generate," and **HeyGen** (with **ElevenLabs**) turns that text into a video.
6.  **Vercel** delivers the final video back to the user's screen.
