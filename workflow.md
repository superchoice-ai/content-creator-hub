สรุปตรง ๆ: ตอนนี้ผู้ใช้ “ยังไม่มีหน้าจอใช้งานที่ชัดเจน” แม้มี workflow Publisher อยู่ เพราะระบบขาดจุดรับงานแบบง่ายสำหรับเลือกคลิป ใส่หัวข้อ เลือก Social Media ดู Preview และกดอนุมัติ จึงไม่แปลกที่ยังไม่รู้ว่าจะเริ่มตรงไหน  
รูปแบบใช้งานที่ควรเป็นมี 2 Use Case ดังนี้  
## Use Case 1: มีคลิปวิดีโออยู่แล้ว  
ตัวอย่าง: มี MP4 อยู่ใน Google Drive และต้องการให้ AI ปรับข้อความก่อนโพสต์  
## สิ่งที่ผู้ใช้ต้องกรอก  
1. เลือกไฟล์วิดีโอจาก Google Drive  
2. ใส่หัวข้อหรือแนวคิดต้นฉบับ เช่น SuperChoice AI ช่วยองค์กรสร้างระบบ RAG ได้อย่างไร  
3. เลือกเป้าหมาย เช่น  
    * ให้ความรู้  
    * โปรโมตบริการ  
    * สร้าง Engagement  
    * เชิญชวนให้ติดต่อ  
4. เลือก Social Media ที่ต้องการโพสต์:  
    * YouTube  
    * Facebook Page  
    * Facebook Group  
    * Instagram  
    * Threads  
    * X  
    * LINE OA  
    * LinkedIn  
5. กด Generate Preview  
## สิ่งที่ AI ทำ  
AI ควรถูกเรียกเพียง 1 ครั้ง แล้วส่งผลลัพธ์เป็น JSON ครบทุกแพลตฟอร์ม ไม่เรียก AI แยกทีละช่องและไม่ใช้ n8n AI Assistant  
ตัวอย่างผลลัพธ์:  

| ช่องทาง              | AI จัดเตรียมให้                         |
| ------------------- | ------------------------------------ |
| YouTube             | Title, Description, Hashtag, Privacy |
| Facebook Page/Group | Caption แบบอ่านง่ายและชวนสนทนา         |
| Instagram           | Hook สั้น, Caption, CTA, Hashtag       |
| Threads             | ข้อความสั้นแบบสนทนา                     |
| X                   | ข้อความไม่เกินข้อจำกัดที่กำหนด                |
| LINE OA             | ข้อความแจ้งผู้ติดตามและลิงก์                |
| LinkedIn            | ข้อความเชิงธุรกิจ/Enterprise             |
  
สำหรับคลิปแนว Reels/Shorts ใช้ Hook + ประโยชน์ + CTA + Hashtag 3–5 รายการ ส่วน LinkedIn ใช้ภาษาเชิงธุรกิจมากกว่า โดยสารหลักต้องไม่เปลี่ยนจากต้นฉบับ  
## ขั้น Preview และ Approval  
ระบบแสดงตารางให้ตรวจ:  

| ช่องทาง    | หัวข้อ/Caption | เลือกโพสต์ | สถานะ            |
| --------- | ------------ | -------- | ---------------- |
| YouTube   | AI สร้างให้    | ✅        | Waiting Approval |
| Facebook  | AI สร้างให้    | ✅        | Waiting Approval |
| Instagram | AI สร้างให้    | ✅        | Waiting Approval |
| X         | AI สร้างให้    | ❌        | Not Selected     |
| LinkedIn  | AI สร้างให้    | ✅        | Waiting Approval |
  
ผู้ใช้สามารถ:  
* แก้หัวข้อหรือ Caption  
* ปิดบางแพลตฟอร์ม  
* กำหนดเวลาโพสต์  
* เลือก YouTube เป็น Private/Public  
* กด Approve  
* กด Publish เป็นขั้นตอนสุดท้าย  
เมื่อยังไม่กดอนุมัติ ระบบต้องเป็น:  
```
approved=false
dry_run=true

```
เมื่อยืนยันโพสต์จริงจึงเปลี่ยนเป็น:  
```
approved=true
dry_run=false

```
จากนั้นจึงส่งเข้า CMT-01 Multi-Channel Publishing Orchestrator และส่งเฉพาะช่องที่เลือก  
  
