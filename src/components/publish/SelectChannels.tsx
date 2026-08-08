import React, { useState, useEffect } from 'react';
import type { ChannelPayload } from '../../src/routes/publish/schema';

interface Props {
  initial?: { channels?: string[]; perChannelOptions?: Record<string, any> };
  onChange: (data: { channels: string[]; perChannelOptions: Record<string, any> }) => void;
}

const ALL_CHANNELS = ['youtube','facebook','facebook_group','instagram','threads','x','line_oa','linkedin'];

export default function SelectChannels({ initial, onChange }: Props) {
  const [channels, setChannels] = useState<string[]>(initial?.channels || ['youtube']);
  const [perChannelOptions, setPerChannelOptions] = useState<Record<string, any>>(initial?.perChannelOptions || {});

  useEffect(() => { emit(); }, [channels, perChannelOptions]);

  function toggleChannel(ch: string) {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  }

  function setYoutubePrivacy(p: 'public'|'private'|'unlisted') {
    setPerChannelOptions((prev) => ({ ...prev, youtube: { ...(prev.youtube||{}), privacy: p } }));
  }

  function setSchedule(ch: string, iso?: string) {
    setPerChannelOptions((prev) => ({ ...prev, [ch]: { ...(prev[ch]||{}), schedule: iso || null } }));
  }

  function emit() {
    onChange({ channels, perChannelOptions });
  }

  return (
    <div>
      <h3>Select Channels</h3>
      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        {ALL_CHANNELS.map((ch) => (
          <label key={ch} style={{minWidth:160}}>
            <input type="checkbox" checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} /> {ch}
            {ch === 'youtube' && channels.includes('youtube') && (
              <div style={{marginLeft:20}}>
                <label>Privacy: </label>
                <select value={perChannelOptions.youtube?.privacy || 'private'} onChange={(e) => setYoutubePrivacy(e.target.value as any)}>
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
                <div>
                  <label>Schedule (ISO datetime) </label>
                  <input type="datetime-local" value={perChannelOptions.youtube?.schedule || ''} onChange={(e) => setSchedule('youtube', e.target.value || undefined)} />
                </div>
              </div>
            )}
            {channels.includes(ch) && ch !== 'youtube' && (
              <div style={{marginLeft:20}}>
                <label>Schedule (optional)</label>
                <input type="datetime-local" value={perChannelOptions[ch]?.schedule || ''} onChange={(e) => setSchedule(ch, e.target.value || undefined)} />
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
