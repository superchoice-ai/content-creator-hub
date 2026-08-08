export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload, selectedChannels, credentialsId, approved, dry_run } = body;

    if (!payload || !Array.isArray(selectedChannels) || selectedChannels.length === 0) {
      return new Response(JSON.stringify({ error: 'missing required fields: payload and selectedChannels (non-empty array)' }), { status: 400 });
    }

    const jobId = `job-${Date.now()}`;
    const responseBody: any = { jobId, status: 'queued' };

    // If an N8N webhook URL is configured, forward the payload
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET;

    if (n8nUrl) {
      try {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(n8nSecret ? { 'X-Webhook-Secret': n8nSecret } : {}),
          },
          body: JSON.stringify({ jobId, payload, selectedChannels, credentialsId, approved: !!approved, dry_run: !!dry_run }),
        });
        responseBody.forwarded = true;
      } catch (err: any) {
        // Forward failed; record the error but still return queued
        responseBody.forwarded = false;
        responseBody.forwardError = String(err.message || err);
      }
    } else {
      // No n8n configured — this is a stub. In production this should POST to n8n.
      responseBody.forwarded = false;
      responseBody.note = 'N8N_WEBHOOK_URL not configured; this is a local stub.';
    }

    return new Response(JSON.stringify(responseBody), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
