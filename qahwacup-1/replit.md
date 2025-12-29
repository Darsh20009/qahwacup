# Menuza – Smart Restaurant & Café System
**by Ma3k Company**

---

## 🧠 القسم 0 – القواعد الثابتة (ABSOLUTE RULES)

### 0.1 Rules That Cannot Be Negotiated
- **قهوة كوب = System Engine ONLY** - Cannot modify any logic inside Coffee Cup
- **Cannot break existing features** - All current functionality must remain intact
- **Menuza = Wrapper Layer + Management + Sales** - Only extend, never modify the core
- **NO AI** - No intelligent automation
- **NO Smart Automation** - Everything is manual and controlled
- **Everything is Manual + Controlled** - Full human control
- **Everything is Multi-Tenant** - System works for any café
- **Everything is Sellable** - All features are configurable for clients

### 0.2 System Philosophy
- One system → works for ANY café
- Customer does NOT "program"
- Customer "requests modifications"
- Company maintains full control

---

## 📋 Overview

قهوة كوب is a comprehensive coffee shop management system designed to streamline coffee shop operations. Menuza is the SaaS wrapper that enables multi-tenancy, allowing Ma3k Company to offer this system to multiple customers with complete data isolation.

## User Preferences
- All texts are in Arabic with English support for data.
- The system fully supports RTL.
- Iterative development approach.
- Work in Fast mode with small, focused chunks.

## Current Progress (December 26, 2025)

### ✅ COMPLETED: Multi-Tenant Coffee Items (PHASE 1.1)

**Schema Changes:**
- Added `tenantId: string` field to ICoffeeItem interface
- Added `tenantId` field to CoffeeItemSchema (required)
- Added multi-tenant indexes:
  - `{ tenantId: 1 }`
  - `{ tenantId: 1, category: 1 }`
  - `{ tenantId: 1, publishedBranches: 1 }`
  - `{ tenantId: 1, isAvailable: 1 }`

**Route Updates (GET/POST Routes):**
- ✅ `GET /api/coffee-items` - Filters by tenantId
- ✅ `GET /api/coffee-items/unpublished` - Filters by tenantId (manager only)
- ✅ `GET /api/coffee-items/category/:category` - Filters by tenantId
- ✅ `GET /api/coffee-items/:id` - Filters by tenantId
- ✅ `POST /api/coffee-items` - Sets tenantId automatically (manager only)

**Routes Still Needing Updates (Minor):**
- `PUT /api/coffee-items/:id` - Update validation
- `DELETE /api/coffee-items/:id` - Delete validation
- `PATCH /api/coffee-items/:id/availability` - Tenant check (partial)
- Recipe, ingredient, and addon routes (dependent routes)

### ✅ COMPLETED: Multi-Tenant Foundation (PHASE 1.0)
1. **Tenant Schema Created**
   - `ITenant` model with full SaaS fields (id, nameAr, nameEn, type, status, subscription, features, billing, branding)
   - MongoDB indexes for fast queries
   - `TenantModel` ready to use

2. **Employee Model Updated**
   - Added `tenantId: string` field (required)
   - Multi-tenant filtering indexes
   - All employees now belong to a tenant

3. **Multi-Tenant Middleware Created**
   - `server/middleware/tenant.ts` - Tenant context enforcement
   - `server/middleware/auth.ts` - Extended with tenant support
   - All authenticated requests have tenant context

4. **Tenant Management APIs**
   ```
   ✅ GET  /api/admin/tenants           - List all tenants
   ✅ GET  /api/admin/tenants/:id       - Get specific tenant
   ✅ POST /api/admin/tenants           - Create new tenant
   ✅ PATCH /api/admin/tenants/:id      - Update tenant
   ✅ DELETE /api/admin/tenants/:id     - Deactivate tenant (soft delete)
   ✅ GET  /api/tenant/info             - Get logged-in user's tenant
   ```

5. **Demo & Real Client Tenants Seeded**
   - `demo-1` - Demo tenant (type: demo)
   - `client-1` - Real Client tenant (type: client, plan: professional)
   - Both tenants created automatically on server startup

## System Architecture

### UI/UX Decisions
The UI/UX features a modern, attractive design with a beige color scheme, warm tones, site logo, and golden accents for QR cards and employee badges. Password fields include show/hide icons for usability. Inventory management UI uses category-specific icons and a warm coffee-themed color palette.

### Sprint 0 - Design System (December 2025)
- **Typography:** Tajawal font for Arabic with IBM Plex Sans Arabic as fallback
- **Role-Based Layouts:** 4 distinct layouts for different user types (Customer, POS, Kitchen, Manager)
- **Loading States:** Specialized skeletons for different sections
- **Empty/Error States:** Unified components with retry functionality

### Sprint 1 - Data Unification (December 2025)
- **Unified Inventory Model:** RawItem is the single source of truth for all inventory
- **Recipe Management:** Uses RecipeItem model linking CoffeeItem to RawItem

### Sprint 3 & 4 - Recipe Enforcement & Addon Inventory (December 2025)
- **Product Recipe Wizard:** 2-step product creation
- **Addon Inventory Tracking:** ProductAddons linked to RawItems
- **Order Customization Snapshot:** Full inventory deduction for addons

### Technical Stack
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, Zod for validation
- **Frontend:** React, TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter

