# 🌟 Smart Menu - المنظومة السحابية المتكاملة للطلب وإدارة المنشآت (SaaS)

منصة سحابية متكاملة (Multi-Tenant SaaS) بنظام **Apple + Amazon DNA**، تقدم واجهة دافئة فاخرة (**Warm Off-White**) ومزامنة لحظية فائقة السرعة (**Sub-100ms Real-Time WebSockets**) بين أطراف التشغيل الثلاثة (الصالة، محطة التجهيز KDS، والكاشير)، مع نظام أمان متكامل بالصلاحيات (RBAC)، وعزل كامل لكل عميل/نشاط تجاري، ومحرك تحكم ذكي بالتراخيص والاشتراكات لمالك المنصة مع دعم الدفع عبر **Vodafone Cash** و **InstaPay**.

---

## 🏛️ البنية المعمارية وأطراف التشغيل (3 Branches Architecture)

```mermaid
flowchart TD
    subgraph MultiTenant ["محرك العزل السحابي (Multi-Tenant Hub)"]
        T1["مطعم البرنس (/m/el-prince)"]
        T2["أروما كافيه (/m/aroma-cafe)"]
        T3["معمل النور (/m/al-noor)"]
    end

    subgraph SecurityAuth ["دورة الأمان وحماية الأدوار (100% RBAC)"]
        R1["👑 Super Admin (مالك المنصة المركزية)"]
        R2["🏢 Tenant Admin (مدير النشاط التجاري)"]
        R3["💵 Cashier (شاشة الكاشير ونقاط البيع)"]
        R4["👨‍🍳 Kitchen (محطة التجهيز الذكية KDS)"]
        R5["📱 Customer (العميل في الصالة عبر QR)"]
    end

    subgraph RealTimeSync ["محرك المزامنة اللحظية (WebSockets Sub-100ms)"]
        WS["Socket.io Tenant Partitioned Rooms (tenant:id)"]
    end

    subgraph FreeDB ["قاعدة البيانات السحابية المجانية (PostgreSQL)"]
        DB["Supabase / Neon / Prisma ORM"]
    end

    T1 --> WS
    T2 --> WS
    WS <--> R1
    WS <--> R2
    WS <--> R3
    WS <--> R4
    WS <--> R5
    SecurityAuth <--> FreeDB
```

---

## 🚀 المميزات الرئيسية (Key Highlights)

### 1. دورة أمان وحماية كاملة 100% (Role-Based Access Control - RBAC)
* **فصل أمني صارم للأدوار**:
  - `SUPER_ADMIN`: صاحب النظام المركزي، يمتلك صلاحية مطلقة لإدارة المشتركين، تفعيل التراخيص، إيقاف الحسابات، ومراجعة التحويلات المالية.
  - `TENANT_ADMIN`: مدير الفرع، إدارة المنيو، المخزون، الطاولات، التقارير وإعدادات المكان.
  - `CASHIER`: كاشير نقطة البيع، فتح وحجز الطاولات، نقل الطاولات، تطبيق الخصومات، تحصيل الفواتير، طباعة إيصالات حرارية 80mm، وتقفيل الوردية إلى CSV/Excel.
  - `KITCHEN`: محطة التجهيز (KDS)، استقبال الطلبات اللحظية، المؤقتات الملونة (أخضر/أصفر/أحمر)، والتنبيهات الصوتية، وزر "جاهز" بلمسة واحدة.
  - `CUSTOMER`: واجهة الصالة برمز الطاولة/QR، تصفح فوري، سلة ذكية، وتتبع مباشر للطلب.
* **حراسة المسارات (Route Guards)**: منع أي مستخدم من الوصول إلى شاشات خارج نطاق صلاحياته مع عرض شاشة توجيه فاخرة وزر تبديل الدور للتجربة.

### 2. فصل النظام للعملاء (Multi-Tenant Isolation)
* **رابط مخصص لكل نشاط تجاري**: يمكن لكل مطعم/كافيه مشاركة رابطه المستقل مثل:
  - `http://localhost:3000/m/el-prince` (مطعم البرنس)
  - `http://localhost:3000/m/aroma-cafe` (أروما كافيه)
  - `http://localhost:3000/m/cairo-grill` (مشويات كايرو)
