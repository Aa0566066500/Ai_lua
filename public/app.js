"use strict";

const state = {
    messages: [],
    conversations: [],
    currentConversationId: null,
    selectedModel: "lua",
    isGenerating: false,
    controller: null
};

const MAX_MESSAGE_LENGTH = 3000;
const MAX_HISTORY = 30;

const STORAGE_KEY = "ai_lua_roblox_v3";
const THEME_KEY = "ai_lua_theme";

const $ = id => document.getElementById(id);

const el = {
    sidebar: $("sidebar"),
    openSidebar: $("openSidebar"),
    closeSidebar: $("closeSidebar"),

    newChat: $("newChatButton"),
    conversationList: $("conversationList"),

    input: $("messageInput"),
    send: $("sendButton"),

    messages: $("messages"),
    welcome: $("welcomeScreen"),

    typing: $("typingContainer"),

    attachment: $("attachmentButton"),
    attachmentMenu: $("attachmentMenu"),

    upload: $("uploadCode"),
    paste: $("pasteCode"),
    file: $("fileInput"),

    counter: $("characterCounter"),

    modelButton: $("modelButton"),
    modelMenu: $("modelMenu"),
    modelName: $("modelName"),

    settings: $("settingsButton"),
    settingsModal: $("settingsModal"),
    closeSettings: $("closeSettings"),

    theme: $("themeSelect"),

    help: $("helpButton"),
    share: $("shareButton"),
    more: $("moreButton")
};


/* ==============================
   ID
============================== */

function id() {

    if (
        crypto &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return Date.now() + Math.random();
}


/* ==============================
   STORAGE
============================== */

function save() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            conversations: state.conversations,
            currentConversationId:
                state.currentConversationId,
            selectedModel:
                state.selectedModel
        })
    );
}


function load() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            createConversation(false);
            return;
        }

        const data = JSON.parse(raw);

        state.conversations =
            Array.isArray(data.conversations)
                ? data.conversations
                : [];

        state.currentConversationId =
            data.currentConversationId || null;

        state.selectedModel =
            data.selectedModel || "lua";

        if (!state.conversations.length) {
            createConversation(false);
            return;
        }

        if (!getConversation()) {
            state.currentConversationId =
                state.conversations[0].id;
        }

        loadConversation();

    } catch {

        state.conversations = [];

        createConversation(false);
    }
}


/* ==============================
   CONVERSATIONS
============================== */

function createConversation(saveIt = true) {

    const conversation = {
        id: id(),
        title: "محادثة جديدة",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };

    state.conversations.unshift(
        conversation
    );

    state.currentConversationId =
        conversation.id;

    state.messages = [];

    renderConversations();
    renderMessages();

    if (saveIt) save();

    closeSidebar();
}


function getConversation() {

    return state.conversations.find(
        x =>
            x.id ===
            state.currentConversationId
    );
}


function loadConversation() {

    const conversation =
        getConversation();

    if (!conversation) {
        createConversation();
        return;
    }

    state.messages =
        Array.isArray(conversation.messages)
            ? [...conversation.messages]
            : [];

    renderConversations();
    renderMessages();
}


function syncConversation() {

    const conversation =
        getConversation();

    if (!conversation) return;

    conversation.messages =
        [...state.messages];

    conversation.updatedAt =
        Date.now();

    if (
        conversation.title === "محادثة جديدة"
    ) {

        const first =
            state.messages.find(
                x => x.role === "user"
            );

        if (first) {

            conversation.title =
                first.content
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 42);
        }
    }

    state.conversations.sort(
        (a, b) =>
            b.updatedAt -
            a.updatedAt
    );

    renderConversations();
    save();
}


function renderConversations() {

    el.conversationList.innerHTML = "";

    for (const conversation of state.conversations) {

        const button =
            document.createElement("button");

        button.className =
            "conversation-item";

        if (
            conversation.id ===
            state.currentConversationId
        ) {
            button.classList.add("active");
        }

        button.textContent =
            conversation.title;

        button.onclick = () => {

            state.currentConversationId =
                conversation.id;

            loadConversation();
            save();
            closeSidebar();
        };

        el.conversationList.appendChild(
            button
        );
    }
}


