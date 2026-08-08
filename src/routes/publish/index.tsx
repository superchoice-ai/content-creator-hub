import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/publish/")({ component: PublishRoute });

type SourceType = "google_drive" | "local_upload";
type Privacy = "private" | "unlisted" | "public";

function driveFileId(value: string) {
  const trimmed = value.trim();
  return trimmed.match(/\/d\/([^/]+)/)?.[1] ?? trimmed.match(/[?&]id=([^&]+)/)?.[1] ?? trimmed;
}

export function PublishRoute() {
  const [sourceType, setSourceType] = useState<SourceType>("google_drive");
  const [driveValue, setDriveValue] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("private");
  const [dryRun, setDryRun] = useState(true);
  const [approved, setApproved] = useState(false);
  const [approvalToken, setApprovalToken] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const sourceReady = sourceType === "google_drive" ? driveFileId(driveValue).length > 5 : !!localFile;
  const canSubmit = sourceReady && title.trim().length > 0 && (dryRun || (approved && approvalToken.length > 0));

  const preview = useMemo(() => ({
    title: title.trim(),
    description: description.trim(),
    tags: tags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean),
    privacy,
  }), [title, description, tags, privacy]);

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setStatus(dryRun ? "กำลังตรวจสอบ Dry-run…" : "กำลังส่งงานไปยัง YouTube workflow…");
    try {
      let source: Record<string, unknown>;
      if (sourceType === "google_drive") {
        source = { type: "google_drive", fileId: driveFileId(driveValue) };
      } else if (dryRun) {
        source = { type: "local_upload", filename: localFile!.name, mimeType: localFile!.type, size: localFile!.size };
      } else {
        const form = new FormData();
        form.set("file", localFile!);
        form.set("approved", String(approved));
        form.set("dry_run", String(dryRun));
        const uploadResponse = await fetch("/api/publish/upload", { method: "POST", headers: { Authorization: `Bearer ${approvalToken}` }, body: form });
        const upload = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(upload.error ?? "Local upload failed");
        source = { type: "local_upload", uploadId: upload.uploadId, filename: localFile!.name };
      }

      const response = await fetch("/api/publish/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(dryRun ? {} : { Authorization: `Bearer ${approvalToken}` }) },
        body: JSON.stringify({
          source,
          payload: { meta: { sourceType, generatedAt: new Date().toISOString() }, channels: { youtube: preview } },
          selectedChannels: ["youtube"],
          approved,
          dry_run: dryRun,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Publish request failed");
      setStatus(result.dry_run
        ? `Dry-run ผ่าน: ${result.jobId} — ไม่มีการอัปโหลดขึ้น YouTube`
        : `ส่งเข้า YouTube workflow แล้ว: ${result.jobId}`);
    } catch (error) {
      setStatus(`ผิดพลาด: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">SuperChoice Content Creator Hub</p>
          <h1 className="mt-2 text-3xl font-bold">YouTube Publisher</h1>
          <p className="mt-2 text-slate-400">เลือกวิดีโอจาก Google Drive หรือเครื่องของคุณ ตรวจ Preview แล้วส่งผ่าน Approval Gate</p>
        </header>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">1. เลือกวิดีโอ</h2>
          <div className="mb-4 flex gap-3">
            {(["google_drive", "local_upload"] as SourceType[]).map((type) => (
              <button key={type} type="button" onClick={() => setSourceType(type)}
                className={`rounded-lg px-4 py-2 ${sourceType === type ? "bg-red-600" : "bg-slate-800"}`}>
                {type === "google_drive" ? "Google Drive" : "Local Drive"}
              </button>
            ))}
          </div>
          {sourceType === "google_drive" ? (
            <label className="block">
              <span className="text-sm text-slate-300">Google Drive share URL หรือ File ID</span>
              <input value={driveValue} onChange={(e) => setDriveValue(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="https://drive.google.com/file/d/… หรือ File ID" />
              <small className="mt-2 block text-slate-500">ไฟล์ต้องเปิดให้ Google Drive credential ใน n8n เข้าถึงได้</small>
            </label>
          ) : (
            <label className="block rounded-xl border border-dashed border-slate-700 p-5 text-center">
              <span className="block text-sm text-slate-300">เลือกไฟล์วิดีโอจากเครื่อง</span>
              <input type="file" accept="video/*" className="mt-3" onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)} />
              {localFile && <small className="mt-2 block text-slate-400">{localFile.name} · {(localFile.size / 1048576).toFixed(1)} MB</small>}
            </label>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">2. รายละเอียด YouTube</h2>
          <div className="space-y-4">
            <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" placeholder="ชื่อวิดีโอ *" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" placeholder="คำอธิบาย" />
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" placeholder="Tags คั่นด้วย comma" />
            <select value={privacy} onChange={(e) => setPrivacy(e.target.value as Privacy)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              <option value="private">Private (แนะนำสำหรับทดสอบ)</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 text-lg font-semibold">3. Approval Gate</h2>
          <label className="mb-3 flex items-center gap-3">
            <input type="checkbox" checked={dryRun} onChange={(e) => { setDryRun(e.target.checked); if (e.target.checked) setApproved(false); }} />
            Dry-run — ตรวจสอบเท่านั้น ไม่โพสต์จริง
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={approved} disabled={dryRun} onChange={(e) => setApproved(e.target.checked)} />
            อนุมัติโพสต์จริง
          </label>
          {!dryRun && (
            <input type="password" value={approvalToken} onChange={(e) => setApprovalToken(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
              placeholder="PORTAL_PUBLISH_TOKEN (ไม่ถูกบันทึก)" autoComplete="off" />
          )}
          <button type="button" disabled={!canSubmit || busy} onClick={submit}
            className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? "กำลังดำเนินการ…" : dryRun ? "ทดสอบ Dry-run" : "ส่งขึ้น YouTube"}
          </button>
          {status && <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm">{status}</p>}
        </div>
      </section>
    </main>
  );
}