* **عزل تام للبيانات والشبكة**: غرف Socket.io معزولة برقم النشاط (`tenant:tenantId`) تضمن عدم تداخل الطلبات أو الطاولات نهائياً بين العملاء.

### 3. التحكم الذكي في تفعيل الاشتراكات والتراخيص (Smart Licensing Engine)
* **لوحة المالك (Super Admin Dashboard)**:
  - عدادات وإحصائيات لحظية للمشتركين (النشطين، التجريبيين، المنتهين، والمعلقين).
  - أزرار تحكم بلمسة واحدة (1-Click Actions):
    - 🟢 `+30 يوم`: تفعيل أو تمديد فوري لشهر إضافي.
    - 👑 `+سنة (+365 يوم)`: تجديد سنوي كامل.
    - ⏳ `+14 يوم`: منح فترة تجريبية مجانية.
    - 🛑 `تعليق الحساب (Suspend)`: إيقاف فوري لأي نشاط مخالف أو غير مسدد.
    - 🔄 `تنشيط`: إعادة تفعيل الحساب فوراً.
* **حاجز الدفع الذكي (Tenant Paywall)**:
  - عند انتهاء الاشتراك أو تعليقه، يتم حجب النظام تلقائياً وعرض شاشة دافئة فاخرة توضح انتهاء الصلاحية.
  - عرض مباشر لبيانات الدفع عبر **InstaPay IPA** و **Vodafone Cash**.
  - نموذج إرسال إثبات التحويل ورقم العملية لتفعيل فوري.

---

## 🗄️ تكامل قاعدة البيانات السحابية المجانية (Free Cloud Database)

النظام مهيأ للعمل مع أي قاعدة بيانات **PostgreSQL سحابية مجانية بالكامل**:
* **Supabase** (باقة مجانية 500MB + SSL + API فوري)
* **Neon.tech** (باقة مجانية Serverless PostgreSQL)

### خطوات ربط قاعدة البيانات المجانية في دقيقة واحدة:

1. أنشئ مشروعاً مجانياً على [Supabase](https://supabase.com) أو [Neon](https://neon.tech).
2. انسخ رابط الاتصال (Connection String) وضعه في ملف `.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres?sslmode=require"
```
3. طبّق الـ Schema وابدأ التغذية الأولية للبيانات:
```bash
npx prisma db push
node scripts/seed.js
```

> [!NOTE]
> النظام مزود بطبقة تخزين مدمجة ذكية (In-Memory + LocalStorage Backup)، بحيث يعمل بكامل كفاءته فور تشغيله حتى قبل إدخال رابط قاعدة البيانات السحابية!

---

## 📦 رفع المشروع على GitHub مجاناً (Push to Free GitHub)

لقد تم تهيئة مستودع Git محلياً وتضمين جميع ملفات المشروع:

```bash
# 1. انتقل لمجلد المشروع
cd D:\smart-menu

# 2. أضف رابط مستودعك الخاص على GitHub
git remote add origin https://github.com/YOUR_USERNAME/smart-menu.git

# 3. اضبط الفرع الرئيسي
git branch -M main

# 4. ارفع المشروع مباشرة
git push -u origin main
```

---

## 🌐 النشر المجاني السحابي (Free Cloud Hosting)

يمكنك نشر المنصة بضغطة زر واحدة مجاناً على:
1. **Vercel** أو **Netlify**: استيراد المستودع من GitHub وإضافة متغيرات البيئة.
2. **Render** أو **Railway**: لتشغيل خادم Socket.io المخصص (`server.js`).

---

## 🛠️ التشغيل المحلي السريع (Local Development)

```bash
# تثبيت الحزم
npm install

# تشغيل الخادم في وضع التطوير مع WebSockets اللحظية
node server.js
```

افتح المتصفح على: `http://localhost:3000`
