# Overview

"قهوة كوب" (Coffee Cup) is a full-stack web application providing an Arabic-first digital coffee menu. It enables customers to browse coffee items, manage a shopping cart, and place orders with various payment methods. The project aims to offer a modern, efficient, and culturally tailored ordering experience, targeting the digital transformation of local coffee shops.

# Recent Changes (November 2025)

## Complete Migration from PostgreSQL to MongoDB (November 6, 2025)
- **Database Migration**: Successfully migrated the entire application from PostgreSQL (Drizzle ORM) to MongoDB (Mongoose)
  - **MongoDB Atlas Connection**: Using MongoDB Atlas cloud database
  - **Connection String**: Stored securely in `qahwa_MONGODB_URI` environment variable
  - **Connection URL**: `mongodb+srv://Vercel-Admin-qahwa:x90QpnUhb5PqfaVK@qahwa.ink6nxz.mongodb.net/`
- **Schema Migration**: Converted all 14 database schemas from Drizzle to Mongoose
  - All models now use Mongoose schemas with full type safety
  - Zod validators maintained for insert operations
  - String-based IDs (MongoDB ObjectId) replacing numeric IDs
- **Storage Layer**: Complete rewrite of `server/storage.ts` (~1400 lines)
  - All CRUD operations reimplemented using Mongoose
  - Automatic database initialization with seed data
  - Demo employee (username: 'darwish', password: '2009')
  - Full coffee menu (24 items) automatically seeded
- **Cleanup**: Removed all PostgreSQL artifacts
  - Removed packages: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `pg`
  - Deleted files: `drizzle.config.ts`, `scripts/setup-db.ts`, `migrations/`, `run-migration.ts`
  - Removed dev dependencies: `@types/connect-pg-simple`
  - Updated build scripts: removed `db:push`, `db:setup`, `postbuild` scripts
- **Production Ready**: Application fully tested and approved for deployment
  - All features working with MongoDB
  - Frontend displaying correctly with Arabic RTL layout
  - Backend API endpoints operational
  - Database connection established successfully

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
The backend is an Express.js application written in TypeScript, adhering to a RESTful API pattern. It utilizes MongoDB with Mongoose for type-safe data persistence. The architecture is modular, separating routes, storage logic, and server configurations.

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
The system uses 14 main collections managed by MongoDB and Mongoose:
- **Coffee Items**: Product catalog with availability tracking (24 items seeded automatically)
- **Orders & Order Items**: Order tracking and detailed line items
- **Cart Items**: Session-based temporary storage
- **Employees**: Staff accounts with secure authentication (demo: darwish/2009)
- **Customers**: Customer accounts with encrypted passwords
- **Loyalty Cards, Card Codes, Loyalty Transactions, Loyalty Rewards**: Comprehensive loyalty program management
- **Ingredients**: Inventory tracking for coffee shop ingredients (17 items)
- **Coffee Item Ingredients**: Many-to-many relationship between coffee items and their required ingredients
- **Password Reset Tokens**: Secure password recovery system
- **Users**: General user management

## UI/UX Decisions
The application features a modern aesthetic with a dark background and gold accents, inspired by traditional Arabic coffee culture. It prioritizes an Arabic-first, right-to-left (RTL) layout. The loyalty card UI is inspired by Fuji Cafe's design, using amber/orange color schemes.

# External Dependencies

## Core Framework & Data
- **mongoose**: MongoDB ODM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

## UI and Styling
- **@radix-ui/***: Accessible UI primitives.
- **tailwindcss**: Utility-first CSS framework.
- **shadcn/ui**: Reusable UI components.

## Form and Validation
- **react-hook-form**: Performant form library.
- **zod**: TypeScript-first schema validation.

## Security
- **bcryptjs**: Password hashing library.


## Other Libraries
- **qrcode**: QR code generation.
- **html2canvas**: Used for client-side image generation (e.g., loyalty card download).

# Replit Environment Setup

## Development Environment
This application is configured to run in the Replit environment with the following setup:

### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Environment Variable**: `qahwa_MONGODB_URI` (stored securely in Replit Secrets)
- **Connection URL**: `mongodb+srv://Vercel-Admin-qahwa:x90QpnUhb5PqfaVK@qahwa.ink6nxz.mongodb.net/`
- **Automatic Initialization**: Database automatically seeds demo data on first run

### Workflow Configuration
- **Workflow**: "Start application" runs `npm run dev`
- **Port**: Server runs on port 5000 (0.0.0.0:5000)
- **Output**: Webview interface for frontend preview
- **Vite Configuration**: Already configured with `allowedHosts: true` to work with Replit's iframe proxy

### Development Commands
- `npm run dev`: Start development server (Express + Vite)
- `npm run build`: Build frontend and backend for production
- `npm run start`: Start production server
- `npm run check`: Run TypeScript type checking

### Default Credentials
- **Employee Login**: Username: `darwish`, Password: `2009`

### Directory Structure
- `/client`: React frontend application
- `/server`: Express backend API
- `/shared`: Shared types and schemas (Mongoose/Zod)
- `/attached_assets`: Static assets including coffee images

## Deployment Notes

### MongoDB Atlas Connection
- The application uses MongoDB Atlas for the database
- Set the `qahwa_MONGODB_URI` environment variable in your deployment platform
- Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/`
- The database automatically initializes with seed data on first connection

### Environment Variables Required for Deployment
- `qahwa_MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Set to "production" for production builds