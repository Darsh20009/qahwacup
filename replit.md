# Overview

"قهوة كوب" (Coffee Cup) is a full-stack web application providing an Arabic-first digital coffee menu. It enables customers to browse coffee items, manage a shopping cart, and place orders with various payment methods. The project aims to offer a modern, efficient, and culturally tailored ordering experience, targeting the digital transformation of local coffee shops.

# Recent Changes (November 2025)

## إعداد قاعدة البيانات الخارجية للنشر على Render (نوفمبر 5, 2025)
- **قاعدة بيانات Filess.io**: تم ربط التطبيق بقاعدة بيانات PostgreSQL خارجية
  - Database URL: `postgresql://QAHWACUP_distantits:92e56d78c4ef08bcf6cafe7e07318058e6877173@ir9zip.h.filess.io:5432/QAHWACUP_distantits`
- **إصلاح مشاكل Render Deployment**:
  - **Problem 1**: كان السكريبت يحاول تنفيذ `ALTER DATABASE` والذي يتطلب صلاحيات المالك - تم إزالته
  - **Problem 2**: كان drizzle-kit push يفشل بخطأ "no schema has been selected to create in" - تم إضافة `search_path=public`
- **التعديلات التقنية**:
  - `scripts/setup-db.ts`: تم تبسيط السكريبت وإزالة ALTER DATABASE، إضافة `options: '-c search_path=public'`
  - `server/storage.ts`: إضافة `options: '-c search_path=public'` في Pool configuration
  - `drizzle.config.ts`: إضافة search_path في URL للقاعدة الخارجية
- **التوافق التلقائي**: الكود يتعرف تلقائياً على البيئة:
  - في Replit: يستخدم قاعدة البيانات الداخلية (PGHOST, PGDATABASE)
  - في Render: يستخدم DATABASE_URL للقاعدة الخارجية
- **دليل النشر**: تم إنشاء ملف `RENDER_DEPLOYMENT.md` مع التعليمات الكاملة للنشر

## Enhanced Customer Authentication System (November 5, 2025)
- **Mandatory Customer Registration**: Customers must now create accounts with both name and password
  - `shared/schema.ts` updated: both `name` and `password` fields are now required (notNull)
  - Minimum validation: name ≥ 2 characters, password ≥ 4 characters
  - Password field added to customers table with bcrypt encryption
- **Separate API Endpoints**:
  - `/api/customers/register`: Create new customer account with phone, name, and password
  - `/api/customers/login`: Authenticate existing customers with phone and password
  - Duplicate phone number registration blocked with proper error messages
- **Password Security**: 
  - All passwords hashed using bcrypt (salt rounds: 10) before storage
  - `DBStorage.createCustomer` encrypts passwords on registration
  - `DBStorage.verifyCustomerPassword` verifies credentials on login
- **Modern UI with Tabs**: 
  - `CustomerAuth.tsx` redesigned with separate tabs for Login and Register
  - Clear visual distinction: amber button for login, green button for registration
  - Real-time validation with helpful error messages in Arabic
  - RTL layout with proper Arabic typography
- **Database Integration**: All customer data persists in PostgreSQL with encrypted passwords
- **Full Coffee Menu Display**: Fixed initialization bug - now showing all 23 coffee items instead of only 3
  - Database initialization logic updated to check for complete menu (23 items)
  - Automatically clears partial data and reinitializes with full menu
  - All coffee categories available: قهوة أساسية، قهوة ساخنة، قهوة باردة، المشروبات الإضافية، الحلويات

# Recent Changes (October 2025)

## GitHub Import Setup (October 4, 2025)
- **Replit Environment Configuration**: Successfully configured the project to run in Replit environment
  - Created PostgreSQL database using Replit's built-in database service
  - Pushed database schema using `npm run db:push`
  - Configured workflow "Start application" with webview output on port 5000
  - Verified `allowedHosts: true` in Vite configuration for Replit proxy compatibility
  - Configured deployment settings for autoscale with build and start commands
- **Application Status**: Fully functional
  - Frontend: Arabic coffee menu loading correctly with RTL layout
  - Backend: API endpoints responding successfully (coffee items, cart operations)
  - Database: Connected and operational with all tables created
  - Employee login page accessible at `/employee/login`