/* ==============================
   MESSAGES
============================== */

function addMessage(role, content) {

    const message = {
        id: id(),
        role,
        content: String(content || ""),
        createdAt: Date.now()
    };

    state.messages.push(message);

    syncConversation();

    return message;
}


function renderMessages() {

    el.messages.innerHTML = "";

    const has =
        state.messages.length > 0;

    el.welcome.classList.toggle(
        "hidden",
        has
    );

    for (const message of state.messages) {

        el.messages.appendChild(
            createMessage(message)
        );
    }

    scrollBottom();
}


function createMessage(message) {

    const article =
        document.createElement("article");

    article.className =
        `message ${message.role}`;

    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    if (message.role === "assistant") {

        const img =
            document.createElement("img");

        img.src = "/logo.png";
        img.alt = "";

        avatar.appendChild(img);

    } else {

        avatar.textContent = "أنت";
    }

    const body =
        document.createElement("div");

    body.className = "message-body";

    const name =
        document.createElement("div");

    name.className = "message-name";

    name.textContent =
        message.role === "assistant"
            ? "AI_Lua_roblox"
            : "أنت";

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    if (message.role === "assistant") {

        renderAssistant(
            content,
            message.content
        );

    } else {

        content.textContent =
            message.content;
    }

    body.appendChild(name);
    body.appendChild(content);

    article.appendChild(avatar);
    article.appendChild(body);

    return article;
}


/* ==============================
   AI CONTENT
============================== */

function renderAssistant(
    container,
    text
) {

    const regex =
        /```([\w-]*)\n?([\s\S]*?)```/g;

    let last = 0;
    let match;

    while (
        (match = regex.exec(text)) !== null
    ) {

        const before =
            text.slice(last, match.index);

        if (before) {
            appendText(container, before);
        }

        container.appendChild(
            createCode(
                match[1] || "code",
                match[2].replace(/\n$/, "")
            )
        );

        last = regex.lastIndex;
    }

    const remaining =
        text.slice(last);

    if (remaining) {
        appendText(container, remaining);
    }
}


function appendText(container, text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    div.style.whiteSpace = "pre-wrap";

    container.appendChild(div);
}


function createCode(language, code) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "code-block";

    const header =
        document.createElement("div");

    header.className =
        "code-header";

    const lang =
        document.createElement("span");

    lang.className =
        "code-language";

    lang.textContent =
        language;

    const copy =
        document.createElement("button");

    copy.className =
        "copy-code";

    copy.textContent =
        "نسخ";

    copy.onclick = async () => {

        try {

            await navigator.clipboard.writeText(
                code
            );

            copy.textContent =
                "تم النسخ";

            setTimeout(
                () => copy.textContent = "نسخ",
                1500
            );

        } catch {

            copy.textContent =
                "فشل النسخ";
        }
    };

    header.appendChild(lang);
    header.appendChild(copy);

    const pre =
        document.createElement("pre");

    const codeElement =
        document.createElement("code");

    codeElement.textContent = code;

    pre.appendChild(codeElement);

    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    return wrapper;
}


/* ==============================
   INPUT
============================== */

function updateInput() {

    const value = el.input.value;

    el.counter.textContent =
        `${value.length} / ${MAX_MESSAGE_LENGTH}`;

    el.input.style.height = "auto";

    el.input.style.height =
        Math.min(
            el.input.scrollHeight,
            190
        ) + "px";

    if (!state.isGenerating) {

        el.send.disabled =
            !value.trim();
    }
}


function clearInput() {

    el.input.value = "";

    updateInput();
}


/* ==============================
   HISTORY
============================== */

function history() {

    return state.messages
        .slice(-MAX_HISTORY)
        .map(message => ({
            role:
                message.role === "assistant"
                    ? "assistant"
                    : "user",

            content:
                String(message.content)
        }));
}


/* ==============================
   SEND
============================== */

