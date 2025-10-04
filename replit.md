# Overview

"قهوة كوب" (Coffee Cup) is a full-stack web application providing an Arabic-first digital coffee menu. It enables customers to browse coffee items, manage a shopping cart, and place orders with various payment methods. The project aims to offer a modern, efficient, and culturally tailored ordering experience, targeting the digital transformation of local coffee shops.

# Recent Changes (October 2025)

## TypeScript Fixes & Type Safety Improvements
- **CustomerProfile Extension**: Added optional `usedFreeDrinks` property to track free drinks usage across sessions
- **Order Type Import**: Fixed missing `Order` type import in checkout page to resolve TypeScript errors
- **Customer Notes Handling**: Fixed `customerNotes` field to ensure proper null handling (not undefined) in order creation
- **Schema Typing**: Adjusted coffeeMenuData initialization to resolve strict type inference issues with Drizzle schema

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
The system uses eight main entities managed by PostgreSQL and Drizzle ORM:
- **Coffee Items**: Product catalog.
- **Orders & Order Items**: Order tracking and detailed line items.
- **Cart Items**: Session-based temporary storage.
- **Employees**: Staff accounts with secure authentication.
- **Loyalty Cards, Loyalty Transactions, Loyalty Rewards**: Comprehensive loyalty program management.

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