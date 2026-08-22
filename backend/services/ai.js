"use strict";

const API_KEY = process.env.ANTHROPIC_API_KEY;

const MODEL =
    process.env.AI_MODEL ||
    "claude-3-5-sonnet-latest";

const MAX_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 3000;
const TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `
أنت Lua AI، مساعد ذكاء اصطناعي احترافي متخصص في Roblox Studio وLuau.

ساعد المستخدم في البرمجة، إصلاح الأخطاء، شرح الأكواد، تصميم أنظمة Roblox، وتحسين الأمان والأداء.

عند إعطاء كود:
- استخدم Luau الصحيحة.
- اشرح أين يوضع الملف عند الحاجة.
- لا تخترع APIs.
- اجعل الحل واضحًا وكاملًا.
- لا تكشف أي مفاتيح أو أسرار.
`;

function cleanHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(item =>
            item &&
            (item.role === "user" ||
             item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim()
        )
        .slice(-MAX_HISTORY)
        .map(item => ({
            role: item.role,
            content: item.content.slice(
                0,
                MAX_MESSAGE_LENGTH
            )
        }));
}

async function generateReply(message, history = []) {

    if (!API_KEY) {
        throw new Error(
            "ANTHROPIC_API_KEY غير موجود في Environment Variables."
        );
    }

    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        throw new Error("الرسالة غير صالحة.");
    }

    const cleanMessage =
        message.trim().slice(
            0,
            MAX_MESSAGE_LENGTH
        );

    const messages =
        cleanHistory(history);

    const last =
        messages[messages.length - 1];

    if (
        !last ||
        last.role !== "user" ||
        last.content !== cleanMessage
    ) {
        messages.push({
            role: "user",
            content: cleanMessage
        });
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {
            controller.abort();
        }, TIMEOUT_MS);

    let response;

    try {

        response = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-api-key":
                        API_KEY,

                    "anthropic-version":
                        "2023-06-01"
                },

                body: JSON.stringify({
                    model: MODEL,
                    max_tokens: 4096,
                    system: SYSTEM_PROMPT,
                    messages
                }),

                signal:
                    controller.signal
            }
        );

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {
            throw new Error(
                "انتهت مهلة الاتصال بـ Claude بعد 30 ثانية."
            );
        }

        throw new Error(
            "تعذر الاتصال بـ Anthropic: " +
            error.message
        );

    } finally {

        clearTimeout(timeout);
    }

    let data;

    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "Anthropic أرسل ردًا غير مفهوم."
        );
    }

    if (!response.ok) {

        const apiError =
            data?.error?.message ||
            "خطأ غير معروف من Anthropic.";

        throw new Error(
            `Anthropic ${response.status}: ${apiError}`
        );
    }

    const content =
        Array.isArray(data?.content)
            ? data.content
            : [];

    const reply =
        content
            .filter(part =>
                part &&
                part.type === "text"
            )
            .map(part =>
                part.text || ""
            )
            .join("")
            .trim();

    if (!reply) {

        throw new Error(
            "Anthropic لم يرجع نصًا."
        );
    }

    return reply;
}

module.exports = {
    generateReply,
    cleanHistory
};