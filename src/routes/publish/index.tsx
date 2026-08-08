import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/publish/")({ component: PublishRoute });

type SourceType = "google_drive" | "local_upload" | "heygen";
type Channel =
  | "youtube"
  | "facebook_page"
  | "facebook_group"
  | "instagram"
  | "threads"
  | "x"
  | "line_oa"
  | "linkedin";
type ChannelDraft = {
  title?: string;
  caption?: string;
  description?: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  privacy?: string;
  text?: string;
};

const CHANNELS: { id: Channel; label: string }[] = [
  { id: "youtube", label: "YouTube" },
  { id: "facebook_page", label: "Facebook Page" },
  { id: "facebook_group", label: "Facebook Group" },
  { id: "instagram", label: "Instagram" },
  { id: "threads", label: "Threads" },
  { id: "x", label: "X" },
  { id: "line_oa", label: "LINE OA" },
  { id: "linkedin", label: "LinkedIn" },
];

function driveFileId(value: string) {
  const v = value.trim();
  return v.match(/\/d\/([^/]+)/)?.[1] ?? v.match(/[?&]id=([^&]+)/)?.[1] ?? v;
}

function PublishRoute() {
  const [sourceType, setSourceType] = useState<SourceType>("google_drive");
  const [driveValue, setDriveValue] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState("educate");
  const [audience, setAudience] = useState("");
  const [selected, setSelected] = useState<Channel[]>(["youtube"]);
  const [drafts, setDrafts] = useState<Partial<Record<Channel, ChannelDraft>>>(
    {},
  );
  const [scheduleAt, setScheduleAt] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [approved, setApproved] = useState(false);
  const [token, setToken] = useState("");
  const [avatarId, setAvatarId] = useState("private-default");
  const [voiceId, setVoiceId] = useState("default");
  const [language, setLanguage] = useState("th");
  const [ratio, setRatio] = useState("9:16");
  const [videoApproved, setVideoApproved] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const sourceReady =
    sourceType === "google_drive"
      ? driveFileId(driveValue).length > 5
      : sourceType === "local_upload"
        ? !!localFile
        : true;
  const previewReady = selected.length > 0 && Object.keys(drafts).length > 0;
  const liveReady = dryRun || (approved && token.length > 0);
  const source = useMemo(
    () =>
      sourceType === "google_drive"
        ? { type: sourceType, fileId: driveFileId(driveValue) }
        : sourceType === "local_upload"
          ? {
              type: sourceType,
              filename: localFile?.name,
              mimeType: localFile?.type,
              size: localFile?.size,
            }
          : { type: sourceType, avatarId, voiceId, language, ratio },
    [sourceType, driveValue, localFile, avatarId, voiceId, language, ratio],
  );

  function toggleChannel(channel: Channel) {
    setSelected((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  async function generatePreview() {
    if (!sourceReady || !topic.trim() || !selected.length) return;
    setBusy(true);
    setStatus("กำลังสร้าง Draft หนึ่งครั้งสำหรับทุกช่องทาง…");
    try {
      const response = await fetch("/api/publish/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          brief: { title: topic.trim(), objective, audience: audience.trim() },
          channels: selected,
          heygenOptions:
            sourceType === "heygen"
              ? { avatarId, voiceId, language, ratio }
              : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Generate preview failed");
      setDrafts(result.channels ?? {});
      setApproved(false);
      setDryRun(true);
      setStatus("Draft พร้อมตรวจแก้ — ยังไม่มีการสร้างวิดีโอหรือโพสต์จริง");
    } catch (error) {
      setStatus(
        `ผิดพลาด: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  function editDraft(channel: Channel, value: string) {
    setDrafts((current) => ({
      ...current,
      [channel]: {
        ...current[channel],
        ...(channel === "youtube"
          ? { description: value }
          : { caption: value }),
      },
    }));
  }

  async function submit() {
    if (!previewReady || !liveReady) return;
    setBusy(true);
    setStatus(dryRun ? "กำลังตรวจสอบ Dry-run…" : "กำลังส่งเข้า CMT-01…");
    try {
      let finalSource: Record<string, unknown> = source;
      if (sourceType === "local_upload" && !dryRun) {
        const form = new FormData();
        form.set("file", localFile!);
        form.set("approved", "true");
        form.set("dry_run", "false");
        const uploadResponse = await fetch("/api/publish/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const upload = await uploadResponse.json();
        if (!uploadResponse.ok)
          throw new Error(upload.error ?? "Local upload failed");
        finalSource = {
          type: "local_upload",
          uploadId: upload.uploadId,
          filename: localFile!.name,
        };
      }
      const response = await fetch("/api/publish/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(dryRun ? {} : { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          source: finalSource,
          payload: {
            meta: {
              sourceType,
              generatedAt: new Date().toISOString(),
              objective,
              audience,
            },
            channels: drafts,
            heygen:
              sourceType === "heygen"
                ? {
                    avatarId,
                    voiceId,
                    language,
                    ratio,
                    generationApproved: videoApproved,
                  }
                : undefined,
          },
          selectedChannels: selected,
          scheduleAt: scheduleAt || null,
          approved,
          dry_run: dryRun,
          generation_gate: {
            approved: videoApproved,
            dry_run: dryRun,
            output_type: sourceType === "heygen" ? "video" : "existing_video",
          },
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Publish request failed");
      setStatus(
        result.dry_run
          ? `Dry-run ผ่าน: ${result.jobId} — ไม่สร้างวิดีโอและไม่โพสต์จริง`
          : `ส่งเข้า CMT-01 แล้ว: ${result.jobId}`,
      );
    } catch (error) {
      setStatus(
        `ผิดพลาด: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            SuperChoice AI Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Multi-Channel Content Publisher
          </h1>
          <p className="mt-2 text-slate-400">
            สร้าง Draft ครั้งเดียว ตรวจแก้ แล้วส่งเฉพาะช่องทางที่อนุมัติผ่าน n8n
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">1. แหล่งวิดีโอ</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["google_drive", "local_upload", "heygen"] as SourceType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setSourceType(type)}
                    className={`rounded-lg px-4 py-2 ${sourceType === type ? "bg-red-600" : "bg-slate-800"}`}
                  >
                    {type === "google_drive"
                      ? "Google Drive"
                      : type === "local_upload"
                        ? "Local Drive"
                        : "สร้างด้วย HeyGen"}
                  </button>
                ),
              )}
            </div>
            {sourceType === "google_drive" && (
              <input
                value={driveValue}
                onChange={(e) => setDriveValue(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
                placeholder="Google Drive share URL หรือ File ID"
              />
            )}
            {sourceType === "local_upload" && (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)}
              />
            )}
            {sourceType === "heygen" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  className="rounded-lg bg-slate-950 p-3"
                  placeholder="Avatar ID"
                />
                <input
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="rounded-lg bg-slate-950 p-3"
                  placeholder="Voice ID"
                />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-lg bg-slate-950 p-3"
                >
                  <option value="th">ไทย</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                </select>
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  className="rounded-lg bg-slate-950 p-3"
                >
                  <option>9:16</option>
                  <option>16:9</option>
                  <option>1:1</option>
                </select>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">2. Brief</h2>
            <div className="space-y-3">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-24 w-full rounded-lg bg-slate-950 p-3"
                placeholder="หัวข้อหรือข้อมูลต้นทาง *"
              />
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full rounded-lg bg-slate-950 p-3"
              >
                <option value="educate">ให้ความรู้</option>
                <option value="promote">โปรโมตบริการ</option>
                <option value="engagement">สร้าง Engagement</option>
                <option value="contact">เชิญชวนให้ติดต่อ</option>
              </select>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg bg-slate-950 p-3"
                placeholder="กลุ่มเป้าหมาย"
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">3. ช่องทาง</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNELS.map(({ id, label }) => (
              <label
                key={id}
                className="flex items-center gap-2 rounded-lg bg-slate-950 p-3"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() => toggleChannel(id)}
                />
                {label}
              </label>
            ))}
          </div>
          <button
            disabled={busy || !sourceReady || !topic.trim() || !selected.length}
            onClick={generatePreview}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-semibold disabled:opacity-40"
          >
            Generate Preview (AI 1 ครั้ง)
          </button>
        </div>
        {Object.keys(drafts).length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">4. Preview / Edit</h2>
            <div className="space-y-3">
              {selected.map((channel) => {
                const draft = drafts[channel] ?? {};
                return (
                  <div
                    key={channel}
                    className="grid gap-3 rounded-xl bg-slate-950 p-4 md:grid-cols-[150px_1fr_130px]"
                  >
                    <strong>
                      {CHANNELS.find((x) => x.id === channel)?.label}
                    </strong>
                    <textarea
                      value={
                        channel === "youtube"
                          ? (draft.description ?? draft.caption ?? "")
                          : (draft.caption ?? draft.text ?? "")
                      }
                      onChange={(e) => editDraft(channel, e.target.value)}
                      className="min-h-20 rounded-lg border border-slate-700 bg-slate-900 p-3"
                    />
                    <span className="text-sm text-amber-300">
                      Waiting Approval
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">5. Approval & Schedule</h2>
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="mb-4 rounded-lg bg-slate-950 p-3"
          />
          <label className="mb-3 flex gap-3">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => {
                setDryRun(e.target.checked);
                if (e.target.checked) {
                  setApproved(false);
                  setVideoApproved(false);
                }
              }}
            />
            Dry-run — ไม่สร้างวิดีโอและไม่โพสต์จริง
          </label>
          {sourceType === "heygen" && (
            <label className="mb-3 flex gap-3">
              <input
                type="checkbox"
                disabled={dryRun}
                checked={videoApproved}
                onChange={(e) => setVideoApproved(e.target.checked)}
              />
              อนุมัติสร้างวิดีโอ HeyGen (Gate แยก)
            </label>
          )}
          <label className="flex gap-3">
            <input
              type="checkbox"
              disabled={dryRun || (sourceType === "heygen" && !videoApproved)}
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            อนุมัติโพสต์ Social Media
          </label>
          {!dryRun && (
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-4 w-full rounded-lg bg-slate-950 p-3"
              placeholder="PORTAL_PUBLISH_TOKEN (ไม่ถูกบันทึก)"
            />
          )}
          <button
            disabled={busy || !previewReady || !liveReady}
            onClick={submit}
            className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold disabled:opacity-40"
          >
            {busy
              ? "กำลังดำเนินการ…"
              : dryRun
                ? "ทดสอบ Dry-run"
                : "Publish ผ่าน CMT-01"}
          </button>
          {status && (
            <p className="mt-4 rounded-lg bg-slate-950 p-3 text-sm">{status}</p>
          )}
        </div>
      </section>
    </main>
  );
}
