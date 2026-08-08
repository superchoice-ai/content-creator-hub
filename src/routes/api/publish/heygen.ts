export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { script, heygenOptions } = body;

    if (!script) {
      return new Response(JSON.stringify({ error: 'missing required field: script' }), { status: 400 });
    }

    // Simulate HeyGen processing (stub)
    const now = Date.now();
    const driveFileId = `drive-heygen-${now}`;
    const videoUrl = `https://storage.superchoice.ai/videos/${driveFileId}.mp4`;

    // In a real implementation: call HeyGen API and store result in Google Drive

    const response = {
      status: 'created',
      videoUrl,
      driveFileId,
      heygenOptions: heygenOptions || null,
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
