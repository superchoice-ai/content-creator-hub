import React, { useState } from 'react';
import ContentSource from './ContentSource';
import ContentBrief from './ContentBrief';
import SelectChannels from './SelectChannels';
import PreviewApproval from './PreviewApproval';
import { generatePreview as apiGenerate } from '../../services/publish.service';
import type { PublishFormState } from '@/routes/publish/schema';

export default function PublishPage() {
  const [sourceData, setSourceData] = useState<any>({ sourceType: 'google_drive' });
  const [brief, setBrief] = useState<any>({ title: '' });
  const [channelsState, setChannelsState] = useState<any>({ channels: ['youtube'], perChannelOptions: {} });
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setAiResponse(null);
    try {
      const body: PublishFormState = {
        sourceType: sourceData.sourceType,
        googleDriveFileId: sourceData.googleDriveFileId,
        heygenOptions: sourceData.heygenOptions,
        brief,
        channels: channelsState.channels,
        schedule: null,
        approved: false,
        dry_run: true,
      };
      const res = await apiGenerate(body);
      setAiResponse(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Publish</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <section style={{ padding: 12, border: '1px solid #eee' }}>
          <ContentSource onChange={(d) => setSourceData(d)} initial={{ sourceType: sourceData.sourceType }} />
        </section>

        <section style={{ padding: 12, border: '1px solid #eee' }}>
          <ContentBrief onChange={(b) => setBrief(b)} initial={brief} />
        </section>

        <section style={{ padding: 12, border: '1px solid #eee' }}>
          <SelectChannels onChange={(c) => setChannelsState(c)} initial={channelsState} />
        </section>

        <div>
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Preview'}
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>

        <section style={{ padding: 12, border: '1px solid #eee' }}>
          <PreviewApproval aiResponse={aiResponse} />
        </section>
      </div>
    </div>
  );
}
