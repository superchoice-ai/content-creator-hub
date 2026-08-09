import React, { useState } from 'react';
import type { AIResponse, ChannelPayload } from '@/routes/publish/schema';
import { createHeygen, sendPublish } from '../../services/publish.service';

interface Props {
  aiResponse?: AIResponse | null;
}

export default function PreviewApproval({ aiResponse }: Props) {
  const [edited, setEdited] = useState<Record<string, ChannelPayload>>(() => (aiResponse?.channels || {}));
  const [approved, setApproved] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  React.useEffect(() => {
    setEdited(aiResponse?.channels || {});
  }, [aiResponse]);

  function updateChannel(ch: string, patch: Partial<ChannelPayload>) {
    setEdited((prev) => ({ ...(prev || {}), [ch]: { ...(prev[ch] || {}), ...patch } }));
  }

  async function handleCreateHeygen() {
    if (!aiResponse?.heygen?.script) {
      setStatus('No heygen script available');
      return;
    }
    setStatus('Creating HeyGen...');
    try {
      const res = await createHeygen({ script: aiResponse.heygen.script, heygenOptions: aiResponse.heygen });
      setStatus(`HeyGen created: ${res.driveFileId}`);
    } catch (err: any) {
      setStatus('HeyGen failed: ' + (err.message || String(err)));
    }
  }

  async function handlePublish() {
    setStatus('Publishing...');
    try {
      const payload = { meta: aiResponse?.meta || {}, channels: edited };
      const resp = await sendPublish({ payload, selectedChannels: Object.keys(edited), approved, dry_run: dryRun });
      setStatus(`Publish queued: ${resp.jobId || 'no-job-id'}`);
    } catch (err: any) {
      setStatus('Publish failed: ' + (err.message || String(err)));
    }
  }

  if (!aiResponse) return <div>No preview available</div>;

  return (
    <div>
      <h3>Preview & Approval</h3>
      <div>
        <label>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> Dry run (do not send)
        </label>
        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} /> Approve for publish
        </label>
      </div>

      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Channel</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Fields</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(edited).map((ch) => (
            <tr key={ch}>
              <td style={{ padding: 8, verticalAlign: 'top' }}>{ch}</td>
              <td style={{ padding: 8 }}>
                <div>
                  <label>Title (if applicable)</label>
                  <input value={edited[ch]?.title || ''} onChange={(e) => updateChannel(ch, { title: e.target.value })} />
                </div>
                <div>
                  <label>Caption / Description</label>
                  <textarea value={edited[ch]?.caption || edited[ch]?.description || ''} onChange={(e) => updateChannel(ch, { caption: e.target.value, description: e.target.value })} />
                </div>
                <div>
                  <label>CTA</label>
                  <input value={edited[ch]?.cta || ''} onChange={(e) => updateChannel(ch, { cta: e.target.value })} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        {aiResponse.heygen?.script && (
          <div>
            <h4>HeyGen script</h4>
            <pre style={{ background: '#f6f6f6', padding: 8 }}>{aiResponse.heygen.script}</pre>
            <button onClick={handleCreateHeygen}>Create HeyGen Video</button>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={handlePublish} disabled={!approved && !dryRun}>Publish</button>
        </div>

        {status && <div style={{ marginTop: 8 }}><strong>Status:</strong> {status}</div>}
      </div>
    </div>
  );
}