async function sendMessage(text = null) {

    if (state.isGenerating) return;

    const message =
        text !== null
            ? String(text).trim()
            : el.input.value.trim();

    if (!message) return;

    if (
        message.length >
        MAX_MESSAGE_LENGTH
    ) {

        notice(
            "الحد الأقصى للرسالة 3000 حرف."
        );

        return;
    }

    clearInput();

    addMessage(
        "user",
        message
    );

    renderMessages();

    setGenerating(true);

    state.controller =
        new AbortController();

    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message,
                            model:
                                state.selectedModel,
                            history:
                                history()
                        }),

                    signal:
                        state.controller.signal
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            data.ok !== true
        ) {

            throw new Error(
                data.error ||
                "حدث خطأ في الخادم."
            );
        }

        const reply =
            String(data.reply || "").trim();

        if (!reply) {

            throw new Error(
                "الذكاء الاصطناعي لم يرجع ردًا."
            );
        }

        addMessage(
            "assistant",
            reply
        );

        renderMessages();

    } catch (error) {

        if (
            error.name === "AbortError"
        ) {
            return;
        }

        console.error(error);

        addMessage(
            "assistant",
            "تعذر الحصول على الرد.\n\n" +
            error.message
        );

        renderMessages();

    } finally {

        state.controller = null;

        setGenerating(false);
    }
}


/* ==============================
   GENERATING
============================== */

function setGenerating(value) {

    state.isGenerating = value;

    el.typing.classList.toggle(
        "hidden",
        !value
    );

    if (value) {

        el.send.disabled = false;

        el.send.textContent = "■";

        el.send.title = "إيقاف";

    } else {

        el.send.textContent = "↑";

        el.send.title = "إرسال";

        el.send.disabled =
            !el.input.value.trim();
    }

    if (value) {
        scrollBottom();
    }
}


function stopGeneration() {

    if (state.controller) {

        state.controller.abort();

        state.controller = null;
    }

    setGenerating(false);
}


/* ==============================
   MODEL
============================== */

function selectModel(model) {

    state.selectedModel =
        model === "general"
            ? "general"
            : "lua";

    el.modelName.textContent =
        state.selectedModel === "lua"
            ? "AI_Lua_roblox"
            : "General AI";

    document
        .querySelectorAll(".model-option")
        .forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.model ===
                    state.selectedModel
            );
        });

    el.modelMenu.classList.add("hidden");

    save();
}


/* ==============================
   THEME
============================== */

function applyTheme(theme) {

    document.body.classList.toggle(
        "light",
        theme === "light"
    );

    localStorage.setItem(
        THEME_KEY,
        theme
    );
}


/* ==============================
   FILES
============================== */

async function handleFile(file) {

    if (!file) return;

    const allowed =
        /\.(lua|luau|txt|js|json|md)$/i
            .test(file.name);

    if (!allowed) {

        notice(
            "هذا النوع من الملفات غير مدعوم."
        );

        return;
    }

    if (file.size > 1024 * 1024) {

        notice(
            "حجم الملف يجب أن يكون أقل من 1MB."
        );

        return;
    }

    try {

        const content =
            await file.text();

        el.input.value =
            `حلل هذا الملف: ${file.name}\n\n` +
            "```lua\n" +
            content +
            "\n```";

        updateInput();

        el.input.focus();

    } catch {

        notice(
            "تعذر قراءة الملف."
        );
    }
}


/* ==============================
   SIDEBAR
============================== */

function openSidebar() {

    el.sidebar.classList.add("open");
}


function closeSidebar() {

    el.sidebar.classList.remove("open");
}


/* ==============================
   NOTICE
============================== */

let noticeTimer;

function notice(message) {

    let box =
        document.getElementById(
            "notice"
        );

    if (!box) {

        box =
            document.createElement("div");

        box.id = "notice";

        Object.assign(
            box.style,
            {
                position: "fixed",
                left: "50%",
                bottom: "100px",
                transform:
                    "translateX(-50%)",
                zIndex: 9999,
                padding: "11px 16px",
                borderRadius: "12px",
                background: "#191c25",
                color: "white",
                border:
                    "1px solid rgba(255,255,255,.1)",
                boxShadow:
                    "0 20px 50px rgba(0,0,0,.4)",
                fontSize: "13px"
            }
        );

        document.body.appendChild(box);
    }

    box.textContent = message;

    clearTimeout(noticeTimer);

    noticeTimer =
        setTimeout(
            () => box.remove(),
            2600
        );
}


