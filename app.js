document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");
    const chatContainer = document.getElementById("chatContainer");

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        // إضافة رسالة المستخدم
        appendMessage(text, "user");
        userInput.value = "";

        // رد تجريبي بسيط أو استدعاء للذكاء الاصطناعي
        setTimeout(() => {
            if (typeof askAI === "function") {
                askAI(text);
            } else {
                appendMessage("مرحباً بك! أنا نظام Luau Studio AI التجريبي. كود AI يعمل بنجاح ويمكنك تطويره الآن.", "ai");
            }
        }, 600);
    });

    window.appendMessage = function(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };
});
