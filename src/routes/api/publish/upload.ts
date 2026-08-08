import fs from 'fs';
import path from 'path';

// Simple upload endpoint for local files sent as base64 JSON
// Stores uploads in .uploads/ with a generated uploadId and writes a JSON index

const UPLOAD_DIR = path.resolve(process.cwd(), '.uploads');
const INDEX_FILE = path.join(UPLOAD_DIR, 'index.json');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(INDEX_FILE)) fs.writeFileSync(INDEX_FILE, JSON.stringify({ uploads: {} }, null, 2));
}

function saveUpload(filename: string, base64: string, mimeType: string) {
  ensureUploadDir();
  const uploadId = `upload-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const outPath = path.join(UPLOAD_DIR, uploadId + path.extname(filename));
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(outPath, buffer);
  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  index.uploads[uploadId] = { id: uploadId, filename, path: outPath, mimeType, createdAt: new Date().toISOString() };
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  return { uploadId, outPath };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, contentBase64, mimeType } = body;
    if (!filename || !contentBase64) return new Response(JSON.stringify({ error: 'missing filename or contentBase64' }), { status: 400 });

    const { uploadId, outPath } = saveUpload(filename, contentBase64, mimeType || 'application/octet-stream');

    // Optionally forward to n8n upload fetcher endpoint — n8n workflow has an HTTP GET to pull the file by uploadId
    return new Response(JSON.stringify({ uploadId, note: 'stored', path: outPath }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
}
