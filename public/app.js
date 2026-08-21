"use strict";

const state = {
    messages: [],
    conversations: [],
    currentConversationId: null,
    selectedModel: "lua",
    isGenerating: false,
    controller: null
};

const elements = {
    sidebar: document.getElementById("sidebar"),
    openSidebar: document.getElementById("openSidebar"),
    closeSidebar: document.getElementById("closeSidebar"),

    newChatButton: document.getElementById("newChatButton"),
    conversationList: document.getElementById("conversationList"),

    messageInput: document.getElementById("messageInput"),
    sendButton: document.getElementById("sendButton"),
    messages: document.getElementById("messages"),
    welcomeScreen: document.getElementById("welcomeScreen"),

    typingContainer: document.getElementById("typingContainer"),

    attachmentButton: document.getElementById("attachmentButton"),
    attachmentMenu: document.getElementById("attachmentMenu"),
    uploadCode: document.getElementById("uploadCode"),
    pasteCode: document.getElementById("pasteCode"),
    fileInput: document.getElementById("fileInput"),

    characterCounter: document.getElementById("characterCounter"),

    modelButton: document.getElementById("modelButton"),
    modelMenu: document.getElementById("modelMenu"),

    settingsButton: document.getElementById("settingsButton"),
    settingsModal: document.getElementById("settingsModal"),
    closeSettings: document.getElementById("closeSettings"),
    themeSelect: document.getElementById("themeSelect"),
    languageSelect: document.getElementById("languageSelect"),

    helpButton: document.getElementById("helpButton"),
    shareButton: document.getElementById("shareButton"),
    moreButton: document.getElementById("moreButton"),

    voiceButton: document.getElementById("voiceButton")
};


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "lua_ai_state_v1";

function saveState() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                conversations: state.conversations,
                currentConversationId: state.currentConversationId,
                selectedModel: state.selectedModel
            })
        );
    } catch (error) {
        console.warn("Could not save state:", error);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            createNewConversation(false);
            return;
        }

        const saved = JSON.parse(raw);

        state.conversations = Array.isArray(saved.conversations)
            ? saved.conversations
            : [];

        state.currentConversationId =
            saved.currentConversationId || null;

        state.selectedModel =
            saved.selectedModel || "lua";

        if (!state.conversations.length) {
            createNewConversation(false);
            return;
        }

        const current = getCurrentConversation();

        if (!current) {
            state.currentConversationId =
                state.conversations[0].id;
        }

        loadCurrentConversation();

    } catch (error) {
        console.warn("Could not load state:", error);

        state.conversations = [];
        createNewConversation(false);
    }
}


/* =========================================================
   CONVERSATIONS
========================================================= */

function generateId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}

function createNewConversation(save = true) {
    const conversation = {
        id: generateId(),
        title: "محادثة جديدة",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };

    state.conversations.unshift(conversation);
    state.currentConversationId = conversation.id;
    state.messages = [];

    renderConversations();
    renderMessages();

    if (save) {
        saveState();
    }

    closeSidebarMobile();
}

function getCurrentConversation() {
    return state.conversations.find(
        conversation =>
            conversation.id === state.currentConversationId
    );
}

function loadCurrentConversation() {
    const conversation = getCurrentConversation();

    if (!conversation) {
        createNewConversation();
        return;
    }

    state.messages = Array.isArray(conversation.messages)
        ? [...conversation.messages]
        : [];

    renderConversations();
    renderMessages();
}

function updateCurrentConversation() {
    const conversation = getCurrentConversation();

    if (!conversation) {
        return;
    }

    conversation.messages = [...state.messages];
    conversation.updatedAt = Date.now();

    if (
        conversation.title === "محادثة جديدة" &&
        state.messages.length > 0
    ) {
        const firstUserMessage = state.messages.find(
            message => message.role === "user"
        );

        if (firstUserMessage) {
            conversation.title =
                firstUserMessage.content
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 45) ||
                "محادثة جديدة";
        }
    }

    state.conversations.sort(
        (a, b) => b.updatedAt - a.updatedAt
    );

    renderConversations();
    saveState();
}

function renderConversations() {
    if (!elements.conversationList) {
        return;
    }

    elements.conversationList.innerHTML = "";

    for (const conversation of state.conversations) {
        const button = document.createElement("button");

        button.className = "conversation-item";

        if (
            conversation.id ===
            state.currentConversationId
        ) {
            button.classList.add("active");
        }

        button.textContent =
            conversation.title || "محادثة جديدة";

        button.title =
            conversation.title || "محادثة جديدة";

        button.addEventListener("click", () => {
            state.currentConversationId =
                conversation.id;

            loadCurrentConversation();
            saveState();
            closeSidebarMobile();
        });

        elements.conversationList.appendChild(button);
    }
}


