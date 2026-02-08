# 🛠️ NYX Engine: Technical Stack Documentation

This document outlines the technical architecture, libraries, and tools used in the **NYX Engine** application.

## 1. Frontend Architecture

The user interface is built for performance, interactivity, and a premium aesthetic using modern web technologies.

*   **Framework**: [Next.js](https://nextjs.org/) (React 19) - Used for server-side rendering, routing, and API handling.
*   **Language**: **TypeScript** - Ensures type safety and better developer experience.
*   **Styling**: **Tailwind CSS** - Utility-first CSS framework for rapid and responsive UI development. (Note: Ensure dependencies are correctly installed).
*   **3D & Graphics**:
    *   **Three.js**: Core 3D library.
    *   **React Three Fiber**: React renderer for Three.js.
    *   **React Three Drei**: Useful helpers for React Three Fiber.
*   **Animations**:
    *   **GSAP (GreenSock Animation Platform)**: For high-performance, complex animations.
*   **Icons**: **Lucide React** - Clean, consistent icon set.

## 2. Backend & Database

The backend is integrated via Next.js API routes, managing data persistence, authentication, and external service orchestration.

*   **Runtime**: **Node.js** (Serverless Functions via Next.js).
*   **Database**: **PostgreSQL** - Relational database for storing users, scripts, and video metadata.
*   **ORM**: **Prisma** - Type-safe database client for schema management and queries.
*   **Authentication**:
    *   **NextAuth.js**: Handles secure user sessions and authentication flows.
    *   **Bcryptjs**: Used for secure password hashing.

## 3. AI & External Services

The core intelligence and content generation capabilities are powered by industry-leading AI models and APIs.

*   **Generative AI**:
    *   **Google Gemini AI (`@google/generative-ai`)**: Primary engine for content analysis, ideation, and scriptwriting.
    *   **OpenAI**: Available as a secondary/fallback AI provider.
*   **Data Acquisition (Scraping)**:
    *   **`@aduptive/instagram-scraper`**: Specialized library for fetching Instagram data.
    *   **Cheerio**: HTML parsing for general scraping needs.
    *   **Axios**: HTTP client for making API requests.
*   **Media Generation**:
    *   **HeyGen API**: Used for generating AI-powered avatar videos from text scripts.
    *   **ElevenLabs**: utilizied for high-quality, realistic voice synthesis (Text-to-Speech).

## 4. Infrastructure & Deployment

*   **Platform**: **Vercel** - Optimized hosting for Next.js applications, providing serverless infrastructure and edge caching.
*   **Configuration**: `vercel.json` manages deployment settings and build configurations.

## 5. Key Dependencies Overview

A summary of major packages found in `package.json`:

| Package | Purpose |
| :--- | :--- |
| `next`, `react`, `react-dom` | Core App Framework |
| `@prisma/client`, `prisma` | Database ORM |
| `next-auth`, `@auth/core` |/Authentication |
| `@google/generative-ai` | AI Integration |
| `@react-three/fiber` | 3D Rendering |
| `gsap` | Animations |
| `axios`, `cheerio` | Data Fetching & Parsing |

---
*Generated based on project files as of 2025-12-28.*
