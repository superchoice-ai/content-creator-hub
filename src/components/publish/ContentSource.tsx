import React, { useState } from 'react';
import type { HeygenOptions } from '@/routes/publish/schema';

interface Props {
  onChange: (data: { sourceType: string; googleDriveFileId?: string; localFile?: File | null; heygenOptions?: HeygenOptions | null }) => void;
  initial?: { sourceType?: string };
}

export default function ContentSource({ onChange, initial }: Props) {
  const [sourceType, setSourceType] = useState<string>(initial?.sourceType || 'google_drive');
  const [googleDriveFileId, setGoogleDriveFileId] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [heygenOptions, setHeygenOptions] = useState<HeygenOptions>({ avatarId: '', voiceId: '', language: 'th', aspectRatio: '9:16' });

  function emit() {
    onChange({ sourceType, ...(googleDriveFileId ? { googleDriveFileId } : {}), localFile, ...(sourceType === "heygen" ? { heygenOptions } : {}) });
  }

  return (
    <div>
      <label>Source Type</label>
      <select value={sourceType} onChange={(e) => { setSourceType(e.target.value); }} onBlur={emit}>
        <option value="google_drive">Google Drive</option>
        <option value="heygen">Generate with HeyGen</option>
        <option value="local_upload">Local Upload</option>
      </select>

      {sourceType === 'google_drive' && (
        <div>
          <label>Google Drive File ID</label>
          <input value={googleDriveFileId} onChange={(e) => setGoogleDriveFileId(e.target.value)} onBlur={emit} />
        </div>
      )}

      {sourceType === 'local_upload' && (
        <div>
          <label>Local file</label>
          <input type="file" onChange={(e) => { setLocalFile(e.target.files?.[0] ?? null); emit(); }} />
        </div>
      )}

      {sourceType === 'heygen' && (
        <div>
          <label>HeyGen Avatar ID</label>
          <input value={heygenOptions.avatarId} onChange={(e) => setHeygenOptions({ ...heygenOptions, avatarId: e.target.value })} onBlur={emit} />
          <label>HeyGen Voice ID</label>
          <input value={heygenOptions.voiceId} onChange={(e) => setHeygenOptions({ ...heygenOptions, voiceId: e.target.value })} onBlur={emit} />
          <label>Language</label>
          <input value={heygenOptions.language} onChange={(e) => setHeygenOptions({ ...heygenOptions, language: e.target.value })} onBlur={emit} />
          <label>Aspect Ratio</label>
          <input value={heygenOptions.aspectRatio} onChange={(e) => setHeygenOptions({ ...heygenOptions, aspectRatio: e.target.value })} onBlur={emit} />
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button onClick={emit}>Apply Source</button>
      </div>
    </div>
  );
}