/* =========================================================
   MESSAGES
========================================================= */

function addMessage(role, content) {
    const message = {
        id: generateId(),
        role,
        content,
        createdAt: Date.now()
    };

    state.messages.push(message);

    updateCurrentConversation();

    return message;
}

function renderMessages() {
    if (!elements.messages) {
        return;
    }

    elements.messages.innerHTML = "";

    const hasMessages = state.messages.length > 0;

    if (elements.welcomeScreen) {
        elements.welcomeScreen.classList.toggle(
            "hidden",
            hasMessages
        );
    }

    for (const message of state.messages) {
        const element = createMessageElement(message);

        elements.messages.appendChild(element);
    }

    scrollToBottom();
}

function createMessageElement(message) {
    const wrapper = document.createElement("article");

    wrapper.className = `message ${message.role}`;

    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
        message.role === "user"
            ? "أنت"
            : "✦";

    const body = document.createElement("div");

    body.className = "message-body";

    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent =
        message.role === "user"
            ? "أنت"
            : "Lua AI";

    const content = document.createElement("div");

    content.className = "message-content";

    if (message.role === "assistant") {
        renderAssistantContent(
            content,
            message.content
        );
    } else {
        content.textContent = message.content;
    }

    body.appendChild(name);
    body.appendChild(content);

    wrapper.appendChild(avatar);
    wrapper.appendChild(body);

    return wrapper;
}


/* =========================================================
   MARKDOWN-LIKE RENDERING
========================================================= */

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderAssistantContent(container, text) {
    const source = String(text || "");

    const codeRegex =
        /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(source)) !== null) {
        const before = source.slice(
            lastIndex,
            match.index
        );

        if (before) {
            appendFormattedText(
                container,
                before
            );
        }

        const language =
            match[1] || "code";

        const code =
            match[2].replace(/\n$/, "");

        container.appendChild(
            createCodeBlock(language, code)
        );

        lastIndex = codeRegex.lastIndex;
    }

    const remaining =
        source.slice(lastIndex);

    if (remaining) {
        appendFormattedText(
            container,
            remaining
        );
    }
}

function appendFormattedText(container, text) {
    const block = document.createElement("div");

    block.textContent = text;

    block.style.whiteSpace = "pre-wrap";

    container.appendChild(block);
}

function createCodeBlock(language, code) {
    const wrapper = document.createElement("div");

    wrapper.className = "code-block";

    const header = document.createElement("div");

    header.className = "code-header";

    const languageElement =
        document.createElement("span");

    languageElement.className =
        "code-language";

    languageElement.textContent =
        language;

    const copyButton =
        document.createElement("button");

    copyButton.className = "copy-code";

    copyButton.textContent = "نسخ";

    copyButton.addEventListener(
        "click",
        async () => {
            try {
                await navigator.clipboard.writeText(
                    code
                );

                copyButton.textContent =
                    "تم النسخ";

                setTimeout(() => {
                    copyButton.textContent =
                        "نسخ";
                }, 1500);

            } catch {
                copyButton.textContent =
                    "فشل النسخ";
            }
        }
    );

    header.appendChild(languageElement);
    header.appendChild(copyButton);

    const pre = document.createElement("pre");

    const codeElement =
        document.createElement("code");

    codeElement.textContent = code;

    pre.appendChild(codeElement);

    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    return wrapper;
}


/* =========================================================
   INPUT
========================================================= */

function updateComposer() {
    const input = elements.messageInput;

    if (!input) {
        return;
    }

    const value = input.value;

    if (elements.characterCounter) {
        elements.characterCounter.textContent =
            `${value.length} / 2000`;
    }

    if (elements.sendButton) {
        elements.sendButton.disabled =
            !value.trim() ||
            state.isGenerating;
    }

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 180) +
        "px";
}

function clearInput() {
    elements.messageInput.value = "";

    updateComposer();

    elements.messageInput.style.height = "auto";
}


/* =========================================================
   CHAT REQUEST
========================================================= */

async function sendMessage(text = null) {
    if (state.isGenerating) {
        return;
    }

    const message =
        text !== null
            ? String(text).trim()
            : elements.messageInput.value.trim();

    if (!message) {
        return;
    }

    if (message.length > 2000) {
        showTemporaryNotice(
            "الرسالة طويلة جدًا."
        );

        return;
    }

    clearInput();

    addMessage("user", message);

    renderMessages();

    setGenerating(true);

    try {
        state.controller =
            new AbortController();

        const response = await fetch(
            "/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message,
                    model: state.selectedModel
                }),

                signal:
                    state.controller.signal
            }
        );

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "Invalid server response."
            );
        }

        if (!response.ok || data.ok !== true) {
            throw new Error(
                data.error ||
                "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي."
            );
        }

        addMessage(
            "assistant",
            data.reply || "لم يتم استلام رد."
        );

        renderMessages();

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(error);

        addMessage(
            "assistant",
            `حدث خطأ:\n\n${error.message}`
        );

        renderMessages();

    } finally {
        state.controller = null;

        setGenerating(false);
    }
}

