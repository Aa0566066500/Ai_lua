import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

const JAILBREAK_PATTERNS = [
  /ignore previous instructions/i,
  /تجاهل التعليمات السابقة/i,
  /dan mode/i,
  /bypass/i
];

const MODES = {
  default: {
    systemInstruction: `
      أنت Luau Studio AI - المساعد الذكي الاحترافي المخصص للدردشة والبرمجة.
      مهامك وأسلوبك:
      1. السواليف والمحادثة: تدردش وتجيب على الأسئلة العامة بأسلوب ممتع، مرن، واحترافي.
      2. التفكير الشامل والربط: عند تقديم أي مشكلة أو سكريبت، تقوم بفحص التعارضات بين الأكواد والتأكد من توافقية المكونات مع بعضها.
      3. تصحيح الأخطاء: تفحص الكود بدقة لتكتشف الأخطاء البرمجية (Bugs) والأخطاء المنطقية وتصلحها فوراً.
      4. الاحترافية المباشرة: تزود المستخدم بأفضل الممارسات (Best Practices) في Roblox Luau مع شرح مبسط وعملي.
    `
  },
  flash: {
    systemInstruction: `
      أنت Luau Studio AI - المحرك السريع.
      تفحص الأكواد وتكتشف الأخطاء والتعارضات فوراً، وتقدم الحلول والإجابات بأسلوب خاطف ومباشر جداً بدون مقدمات.
    `
  }
};

window.generateAIResponse = async function(prompt, modeKey, onChunk) {
  const isViolating = JAILBREAK_PATTERNS.some(p => p.test(prompt));
  if (isViolating) {
    return "⚠️ عذراً، لا يمكن معالجة هذا الطلب. النظام مخصص لبرمجة Roblox Luau والمحادثات الآمنة فقط.";
  }

  const selectedMode = MODES[modeKey] || MODES.default;
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: selectedMode.systemInstruction
  });

  try {
    const resultStream = await model.generateContentStream(prompt);
    let fullText = "";
    for await (const chunk of resultStream.stream) {
      const text = chunk.text();
      fullText += text;
      if (onChunk) onChunk(fullText);
    }
    return fullText;
  } catch (err) {
    return "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.";
  }
};
