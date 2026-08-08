import React, { useState } from 'react';
import { uploadFileBrowser, sendPublish } from '../../services/publish.service';

interface Props {
  onUploaded: (uploadId: string | null) => void;
}

export default function LocalUploader({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] || null;
    setFile(f);
    setUploadId(null);
    if (f) {
      // auto-upload small files
      setUploading(true);
      try {
        const res = await uploadFileBrowser(f);
        setUploadId(res.uploadId || null);
        onUploaded(res.uploadId || null);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setUploading(false);
      }
    }
  }

  return (
    <div>
      <label>
        Upload local file:
        <input type="file" accept="video/*" onChange={handleFile} />
      </label>
      {uploading && <div>Uploading...</div>}
      {uploadId && <div>Uploaded: {uploadId}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
