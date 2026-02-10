# Video Generation Workflow Architecture

This document outlines the exact technical workflow of the NYX Video Generation System, detailing how Avatars, Scripts, and Voices are synthesized into a final video.

## 1. High-Level Overview

The system uses a **Text-to-Video** pipeline where:
1.  **Avatar**: A specific digital human model is selected (via ID).
2.  **Audio**: Audio is generated from text using a specific Voice ID (HeyGen or ElevenLabs).
3.  **Synchronization**: The audio is lip-synced to the avatar's animation.

## 2. Detailed Step-by-Step Workflow

### Step 1: User Configuration
*   **Avatar Selection**: The user selects an avatar. This ID (e.g., `6b18354c...`) corresponds to a specific model in the HeyGen account.
*   **Voice Selection**: The user provides a **Voice ID**. 
    *   *Note*: This ID can be a standard HeyGen voice, a "Instant Clone" created in HeyGen, or an ElevenLabs voice that has been linked to the HeyGen account.
*   **Script Input**: The user types the text script (e.g., the Arijit Singh news script).

### Step 2: API Request (The "Trigger")
When "Generate Video" is clicked, the Next.js backend (`src/lib/services/video-gen.ts`) constructs a payload for the HeyGen API (`v2/video/generate`).

**Payload Structure:**
```json
{
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "YOUR_AVATAR_ID",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "text",
        "input_text": "Arijit Singh's SHOCKING Exit...", 
        "voice_id": "YOUR_VOICE_ID"
      }
    }
  ],
  "dimension": { "width": 720, "height": 1280 }
}
```

### Step 3: Audio Synthesis & Synchronization (The "Black Box")
Once HeyGen receives this request, **internal orchestration** occurs:

1.  **Audio Generation**: 
    *   HeyGen's engine takes the `input_text` and `voice_id`.
    *   If it's an **ElevenLabs Voice ID**, HeyGen internally calls ElevenLabs API (or uses cached credentials) to generate the audio file.
    *   If it's a **HeyGen Voice ID**, it uses its native engine.
    
2.  **Lip-Sync Analysis**:
    *   The generated audio waveform is analyzed to determine phonemes (sounds).
    *   These phonemes are mapped to the Avatar's facial blendshapes (mouth movements).

3.  **Rendering**:
    *   The Avatar is animated frame-by-frame to match the audio.
    *   The video is rendered into an MP4 file.

### Step 4: Status Polling
The NYX application cannot wait synchronously (it takes minutes). Instead:
1.  HeyGen returns a `video_id` immediately (status: `processing`).
2.  The NYX Frontend (`VideoHistoryList.tsx`) polls the backend every 3 seconds.
3.  The Backend checks HeyGen's status endpoint (`v1/video_status.get`).
4.  Once status is `completed`, HeyGen provides a distinct URL (e.g., `https://files2.heygen.ai/...`).

### Step 5: Delivery
*   The final video URL is saved to the NYX database.
*   The Dashboard displays the video.
*   Users can download or view it immediately.

## 3. Technical Diagram

```mermaid
graph TD
    User[User] -->|Script + AvatarID + VoiceID| App[NYX App]
    App -->|POST /v2/video/generate| HeyGen[HeyGen API]
    
    subgraph "HeyGen Internal Engine"
        HeyGen -->|Text + VoiceID| TTS[Audio Engine (ElevenLabs/Native)]
        TTS -->|Audio File| Sync[Lip-Sync Engine]
        Sync -->|Animation Data| Renderer[Video Renderer]
    end
    
    Renderer -->|MP4 URL| HeyGen
    App -->|Poll Status| HeyGen
    HeyGen -->|Status: Completed + URL| App
    App -->|Show Video| User
```

## 4. Key Configuration Files
*   **Generator Logic**: `src/lib/services/video-gen.ts` (Handles API orchestration).
*   **UI/Input**: `src/components/VideoGeneration.tsx` (Captures user input).
*   **History/Status**: `src/components/VideoHistoryList.tsx` (Polls for completion).
