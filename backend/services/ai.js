"use strict";

const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const MODEL =
    process.env.AI_MODEL || "gpt-5.6";

const MAX_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 3000;
const TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `
أنت Lua AI، مساعد ذكاء اصطناعي احترافي ومتخصص في Roblox Studio وLuau.

مهمتك مساعدة المستخدم في:
- Lua وLuau
- Roblox Studio
- Scripts وLocalScripts وModuleScripts
- RemoteEvents وRemoteFunctions
- ServerScriptService
- ReplicatedStorage
- StarterGui وStarterPlayer
- واجهات المستخدم UI
- NPCs
- Inventory
- Trading
- Round Systems
- Lobby Systems
- DataStores
- Debugging
- تحسين الأداء
- حماية أنظمة Roblox

القواعد:
1. افهم سياق المحادثة قبل الإجابة.
2. إذا طلب المستخدم كودًا، أعطه كودًا كاملًا وواضحًا.
3. اذكر اسم الملف ومكان وضعه عندما يكون ذلك مفيدًا.
4. استخدم Luau الصحيحة الخاصة بـ Roblox.
5. لا تخترع APIs أو خصائص غير موجودة.
6. إذا كان هناك خطأ، اشرح السبب ثم أعط الإصلاح.
7. لا تكشف مفاتيح API أو الأسرار.
8. اعتبر بيانات العميل غير موثوقة، وضع التحقق المهم على السيرفر.
9. لا تدّعي أنك نفذت شيئًا لم تنفذه.
10. اجعل الإجابة مرتبة وسهلة الفهم.
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

    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY غير موجود في Environment Variables."
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

    const historyMessages =
        cleanHistory(history);

    const input = [
        {
            role: "developer",
            content: SYSTEM_PROMPT
        }
    ];

    for (const item of historyMessages) {
        input.push({
            role: item.role,
            content: item.content
        });
    }

    const last =
        historyMessages[
            historyMessages.length - 1
        ];

    if (
        !last ||
        last.role !== "user" ||
        last.content !== cleanMessage
    ) {
        input.push({
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

    try {

        const response =
            await client.responses.create(
                {
                    model: MODEL,
                    input: input
                },
                {
                    signal:
                        controller.signal
                }
            );

        const reply =
            String(
                response.output_text || ""
            ).trim();

        if (!reply) {
            throw new Error(
                "OpenAI لم يرجع ردًا."
            );
        }

        return reply;

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {
            throw new Error(
                "انتهت مهلة الاتصال بـ OpenAI بعد 30 ثانية."
            );
        }

        console.error(
            "OpenAI Error:",
            error
        );

        throw new Error(
            error?.message ||
            "حدث خطأ أثناء الاتصال بـ OpenAI."
        );

    } finally {

        clearTimeout(timeout);
    }
}

module.exports = {
    generateReply,
    cleanHistory
};