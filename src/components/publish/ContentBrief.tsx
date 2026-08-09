import React, { useEffect, useState } from 'react';
import type { ContentBrief as ContentBriefType } from '@/routes/publish/schema';

interface Props {
  initial?: ContentBriefType;
  onChange: (brief: ContentBriefType) => void;
}

export default function ContentBrief({ initial, onChange }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [audience, setAudience] = useState(initial?.audience || '');
  const [objective, setObjective] = useState<any>(initial?.objective || 'educate');
  const [cta, setCta] = useState(initial?.cta || '');
  const [tags, setTags] = useState<string>((initial?.tags || []).join(', '));

  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, audience, objective, cta, tags]);

  function emit() {
    onChange({ title, description, audience, objective, cta, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) });
  }

  return (
    <div>
      <h3>Content Brief</h3>
      <div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" />
      </div>
      <div>
        <label>Description / Context (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context for AI" />
      </div>
      <div>
        <label>Audience</label>
        <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g., developers, SMB" />
      </div>
      <div>
        <label>Objective</label>
        <select value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option value="educate">Educate</option>
          <option value="promote">Promote</option>
          <option value="engage">Engage</option>
          <option value="contact">Contact</option>
        </select>
      </div>
      <div>
        <label>Call to Action (CTA)</label>
        <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="e.g., Sign up" />
      </div>
      <div>
        <label>Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#ai,#rag" />
      </div>
    </div>
  );
}
