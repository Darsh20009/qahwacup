# Café Operating System (QahwaCup Engine)

## Overview

QahwaCup Engine is a comprehensive multi-tenant café management system designed to operate as a complete "Operating System for Cafés." The system provides end-to-end café operations including POS, kitchen display, recipe management with cost calculation, smart inventory tracking, operational accounting, and customer-facing menu ordering. Built for Ma3k Company as a SaaS product serving multiple café businesses.

**Core Capabilities:**
- Multi-branch, multi-tenant café operations
- Recipe intelligence with ingredient cost tracking
- Smart inventory with automatic deductions and alerts
- Operational accounting with profit analysis
- Customer ordering with delivery zone management
- Employee management with role-based access

## User Preferences

Preferred communication style: Simple, everyday language.

- All user-facing texts are in Arabic with English support for data fields
- System fully supports RTL (right-to-left) layout
- Iterative development approach with small, focused chunks
- Work in Fast mode with targeted implementations
- No AI or smart automation - everything is manual and controlled
- Everything must be multi-tenant and sellable as a configurable SaaS feature

## System Architecture

### Layer Structure

**Frontend Layer (React/Vite)**
- Built with React, TypeScript, and Vite
- Uses shadcn/ui component library with Radix UI primitives
- TailwindCSS for styling with custom design tokens
- React Query (@tanstack/react-query) for server state management
- Path aliases: `@/` for client/src, `@shared/` for shared types

**API Layer (Express)**
- RESTful API routes organized by domain
- Session-based authentication with role guards
- Routes: `/api/cafe/*`, `/api/branch/*`, `/api/menu/*`, `/api/orders/*`, `/api/inventory/*`, `/api/accounting/*`
- 14+ implemented routes for recipes, inventory, and accounting

**Business Logic Engines**
- `server/recipe-engine.ts` - Cost calculation, recipe versioning, profit margins
- `server/inventory-engine.ts` - Stock tracking, automatic deductions, alerts
- `server/units-engine.ts` - Unit conversions (g/kg, ml/l)
- `server/accounting-engine.ts` - Daily snapshots, profit analysis, waste tracking

**Data Layer (MongoDB)**
- MongoDB with Mongoose ODM
- 48+ schema models defined in `shared/schema.ts`
- Multi-tenant isolation via `tenantId` field on all entities
- Indexed for performance on tenant + common query patterns

### Key Domain Models
- `ICafe` - Business configuration with subscription plans
- `IBranch` - Branch locations with working hours
- `IEmployee` - Staff with role-based permissions (super_admin, manager, cashier, barista, etc.)
- `ICoffeeItem` - Menu items with SKU, pricing, and recipe links
- `IRecipe` - Recipe definitions with versioned ingredient costs
- `IOrder` - Order processing with status pipeline
- `IIngredientItem` - Raw materials with stock levels and reorder points

### Status Flows
- Orders: PENDING → CONFIRMED → PREPARING → READY → DELIVERED/COLLECTED → COMPLETED
- Cancellation possible from any state except COMPLETED

## External Dependencies

**Database**
- MongoDB Atlas (primary) - Connection via `MONGODB_URI` environment variable
- PostgreSQL support via Drizzle ORM (alternative configuration)

**Authentication**
- bcryptjs for password hashing
- Express sessions for state management

**Email Service**
- Nodemailer with Gmail SMTP
- Requires `GMAIL_USER` and `GMAIL_APP_PASSWORD` environment variables
- Used for order updates, referral programs, loyalty notifications

**File Storage**
- Multer for file uploads (payment receipts, images)

**PDF/Export**
- jsPDF for PDF generation
- html2canvas for document rendering
- QRCode generation for receipts

**Maps/Location**
- Leaflet for map-based delivery address selection
- @turf/turf for geospatial zone validation

**Deployment**
- Configured for Render.com and Vercel
- Build: `npm run build` (Vite frontend + esbuild backend)
- Start: `npm run start` (Node.js production server on port 10000)