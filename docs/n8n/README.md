# CMT-01 Publish Orchestrator (n8n)

This document explains how to import and test the CMT-01 workflow included in `CMT-01-workflow.json`.

## Import

1. In your n8n instance, go to "Workflows" → "Import".
2. Upload `CMT-01-workflow.json`.
3. Activate the workflow (optional for manual testing).

## Workflow overview

- Webhook (POST /webhook/publish-cmt-01) — entry point. Accepts JSON body:
  {
    "payload": { /* AI JSON (meta + channels) */ },
    "selectedChannels": ["youtube","instagram"],
    "jobId": "job-<timestamp>"
  }
- Set Job — generates jobId (job-<timestamp>)
- HTTP Request (Mock Publish) — sends payload to a mock endpoint (httpbin.org in template)

## Expected payload (minimal)

```json
{
  "payload": { "meta": {...}, "channels": { "youtube": {...}, "instagram": {...} } },
  "selectedChannels": ["youtube","instagram"]
}
```

## Testing (curl)

1. Get your webhook URL from the imported Webhook node (n8n shows a URL like `https://<n8n-host>/webhook/publish-cmt-01`).
2. Send test payload:

```bash
curl -X POST "https://<n8n-host>/webhook/publish-cmt-01" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": { "meta": { "sourceType":"local_upload" }, "channels": { "youtube": { "title":"Test" } } },
    "selectedChannels": ["youtube"]
  }'
```

## Observations

- Check the execution view in n8n: Webhook → Set Job → HTTP Request node.
- The HTTP Request node uses httpbin.org in the template; replace with your real publisher endpoints or further nodes for per-channel posting.