## Use Case 2: ยังไม่มีคลิป และต้องการสร้างด้วย HeyGen  
ตัวอย่าง: มีเพียงหัวข้อ “5 เหตุผลที่องค์กรควรใช้ AI RAG”  
## ขั้นตอนใช้งาน  
1. ใส่หัวข้อหรือข้อมูลต้นทาง  
2. เลือกวัตถุประสงค์และกลุ่มเป้าหมาย  
3. เลือก Generate video with HeyGen  
4. AI สร้าง:  
    * Video script  
    * Opening hook  
    * Scene/section  
    * Closing CTA  
    * Caption สำหรับแต่ละ Social Media  
5. ผู้ใช้ตรวจและแก้ Script  
6. เลือก HeyGen:  
    * Avatar  
    * Voice  
    * ภาษา  
    * อัตราส่วนวิดีโอ เช่น 9:16 หรือ 16:9  
7. กดอนุมัติให้สร้างวิดีโอ  
8. HeyGen สร้างวิดีโอเพียง 1 คลิปต่อ Execution  
9. บันทึกวิดีโอไป Google Drive  
10. ผู้ใช้ Preview คลิปจริง  
11. เลือก Social Media ที่ต้องการ  
12. ตรวจ Caption รายช่อง  
13. อนุมัติและโพสต์  
HeyGen Generation Gate ต้องผ่านเงื่อนไขนี้เท่านั้น:  
```
approved=true
dry_run=false
output_type=video

```
การอนุมัติ “สร้างวิดีโอ” และ “โพสต์ Social Media” ควรแยกเป็นคนละ Gate เพื่อป้องกันคลิปที่เพิ่งสร้างถูกโพสต์ทันทีโดยยังไม่ได้ดู  
```
flowchart TD
    A["หัวข้อ/ข้อมูลต้นทาง"] --> B["AI สร้าง Script และ Caption"]
    B --> C["อนุมัติ Script"]
    C --> D["HeyGen สร้างวิดีโอ"]
    D --> E["เก็บใน Google Drive"]
    E --> F["Preview วิดีโอ"]
    F --> G["เลือก Social Media"]
    G --> H["อนุมัติโพสต์"]
    H --> I["CMT-01 Orchestrator"]

```
## สถานะที่ใช้งานได้ตอนนี้  
* เส้นทาง “มีคลิปแล้ว” มีโครง Publisher และ Orchestrator อยู่ แต่ส่วนที่เคยรายงานว่าเสร็จ 100% ต้องตรวจแบบ deterministic ใหม่ เพราะเคยถูกแก้ผ่าน n8n AI Assistant ซึ่งผิด Iron Rules  
* HeyGen ยังพักอยู่  
* ยังไม่ได้เลือก Avatar ID และ Voice ID  
* ยังไม่ได้ต่อ HeyGen Generation Gate เข้ากับเส้นทางใช้งานจริง  
* TikTok, Pinterest และ WordPress ยังพัก  
* ช่องที่อยู่ในขอบเขตคือ YouTube, Facebook Page/Group, Instagram, Threads, X, LINE OA และ LinkedIn  
* ยังไม่ควรโพสต์จริงจนกว่าจะตรวจ Publisher และ Approval Gate ใหม่  
## หน้าจอใช้งานที่ควรสร้าง  
เพื่อให้ใช้งานง่ายที่สุด ควรมี Content Publishing Form หน้าเดียว โดยแบ่งเป็น 4 ส่วน:  
1. **Content Source**  
    * Upload/Google Drive  
    * Generate with HeyGen  
2. **Content Brief**  
    * หัวข้อ  
    * กลุ่มเป้าหมาย  
    * วัตถุประสงค์  
    * CTA  
3. **Select Channels**  
    * Checkbox เลือก Social Media  
    * ตัวเลือกเฉพาะแต่ละช่อง  
4. **Preview & Approval**  
    * ดูคลิป  
    * ตรวจข้อความรายช่อง  
    * Approve  
    * Schedule/Publish  
ดังนั้นสิ่งที่ต้องทำต่อจริง ๆ ไม่ใช่เพิ่ม Publisher อีก แต่คือสร้าง Content Publishing Form → AI Content Adaptation → Preview → Approval → Orchestrator และเปิด HeyGen เป็นเส้นทางเสริมภายหลัง เมื่อเลือก Avatar/Voice และตรวจ Gate เรียบร้อยแล้วครับ.  
