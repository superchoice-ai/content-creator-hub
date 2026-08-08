import React from "react";

// TODO: This is a skeleton route. Implement UI in Lovable and sync to this file.
// See docs/CONTENT_PUBLISHING_SPEC.md for the API contract and data shapes.

export default function PublishRoute() {
  return (
    <div style={{padding: '24px'}}>
      <h1>Content Publishing (Skeleton)</h1>
      <p>Primary editor: Lovable. Implement UI in Lovable and keep feature branches named <code>feat/lovable/*</code>.</p>

      <section>
        <h2>1. Content Source</h2>
        <p>TODO: ContentSource component (google drive, local upload, generate with HeyGen)</p>
      </section>

      <section>
        <h2>2. Content Brief</h2>
        <p>TODO: ContentBrief component (title, audience, objective, CTA)</p>
      </section>

      <section>
        <h2>3. Select Channels</h2>
        <p>TODO: SelectChannels component (checkboxes and per-channel options)</p>
      </section>

      <section>
        <h2>4. Preview & Approval</h2>
        <p>TODO: PreviewApproval component (preview table, edit per-channel, approve/publish)</p>
      </section>

      <p>Link to spec: <a href="/docs/CONTENT_PUBLISHING_SPEC.md">docs/CONTENT_PUBLISHING_SPEC.md</a></p>
    </div>
  );
}