## QahwaCup Engine - Master Implementation Plan (PHASE 0 COMPLETE)

### ✅ PHASE 0 — Product Re-Architecture (COMPLETE - December 29, 2025)
See `PHASE_0_ARCHITECTURE.md` for complete deliverables:
- ✅ 10 Core domain entities defined
- ✅ Layer separation (Frontend/Logic/Data)
- ✅ Multi-tenant architecture
- ✅ Naming conventions and status flows
- ✅ MongoDB schema (2800+ lines)
- ✅ Business logic engines

### ✅ PHASE 1 — Recipe Intelligence Engine (COMPLETE - December 29, 2025)
**Completed Features:**

1. **Recipe Engine (server/recipe-engine.ts)**
   - Auto-calculate recipe cost from ingredients
   - COGS calculation per order item with modifiers
   - Cost snapshot for each order (immutable)
   - Profit margin calculation (selling price - COGS)
   - Multi-source addon field normalization (selectedAddons, addons, customization.selectedAddons)

2. **Modifiers/Add-ons Cost System**
   - Price impact per addon calculated
   - Modifier cost integrated into order snapshots
   - Query support for both `id` and `_id` fields

3. **Permissions Engine (server/permissions-engine.ts)**
   - Complete Permission Matrix for 6 roles: cashier, barista, supervisor, branch_manager, owner, admin
   - 50+ granular permissions across 8 categories
   - Role hierarchy with permission inheritance
   - `checkPermission()` and `requirePermission()` middleware

4. **Report Exporter (in server/accounting-engine.ts)**
   - CSV export for Sales Report, Profit Report, COGS Report
   - Inventory Movement Report export
   - Arabic headers support

### 📦 PHASE 2 — Smart Inventory Core (NOT STARTED)
**Estimated: 10 days** - Requires 2+ turns in Autonomous Build Mode

1. Units & Conversion Engine
   - g ↔ kg, ml ↔ L, pieces
   - Storage unit per ingredient
   - Conversion validation

2. Ingredient Catalog
   - Create/Edit ingredients
   - Min stock thresholds
   - Cost tracking per unit

3. Stock Movements
   - Stock In (Purchase)
   - Stock Out (Manual waste)
   - Adjustment (Physical count)

4. Deduction Automation
   - Auto-deduct on order completion
   - Prevent negative stock
   - Deduction audit trail

5. Alerts System
   - Low stock warnings
   - Out of stock alerts
   - Daily summary

6. Inventory UI
   - Ingredients management
   - Stock In form
   - Movements log
   - Alerts dashboard

### 💰 PHASE 3 — Operational Accounting (NOT STARTED)
**Estimated: 7-10 days** - Requires 1-2 turns

1. Daily Snapshots
   - Sales count & total
   - COGS aggregation
   - Profit calculation
   - Waste tracking

2. Reports
   - Profit per item/category
   - Top performers/worst items
   - Waste analysis

3. Owner Dashboard
   - Daily profit card
   - COGS visualization
   - Waste tracking
   - Quick filters (date range, branch)

4. Export
   - CSV export (Orders, Inventory)
   - PDF summary (optional)

### 👥 PHASE 4 — Human Roles System (NOT STARTED)
**Estimated: 5-7 days** - Requires 1 turn

1. Role Definitions
   - Cashier, Barista, Supervisor, Manager, Owner
   - Permission matrix

2. UI Gating
   - Hide unauthorized pages
   - Block API access
   - Audit logs

### 🎨 PHASE 5 — UI Redesign (NOT STARTED)
**Estimated: 10-14 days** - Requires 2+ turns

1. Design System
   - Warm color palette
   - Arabic/English fonts
   - Component library

2. POS UI (Cashier)
   - Categories + Items grid
   - Cart with customization
   - Quick actions
   - Receipt

3. Kitchen/Preparation UI
   - Queue columns (New/Preparing/Ready)
   - Large readable cards
   - Timer & status updates

4. Admin UI
   - Modern dashboard
   - Tables with filters
   - Settings pages

### 🚀 PHASE 6 — SaaS & Scale Layer (NOT STARTED)
**Estimated: 14-21 days** - Requires 2-3 turns

1. Tenant Setup Wizard
   - Business info
   - Branch setup
   - Default menu template

2. Multi-Branch Support
   - Branch switching
   - Branch-specific reports
   - Branch inventory

3. Subscription Management
   - Plan data model
   - Renew/suspend flows
   - Billing integration

4. Demo Café Templates
   - 10 pre-built templates
   - Daily reset
   - No production impact

---

## Implementation Strategy

**Fast Mode (3 turns): Phase 0 only** ✅ COMPLETE
**Autonomous Build Mode Needed For:**
- Phase 1 (10-14 days of work)
- Phase 2 (10 days of work)
- Phase 3 (7-10 days of work)
- Phase 4-6 (Combined 30-42 days)

**Total Estimated Project Time:** 60-80 days of full-time development

## External Dependencies
- **MongoDB:** Database for multi-tenant data
- **Google Maps:** Branch locations and navigation
- **Maileroo:** SMTP for invoices and notifications

## Deployment
- Built with npm + Vite
- Express backend serves on port 5000
- Production: `npm run build` then `node ./dist/index.cjs`
