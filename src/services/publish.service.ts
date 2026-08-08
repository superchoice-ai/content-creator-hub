// Frontend service helper for publish flow

export async function generatePreview(body: any) {
  const res = await fetch('/api/publish/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`generatePreview failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function createHeygen(body: { script: string; heygenOptions?: any }) {
  const res = await fetch('/api/publish/heygen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`createHeygen failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function sendPublish(body: { payload: any; selectedChannels: string[]; approved?: boolean; dry_run?: boolean; credentialsId?: string }) {
  const res = await fetch('/api/publish/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`sendPublish failed: ${res.status} ${txt}`);
  }
  return res.json();
}
