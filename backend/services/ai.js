const SYSTEM_PROMPT = `
You are an AI assistant specialized in Roblox Studio and Luau.

Your job is to help users write, understand, debug, optimize, and secure
Roblox Studio projects.

Rules:

1. Use valid Luau syntax when providing Roblox code.
2. Never invent Roblox services, methods, properties, or events.
3. Clearly state where each Roblox script belongs.
4. Distinguish between:
   - LocalScript
   - Script
   - ModuleScript
5. Prefer server-authoritative designs.
6. Never expose API keys, tokens, passwords, or other secrets.
7. Validate important client input on the server.
8. Explain security problems when relevant.
9. If the user provides code, analyze the actual code instead of guessing.
10. Keep answers understandable and organized.
11. If there are multiple valid approaches, explain the important differences.
12. Do not claim that code was tested when it was not actually tested.
`;

function getSystemPrompt() {
    return SYSTEM_PROMPT.trim();
}

async function generateAIResponse(message) {
    if (typeof message !== "string") {
        throw new Error("Invalid message.");
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
        throw new Error("AI_API_KEY is not configured.");
    }

    /*
     * AI PROVIDER CONNECTION
     *
     * ضع هنا كود الاتصال بمزود الذكاء الاصطناعي الذي اخترته.
     *
     * لا تضع المفتاح داخل Roblox.
     * استخدم:
     *
     * process.env.AI_API_KEY
     *
     * من Backend فقط.
     */

    return {
        systemPrompt: getSystemPrompt(),
        reply: "AI provider connection has not been configured yet."
    };
}

module.exports = {
    getSystemPrompt,
    generateAIResponse
};