## نظام تتبع الطلبات الإبداعي (أكتوبر 2025)
- **نظام تتبع مرئي متطور**: أضفنا نظام تتبع طلبات إبداعي يعرض مراحل الطلب بشكل بصري:
  - 4 مراحل: تم الطلب → تم التأكيد → تحت التحضير → جاهز للاستلام
  - تأثيرات بصرية متحركة وألوان مميزة لكل مرحلة
  - شريط تقدم متحرك يظهر الحالة الحالية
  - تحديث تلقائي كل 5 ثواني
- **لوحة عرض سريعة**: إضافة بانر يظهر في الصفحة الرئيسية للعميل يعرض الطلب الحالي
- **تحسين واجهة الطلبات**: صفحة طلباتي `/my-orders` تعرض الآن كل طلب مع نظام تتبع كامل
- **إشعارات الحالة**: يتم تحديث حالة الطلب تلقائياً عند تغيير الموظف لها

## TypeScript Fixes & Type Safety Improvements
- **CustomerProfile Extension**: Added optional `usedFreeDrinks` property to track free drinks usage across sessions
- **Order Type Import**: Fixed missing `Order` type import in checkout page to resolve TypeScript errors
- **Customer Notes Handling**: Fixed `customerNotes` field to ensure proper null handling (not undefined) in order creation
- **Schema Typing**: Adjusted coffeeMenuData initialization to resolve strict type inference issues with Drizzle schema

## Ingredient Management System (October 5, 2025)
- **Database Schema**: Added two new tables:
  - `ingredients`: Stores 17 ingredients (milk, coffee beans, chocolate, etc.) with availability tracking
  - `coffeeItemIngredients`: Many-to-many relationship linking coffee items to their ingredients
- **Employee Interface**: New ingredient management page at `/employee/ingredients`
  - Creative card-based UI with ingredient icons
  - Toggle availability with visual feedback
  - Shows affected coffee items count when updating
- **Automatic Availability Logic**: 
  - When an ingredient becomes unavailable, all coffee items using it are automatically marked unavailable
  - When an ingredient becomes available again, coffee items are re-enabled only if ALL their ingredients are available
  - Status messages show which ingredient is out of stock (e.g., "نفذ الحليب")
- **API Routes**: Complete CRUD operations for ingredients with automatic coffee item updates
- **17 Base Ingredients**: حليب، حبوب البن، بن مطحون، شوكولاتة، حليب مكثف، فانيليا، كاكاو، كراميل، ثلج، ماء، شاي، نعناع، ليمون، ماتشا، كيك، كريمة، بسكويت

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is a React 18 application built with TypeScript. It uses Wouter for routing, React Context API for state management (especially for the cart), Shadcn/ui and Radix UI for accessible components, and Tailwind CSS for styling with an Arabic-focused theme. React Hook Form with Zod handles form validation, and TanStack Query manages server state.

## Backend Architecture
The backend is an Express.js application written in TypeScript, adhering to a RESTful API pattern. It utilizes PostgreSQL with Drizzle ORM for type-safe data persistence. The architecture is modular, separating routes, storage logic, and server configurations.

## Key Features
- **Multi-language Support**: Arabic-first with RTL layout and English fallbacks.
- **Shopping Cart & Order Management**: Session-based cart with full order lifecycle management and multiple payment options.
- **Responsive Design**: Mobile-first approach for adaptive layouts.
- **Employee Management System**: Secure authentication, employee dashboard, and a cashier interface for order creation.
- **WhatsApp Integration**: Automated invoices and order status notifications.
- **Customer Loyalty Card System**: Web-based "My Card" system with stamp collection (7 stamps = 1 free coffee), QR code generation, card retrieval via phone number, and offline storage options.
- **QR Scanner Integration**: Cashier can scan loyalty cards for instant discounts.
- **Unified Hub Page**: Combines employee dashboard and menu view at `/0`.

