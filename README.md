# Lua AI

مساعد ذكاء اصطناعي متخصص في Lua / Luau وRoblox Studio.

## الفكرة

Lua AI هو موقع دردشة يساعد مطوري Roblox على:

- كتابة Luau
- شرح الأكواد
- إصلاح الأخطاء
- تحليل المشاريع
- تصميم الأنظمة
- تحسين الأداء
- مراجعة أمان الأكواد
- شرح Roblox APIs
- بناء أنظمة Roblox خطوة بخطوة

## التقنيات

- HTML
- CSS
- JavaScript
- Node.js
- Express
- AI API
- Git
- Render

## Structure

lua-ai/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   └── chat.js
│   ├── services/
│   │   └── ai.js
│   ├── middleware/
│   │   ├── rateLimit.js
│   │   └── validation.js
│   └── utils/
│       └── errors.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js

## Environment Variables

لا تضع API Key داخل Git.

في Render أضف Environment Variable:

AI_API_KEY=YOUR_REAL_API_KEY

ويمكن استخدام:

PORT=3000

## Security

المفتاح السري لا يوضع داخل:

- HTML
- CSS
- JavaScript الموجود في المتصفح
- GitHub
- README
- `.env.example`

المفتاح يبقى في Backend / Render Environment Variables.

## Deployment

المشروع مصمم للعمل مع Render.

Build Command:

npm install

Start Command:

npm start

إذا كان مجلد Backend هو Root Directory:

backend

## AI

المساعد مخصص لفهم:

- Luau
- Roblox Studio
- RemoteEvents
- RemoteFunctions
- ModuleScripts
- ServerScriptService
- ReplicatedStorage
- StarterPlayer
- StarterGui
- Workspace
- DataStoreService
- MemoryStoreService
- HttpService
- TweenService
- RunService
- Players
- UserInputService
- ContextActionService
- UI
- NPCs
- Tools
- Inventories
- Trading systems
- Game systems
- Debugging
- Optimization
- Security

## Important

AI يمكن أن يخطئ.

راجع الأكواد واختبرها داخل Roblox Studio قبل استخدامها في مشروع حقيقي.