/* ==============================
   SCROLL
============================== */

function scrollBottom() {

    requestAnimationFrame(() => {

        el.chat =
            document.getElementById(
                "chatContainer"
            );

        if (el.chat) {

            el.chat.scrollTop =
                el.chat.scrollHeight;
        }
    });
}


/* ==============================
   EVENTS
============================== */

function events() {

    el.input.addEventListener(
        "input",
        updateInput
    );

    el.input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );

    el.send.onclick = () => {

        if (state.isGenerating) {

            stopGeneration();

        } else {

            sendMessage();
        }
    };

    el.newChat.onclick =
        () => createConversation();

    el.openSidebar.onclick =
        openSidebar;

    el.closeSidebar.onclick =
        closeSidebar;

    el.modelButton.onclick = () => {

        el.modelMenu.classList.toggle(
            "hidden"
        );
    };

    document
        .querySelectorAll(".model-option")
        .forEach(option => {

            option.onclick = () =>
                selectModel(
                    option.dataset.model
                );
        });

    el.settings.onclick = () => {

        el.settingsModal.classList.remove(
            "hidden"
        );
    };

    el.closeSettings.onclick = () => {

        el.settingsModal.classList.add(
            "hidden"
        );
    };

    el.theme.onchange = event =>
        applyTheme(
            event.target.value
        );

    el.attachment.onclick = () => {

        el.attachmentMenu.classList.toggle(
            "hidden"
        );
    };

    el.upload.onclick = () => {

        el.file.click();

        el.attachmentMenu.classList.add(
            "hidden"
        );
    };

    el.file.onchange = event => {

        handleFile(
            event.target.files[0]
        );

        event.target.value = "";
    };

    el.paste.onclick = async () => {

        try {

            el.input.value =
                await navigator.clipboard
                    .readText();

            updateInput();
            el.input.focus();

        } catch {

            notice(
                "تعذر قراءة الحافظة."
            );
        }

        el.attachmentMenu.classList.add(
            "hidden"
        );
    };

    el.help.onclick = () => {

        notice(
            "اكتب سؤالًا عن Roblox أو Luau أو ارفع ملف كود."
        );
    };

    el.share.onclick = async () => {

        const conversation =
            getConversation();

        if (!conversation) return;

        const text =
            conversation.messages
                .map(x =>
                    `${x.role === "user" ? "أنت" : "AI_Lua_roblox"}:\n${x.content}`
                )
                .join("\n\n");

        try {

            if (navigator.share) {

                await navigator.share({
                    title:
                        conversation.title,
                    text
                });

            } else {

                await navigator.clipboard
                    .writeText(text);

                notice(
                    "تم نسخ المحادثة."
                );
            }

        } catch {}
    };

    el.more.onclick = () => {

        notice(
            "المزيد من أدوات المحادثة قريبًا."
        );
    };

    document.addEventListener(
        "click",
        event => {

            if (
                !el.modelMenu.contains(
                    event.target
                ) &&
                !el.modelButton.contains(
                    event.target
                )
            ) {

                el.modelMenu.classList.add(
                    "hidden"
                );
            }

            if (
                !el.attachmentMenu.contains(
                    event.target
                ) &&
                !el.attachment.contains(
                    event.target
                )
            ) {

                el.attachmentMenu.classList.add(
                    "hidden"
                );
            }
        }
    );

    document
        .querySelectorAll(".quick-card")
        .forEach(card => {

            card.onclick = () => {

                sendMessage(
                    card.dataset.prompt
                );
            };
        });
}


/* ==============================
   INIT
============================== */

function init() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        ) || "dark";

    applyTheme(theme);

    el.theme.value = theme;

    load();

    events();

    selectModel(
        state.selectedModel
    );

    updateInput();
}

init();