const express = require("express");

const chatRouter = require("./routes/chat");
const rateLimit = require("./middleware/rateLimit");
const validateChatRequest = require("./middleware/validation");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(express.json({
    limit: "16kb"
}));

app.get("/", (req, res) => {
    res.json({
        ok: true,
        service: "Roblox Lua AI",
        status: "online"
    });
});

app.get("/health", (req, res) => {
    res.json({
        ok: true,
        status: "healthy"
    });
});

app.use(
    "/api/chat",
    rateLimit({
        windowMs: 60 * 1000,
        maxRequests: 20
    }),
    validateChatRequest,
    chatRouter
);

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        error: "Route not found."
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    res.status(500).json({
        ok: false,
        error: "Internal server error."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});