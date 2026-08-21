function validateChatRequest(req, res, next) {
    const { message } = req.body || {};

    if (typeof message !== "string") {
        return res.status(400).json({
            ok: false,
            error: "message must be a string."
        });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
        return res.status(400).json({
            ok: false,
            error: "message cannot be empty."
        });
    }

    if (trimmedMessage.length > 2000) {
        return res.status(400).json({
            ok: false,
            error: "message is too long."
        });
    }

    req.chatMessage = trimmedMessage;

    next();
}

module.exports = validateChatRequest;