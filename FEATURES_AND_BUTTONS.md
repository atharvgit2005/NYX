# NYX Application Documentation

This document provides a detailed overview of every feature and interactive element (button, link, input) within the NYX application.

## 1. Landing Page (`/`)

The public-facing homepage designed to convert visitors into users.

### Navigation Bar
- **Logo (NYX)**: Links to the top of the Landing Page.
- **Features**: Scrolls to the "Features" section.
- **How it Works**: Scrolls to the "How it Works" section.
- **Pricing**: Scrolls to the "Pricing" section.
- **Log In**: Navigates to the Login page (`/login`).
- **Sign Up**: Navigates to the Signup page (`/signup`).
- **Dashboard (if logged in)**: Navigates to the user dashboard (`/dashboard`).
- **Sign Out (if logged in)**: Logs the user out and redirects to the home page.

### Hero Section
- **Start Free**: Primary Call-to-Action (CTA). Navigates to the Signup page.
- **See How It Works**: Secondary CTA. Scrolls to the "How it Works" section.

### Features Section
- **Video Carousel**: A scrollable list of demo videos created with NYX. Clicking a card does not currently play a video (demo only).

### Pricing Section
- **Choose [Plan Name]**: Buttons on each pricing card (Starter, Pro, Agency) that redirect to the Signup page.

---

## 2. Authentication Pages

### Login Page (`/login`)
- **Email Input**: Field to enter registered email.
- **Password Input**: Field to enter password.
- **Sign In Button**: Submits credentials to log in.
- **Google Button**: Initiates OAuth login with Google.
- **Instagram Button**: (Placeholder) Intended for Instagram OAuth.
- **Sign Up Link**: Redirects to the Signup page.
- **Back to Home**: Redirects to the Landing Page (`/`).

### Signup Page (`/signup`)
- **Name Input**: Field for full name.
- **Email Input**: Field for email address.
- **Password Input**: Field for password.
- **Create Account Button**: Registers a new user and automatically logs them in.
- **Log In Link**: Redirects to the Login page.

---

## 3. Dashboard (`/dashboard`)

The main application interface for authenticated users.

### Sidebar Navigation
- **Dashboard**: Overview page (currently redirects to `/dashboard`).
- **Connect Socials**: Navigates to `/dashboard/connect`.
- **Brand Analysis**: Navigates to `/dashboard/analysis`.
- **Idea Generator**: Navigates to `/dashboard/ideas`.
- **Script Editor**: Navigates to `/dashboard/scripts`.
- **Avatar & Voice**: Navigates to `/dashboard/avatar`.
- **Video Generation**: Navigates to `/dashboard/video`.
- **Back to Home**: Returns to the public Landing Page (`/`).
- **User Profile**: Bottom of sidebar, links to `/dashboard/profile`.

### Header
- **Breadcrumbs/Title**: Shows current page name.
- **User Menu**: (Top right) Access profile or logout.

### Connect Socials Page (`/dashboard/connect`)
- **Connect Instagram**: Initiates Instagram account linking (Mock/Actual depending on API).
- **Connect TikTok**: Initiates TikTok account linking (Mock).
- **Connect YouTube**: Initiates YouTube account linking (Mock).

### Brand Analysis Page (`/dashboard/analysis`)
- **Analyze Brand Button**: Triggers an AI analysis of the connected social profiles to determine niche, tone, and content strategy.

### Idea Generator Page (`/dashboard/ideas`)
- **Generate Ideas Button**: Uses AI to generate video concepts based on brand analysis.
- **Approve/Save Idea Buttons**: Adds a generated idea to the "Saved Ideas" list for scripting.

### Script Editor Page (`/dashboard/scripts`)
- **Select Idea Dropdown**: Choose a saved idea to base the script on.
- **Generate Script Button**: AI generates a full video script (Hook, Body, CTA) from the selected idea.
- **Edit Text Area**: Text box to manually edit the generated script.
- **Save Script Button**: Saves the current script to the database.

### Avatar & Voice Page (`/dashboard/avatar`)
- **Select Avatar**: Grid of available AI avatars. Clicking one selects it for the next video.
- **Select Voice**: List of available AI voices. Clicking one selects it.
- **Create Custom Avatar**: (Premium) Upload a photo/video to create a custom clone.

### Video Generation Page (`/dashboard/video`)
- **Script Preview**: Shows the script passed from the Script Editor.
- **HeyGen API Key Input**: (Optional) Input field to override the default system API key.
- **Generate Video Button**: Sends the script, selected avatar, and voice to the HeyGen API to render the video.
- **Upload Video Button**: (In History section) Allows uploading a local video file to the history list.
- **Delete Button (Trash Icon)**: Removes a video from history.
- **Download Video Button**: (On completed videos) Downloads the MP4 file to the user's device.
- **Schedule Post Button**: (Placeholder) Intended to schedule the video for social media.

---

## 4. Technical Features (Under the Hood)

- **Database Sync**: Local data (SQLite) allows development, while Production uses detailed PostgreSQL (Supabase) for scalability.
- **Error Handling**: 
    - **Video Fallback**: If a video file is missing (e.g., local file not on server), a "Video Not Found" UI is displayed instead of a broken player.
    - **Login Errors**: Clear alerts for invalid credentials or server errors.
- **Google Auth**: Secure OAuth 2.0 integration with detailed server-side logging for debugging.
