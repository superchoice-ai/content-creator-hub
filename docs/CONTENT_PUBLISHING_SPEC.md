# Content Publishing Specification

This document specifies the Content Publishing Form, the AI JSON contract, state machine (approval gates), integrations, and implementation TODOs for SuperChoice AI Portal. Follow the Lovable-first workflow (see CONTRIBUTING.md) — UI work should originate in Lovable and map to the routes in src/routes/publish.

Summary
- Scope: Content Publishing for three Use Cases:
  1. Use Case A — Clip exists in Google Drive (select from Drive)
  2. Use Case B — Generate video with HeyGen (create a new video from script)
  3. Use Case C — Clip exists on local device (upload from local drive)
- Goal: Single AI invocation (one prompt/call) returns a JSON payload that contains prepared content for each selected social channel. The system displays previews, allows per-channel edits, approval and scheduling, and then sends selected channels to the CMT-01 orchestrator for publishing.

1. Content Publishing Form — Sections

1.1 Content Source
- sourceType: "google_drive" | "heygen" | "local_upload"
- googleDriveFileId: string (when sourceType === "google_drive")
- localFile: multipart upload metadata (when sourceType === "local_upload")
- heygenOptions: { avatarId?: string, voiceId?: string, language?: string, aspectRatio?: string } (when sourceType === "heygen")

1.2 Content Brief
- title: string
- description: string (optional, used as context for AI)
- audience: string (e.g., "developers", "enterprise", "SMB")
- objective: enum ("educate", "promote", "engage", "contact")
- cta: string
- tags: string[]

1.3 Select Channels
- channels: string[] (subset of ["youtube","facebook","facebook_group","instagram","threads","x","line_oa","linkedin"]) 
- per-channel options: e.g., youtube.privacy (public|private|unlisted), schedule timestamp

1.4 Preview & Approval
- The UI shows a table per selected channel with the AI-generated fields (title/caption/etc.).
- User can edit any field before approval.
- Approve/publish flow uses two separate gates:
  - HeyGen creation gate (only for Use Case B)
  - Social publish gate (for distributing to channels)


2. AI JSON Contract (single response for all channels)

Top-level shape (example):
{
  "meta": {
    "sourceType": "google_drive",
    "sourceFileId": "...",
    "generatedAt": "2026-08-08T00:00:00Z",
    "model": "gpt-4x"
  },
  "channels": {
    "youtube": {
      "title": "...",
      "description": "...",
      "hashtags": ["#ai","#superchoice"],
      "privacy": "private",
      "tags": ["ai","rag"]
    },
    "instagram": {
      "hook": "Short hook",
      "caption": "Longer caption with CTA",
      "hashtags": ["#shorts","#ai"],
      "cta": "Link in bio"
    },
    "x": {
      "text": "Short tweet-friendly copy",
      "maxLength": 280
    }
  },
  "heygen": {
    "script": "...",
    "scenes": [{"start":0,"end":5,"text":"..."}],
    "suggestedAvatarId": "...",
    "suggestedVoiceId": "..."
  }
}

Key rules
- The AI is called once and must return all selected channels in a single response.
- Fields not applicable to a channel may be omitted or set to null.
- Always include meta and channels keys.

3. Example payload (short)

{
  "meta": { "sourceType":"local_upload","generatedAt":"2026-08-08T00:00:00Z" },
  "channels": {
    "youtube": { "title":"5 เหตุผลที่องค์กรควรใช้ AI RAG", "description":"...", "hashtags":["#RAG","#AI"], "privacy":"public" },
    "instagram": { "hook":"เริ่มต้นด้วยคำถามเร็วๆ", "caption":"...", "hashtags":["#AI"], "cta":"ดูเพิ่มเติม" }
  }
}


4. State machine / Approval Gates
- Draft -> PreviewGenerated (AI output) -> ApprovedForHeyGen (only for Use Case B) -> HeyGenCreated -> ReadyForPublish -> ApprovedForPublish -> Published

States and flags represented in API payloads
- approved: boolean (represents publish approval)
- dry_run: boolean (when true: do not send to orchestrator)
- output_type: "video" | "metadata" — HeyGen gate requires output_type === "video" and approved === true and dry_run === false

Transitions
- After AI generation: dry_run default true, approved false
- When user approves preview for publication: approved=true, dry_run=false -> send to orchestrator for selected channels
- For HeyGen: separate approval to create a video. Only after HeyGen returns a video and user previews it should publish flow be allowed.


5. Integrations (contracts)

5.1 n8n — CMT-01 Multi-Channel Publishing Orchestrator
- Input: JSON with meta, channels, and per-channel schedule/credentials
- Example: POST /webhook/cmt-01 { "taskId":"...","payload":<AI JSON>, "channelsSelected": [ ... ], "credentialsId": "n8n-cred-xxx" }
- n8n receives the JSON and executes per-channel publishing connectors.

5.2 HeyGen
- Input: script, avatarId, voiceId, language, aspectRatio
- Output: { videoUrl, driveFileId }
- The UI must request HeyGen creation only when ApprovedForHeyGen === true.

5.3 Google Drive
- Store original files and HeyGen outputs under a predictable path: /SuperChoiceAI/Projects/<project-id>/videos/<YYYY-MM-DD>__<slug>.mp4
- Use Google Drive fileId in meta and store permissions accordingly.

5.4 LINE LIFF / Auth
- Use LINE Login + Google OAuth for Drive access.
- Required scopes: openid, profile, email, https://www.googleapis.com/auth/drive.file (or drive.readonly if upload not required)


6. Security & Secrets
- Store API keys / HeyGen keys / n8n webhook secrets in environment variables or Lovable Cloud secrets store.
- Never put credentials in repository.
- Use short-lived tokens where possible and rotate credentials regularly.


7. Implementation TODOs
- API endpoints: /api/publish/generate (POST) -> calls AI and returns AI JSON, /api/publish/heygen (POST) -> trigger HeyGen and return driveFileId, /api/publish/send (POST) -> send to n8n orchestrator
- Lovable UI components: ContentSource, ContentBrief, SelectChannels, PreviewApproval
- Frontend types: align with src/routes/publish/schema.ts
- n8n workflow names and example webhooks: define in docs and create n8n templates
- Tests: unit tests for payload validation, e2e for preview -> approve -> publish (dry_run=false)


Appendix — file references
- SuperChoiceAIPortal.md — authoritative portal-level spec (use as ground truth for UI flow)
- docs/CONTENT_PUBLISHING_SPEC.md (this file)
- src/routes/publish/* — route skeletons and types

