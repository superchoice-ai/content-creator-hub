# CMT-01 Publish Orchestrator (Drive + Local -> YouTube)

This document explains how to import and test the updated CMT-01 workflow which supports both Google Drive and Local upload flows, and performs resumable uploads to YouTube.

## Notes
- The template assumes you have configured Google OAuth2 credentials in n8n with the following scopes at minimum:
  - https://www.googleapis.com/auth/drive.readonly
  - https://www.googleapis.com/auth/youtube.upload
  - https://www.googleapis.com/auth/youtube

- The workflow uses a Webhook node named `publish-cmt-01` as the entry point.
- For Drive flow, the workflow reads `payload.meta.driveFileId` or `payload.channels.youtube.driveFileId` and uses the Google Drive node to fetch file content and metadata.
- For Local flow, the workflow expects `payload.meta.uploadId` which refers to an upload previously made to the app (e.g., `/api/publish/upload`). The workflow then GETs the upload by that ID from your app and proceeds with the upload to YouTube.

## Import
1. In your n8n instance, go to "Workflows" → "Import".
2. Upload `CMT-01-workflow.json`.
3. Connect the Google OAuth2 credential to the Google Drive node and ensure the HTTP Request nodes use the same OAuth if required.
4. Activate the workflow (optional during testing).

## Workflow overview
- Webhook (POST /webhook/publish-cmt-01) — entry point. Accepts JSON body:
  {
    "payload": { /* AI JSON (meta + channels) */ },
    "selectedChannels": ["youtube"],
    "jobId": "job-<timestamp>"
  }
- Set Job — generates jobId (job-<timestamp>)
- If has Drive file:
  - Google Drive: get file by ID
  - YouTube Create Resumable Upload (HTTP Request) — start session
  - YouTube Upload Video (PUT) — upload binary to session URL
- If has uploadId (local):
  - HTTP Get Upload (from app) — GET /api/publish/upload/<uploadId>
  - YouTube Create Resumable Upload -> Upload Video (PUT)
- HTTP Request (Mock Publish) — sends the job result to a configured endpoint (httpbin.org in template)

## Example minimal payload (drive)
```json
{
  "payload": { "meta": { "driveFileId": "1AbCdEfG" }, "channels": { "youtube": { "title":"Test" } } },
  "selectedChannels": ["youtube"]
}
```

## Example minimal payload (local)
```json
{
  "payload": { "meta": { "uploadId": "upload-123" }, "channels": { "youtube": { "title":"Local Test" } } },
  "selectedChannels": ["youtube"]
}
```

## Resumable Upload notes
- The workflow starts a resumable upload session by calling the YouTube Upload API endpoint with `uploadType=resumable` and receives an `Location` header (session URL).
- The workflow must then PUT the video binary to that session URL. Some n8n setups require the binary to be present in the incoming data; ensure the Google Drive node or the HTTP Get Upload returns binary data for the subsequent HTTP Request node.

## Testing
- Import workflow, attach Google credential, and test with example payloads.
- Monitor executions to verify the session URL is returned and the PUT uploads the video.

## Troubleshooting
- If authentication errors occur, re-check the OAuth credential scopes and the consent screen in Google Cloud Console.
- For large files, ensure n8n has enough memory/timeouts; resumable uploads are recommended.
