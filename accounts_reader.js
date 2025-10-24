document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('accounts-container');
    const whatsappBase = 'https://wa.me/212770306095'; // ضع رقم الواتساب الخاص بك هنا

    // 1. جلب ملف JSON الذي يحتوي على كل الحسابات
    fetch('_data/accounts.json')
        .then(response => {
            if (!response.ok) {
                // إذا لم يتم العثور على الملف، إظهار رسالة خطأ
                throw new Error('فشل في جلب ملف البيانات. تحقق من المسار.');
            }
            return response.json();
        })
        .then(data => {
            const accounts = data.items; // يجب أن تكون القائمة موجودة في items

            if (!accounts || accounts.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #777;">لا توجد حسابات معروضة حاليًا.</p>';
                return;
            }

            container.innerHTML = ''; // مسح رسالة "جاري التحميل"

            // 2. بناء بطاقات HTML لكل حساب
            accounts.forEach(account => {
                const whatsappMessage = encodeURIComponent(`${account.whatsapp_msg} - أنا مهتم بحساب ${account.title}`);
                const whatsappLink = whatsappBase + whatsappMessage;
                
                const card = `
                    <div class="card">
                        <img src="${account.image}" alt="${account.title}" class="card-image">
                        <div class="card-content">
                            <h3 class="card-title">${account.title}</h3>
                            <p class="card-description">${account.description}</p>
                            <div class="card-footer">
                                <span class="card-price">${account.price} ريال</span>
                                <a href="${whatsappLink}" target="_blank" class="buy-btn">
                                    <i class="fab fa-whatsapp"></i> شراء
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += card;
            });
        })
        .catch(error => {
            console.error('حدث خطأ:', error);
            container.innerHTML = `<p style="text-align: center; color: red;">خطأ في تحميل الحسابات: ${error.message}</p>`;
        });
});