## Database Schema
The system uses ten main entities managed by PostgreSQL and Drizzle ORM:
- **Coffee Items**: Product catalog with availability tracking.
- **Orders & Order Items**: Order tracking and detailed line items.
- **Cart Items**: Session-based temporary storage.
- **Employees**: Staff accounts with secure authentication.
- **Loyalty Cards, Loyalty Transactions, Loyalty Rewards**: Comprehensive loyalty program management.
- **Ingredients**: Inventory tracking for coffee shop ingredients.
- **Coffee Item Ingredients**: Many-to-many relationship between coffee items and their required ingredients.

## UI/UX Decisions
The application features a modern aesthetic with a dark background and gold accents, inspired by traditional Arabic coffee culture. It prioritizes an Arabic-first, right-to-left (RTL) layout. The loyalty card UI is inspired by Fuji Cafe's design, using amber/orange color schemes.

# External Dependencies

## Core Framework & Data
- **@neondatabase/serverless**: PostgreSQL serverless driver.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **@tanstack/react-query**: Server state management and caching.
- **wouter**: Lightweight React router.

## UI and Styling
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **shadcn/ui**: Reusable UI components.

## Form and Validation
- **react-hook-form**: Performant form library.
- **zod**: TypeScript-first schema validation.

## Security
- **bcryptjs**: Password hashing library.

## Database Tools
- **drizzle-kit**: Database migration and schema management.

## Other Libraries
- **qrcode**: QR code generation.
- **html2canvas**: Used for client-side image generation (e.g., loyalty card download).

# Replit Environment Setup

## Development Environment
This application is configured to run in the Replit environment with the following setup:

### Database
- **PostgreSQL Database**: Provisioned using Replit's built-in database service
- **Environment Variables**: DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST
- **Schema Management**: Uses `npm run db:push` to sync schema changes to the database

### Workflow Configuration
- **Workflow**: "Start application" runs `npm run dev`
- **Port**: Server runs on port 5000 (0.0.0.0:5000)
- **Output**: Webview interface for frontend preview
- **Vite Configuration**: Already configured with `allowedHosts: true` to work with Replit's iframe proxy

### Development Commands
- `npm run dev`: Start development server (Express + Vite)
- `npm run build`: Build frontend and backend for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes

### Default Credentials
- **Employee Login**: Username: `darwish`, Password: `2009`

### Directory Structure
- `/client`: React frontend application
- `/server`: Express backend API
- `/shared`: Shared types and schemas (Drizzle/Zod)
- `/attached_assets`: Static assets including coffee images

## تحديث قاعدة البيانات في Render

عند نشر تحديثات جديدة على Render تحتوي على تغييرات في الـ schema:

1. **افتح Shell في Render Dashboard**
2. **نفذ الأمر**:
   ```bash
   npm run db:push
   ```
   أو إذا طلب تأكيد:
   ```bash
   npm run db:push -- --force
   ```

هذا سيضيف الأعمدة والجداول الجديدة بدون حذف البيانات الموجودة.

## مشكلة قاعدة بيانات Neon عند النشر (أكتوبر 13، 2025)

### المشكلة
عند النشر على Render، ظهرت مشكلة:
```
error: The endpoint has been disabled. Enable it using Neon API and retry.
```

هذا يحدث مع الحسابات المجانية في Neon عندما تكون قاعدة البيانات غير نشطة لفترة طويلة.

### الحل
تم إنشاء **قاعدة بيانات Replit PostgreSQL المدمجة** كبديل موثوق:

1. **قاعدة البيانات**: قاعدة بيانات Replit PostgreSQL (مدمجة)
2. **متغير البيئة**: `DATABASE_URL` متوفر تلقائياً من Replit
3. **للنشر على Render**:
   - الخيار 1: استخدم `DATABASE_URL` من Replit في متغيرات البيئة على Render
   - الخيار 2: أنشئ قاعدة بيانات PostgreSQL على Render نفسها
   - الخيار 3: فعّل قاعدة بيانات Neon من لوحة التحكم (لكن قد تتعطل مرة أخرى)

4. **الأوامر الضرورية بعد إعداد قاعدة البيانات**:
   ```bash
   npm run db:push
   ```

### ملاحظات
- قاعدة بيانات Replit أكثر استقراراً وموثوقية للمشاريع المستضافة على Replit
- التطبيق يتحقق تلقائياً من وجود `DATABASE_URL` ويستخدم DBStorage للاتصال بـ PostgreSQL