function stopGeneration() {
    if (state.controller) {
        state.controller.abort();
        state.controller = null;
    }

    setGenerating(false);
}

function setGenerating(value) {
    state.isGenerating = value;

    if (elements.typingContainer) {
        elements.typingContainer.classList.toggle(
            "hidden",
            !value
        );
    }

    updateComposer();

    if (value) {
        scrollToBottom();
    }
}


/* =========================================================
   QUICK PROMPTS
========================================================= */

function setupQuickPrompts() {
    const prompts =
        document.querySelectorAll(
            ".prompt-card"
        );

    prompts.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const prompt =
                    button.dataset.prompt;

                if (prompt) {
                    sendMessage(prompt);
                }
            }
        );
    });
}


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebarMobile() {
    elements.sidebar?.classList.add("open");
}

function closeSidebarMobile() {
    elements.sidebar?.classList.remove("open");
}


/* =========================================================
   MODEL MENU
========================================================= */

function toggleModelMenu() {
    elements.modelMenu?.classList.toggle(
        "hidden"
    );

    const expanded =
        !elements.modelMenu?.classList.contains(
            "hidden"
        );

    elements.modelButton?.setAttribute(
        "aria-expanded",
        String(expanded)
    );
}

function selectModel(model) {
    state.selectedModel = model;

    document
        .querySelectorAll(".model-option")
        .forEach(option => {
            option.classList.toggle(
                "active",
                option.dataset.model === model
            );
        });

    const name =
        model === "lua"
            ? "Lua AI"
            : "General AI";

    const modelName =
        document.querySelector(
            ".model-name"
        );

    if (modelName) {
        modelName.textContent = name;
    }

    elements.modelMenu?.classList.add(
        "hidden"
    );

    saveState();
}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {
    elements.settingsModal?.classList.remove(
        "hidden"
    );
}

function closeSettings() {
    elements.settingsModal?.classList.add(
        "hidden"
    );
}

function applyTheme(theme) {
    document.body.classList.toggle(
        "light",
        theme === "light"
    );

    localStorage.setItem(
        "lua_ai_theme",
        theme
    );
}

function loadTheme() {
    const theme =
        localStorage.getItem(
            "lua_ai_theme"
        ) || "dark";

    applyTheme(theme);

    if (elements.themeSelect) {
        elements.themeSelect.value = theme;
    }
}


/* =========================================================
   ATTACHMENTS
========================================================= */

function toggleAttachmentMenu() {
    elements.attachmentMenu?.classList.toggle(
        "hidden"
    );
}

function openFilePicker() {
    elements.fileInput?.click();

    elements.attachmentMenu?.classList.add(
        "hidden"
    );
}

async function handleFile(file) {
    if (!file) {
        return;
    }

    const allowedExtensions = [
        ".lua",
        ".luau",
        ".txt",
        ".js",
        ".json",
        ".md"
    ];

    const lowerName =
        file.name.toLowerCase();

    const allowed =
        allowedExtensions.some(
            extension =>
                lowerName.endsWith(extension)
        );

    if (!allowed) {
        showTemporaryNotice(
            "نوع الملف غير مدعوم."
        );

        return;
    }

    if (file.size > 1024 * 1024) {
        showTemporaryNotice(
            "حجم الملف أكبر من 1MB."
        );

        return;
    }

    try {
        const content =
            await file.text();

        elements.messageInput.value =
            `راجع هذا الملف: ${file.name}\n\n` +
            "```lua\n" +
            content +
            "\n```";

        updateComposer();

        elements.messageInput.focus();

    } catch (error) {
        console.error(error);

        showTemporaryNotice(
            "تعذر قراءة الملف."
        );
    }
}


/* =========================================================
   HELP / SHARE
========================================================= */

function showHelp() {
    showTemporaryNotice(
        "اكتب سؤالك عن Lua أو Roblox Studio، ويمكنك أيضًا رفع ملف كود لتحليله."
    );
}

async function shareConversation() {
    const conversation =
        getCurrentConversation();

    if (!conversation) {
        return;
    }

    const text =
        conversation.messages
            .map(message => {
                const name =
                    message.role === "user"
                        ? "أنت"
                        : "Lua AI";

                return `${name}:\n${message.content}`;
            })
            .join("\n\n");

    try {
        if (
            navigator.share
        ) {
            await navigator.share({
                title: conversation.title,
                text
            });

            return;
        }

        await navigator.clipboard.writeText(
            text
        );

        showTemporaryNotice(
            "تم نسخ المحادثة."
        );

    } catch (error) {
        console.warn(error);
    }
}

