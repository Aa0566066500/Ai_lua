const express = require("express");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (typeof message !== "string") {
            return res.status(400).json({
                ok: false,
                error: "Message must be a string."
            });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({
                ok: false,
                error: "Message cannot be empty."
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                ok: false,
                error: "Message is too long."
            });
        }

        return res.json({
            ok: true,
            reply: "Chat route is working."
        });

    } catch (error) {
        console.error("Chat route error:", error);

        return res.status(500).json({
            ok: false,
            error: "Internal server error."
        });
    }
});

module.exports = router;