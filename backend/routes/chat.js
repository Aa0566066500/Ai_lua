"use strict";

const express = require("express");
const { generateReply } = require("../services/ai");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY = 30;


/* =========================================================
   POST /api/chat
========================================================= */

router.post("/", async (req, res) => {
    try {
        const body = req.body || {};

        const message =
            typeof body.message === "string"
                ? body.message.trim()
                : "";

        const model =
            typeof body.model === "string" &&
            body.model.trim()
                ? body.model.trim()
                : undefined;

        const history =
            Array.isArray(body.history)
                ? body.history
                : [];


        /* =================================================
           VALIDATE MESSAGE
        ================================================= */

        if (!message) {
            return res.status(400).json({
                ok: false,
                error: "اكتب رسالة أولًا."
            });
        }


        if (
            message.length >
            MAX_MESSAGE_LENGTH
        ) {
            return res.status(400).json({
                ok: false,
                error:
                    "الرسالة أطول من الحد المسموح."
            });
        }


        /* =================================================
           CLEAN HISTORY
        ================================================= */

        const cleanHistory =
            history
                .filter(item => {
                    return (
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string"
                    );
                })
                .slice(-MAX_HISTORY)
                .map(item => {
                    return {
                        role: item.role,
                        content:
                            item.content
                                .slice(
                                    0,
                                    MAX_MESSAGE_LENGTH
                                )
                    };
                });


        /* =================================================
           GENERATE AI RESPONSE
        ================================================= */

        const reply =
            await generateReply(
                message,
                cleanHistory,
                model
            );


        /* =================================================
           RESPONSE
        ================================================= */

        return res.json({
            ok: true,
            reply: String(reply)
        });

    } catch (error) {

        console.error(
            "Chat API Error:",
            error
        );


        return res.status(500).json({
            ok: false,
            error:
                "حدث خطأ أثناء معالجة الطلب."
        });
    }
});


module.exports = router;