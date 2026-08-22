"use strict";

const API_KEY = process.env.ANTHROPIC_API_KEY;

const MODEL =
    process.env.AI_MODEL ||
    "claude-3-5-sonnet-latest";

const MAX_HISTORY = 30;
const MAX_MESSAGE_LENGTH = 3000;

const SYSTEM_PROMPT = `
أنت AI_Lua_Roblox، مساعد ذكاء اصطناعي احترافي متخصص في Roblox Studio وLuau.

ساعد المستخدم في:
- Luau وLua
- Roblox Studio
- Scripts وLocalScripts وModuleScripts
- RemoteEvents وRemoteFunctions
- ServerScriptService
- ReplicatedStorage
- StarterGui وStarterPlayer
- UI
- NPCs
- Inventory
- Trading
- Round Systems
- Lobby Systems
- DataStores
- Debugging
- تحسين الأداء
- أمن أنظمة Roblox
- تصميم المشاريع الكبيرة

القواعد:
1. افهم سياق المحادثة قبل الإجابة.
2. إذا طلب المستخدم كودًا، أعطه كودًا كاملًا وواضحًا.
3. وضح اسم الملف ومكان وضعه إذا كان ذلك مفيدًا.
4. استخدم Luau الصحيحة الخاصة بـ Roblox.
5. لا تخترع APIs أو خصائص غير موجودة.
6. إذا كان هناك خطأ، اشرح السبب ثم أعط الإصلاح.
7. لا تكشف مفاتيح API أو الأسرار.
8. اعتبر بيانات العميل غير موثوقة، وضع التحقق المهم على السيرفر.
9. لا تدّعي تنفيذ شيء لم تنفذه.
10. حافظ على سياق المحادثة.
11. اجعل الإجابة مرتبة واحترافية.
12. عند إعطاء مشروع كامل، اذكر جميع الملفات المطلوبة.
`;

function validateConfiguration() {
    if (!API_KEY) {
        throw new Error(
            "ANTHROPIC_API_KEY غير موجود في Environment Variables."
        );
    }
}

function cleanHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(item => {
            return (
                item &&
                (
                    item.role === "user" ||
                    item.role === "assistant"
                ) &&
                typeof item.content === "string" &&
                item.content.trim()
            );
        })
        .slice(-MAX_HISTORY)
        .map(item => ({
            role: item.role,
            content: item.content
                .slice(0, MAX_MESSAGE_LENGTH)
        }));
}

async function generateReply(
    message,
    history = []
) {
    validateConfiguration();

    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        throw new Error("الرسالة غير صالحة.");
    }

    const cleanMessage =
        message
            .trim()
            .slice(0, MAX_MESSAGE_LENGTH);

    const messages =
        cleanHistory(history);

    /*
       لا نكرر رسالة المستخدم الحالية
       إذا كانت موجودة بالفعل في history.
    */

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

    const response =
        await fetch(
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

                    max_tokens: 8192,

                    system:
                        SYSTEM_PROMPT,

                    messages
                })
            }
        );

    let data;

    try {
        data =
            await response.json();
    } catch {
        throw new Error(
            "تعذر قراءة رد Claude."
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.error?.message ||
            `Claude API Error: ${response.status}`
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
            "Claude لم يرجع ردًا."
        );
    }

    return reply;
}

module.exports = {
    generateReply,
    cleanHistory
};