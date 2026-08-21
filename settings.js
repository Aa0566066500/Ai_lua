window.toggleSettingsModal = function(show) {
  document.getElementById('settingsModal').style.display = show ? 'flex' : 'none';
};

window.setTheme = function(themeName) {
  document.body.classList.remove('theme-black', 'theme-white');
  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));

  if (themeName === 'black') {
    document.body.classList.add('theme-black');
    document.getElementById('theme-black').classList.add('active');
  } else if (themeName === 'white') {
    document.body.classList.add('theme-white');
    document.getElementById('theme-white').classList.add('active');
  } else {
    document.getElementById('theme-default').classList.add('active');
  }
  localStorage.setItem('ls_theme', themeName);
};

window.changeLanguage = function(lang) {
  const root = document.getElementById('html-root');
  if (lang === 'en') {
    root.setAttribute('dir', 'ltr');
    root.setAttribute('lang', 'en');
  } else {
    root.setAttribute('dir', 'rtl');
    root.setAttribute('lang', 'ar');
  }
};

window.requestAccountEdit = function(field) {
  alert(`تم إرسال كود تأكيد تعديل الـ ${field} لبريدك الإلكتروني`);
  const otp = prompt("أدخل كود التحقق (6 أرقام):");
  if (otp) {
    document.getElementById(`setting-${field}`).disabled = false;
    alert("تم التحقق، يمكنك التعديل الآن.");
  }
};

window.confirmAccountAction = function(type) {
  const modal = document.getElementById('confirmModal');
  const msg = document.getElementById('confirmMessage');
  const btn = document.getElementById('confirmAcceptBtn');
  modal.style.display = 'flex';

  if (type === 'switch') {
    msg.innerText = "سوف يتم الخروج من الحساب الحالي للتبديل لحساب آخر. هل تريد المتابعة؟";
    btn.onclick = () => executeLogout(true);
  } else {
    msg.innerText = "سوف يتم الخروج من الحساب والعودة لشاشة الدخول. هل أنت متأكد؟";
    btn.onclick = () => executeLogout(false);
  }
};

window.closeConfirmModal = function() {
  document.getElementById('confirmModal').style.display = 'none';
};

function executeLogout(isSwitching) {
  localStorage.removeItem('ls_user');
  closeConfirmModal();
  toggleSettingsModal(false);
  document.getElementById('authModal').style.display = 'flex';
  switchAuthView(isSwitching ? 'signup' : 'login');
}
