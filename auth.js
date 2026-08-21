const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

window.switchAuthView = function(viewName) {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-signup').style.display = 'none';
  document.getElementById('view-forgot').style.display = 'none';
  document.getElementById(`view-${viewName}`).style.display = 'block';
};

window.handleLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) return alert("يرجى ملء جميع الحقول");

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("خطأ: " + error.message);
    else saveSession({ name: data.user.user_metadata.first_name || email.split('@')[0], email });
  } else {
    saveSession({ name: email.split('@')[0], email });
  }
};

window.sendSignupOTP = async function() {
  const firstName = document.getElementById('signup-firstname').value.trim();
  const lastName = document.getElementById('signup-lastname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-password').value;
  const confirmPass = document.getElementById('signup-confirm-password').value;

  if (!firstName || !lastName || !email || !pass) return alert("يرجى كتابة كافة البيانات");
  if (pass !== confirmPass) return alert("كلمتا المرور غير متطابقتين!");

  if (supabase) {
    const { error } = await supabase.auth.signUp({ email, password: pass, options: { data: { first_name: firstName, last_name: lastName } } });
    if (error) return alert("خطأ: " + error.message);
  }
  alert("تم إرسال كود التحقق لبريدك!");
  document.getElementById('signup-step-1').style.display = 'none';
  document.getElementById('signup-step-2').style.display = 'block';
};

window.verifyAndCreateAccount = async function() {
  const email = document.getElementById('signup-email').value.trim();
  const code = document.getElementById('signup-otp').value.trim();

  if (supabase) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    if (error) return alert("الكود خاطئ!");
    saveSession({ name: data.user.user_metadata.first_name || email.split('@')[0], email });
  } else {
    if (code === '123456') saveSession({ name: email.split('@')[0], email });
    else alert("الكود التجريبي هو 123456");
  }
};

window.sendResetOTP = async function() {
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) return alert("أدخل البريد الإلكتروني");
  alert("تم إرسال رمز الاستعادة لبريدك!");
  document.getElementById('forgot-step-1').style.display = 'none';
  document.getElementById('forgot-step-2').style.display = 'block';
};

window.resetPasswordAndLogin = async function() {
  const newPass = document.getElementById('new-password').value;
  const confirmNewPass = document.getElementById('confirm-new-password').value;

  if (newPass !== confirmNewPass) return alert("كلمتا المرور غير متطابقتين!");
  alert("تم تحديث كلمة المرور بنجاح!");
  switchAuthView('login');
};

function saveSession(user) {
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`;
  const session = { ...user, avatar };
  localStorage.setItem('ls_user', JSON.stringify(session));
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('userProfile').style.display = 'flex';
  document.getElementById('userImg').src = avatar;
}

window.handleGoogleLogin = function(response) {
  const user = parseJwt(response.credential);
  saveSession({ name: user.name, email: user.email });
};

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
}
