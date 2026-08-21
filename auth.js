document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailInput");
    const providerBadge = document.getElementById("providerBadge");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const googleBtn = document.getElementById("googleBtn");

    // 1. التعرف المباشر على نوع نطاق البريد الذكي
    emailInput.addEventListener("input", (e) => {
        const val = e.target.value.trim().toLowerCase();
        
        if (val.endsWith("@gmail.com")) {
            providerBadge.textContent = "Google";
            providerBadge.className = "provider-badge badge-gmail";
        } else if (val.endsWith("@icloud.com") || val.endsWith("@me.com")) {
            providerBadge.textContent = "iCloud";
            providerBadge.className = "provider-badge badge-icloud";
        } else {
            providerBadge.className = "provider-badge hidden";
        }
    });

    // 2. معالجة "نسيت كلمة المرور"
    forgotPasswordBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();

        if (!email || !email.includes("@")) {
            alert("⚠️ يرجى كتابة بريدك الإلكتروني أولاً في الخانة المخصصة.");
            emailInput.focus();
            return;
        }

        const code = Math.floor(100000 + Math.random() * 900000);
        alert(`✅ تم إرسال رمز استعادة كلمة المرور إلى البريد:\n${email}\n\n🔑 الرمز المؤقت للتجربة: ${code}`);

        const inputCode = prompt(`أدخل الرمز المكون من 6 أرقام المرسل إلى ${email}:`);
        if (inputCode === String(code)) {
            const newPass = prompt("أدخل كلمة المرور الجديدة:");
            if (newPass && newPass.length >= 6) {
                alert("🎉 تم تحديث كلمة المرور بنجاح!");
            } else {
                alert("❌ كلمة المرور ضعيفة. يجب أن تتكون من 6 حروف/أرقام على الأقل.");
            }
        } else if (inputCode !== null) {
            alert("❌ رمز غير صحيح.");
        }
    });

    // 3. تنبيه زر جوجل الذكي
    googleBtn.addEventListener("click", () => {
        alert("💡 للربط المباشر مع حساب Google عبر رابط النشر الحالي:\n\nتأكد من إضافة رابطك (https://ai-lua.onrender.com) داخل Google Cloud Console في قسم Authorized JavaScript Origins.");
    });
});
