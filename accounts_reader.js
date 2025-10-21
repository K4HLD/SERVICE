// رقم الواتساب الخاص بك
const WHATSAPP_NUMBER = '212770306095'; 
// المجلد الذي يحتوي على ملفات JSON (كما حددناه في config.yml)
const DATA_FOLDER = '_data/accounts/'; 

// الوظيفة الرئيسية لجلب البيانات وبناء البطاقات
async function loadAccounts() {
    const container = document.getElementById('accounts-container');
    if (!container) return;
    
    // سنقوم بقراءة البيانات من مجلد _data/accounts
    // Netlify CMS يستخدم ملفات فردية (مثل account-1.json)
    
    // ملاحظة: بما أن Netlify CMS يحفظ كل منتج كملف JSON منفصل، 
    // هذا الكود يتطلب معرفة أسماء الملفات. للتجربة الأولية، سنفترض وجود حساب واحد.
    
    try {
        // 1. جلب البيانات من ملف واحد للتجربة (يجب عليك إنشاء هذا الملف أولاً عبر الـ CMS)
        // هذا مجرد مثال على كيفية قراءة ملف JSON واحد:
        const response = await fetch(`${DATA_FOLDER}sample-account.json`);
        
        if (!response.ok) {
             container.innerHTML = '<p style="color: #ccc; text-align: center;"> لا توجد حسابات معروضة للبيع حالياً </p>';
             return;
        }

        const account = await response.json();
        const accounts = [account]; // نضع الحساب في مصفوفة للتطبيق

        container.innerHTML = ''; // إفراغ رسالة التحميل

        // 2. بناء بطاقة لكل حساب
        accounts.forEach(account => {
            // بناء رسالة الواتساب
            const encodedMessage = encodeURIComponent(
                account.whatsapp_msg 
                + `\n\n*السعر:* ${account.price} درهم مغربي (DH)\n\nالرجاء إخباري بخطوات الدفع لإتمام الطلب.`
            );
            const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
            
            // إنشاء كود HTML للبطاقة
            const cardHTML = `
                <div class="service-card" style="text-align: center;">
                    
                    <img src="${account.image}" alt="${account.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0; margin-bottom: 15px;">
                    
                    <h3>${account.title}</h3>
                    <p style="min-height: 50px;">${account.description}</p>
                    
                    <p class="price-text" style="font-size: 1.5rem; font-weight: 700;">
                        ${account.price} درهم
                    </p>
                    
                    <a href="${whatsappURL}" target="_blank"
                        class="btn btn-primary"
                        style="display: block; width: 90%; margin: 15px auto;">
                        <i class="fab fa-whatsapp"></i> اطلب الآن
                    </a>
                </div>
            `;
            
            // إضافة البطاقة إلى الحاوية
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("حدث خطأ أثناء جلب بيانات الحسابات:", error);
        container.innerHTML = '<p style="color: red; text-align: center;">عذراً، تعذر تحميل بيانات الحسابات حالياً.</p>';
    }
}

// تشغيل الوظيفة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadAccounts);
