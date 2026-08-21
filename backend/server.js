"use strict";

require("dotenv").config();

const express = require("express");
const path = require("path");

const chatRouter = require("./routes/chat");
const rateLimit = require("./middleware/rateLimit");

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;


/* =========================================================
   SECURITY
========================================================= */

app.disable("x-powered-by");


/* =========================================================
   BODY PARSER
========================================================= */

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


/* =========================================================
   FRONTEND
========================================================= */

const publicPath =
    path.join(__dirname, "..", "public");

app.use(
    express.static(publicPath)
);


/* =========================================================
   API RATE LIMIT
========================================================= */

app.use(
    "/api/chat",
    rateLimit
);


/* =========================================================
   CHAT API
========================================================= */

app.use(
    "/api/chat",
    chatRouter
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/api/health",
    (req, res) => {
        res.json({
            ok: true,
            service: "Roblox Lua AI",
            status: "online"
        });
    }
);


/* =========================================================
   HOME
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                publicPath,
                "index.html"
            )
        );
    }
);


/* =========================================================
   API 404
========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            ok: false,
            error: "API endpoint not found."
        });
    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "Server Error:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        res.status(500).json({
            ok: false,
            error:
                "حدث خطأ داخلي في الخادم."
        });
    }
);


/* =========================================================
   START
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Roblox Lua AI backend running on port ${PORT}`
        );
    }
);