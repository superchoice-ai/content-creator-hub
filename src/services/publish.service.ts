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

// Upload a local file from the browser. Reads file as base64 and POSTS to /api/publish/upload.
// Returns JSON from the server: { uploadId, forwarded, note }
export async function uploadFileBrowser(file: File) {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like 'data:<mime>;base64,<data>' — strip prefix
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/publish/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentBase64: base64, mimeType: file.type }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`uploadFileBrowser failed: ${res.status} ${txt}`);
  }
  return res.json();
}
