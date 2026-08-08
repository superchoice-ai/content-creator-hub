export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceType, brief, channels } = body;

    if (!sourceType || !brief || !channels) {
      return new Response(JSON.stringify({ error: 'missing required fields: sourceType, brief, channels' }), { status: 400 });
    }

    const now = new Date().toISOString();

    // Example AI-generated payload shaped to docs/CONTENT_PUBLISHING_SPEC.md
    const response = {
      meta: {
        sourceType,
        generatedAt: now,
        model: 'gpt-4x',
      },
      channels: {},
      heygen: undefined,
    };

    // Populate channel payloads with simple templated text
    for (const ch of channels) {
      if (ch === 'youtube') {
        response.channels.youtube = {
          title: `${brief.title} | SuperChoice AI`,
          description: brief.description || 'Auto-generated description',
          hashtags: ['#AI', '#SuperChoice'],
          privacy: 'private',
        };
      } else if (ch === 'instagram') {
        response.channels.instagram = {
          hook: `Hook: ${brief.title}`,
          caption: `${brief.title} — ${brief.cta || ''}`,
          hashtags: ['#shorts', '#AI'],
          cta: brief.cta || 'Learn more',
        };
      } else if (ch === 'x') {
        response.channels.x = {
          text: `${brief.title} — ${brief.cta || ''}`,
          maxLength: 280,
        };
      } else {
        // generic channel payload
        response.channels[ch] = {
          caption: `${brief.title} — ${brief.cta || ''}`,
        };
      }
    }

    // If the user requested HeyGen suggestions, provide a simple script
    if (sourceType === 'heygen') {
      response.heygen = {
        script: `Intro: ${brief.title}\nKey points: ...\nCTA: ${brief.cta || 'Contact us'}`,
        scenes: [{ start: 0, end: 10, text: 'Intro scene' }],
        suggestedAvatarId: body.heygenOptions?.avatarId || 'heygen-default-avatar',
        suggestedVoiceId: body.heygenOptions?.voiceId || 'heygen-default-voice',
      };
    }

    return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
