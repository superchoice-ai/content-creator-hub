# สร้าง SuperChoice AI Portal = Website + Feed/CMS + LIFF/Web Form + CRM Lite + Cart/Payment + Member Dashboard วางขอบเขตเป็น 3 ระยะ:  
1. Website + Feed/CMS + Content Publishing Form + LIFF  
2. CRM Lite + Member Dashboard + Lead/Customer management  
3. Product/Package + Cart + Payment + Subscription  
ให้รองรับ LINE Login/LIFF, n8n,  Google Workspace(Wordpress, Woocommerce, Hubspot, Salesforce สำหรับอนาคต) โดย สำหรับ admin page ให้ทำได้ดังนี้ AI สร้าง Content Draft → เก็บใน CMS → Admin Preview/Edit → Approve → แสดงบน Website Feed → เลือก Social Media → ส่งเข้า n8n Publisher   

| ระบบ | หน้าที่ |
| ------------- | --------------------------------------------------------------------------- |
| Lovable | Website, Feed, Web Form, Dashboard และ Admin UI |
| Lovable Cloud | Database, Auth, Storage, Edge Functions |
| n8n | Automation, AI adaptation, HeyGen, Approval และ Social Publishing |
| Google Drive | เก็บวิดีโอต้นฉบับและผลลัพธ์ HeyGen |
| LINE LIFF | เปิด Form/Dashboard ด้วย LINE LIFF ผ่าน Browser หรือ LINE สำหรับ Admin page เท่านั้น |
  
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
  
## Use Case 2: มีคลิปวิดีโออยู่แล้ว (คล้าย Use Case 1 ต่างกันตรงที่เลือกไฟล์จาก local drive แทน) Use Case 3: ยังไม่มีคลิป และต้องการสร้างด้วย HeyGen  
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
    * Avatar(มี option ให้เลือกจากแหล่ง HeyGen หรือจาก private avatar เป็น default)  
    * Voice (มี option ให้เลือกจากแหล่ง HeyGen เป็น default หรือจาก private avatar และสัมพันธ์กับข้อภาษาข้อถัดไป)  
    * ภาษา มี option ให้เลือก 5 ภาษายอดนิยม รวมภาษาไทย เป็น default  
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
 สำหรับบุคคลทั่วไปจะ Guest และมีระบบสมาชิก แบบเข้าสู่ระบบด้วย Google, LINE เพื่อรับสิทธิประโยชน์อื่นๆ และระบบ CRM, ตะกร้า ในอนาคต  
