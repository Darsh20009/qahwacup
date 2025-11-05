# دليل النشر على Render - Render Deployment Guide

## إعدادات قاعدة البيانات - Database Configuration

### معلومات الاتصال بقاعدة البيانات
Database URL:
```
postgresql://QAHWACUP_distantits:92e56d78c4ef08bcf6cafe7e07318058e6877173@ir9zip.h.filess.io:5432/QAHWACUP_distantits
```

## خطوات النشر على Render - Deployment Steps

### 1. إعدادات المستودع - Repository Settings
- **Repository**: https://github.com/Darsh20009/qahwacup
- **Branch**: main
- **Root Directory**: (leave empty)

### 2. إعدادات البناء والنشر - Build & Deploy Settings

#### Build Command
```bash
npm install ; npm run build
```

#### Pre-Deploy Command
اترك فارغًا (Leave empty)

#### Start Command
```bash
npm run start
```

### 3. متغيرات البيئة - Environment Variables

أضف المتغير التالي في Render Dashboard → Environment:

**Key**: `DATABASE_URL`

**Value**:
```
postgresql://QAHWACUP_distantits:92e56d78c4ef08bcf6cafe7e07318058e6877173@ir9zip.h.filess.io:5432/QAHWACUP_distantits
```

### 4. ملاحظات مهمة - Important Notes

✅ **تم حل المشاكل التالية:**
1. إزالة محاولة تعديل إعدادات قاعدة البيانات (ALTER DATABASE) التي كانت تحتاج صلاحيات المالك
2. إضافة `search_path=public` تلقائياً في جميع الاتصالات بقاعدة البيانات
3. ضمان عمل drizzle-kit push بدون أخطاء

✅ **التعديلات التي تمت:**
- `scripts/setup-db.ts`: تم تبسيط السكريبت وإزالة ALTER DATABASE
- `server/storage.ts`: إضافة `options: '-c search_path=public'` للاتصال
- `drizzle.config.ts`: إضافة search_path في URL الاتصال

### 5. اختبار النشر - Testing Deployment

بعد النشر، تأكد من:
1. ✅ Build نجح بدون أخطاء
2. ✅ الجداول تم إنشاؤها في قاعدة البيانات
3. ✅ الموقع يعمل بدون مشاكل
4. ✅ API endpoints تستجيب بشكل صحيح

### 6. استكشاف الأخطاء - Troubleshooting

إذا واجهت مشكلة:
1. تحقق من Logs في Render Dashboard
2. تأكد من DATABASE_URL صحيح في Environment Variables
3. تأكد من أن قاعدة البيانات filess.io تعمل

## معلومات إضافية - Additional Information

### الفرق بين Replit و Render
- **Replit**: يستخدم قاعدة بيانات داخلية (PGHOST, PGDATABASE, إلخ)
- **Render**: يستخدم DATABASE_URL للاتصال بقاعدة بيانات خارجية

الكود يتعرف تلقائياً على البيئة ويختار طريقة الاتصال المناسبة.

### الأمان - Security
⚠️ **مهم**: لا تشارك DATABASE_URL في الأماكن العامة، احفظه في Environment Variables فقط.
