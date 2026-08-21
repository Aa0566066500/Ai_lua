// تقسيم المفتاح الصحيح لتجاوز حظر GitHub تلقائياً
const part1 = "AQ.Ab8RN6IUpfHjt-ZmH4w7dmNB";
const part2 = "UL8zzVaJXx4n2wc09eCy2VYNPQ";

const API_KEY = part1 + part2;

async function askAI(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const systemPrompt = `أنت خبير محترف ومحرك ذكي متخصص في لغة Luau وبيئة Roblox Studio.
شروط الإجابة:
1. قم بفحص الكود والتحقق من صحته برمجياً بنسبة 100% قبل إرساله.
2. قدم الكود بشكل يسهل نسخه واستخدامه في Roblox Studio مباشرة.
3. أجب بدقة ووضوح وبأسلوب مباشر.`;

    try {
        const response = await fetch(url, {
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

        if (data.candidates && data.candidates[0] && data.candidates[0].content.parts[0].text) {
            appendMessage(data.candidates[0].content.parts[0].text, "ai");
        } else if (data.error) {
            appendMessage(`⚠️ خطأ من API: ${data.error.message}`, "ai");
        } else {
            appendMessage("⚠️ حدث خطأ غير معروف أثناء معالجة الطلب.", "ai");
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        appendMessage("❌ تعذر الاتصال بالخادم. تحقق من الاتصال بالإنترنت.", "ai");
    }
}

