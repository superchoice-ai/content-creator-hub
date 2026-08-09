ให้ค้นหาข้อมูล HeyGen ได้ข้อมูลครบถ้วน นี่คือตารางสรุปทั้งหมด:(แต่อาจเปลี่ยนแปลงได้)  
โดย API ฟรี สามารถนำไปใช้ได้ทุกตัว แต่ API คิดเงินเรียกใช้เฉพาะ /v3/video-agents, /v3/ai-clipping เท่านั้น ใน content-creator-hub ให้มี UI สำหรับเลือก avatars, looks, voices และมีปุ่ม ให้ manual refresh ทั้งหมด(avatars, looks, voices)ได้ตามเงื่อนไขด้านล่าง ให้มี UI รองรับค่ามาตรฐานตาม HeyGen กำหนด `/v3/assets` | อัปโหลดรูป/PDF/วิดีโอ/เสียง | เช่น เลือกได้จาก assets list ที่มีอยู่แล้วเท่านั้น หรือ เพิ่มผ่าน local drive ได้เฉพาะไฟล์ที่กำหนดเท่านั้น  
ให้มี UI รองรับ `/v3/ai-clipping` | ตัดคลิป Highlight ให้มีข้อความข้างๆ  “low cost ประหยัดค่าสร้าง VDO”  
ให้มี UI แจ้ง `/v3/users/me` | ดูยอดเงินคงเหลือ
---  
  
## ✅ API ฟรี — ไม่คิดเงิน  
  
| Method | Endpoint | ทำอะไร |  
|--------|----------|--------|  
| GET | `/v3/avatars` | ดูรายการอวตารทั้งหมดเฉพาะ private |  
| GET | `/v3/avatars/looks` | ดูลุคของอวตาร + `avatar_id` เฉพาะ private|  
| GET | `/v3/avatars/{group_id}` | ดูอวตารเฉพาะตัว เฉพาะ private|  
| GET | `/v3/voices` | ดูรายการเสียงทั้งหมด เฉพาะ 5 เสียงหลักที่รองรับใน content-creator-hub |  
| GET | `/v3/voices/{voice_id}` | ดูเสียงเฉพาะตัว เฉพาะ 5 เสียงหลักที่รองรับใน content-creator-hub |  
| GET | `/v3/videos` | ดูรายการวิดีโอในบัญชี |  
| GET | `/v3/videos/{video_id}` | ดูสถานะ/ลิงก์ดาวน์โหลดวิดีโอ |  
| GET | `/v3/users/me` | ดูยอดเงินคงเหลือ |  
| GET | `/v3/templates` | ดูรายการ template |  
| GET | `/v3/assets/{asset_id}` | ดูไฟล์ที่อัปโหลด |  
| POST | `/v3/assets` | อัปโหลดรูป/PDF/วิดีโอ/เสียง |  
| DELETE | `/v3/assets/{asset_id}` | ลบไฟล์ที่อัปโหลด |  
| DELETE | `/v3/videos/{video_id}` | ลบวิดีโอ |  
| GET | `/v3/webhooks` | ดูรายการ webhook |  
| POST | `/v3/webhooks` | สร้าง webhook |  
  
---  
  
## 💰 API คิดเงิน — หักเครดิตทันที  
  
