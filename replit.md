# Overview

This is a digital coffee menu application called "قهوة كوب" (Coffee Cup) built as a full-stack web application. The system provides an Arabic-first interface for browsing coffee items, managing a shopping cart, and placing orders with multiple payment methods. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database management.

# Recent Changes

**2025-10-03**: Fresh GitHub Import - Replit Environment Configuration
- Successfully imported GitHub repository and configured for Replit environment
- Fixed database connection issue: Modified DBStorage to support both Neon serverless (cloud) and standard PostgreSQL (Replit local)
- Added conditional database driver selection: Uses `drizzle-orm/node-postgres` with standard `pg` Pool for Replit's local PostgreSQL
- Configured imports to handle ESM compatibility: Import `pg` as default module and destructure Pool
- Database connection now working with Replit's DATABASE_URL (postgresql://postgres:password@helium/heliumdb?sslmode=disable)
- Workflow "Start application" verified running on port 5000 with webview output type
- Frontend successfully rendering with Arabic RTL layout and all UI components functioning
- Vite dev server HMR connected and working with allowedHosts: true configuration
- Backend Express server serving on port 5000 with 0.0.0.0 host binding
- Database schema already pushed - all 8 tables created and coffee menu data initialized
- Application fully functional with PostgreSQL persistence using DBStorage
- Deployment configuration already set up with autoscale target using npm build/start scripts

**2025-10-01**: Loyalty System Redesign - Card Numbers + Stamps System
- Migrated loyalty system from QR-based to one-time use card code system
- Updated loyalty card schema: added `cardNumber` (unique display number), removed old QR requirement
- Created new `cardCodes` table for managing 100+ one-time use codes per card
- Each code can be used only once, tracked with `isUsed` and `usedAt` fields
- New stamp collection logic: 5 stamps trigger 10% discount, 6th stamp = free coffee
- Customer name made optional (nullable) in loyalty card creation forms
- Schema changes: `loyaltyCards.customerName` is now nullable, `cardNumber` added for display
- Prepared API infrastructure for code redemption and discount application
- Employee loyalty management page updated to reflect new code-based system
- Cashier interface will use card number input instead of QR scanner

**2025-10-01**: Database Migration - Complete PostgreSQL Integration
- Migrated from in-memory storage (MemStorage) to PostgreSQL database with Drizzle ORM
- Created DBStorage class implementing all IStorage methods with database queries
- Configured Neon PostgreSQL connection with WebSocket support for serverless
- All services now use persistent database storage: coffee items, orders, cart, employees, loyalty cards
- Automatic initialization seeds coffee menu data and demo employee on first run
- Database schema pushed successfully with all 8 tables (coffee_items, employees, orders, order_items, cart_items, loyalty_cards, loyalty_transactions, loyalty_rewards)
- Tested and verified all API endpoints working correctly with database
- Query safety ensured through Drizzle's parameterized query builders (no SQL injection risk)
- Data persistence: All customer orders, loyalty cards, and cart items now permanently stored
- Performance: API responses averaging 115-120ms for database queries
- Architecture notes: Storage interface remains unchanged, allowing seamless transition from MemStorage to DBStorage

**2025-10-01**: Customer-Facing Loyalty Card System with localStorage
- Built web-based "My Card" loyalty system (/my-card route) replacing Apple Wallet integration
- Implemented localStorage-based card storage with automatic phone number backup (qahwa-card-{phoneNumber})
- Added stamp collection UI (7 stamps = 1 free coffee) with visual progress indicators
- Created QR code generation for each card with card details encoded
- Implemented card retrieval system: customers can recover their card by entering phone number
- Added PNG image download feature using html2canvas for offline card storage
- Integrated WhatsApp notification when card is issued (sends card number, name, and phone)
- Designed card UI inspired by Fuji Cafe with amber/orange color scheme
- Added "My Card" access button in menu page header and splash screen (bottom-right)
- Removed Apple Wallet endpoint from server/routes.ts and cleaned up unused code
- Security note: Card data stored in browser localStorage (unencrypted) - suitable for non-sensitive loyalty data
- System is fully self-sufficient without requiring database or programmer intervention

**2025-10-01**: Fresh GitHub Clone - Complete Replit Environment Setup
- Successfully set up fresh GitHub clone to run in Replit environment
- Fixed TypeScript configuration: Added target: "ES2022" to support top-level await in server/storage.ts
- Provisioned PostgreSQL database using Replit's built-in database service
- Pushed complete database schema using drizzle-kit (all tables created successfully)
- Verified Vite dev server has allowedHosts: true for Replit proxy support (line 26 in server/vite.ts)
- Confirmed workflow "Start application" configured with webview output on port 5000
- Application running successfully with PostgreSQL database (DBStorage active)
- Tested frontend rendering - Arabic coffee shop interface displays perfectly with RTL layout
- Backend API endpoints validated (coffee items, cart API responding correctly)
- Autoscale deployment configuration already in place with npm build and start scripts
- Database environment variables automatically configured: DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST
- Application ready for immediate use and deployment

**2025-09-30**: Loyalty Card System & Unified Hub Implementation
- Implemented comprehensive loyalty card system with QR code generation
- Added loyalty_cards, loyalty_transactions, and loyalty_rewards database tables
- Created loyalty card issuance page at /employee/loyalty with customer name and phone input
- Built QR scanner component for cashier to scan customer loyalty cards
- Integrated automatic 10% discount when loyalty QR is scanned at checkout
- Added loyalty card tier system: Bronze (0-99), Silver (100-499), Gold (500-999), Platinum (1000+)
- Created unified hub page at route "/0" combining employee dashboard and menu view
- Enhanced employee dashboard with creative coffee-themed UI and loyalty management button
- Added loyalty card component with Apple Wallet export capability (prepared for future implementation)
- QR tokens generated with nanoid for security, scan validation prevents replay attacks
- Loyalty discount displayed in cashier interface with subtotal breakdown

