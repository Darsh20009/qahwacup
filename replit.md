# قهوة كوب - Coffee Shop Management System

## نظرة عامة
نظام متكامل لإدارة المقهى مع نظام استلام من الفروع، إدارة الطلبات، وبطاقات الولاء.

## الميزات الرئيسية

### ✅ الميزات المكتملة:
1. **نظام إدارة المنتجات** - إضافة، تعديل، حذف منتجات القهوة
2. **نظام الطلبات** - إنشاء وتتبع الطلبات (استلام من الفرع فقط)
3. **إدارة الفروع** - إضافة، تعديل، حذف الفروع مع دعم الموقع الجغرافي
4. **بطاقات الولاء** - نظام نقاط وكوبونات
5. **إدارة الموظفين** - حسابات للكاشير والمدير
6. **أكواد الخصم** - نظام خصومات متقدم
7. **المكونات** - إدارة مكونات المشروبات
8. **نظام الدفع** - دفع نقدي، بطاقة، أو إلكتروني مع رفع الإيصال

### 🚀 تحديثات نوفمبر 2025:

#### نظام الاستلام من الفروع:
- ✅ **استلام من الفرع فقط**: تم إزالة خيار التوصيل
- ✅ **اختيار الفرع**: العميل يختار الفرع للاستلام منه
- ✅ **معلومات الموقع**: عرض موقع الفرع على الخريطة (إذا توفر)
- ✅ **روابط الخريطة**: رابط مباشر لفتح الموقع في تطبيقات الخرائط

#### إدارة الفروع المحسّنة:
- ✅ **إضافة موقع الفرع**: حقول latitude و longitude عند إنشاء الفرع
- ✅ **حذف الفروع**: إمكانية حذف الفروع مع رسالة تأكيد
- ✅ **عرض الموقع**: عرض إحداثيات الفرع في القائمة
- ✅ **معاينة الخريطة**: معاينة صورة ثابتة لموقع الفرع

## البنية التقنية

### Backend:
- **Node.js + Express**: Server-side
- **MongoDB + Mongoose**: قاعدة البيانات
- **Zod**: Schema validation
- **bcryptjs**: تشفير كلمات المرور

### Frontend:
- **React + TypeScript**: واجهة المستخدم
- **Vite**: Build tool
- **TanStack Query**: Data fetching
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling
- **Wouter**: Routing

### Geo Services:
- **Point-in-Polygon Algorithm**: للتحقق من المناطق الجغرافية
- **Haversine Distance**: لحساب المسافات

## API Endpoints

### Delivery Zones:
- `GET /api/delivery-zones` - قائمة المناطق
- `POST /api/delivery-zones/validate` - التحقق من نقطة جغرافية

### Drivers:
- `GET /api/drivers` - قائمة السائقين المتاحين
- `PATCH /api/drivers/:id/availability` - تحديث حالة التوفر
- `PATCH /api/drivers/:id/location` - تحديث الموقع

### Delivery Orders:
- `PATCH /api/orders/:id/assign-driver` - تعيين سائق
- `PATCH /api/orders/:id/start-delivery` - بدء التوصيل
- `PATCH /api/orders/:id/complete-delivery` - إتمام التوصيل
- `GET /api/delivery/active-orders` - الطلبات النشطة
- `GET /api/drivers/:id/orders` - طلبات سائق محدد

## Environment Variables
```
MONGODB_URI=<MongoDB connection string>
NODE_ENV=development
PORT=5000
```

## التشغيل
```bash
npm run dev  # يشغل Frontend + Backend معاً
```

## الحالة الحالية

### ✅ مكتمل:
1. Schema updates للتوصيل والسائقين
2. Storage layer مع 14 دالة جديدة
3. Geo utilities (isPointInPolygon, calculateDistance)
4. API routes للتوصيل
5. Seeding للمناطق الجغرافية
6. DeliveryMethodSelector component

### ⏳ قيد التطوير:
1. دمج DeliveryMethodSelector في checkout flow
2. صفحة اختيار العنوان مع خريطة
3. لوحة تحكم المدير (إدارة السائقين والمناطق)
4. صفحة تتبع الطلبات للعملاء
5. واجهة رفع إيصال الدفع
6. تحسينات الأداء
7. تحسينات التوافق مع الجوال

## ملاحظات هامة:
- إحداثيات المناطق حالياً تقريبية (مركز بريدة: 26.3260, 43.9750)
- يُنصح بالحصول على إحداثيات دقيقة من بلدية بريدة أو OSM
- جميع النصوص بالعربية مع دعم الإنجليزية للبيانات
- النظام يدعم RTL بشكل كامل
