// جلب المفتاح المربوط بأمان عبر بيئة التشغيل أو متغير عام
const API_KEY = window.GEMINI_API_KEY || "";

async function askAI(userMessage) {
    const systemPrompt = `
    أنت خبير محترف ومحرك ذكي متخصص في لغة Luau وبيئة Roblox Studio.
    شروط الإجابة:
    1. قم بفحص الكود والتحقق من صحته برمجياً بنسبة 100% قبل إرساله.
    2. قدم الكود بشكل يسهل نسخه واستخدامه في Roblox Studio مباشرة.
    3. إذا كان السؤال عاماً، أجب بدقة ووضوح وبأسلوب بسيط.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nسؤال المستخدم: " + userMessage }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            appendMessage(data.candidates[0].content.parts[0].text, "ai");
        } else {
            appendMessage("⚠️ لم يتم استلام رد صحيح، يرجى التأكد من صلاحية مفتاح API.", "ai");
        }
    } catch (error) {
        console.error("API Error:", error);
        appendMessage("❌ تعذر الاتصال بالسيرفر. تحقق من الاتصال بالإنترنت.", "ai");
    }
}
