# Content Creator Hub

ก่อนสร้างควรไปอ่านสิ่งที่รองรับแล้วใน n8n Projects SuperChoiceAI -> Contents-MKT

This project was built with [Lovable](https://lovable.dev).

Primary editor: Lovable — all UI work should start in Lovable on feature branches named `feat/lovable/*`. See CONTRIBUTING.md for details.

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/562dedca-7e64-4a79-851e-e97cc7dc2fef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

See docs/CONTENT_PUBLISHING_SPEC.md for the Content Publishing spec and src/routes/publish/ for the Lovable-first skeleton.
| Environment Variable               | ใช้ทำอะไร                                                                    | Value ที่ควรใส่ / เอาจากไหน                                                                                                | สร้างเองได้ไหม                                   | การจัดเก็บ                                             |
| ---------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `N8N_CONTENT_GENERATE_WEBHOOK_URL` | ส่งคำขอ Generate Content ไป n8n โดยบังคับ `dry_run=true`, `approved=false`   | `https://superchoiceai.app.n8n.cloud/webhook/cmt-content-generate`                                                         | ไม่ได้ ต้องมาจาก Production URL ของ Webhook node | Lovable Secret                                         |
| `N8N_CMT01_WEBHOOK_URL`            | ส่งงานที่อนุมัติแล้วไป `CMT-01` เพื่อ Publish จริง                           | Copy Production URL จาก Webhook node ของ workflow `CMT-01` เช่น `https://superchoiceai.app.n8n.cloud/webhook/<path-cmt01>` | ไม่ได้ ต้องมาจาก n8n                             | Lovable Secret                                         |
| `N8N_WEBHOOK_SECRET`               | Shared secret ระหว่าง Lovable กับ Webhook n8n ผ่าน Header `X-Webhook-Secret` | สุ่มข้อความลับยาวอย่างน้อย 32–64 bytes แล้วใส่ค่าเดียวกันใน Lovable และ n8n                                                | ได้ สร้างเอง                                     | Secret ทั้ง Lovable และ n8n                            |
| `PORTAL_PUBLISH_TOKEN`             | Gate ขั้นสุดท้ายก่อน Live Publish ผ่าน `Authorization: Bearer ...`           | สุ่ม Token ยาวและไม่ซ้ำกับ `N8N_WEBHOOK_SECRET`                                                                            | ได้ สร้างเอง                                     | Lovable Secret และฝั่งผู้เรียก Publish ที่ได้รับอนุญาต |
| `TIKTOK_ACCESS_TOKEN`              | เรียก TikTok Creator Info และตรวจสถานะ Publish                               | User Access Token ที่ได้จาก TikTok OAuth หลัง SuperChoice AI App ได้รับสิทธิ์ Content Posting/Direct Post                  | สุ่มเองไม่ได้                                    | Lovable Secret                                         |
| `LINE_AUTH_BRIDGE_URL`             | URL ที่ปุ่ม LINE Login redirect ไป                                           | สำหรับโครงปัจจุบันแนะนำใช้ LIFF URL เช่น `https://liff.line.me/{LIFF_ID}`                                                  | ไม่ได้ LINE สร้างให้                             | Lovable Secret/Environment                             |
| `VITE_LINE_LIFF_ID`                | ให้ LIFF SDK ฝั่ง Browser เรียก `liff.init()`                                | LIFF ID เช่น `1234567890-AbCdEfGh` จาก LINE Developers Console                                                             | ไม่ได้ LINE สร้างให้                             | Public Environment                                     |
| `VITE_LINE_LIFF_URL`               | LIFF URL สำหรับเปิด Portal ผ่าน LINE                                         | `https://liff.line.me/{LIFF_ID}` จาก LINE Developers Console                                                               | ไม่ได้ LINE สร้างให้                             | Public Environment                                     |
| `LINE_LIFF_CHANNEL_ID`             | Server ใช้ตรวจสอบว่า LINE ID Token ถูกออกให้ Channel ที่ถูกต้อง              | ตัวเลข Channel ID ของ LINE Login Channel เช่น `1234567890` ไม่ใช่ LIFF ID                                                  | ไม่ได้ LINE สร้างให้                             | Lovable Secret                                         |
| `APP_SESSION_SECRET`               | เซ็น Session Cookie `sc_session` สำหรับ LINE Member/Admin                    | สุ่ม Secret อย่างน้อย 32 ตัวอักษร แนะนำ 64 bytes                                                                           | ได้ สร้างเอง                                     | Lovable Secret                                         |
| `HEYGEN_API_KEY`                   | เรียก HeyGen `/v3/users/me`, avatars, voices, assets, videos และ templates   | Copy API Key จาก HeyGen Account/Developer/API settings                                                                     | สุ่มเองไม่ได้                                    | Lovable Secret                                         |
