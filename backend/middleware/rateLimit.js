const requests = new Map();

function rateLimit(options = {}) {
    const windowMs = options.windowMs ?? 60 * 1000;
    const maxRequests = options.maxRequests ?? 20;

    return (req, res, next) => {
        const key = req.ip || "unknown";
        const now = Date.now();

        let record = requests.get(key);

        if (!record || now - record.start >= windowMs) {
            record = {
                start: now,
                count: 0
            };

            requests.set(key, record);
        }

        record.count += 1;

        if (record.count > maxRequests) {
            return res.status(429).json({
                ok: false,
                error: "Too many requests. Please try again later."
            });
        }

        next();
    };
}

module.exports = rateLimit;