const part1 = "AQ.Ab8RN6IUpfHjt-ZmH4w7dmNB";
const part2 = "UL8zzVaJXx4n2wc09eCy2VYNPQ";

const API_KEY = part1 + part2;

async function askAI(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${API_KEY}`;

    const systemPrompt = `أنت خبير محترف ومحرك ذكي متخصص في لغة Luau وبيئة Roblox Studio.
شروط الإجابة:
1. قم بفحص الكود والتحقق من صحته برمجياً بنسبة 100% قبل إرساله.
2. ضع أي كود دائماً داخل أقواس التنسيق الثلاثية \`\`\`luau ... \`\`\`.
3. أجب بدقة ووضوح.`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nسؤال المستخدم: " + userMessage }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            typeWriterEffect(reply);
        } else if (data.error) {
            appendMessage(`⚠️ خطأ: ${data.error.message}`, "ai");
        }
    } catch (error) {
        appendMessage("❌ تعذر الاتصال بالخادم.", "ai");
    }
}

function typeWriterEffect(text) {
    const chatBox = document.getElementById("chat-box") || document.querySelector(".chat-container");
    const msgDiv = document.createElement("div");
    msgDiv.className = "message ai-message";
    chatBox.appendChild(msgDiv);

    // تحويل الأكواد لواجهة احترافية
    let formattedHtml = text.replace(/```(?:luau|lua)?\n([\s\S]*?)```/g, (match, code) => {
        return `
            <div class="code-box">
                <div class="code-header">
                    <span>Luau Script</span>
                    <button class="copy-btn" onclick="copyCode(this)">📋 نسخ الكود</button>
                </div>
                <pre><code>${code.trim()}</code></pre>
            </div>
        `;
    });

    // إذا فيه كود نعرضه فوراً عشان ما يخرب التنسيق، وإذا كلام يتدرج
    if (text.includes("```")) {
        msgDiv.innerHTML = formattedHtml;
    } else {
        let i = 0;
        const interval = setInterval(() => {
            msgDiv.textContent += text.charAt(i);
            i++;
            if (i >= text.length) clearInterval(interval);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 15);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function copyCode(btn) {
    const code = btn.parentElement.nextElementSibling.innerText;
    navigator.clipboard.writeText(code);
    btn.innerText = "✅ تم النسخ!";
    btn.style.background = "#22c55e";
    setTimeout(() => {
        btn.innerText = "📋 نسخ الكود";
        btn.style.background = "#3b82f6";
    }, 2000);
}