| Method | Endpoint | ทำอะไร | ราคา |  
|--------|----------|--------|------|  
| POST | `/v3/video-agents` | สร้างวิดีโอจาก Prompt | $0.0333/วิ |  
| POST | `/v3/videos` | สร้างวิดีโออวตาร (Avatar IV Photo) | $0.05/วิ |  
| POST | `/v3/videos` | สร้างวิดีโออวตาร (Avatar IV Digital Twin/Studio) | $0.0667/วิ |  
| POST | `/v3/videos` | สร้างวิดีโออวตาร (Avatar V Digital Twin) | $0.0667/วิ |  
| POST | `/v3/videos` | สร้างวิดีโออวตาร (Avatar III) | $0.0167/วิ |  
| POST | `/v3/cinematic-avatar` | สร้าง Cinematic Avatar | $7.00/คลิป |  
| POST | `/v3/hyperframes` | Render HyperFrames 1080p/30fps | $0.10/นาที |  
| POST | `/v3/hyperframes` | Render HyperFrames 4K/30fps | $0.15/นาที |  
| POST | `/v3/video-translations` | แปลวิดีโอ (Speed) | $0.0333/วิ |  
| POST | `/v3/video-translations` | แปลวิดีโอ (Precision Lip Sync) | $0.0667/วิ |  
| POST | `/v3/lipsyncs` | Lipsync Speed | $0.0333/วิ |  
| POST | `/v3/lipsyncs` | Lipsync Precision | $0.0667/วิ |  
| POST | `/v3/ai-clipping` | ตัดคลิป Highlight | $0.15/คลิป |  
| POST | `/v3/speech` | Text-to-Speech | $0.000667/วิ |  
| POST | `/v3/avatars` | สร้าง Digital Twin / Photo Avatar | $1.00/ครั้ง |  
  
---  
  
> **Tip ประหยัดเงิน:** ใช้ GET ทดสอบและหา ID ได้ฟรีไม่จำกัด — จ่ายเงินเฉพาะตอน render จริงเท่านั้น  
  
```suggestions  
(Self-Serve Pricing)[/docs/pricing]  
(Upload Assets)[/docs/upload-assets]  
(Video Agent)[/docs/video-agent]  
```  
  
ให้ค้นหาข้อมูล HeyGen ได้ข้อมูลครบถ้วน นี่คือตัวอย่าง JSON ที่ใกล้เคียงการใช้งานจริงมากที่สุด:(แต่อาจเปลี่ยนแปลงได้)   
---  
  
**Step 1 — อัปโหลดไฟล์ก่อน (รูป + PDF)**  
```bash  
POST /v3/assets   ← ทำ 2 ครั้ง (รูป 1 ครั้ง, PDF 1 ครั้ง)  
→ ได้ asset_id กลับมา เช่น "asset_img001" และ "asset_pdf001"  
```  
  
**Step 2 — ดึง ID ที่ต้องการ**  
- `avatar_id` ← จาก `GET /v3/avatars/looks?ownership=private` กรองชื่อ **SuperChoice** ลุค 1  
- `voice_id` ← จาก `GET /v3/voices` กรองชื่อ **Achird**  
  
---  
  
**Step 3 — ส่ง API สร้างวิดีโอ**  
  
```json  
POST https://api.heygen.com/v3/video-agents  
Headers:  
  X-Api-Key: YOUR_API_KEY  
  Content-Type: application/json  
  
Body:  
{  
  "prompt": "สร้างวิดีโอ 1 นาที แนวนอน ภาษาไทย ทำตาม script ด้านล่างทุก scene:\n\nระบบใหม่ที่จะเปลี่ยนการทำงานทั้งองค์กร\n(ซูมวงกลม TO BE ทั้งวง)\nโครงการนี้เป็นการพัฒนาระบบสินเชื่อจากโปรแกรมเดิม สู่ Web Application...\n✅ Web Application\n✅ Central Database\n✅ 11 Branches\n✅ API Ready",  
  "avatar_id": "LOOK_ID_OF_SUPERCHOICE_LOOK1",  
  "voice_id": "VOICE_ID_OF_ACHIRD",  
  "orientation": "landscape",  
  "files": [  
    { "type": "asset_id", "asset_id": "asset_img001" },  
    { "type": "asset_id", "asset_id": "asset_pdf001" }  
  ],  
  "callback_url": "https://your-server.com/webhook"  
}  
```  
  
---  
  
> **หมายเหตุ:** ค่า `LOOK_ID_...` และ `VOICE_ID_...` ต้องแทนด้วย ID จริงที่ได้จาก Step 2 ครับ  
  
```suggestions  
(Video Agent)[/docs/video-agent]  
(Upload Assets)[/docs/upload-assets]  
(Prompting Guide)[/docs/prompting-guide]  
```  
