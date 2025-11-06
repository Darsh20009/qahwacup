# Overview

"قهوة كوب" (Coffee Cup) is a full-stack web application offering an Arabic-first digital coffee menu. It allows customers to browse items, manage a shopping cart, and place orders with various payment methods. The project aims to provide a modern, efficient, and culturally tailored ordering experience, targeting the digital transformation of local coffee shops. It includes a comprehensive manager dashboard for overseeing customers, employees, orders, branches, and analytics. The application also features an advanced order tracking system, ingredient management, and a customer loyalty program.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is a React 18 application built with TypeScript, utilizing Wouter for routing, React Context API for state management, Shadcn/ui and Radix UI for accessible components, and Tailwind CSS for styling with an Arabic-focused theme. Form validation is handled by React Hook Form with Zod, and server state by TanStack Query. It features a modern UI with a dark background and gold accents, an Arabic-first RTL layout, and responsive design.

## Backend Architecture
The backend is an Express.js application written in TypeScript, following a RESTful API pattern. It uses MongoDB with Mongoose for data persistence. The architecture is modular, separating routes, storage logic, and server configurations. All API endpoints use proper MongoDB serialization.

## Key Features
- **Digital Menu & Ordering**: Browse coffee items, manage a cart, and place orders with multiple payment options (Cash, STC Pay, Alinma Pay, Ur Pay, Barq, Bank Transfer). Optional table number input for dine-in orders.
- **Customer Authentication**: Mandatory customer registration and login with bcrypt-encrypted passwords.
- **Order Tracking System**: Visual order tracking with four stages (Ordered, Confirmed, Preparing, Ready for Pickup) and real-time updates.
- **Manager Dashboard**: Comprehensive interface for managers at `/manager/dashboard` with multi-tab access (Overview, Customers, Employees, Orders, Branches, Analytics). Includes access control for managers only, real-time statistics, revenue analytics, and management of customers, employees, orders, and branches.
- **Ingredient Management**: System to track 17 ingredients with availability, automatically affecting coffee item availability.
- **Employee Management System**: Secure authentication, cashier interface, and employee dashboard.
- **Customer Loyalty Program**: Web-based "My Card" system with stamp collection (7 stamps = 1 free coffee), QR code generation, card retrieval, and QR scanner integration for cashier.
- **WhatsApp Integration**: Automated invoices and order status notifications.
- **Multi-language Support**: Arabic-first with RTL layout.
- **Unified Hub Page**: Combines employee dashboard and menu view at `/0`.

## Database Schema
The system uses 14 main collections managed by MongoDB and Mongoose for:
- Coffee Items (24 items seeded automatically)
- Orders & Order Items
- Cart Items
- Employees (demo: darwish/2009)
- Customers
- Loyalty Cards, Card Codes, Loyalty Transactions, Loyalty Rewards
- Ingredients (17 items)
- Coffee Item Ingredients
- Password Reset Tokens
- Users
- Branches
- Categories

# External Dependencies

## Core Framework & Data
- **mongoose**: MongoDB ODM with schema validation.
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

## Other Libraries
- **qrcode**: QR code generation.
- **html2canvas**: Used for client-side image generation.