const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({
    limit: "16kb"
}));

const MAX_MESSAGE_LENGTH = 2000;

const cooldown = new Map();

function allowedRequest(ip) {
    const now = Date.now();
    const previous = cooldown.get(ip) || 0;

    if (now - previous < 1500) {
        return false;
    }

    cooldown.set(ip, now);

    return true;
}

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "Roblox AI Backend"
    });
});

app.post("/api/chat", async (req, res) => {
    const ip = req.ip;

    if (!allowedRequest(ip)) {
        return res.status(429).json({
            error: "Too many requests"
        });
    }

    const message = req.body?.message;

    if (typeof message !== "string") {
        return res.status(400).json({
            error: "message must be a string"
        });
    }

    if (message.length === 0) {
        return res.status(400).json({
            error: "message is empty"
        });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
            error: "message is too long"
        });
    }

    /*
        هنا سيتم ربط مزود الذكاء الاصطناعي.

        لا تضع API Key داخل Roblox.

        استخدم:
        process.env.AI_API_KEY

        من ملف .env على السيرفر فقط.
    */

    return res.json({
        ok: true,
        reply: "Backend is working."
    });
});

app.listen(PORT, () => {
    console.log(
        `Roblox AI backend running on port ${PORT}`
    );
});