function showMoreMenu() {
    showTemporaryNotice(
        "المزيد من خيارات المحادثة سيتم إضافته لاحقًا."
    );
}


/* =========================================================
   NOTICE
========================================================= */

let noticeTimer = null;

function showTemporaryNotice(message) {
    let notice =
        document.getElementById(
            "temporaryNotice"
        );

    if (!notice) {
        notice =
            document.createElement("div");

        notice.id =
            "temporaryNotice";

        Object.assign(
            notice.style,
            {
                position: "fixed",
                bottom: "95px",
                left: "50%",
                transform:
                    "translateX(-50%)",
                zIndex: "999",
                maxWidth: "90%",
                padding: "11px 16px",
                borderRadius: "12px",
                background: "#1b1b22",
                color: "#fff",
                border:
                    "1px solid rgba(255,255,255,.1)",
                boxShadow:
                    "0 15px 40px rgba(0,0,0,.35)",
                fontSize: "13px",
                textAlign: "center"
            }
        );

        document.body.appendChild(notice);
    }

    notice.textContent = message;
    notice.style.opacity = "1";

    clearTimeout(noticeTimer);

    noticeTimer = setTimeout(() => {
        notice.style.opacity = "0";
    }, 2500);
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    elements.messageInput?.addEventListener(
        "input",
        updateComposer
    );


    elements.messageInput?.addEventListener(
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


    elements.sendButton?.addEventListener(
        "click",
        () => {
            if (state.isGenerating) {
                stopGeneration();
            } else {
                sendMessage();
            }
        }
    );


    elements.newChatButton?.addEventListener(
        "click",
        () => createNewConversation()
    );


    elements.openSidebar?.addEventListener(
        "click",
        openSidebarMobile
    );


    elements.closeSidebar?.addEventListener(
        "click",
        closeSidebarMobile
    );


    elements.modelButton?.addEventListener(
        "click",
        toggleModelMenu
    );


    document
        .querySelectorAll(".model-option")
        .forEach(option => {

            option.addEventListener(
                "click",
                () => {
                    selectModel(
                        option.dataset.model
                    );
                }
            );

        });


    elements.settingsButton?.addEventListener(
        "click",
        openSettings
    );


    elements.closeSettings?.addEventListener(
        "click",
        closeSettings
    );


    elements.settingsModal?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                elements.settingsModal
            ) {
                closeSettings();
            }
        }
    );


    elements.themeSelect?.addEventListener(
        "change",
        event => {
            applyTheme(event.target.value);
        }
    );


    elements.helpButton?.addEventListener(
        "click",
        showHelp
    );


    elements.shareButton?.addEventListener(
        "click",
        shareConversation
    );


    elements.moreButton?.addEventListener(
        "click",
        showMoreMenu
    );


    elements.attachmentButton?.addEventListener(
        "click",
        toggleAttachmentMenu
    );


    elements.uploadCode?.addEventListener(
        "click",
        openFilePicker
    );


    elements.fileInput?.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            handleFile(file);

            event.target.value = "";

        }
    );


    elements.pasteCode?.addEventListener(
        "click",
        async () => {

            try {

                const text =
                    await navigator.clipboard.readText();

                elements.messageInput.value =
                    text;

                updateComposer();

                elements.messageInput.focus();

            } catch {

                showTemporaryNotice(
                    "تعذر الوصول إلى الحافظة."
                );
            }

            elements.attachmentMenu?.classList.add(
                "hidden"
            );
        }
    );


    elements.voiceButton?.addEventListener(
        "click",
        () => {
            showTemporaryNotice(
                "ميزة الصوت سيتم تفعيلها لاحقًا."
            );
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                elements.modelMenu &&
                elements.modelButton &&
                !elements.modelMenu.contains(
                    event.target
                ) &&
                !elements.modelButton.contains(
                    event.target
                )
            ) {
                elements.modelMenu.classList.add(
                    "hidden"
                );
            }

            if (
                elements.attachmentMenu &&
                elements.attachmentButton &&
                !elements.attachmentMenu.contains(
                    event.target
                ) &&
                !elements.attachmentButton.contains(
                    event.target
                )
            ) {
                elements.attachmentMenu.classList.add(
                    "hidden"
                );
            }

        }
    );
}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {
    requestAnimationFrame(() => {
        if (elements.chatContainer) {
            elements.chatContainer.scrollTop =
                elements.chatContainer.scrollHeight;
        }
    });
}


/* =========================================================
   START
========================================================= */

function init() {
    loadTheme();
    loadState();
    setupEvents();
    setupQuickPrompts();
    updateComposer();

    const currentModel =
        state.selectedModel || "lua";

    selectModel(currentModel);
}

init();