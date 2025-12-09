# قهوة كوب - Coffee Shop Management System

## Overview

قهوة كوب (Qahwa Cup) is a comprehensive coffee shop management system built for Saudi Arabian coffee shops. It handles the complete operational workflow including digital menu ordering, table management via QR codes, loyalty programs, employee management, inventory tracking, POS integration, and ZATCA-compliant tax invoicing. The system supports both Arabic (RTL) and English interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

Additional preferences:
- All UI text is primarily in Arabic with English data support
- The system fully supports RTL layout
- Iterative development approach preferred
- Ask before making major architectural changes
- Provide detailed explanations for complex solutions

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming (dark theme with golden accents)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Path Aliases**: `@/*` maps to `client/src/*`, `@shared/*` maps to `shared/*`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with esbuild for production
- **Session Management**: express-session with MemoryStore
- **Authentication**: Role-based access control (admin, manager, cashier, accountant, driver, kitchen)
- **API Design**: RESTful endpoints under `/api/*`

### Data Storage
- **Primary Database**: MongoDB with Mongoose ODM
- **Connection**: MONGODB_URI environment variable
- **Schema Location**: `shared/schema.ts` contains all Mongoose models
- **Alternative**: Legacy Drizzle ORM setup exists for PostgreSQL (not currently active)

### Key Features Implementation
- **Order Lifecycle**: pending → payment_confirmed → preparing → delivering_to_table → delivered/cancelled
- **Table Management**: QR code generation for table ordering with reservation time windows
- **Geolocation**: Point-in-Polygon for zone validation, Haversine formula for distance calculations
- **Attendance**: GPS-based check-in/out within 100 meters of assigned branch
- **POS System**: Full-featured point of sale at `/employee/pos` with offline mode support
- **Tax Compliance**: ZATCA Phase 1 & 2 with TLV QR codes and UBL 2.1 XML invoices

### Build & Deployment
- **Development**: `npm run dev` runs Vite dev server with Express backend
- **Production Build**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.js`
- **Deployment Targets**: Render.com (primary), Vercel (configured)

## External Dependencies

### Database
- **MongoDB Atlas**: Primary database (connection via MONGODB_URI)
- **Mongoose**: ODM for MongoDB schema definition and queries

### Email Services
- **Maileroo SMTP**: Tax invoice delivery to customers (15% VAT invoices)
- **Nodemailer**: Email transport library

### Maps & Location
- **Leaflet**: Interactive maps for delivery address selection
- **Turf.js**: Geospatial analysis (point-in-polygon, distance calculations)

### Document Generation
- **jsPDF**: PDF generation for receipts and invoices
- **html2canvas**: HTML to canvas conversion for PDF rendering
- **QRCode**: QR code generation for tables and ZATCA compliance

### Authentication & Security
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **memorystore**: Session storage

### File Handling
- **Multer**: File upload handling for payment receipts and employee photos

### Payment Integration
- POS device connectivity APIs (cash drawer, receipt printing)
- Multiple payment method support: Cash, Mada, Alinma Pay, Ur Pay, Barq, Al Rajhi, Apple Pay