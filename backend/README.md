# Roblox AI Backend

هذا المجلد يحتوي على الخادم الوسيط بين Roblox ومزود الذكاء الاصطناعي.

## المسؤوليات

- استقبال طلبات Roblox.
- التحقق من البيانات.
- تحديد معدل الطلبات.
- إرسال الطلب إلى مزود AI.
- إعادة النتيجة إلى Roblox.

## API

POST /api/chat

Body:

{
  "message": "اشرح RemoteEvent"
}

## Security

لا تضع مفتاح API داخل Roblox.

يتم استخدام متغير البيئة:

AI_API_KEY

ولا يتم رفع ملف `.env` إلى Git.