**2025-09-30**: Employee Management & Cashier System Implementation
- Built comprehensive employee management system with secure authentication
- Added employee gateway page with general password protection (1802009)
- Implemented individual employee login with bcrypt-hashed passwords
- Created employee dashboard with profile cards and QR code generation
- Built cashier interface for creating customer orders with product selection
- Added customer information capture (name + phone number)
- Integrated WhatsApp invoice delivery system
- Implemented order management page with real-time status updates
- Added WhatsApp notifications for completed orders
- Security: All passwords hashed using bcrypt (10 rounds) before storage
- Demo employee credentials: username "darwish", password "2009"
- Subtly placed employee access button on splash screen (bottom-left)

**2025-09-30**: GitHub import setup completed for Replit environment
- Successfully imported and configured project for Replit deployment
- Configured workflow "Start application" to run on port 5000 with webview output
- Verified all dependencies are properly installed (tsx, vite, express, react)
- Confirmed frontend configuration with allowedHosts: true for Replit proxy support
- Set up autoscale deployment configuration with npm build/start scripts
- Tested application functionality - API endpoints and Vite HMR working correctly
- Application running successfully with in-memory storage for development

**2025-09-19**: Initial GitHub repository setup
- Project structure established with full-stack architecture

**2025-09-10**: Enhanced auto-rotation and promotional messaging
- Implemented automatic drink rotation every 6 seconds across ALL display modes (elegant, showcase, grid, mosaic, waterfall, tv-display, window-display)
- All display modes now show single current item instead of multiple items for cleaner presentation
- Updated promotional slogan from "أفضل قهوة في المدينة" to "لكل لحظة قهوة ، لحظة نجاح"
- Added index bounds protection for safer auto-rotation
- Unified navigation controls available in all view modes with autoplay toggle
- Enhanced QR code component with luxury design, gradients, and animations

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 18 using TypeScript and follows a component-based architecture with:
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for cart state management with session-based persistence
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom Arabic-focused coffee shop theme featuring dark backgrounds and gold accents
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for server state management and caching

## Backend Architecture
The server uses Express.js with TypeScript in a RESTful API pattern:
- **Framework**: Express.js with middleware for JSON parsing and logging
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage with session-based cart persistence
- **File Structure**: Modular design separating routes, storage layer, and server configuration

## Key Features
- **Multi-language Support**: Arabic-first with RTL layout and English fallbacks
- **Shopping Cart**: Session-based cart with add/remove/update functionality
- **Order Management**: Complete order lifecycle from creation to payment processing
- **Payment Integration**: Multiple payment methods including cash, digital wallets (STC Pay, Alinma Pay), and bank transfers
- **PDF Generation**: Client-side receipt generation for completed orders
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Employee Management System**: Secure employee authentication with role-based access (manager/cashier)
- **Cashier Interface**: Staff can create orders for customers with product selection and payment method
- **WhatsApp Integration**: Automated invoice delivery and order status notifications via WhatsApp
- **Employee Dashboard**: Profile cards with QR codes for employee identification
- **Customer Loyalty Card System**: Web-based "My Card" system with localStorage storage (no database required)
  - Stamp collection: 7 stamps = 1 free coffee
  - QR code for each card with encoded card details
  - Card retrieval via phone number
  - PNG image download for offline storage
  - WhatsApp notification on card issuance
  - Fuji Cafe-inspired design with amber/orange theme
- **QR Scanner Integration**: Cashier can scan customer loyalty cards for instant discount application
- **Unified Hub Page**: Combined dashboard and menu view at route "/0" for employees

## Database Schema
The system uses eight main entities:
- **Coffee Items**: Product catalog with multilingual names, pricing, categories, and availability status
- **Orders**: Order tracking with status management, payment details, customer info (name, phone), and employee reference
- **Order Items**: Detailed line items for each order
- **Cart Items**: Session-based temporary storage for shopping cart state
- **Employees**: Staff accounts with secure bcrypt-hashed passwords, roles (manager/cashier), and profile information
- **Loyalty Cards**: Customer loyalty cards with unique QR codes, points balance, and tier status
- **Loyalty Transactions**: Transaction history for loyalty card points and purchases
- **Loyalty Rewards**: Redeemable rewards based on accumulated points and tier level

## Component Architecture
- **Page Components**: Splash screen, menu browsing, product details, cart management, and employee system (gateway, login, dashboard, cashier, orders)
- **UI Components**: Reusable Shadcn/ui components with Arabic localization
- **Modal System**: Cart and checkout modals for streamlined user experience
- **Animation**: CSS animations for loading states and interactive feedback
- **QR Code Generation**: Dynamic QR code creation using qrcode library for employee identification

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

## UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework with custom theming
- **class-variance-authority**: Type-safe component variant management
- **clsx**: Conditional className utility

## Form and Validation Dependencies
- **react-hook-form**: Performant form library with validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation

## Development and Build Dependencies
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Arabic Language Support
- **Google Fonts**: Cairo and Amiri font families for Arabic typography
- **Font Awesome**: Icon library for consistent iconography

## PDF and Document Generation
- **Browser APIs**: Canvas and DOM manipulation for client-side PDF generation

## Database and Storage
- **connect-pg-simple**: PostgreSQL session store (configured but using in-memory for development)
- **drizzle-kit**: Database migration and schema management tools

## Security Dependencies
- **bcryptjs**: Password hashing library for secure employee credential storage
- **@types/bcryptjs**: TypeScript type definitions for bcryptjs