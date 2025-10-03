// =======================================================
// 1. تهيئة Firebase والإعدادات الأساسية
// =======================================================

// قيم التهيئة (تأكد من مطابقتها لمشروعك)
const firebaseConfig = {
    apiKey: "AIzaSyCg4Pg1oGAZNIvIH-M79bY5aPOn2IRnxtg", 
    authDomain: "service-store-auth.firebaseapp.com",
    projectId: "service-store-auth",
    storageBucket: "service-store-auth.firebasestorage.app",
    messagingSenderId: "727304309601",
    appId: "1:727304309601:web:7ededd4f42d39f61b9d320"
};

// تهيئة التطبيق والخدمات
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();

// =======================================================
// 2. وظيفة توثيق الشراء التلقائي
// =======================================================

/**
 * توثق عملية شراء في سجل المستخدم في Firestore بشكل تلقائي.
 * @param {string} itemName - اسم المنتج الذي تم طلبه (مثل: Free Fire - 100 جوهرة).
 * @param {number} price - سعر المنتج بالدرهم.
 */
const recordPurchase = async (itemName, price) => {
    const user = auth.currentUser;
    
    if (!user) {
        // إذا لم يكن المستخدم مسجلاً، اطلب منه التسجيل وافتح قسم المصادقة
        alert('يرجى تسجيل الدخول أولاً لتوثيق طلبك!');
        document.getElementById('firebase-auth-section').style.display = 'block'; 
        return;
    }
    
    // تأكد من أن السعر رقم صالح
    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
        alert('حدث خطأ: السعر غير صحيح.');
        return;
    }
    
    try {
        // حفظ الطلب في مجموعة purchases الخاصة بالمستخدم
        await db.collection('users').doc(user.uid)
                .collection('purchases').add({
            itemName: itemName,
            price: itemPrice,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // تنبيه المستخدم بنجاح التوثيق
        alert(`✅ تم توثيق طلب "${itemName}" بنجاح! يرجى الآن التواصل مع البائع لإتمام الدفع.`);
        
    } catch (error) {
        alert(`❌ حدث خطأ أثناء توثيق الطلب: ${error.message}`);
        console.error('Error adding document: ', error);
    }
};

// =======================================================
// 3. وظائف جلب السجل والمصادقة
// =======================================================

const loadPurchaseHistory = (user) => {
    const historyList = document.getElementById('history-list');
    if (!user || !historyList) return;

    historyList.innerHTML = '<li>جاري تحميل السجلات...</li>';
    
    // الاستماع للتغييرات في سجل المشتريات
    db.collection('users').doc(user.uid).collection('purchases')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            historyList.innerHTML = '';
            if (snapshot.empty) {
                historyList.innerHTML = '<li>لا توجد سجلات شراء حتى الآن.</li>';
                return;
            }
            snapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                // تنسيق وعرض التاريخ
                const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString('ar-MA') : 'غير متوفر';
                
                li.textContent = `[${date}] - المنتج: ${data.itemName} - القيمة: ${data.price} درهم`;
                historyList.appendChild(li);
            });
        }, (error) => {
            console.error('Error listening to history: ', error);
            historyList.innerHTML = '<li>خطأ في جلب السجلات.</li>';
        });
};


// =======================================================
// 4. تهيئة واجهة المستخدم (عند تحميل الصفحة)
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // عناصر القائمة المتنقلة (Hamburger Menu)
    const nav = document.querySelector('.nav');
    const menuIcon = document.querySelector('.menu-icon');

    // تفعيل زر القائمة
    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // العناصر الرئيسية للمصادقة
    const authSection = document.getElementById('firebase-auth-section');
    const authLink = document.getElementById('auth-link');
    const authUI = document.getElementById('auth-ui');
    const purchaseSection = document.getElementById('purchase-section');
    const userEmailDisplay = document.getElementById('user-email-display');
    const statusMessage = document.getElementById('status-message');
    
    // نماذج المصادقة والأزرار
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // وظيفة عرض/إخفاء قسم Firebase عند النقر على "تسجيل/سجل الشراء"
    if (authLink) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            authSection.style.display = authSection.style.display === 'none' ? 'block' : 'none';
        });
    }

    // =======================================================
    // معالجات أحداث المصادقة
    // =======================================================

    // التسجيل (Signup)
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusMessage.textContent = '';
            const email = signupForm['signup-email'].value;
            const password = signupForm['signup-password'].value;
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                statusMessage.textContent = 'تم إنشاء الحساب بنجاح! سيتم تسجيل الدخول تلقائياً.';
            } catch (error) {
                statusMessage.textContent = `خطأ في التسجيل: ${error.message}`;
            }
        });
    }

    // تسجيل الدخول (Login)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusMessage.textContent = '';
            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
                statusMessage.textContent = 'تم تسجيل الدخول بنجاح!';
            } catch (error) {
                statusMessage.textContent = `خطأ في الدخول: ${error.message}`;
            }
        });
    }

    // تسجيل الخروج (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await auth.signOut();
            statusMessage.textContent = 'تم تسجيل الخروج بنجاح.';
        });
    }

    // =======================================================
    // ربط أزرار "اطلب الآن" بوظيفة التوثيق التلقائي
    // =======================================================
    
    // البحث عن جميع الأزرار التي تحمل الكلاس "purchase-btn"
    const serviceButtons = document.querySelectorAll('.purchase-btn');
    serviceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const itemName = button.getAttribute('data-item-name');
            const itemPrice = button.getAttribute('data-item-price');
            
            if (itemName && itemPrice) {
                recordPurchase(itemName, itemPrice);
            } else {
                console.warn('زر "اطلب الآن" يفتقد لبيانات المنتج (data-item-name/price).');
            }
        });
    });

    // =======================================================
    // مراقبة حالة المصادقة (Auth State Change)
    // =======================================================

    auth.onAuthStateChanged((user) => {
        if (user) {
            // المستخدم مسجل الدخول
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            if (authUI) authUI.style.display = 'none';
            if (purchaseSection) purchaseSection.style.display = 'block';
            loadPurchaseHistory(user);
        } else {
            // المستخدم غير مسجل الدخول
            if (userEmailDisplay) userEmailDisplay.textContent = '';
            if (authUI) authUI.style.display = 'block';
            if (purchaseSection) purchaseSection.style.display = 'none';
            // لا حاجة لـ loadPurchaseHistory(null) لأنه يتم التحقق داخل الدالة
        }
    });
});
