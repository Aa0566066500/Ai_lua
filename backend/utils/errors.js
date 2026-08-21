function sendError(res, statusCode, message) {
    return res.status(statusCode).json({
        ok: false,
        error: message
    });
}

function handleServerError(res, error) {
    console.error(error);

    return res.status(500).json({
        ok: false,
        error: "Internal server error."
    });
}

module.exports = {
    sendError,
    handleServerError
};