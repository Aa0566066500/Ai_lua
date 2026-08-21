# Roblox AI Assistant

مساعد ذكاء اصطناعي مخصص لمساعدة مطوري Roblox Studio في برمجة Luau.

## الهدف

المشروع يفصل بين:

- Roblox Client
- Roblox Server
- Backend
- AI Provider

ولا يتم وضع أي API Key سري داخل Roblox.

## البنية

roblox-ai/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── package.json
│   └── server.js
└── roblox/
    ├── ReplicatedStorage/
    │   ├── AIConfig.lua
    │   └── AIClient.lua
    ├── ServerScriptService/
    │   └── AIServer.server.lua
    └── StarterPlayer/
        └── StarterPlayerScripts/
            └── AIClient.client.lua

## الأمان

لا تضع API Keys أو Secrets داخل:

- LocalScript
- ModuleScript داخل ReplicatedStorage
- StarterPlayer
- StarterGui
- GitHub

المفتاح السري يجب أن يبقى في Backend.

## طريقة الاتصال

Roblox Client
      ↓
Roblox Server
      ↓
Backend
      ↓
AI Provider

لا يتم إرسال API Key إلى اللاعب.