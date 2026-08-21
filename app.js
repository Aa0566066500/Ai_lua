import { generateAIResponse } from './ai.js';

window.onload = function() {
  const savedUser = JSON.parse(localStorage.getItem('ls_user'));
  if (savedUser) {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('userProfile').style.display = 'flex';
    document.getElementById('userImg').src = savedUser.avatar;
  }
  const savedTheme = localStorage.getItem('ls_theme');
  if (savedTheme) setTheme(savedTheme);
};

window.sendMessage = async function() {
  const input = document.getElementById("user-input");
  const stream = document.getElementById("chat-stream");
  const mode = document.getElementById("modeSelect").value;
  const text = input.value.trim();

  if (!text) return;

  const userDiv = document.createElement("div");
  userDiv.className = "user-bubble";
  userDiv.innerText = text;
  stream.appendChild(userDiv);
  input.value = "";

  const aiDiv = document.createElement("div");
  aiDiv.className = "ai-msg-container";
  aiDiv.innerHTML = `<div class="ai-response card">جاري التفكير...</div>`;
  stream.appendChild(aiDiv);
  stream.scrollTop = stream.scrollHeight;

  const responseCard = aiDiv.querySelector('.ai-response');

  await generateAIResponse(text, mode, (currentText) => {
    responseCard.innerHTML = formatMarkdown(currentText);
    stream.scrollTop = stream.scrollHeight;
  });
};

window.clearChat = function() {
  document.getElementById("chat-stream").innerHTML = `
    <div class="ai-msg-container">
      <div class="ai-response card">
        مرحباً بك مجدداً! تم بدء محادثة جديدة.
      </div>
    </div>`;
};

window.checkEnter = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

function formatMarkdown(text) {
  return text
    .replace(/```(luau|lua)?([\s\S]*?)```/g, '<pre style="background:var(--bg-input); padding:16px; border-radius:16px; overflow-x:auto; margin-top:10px; border:1px solid var(--bg-card-border);"><code>$2</code></pre>')
    .replace(/\n/g, '<br>');
}
