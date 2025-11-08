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
- **Real-time Order Management for Cashiers**: 
  - Auto-refresh every 3 seconds using polling
  - Audio and visual notifications for new orders with animated bell badge
  - Advanced search by order number, customer name, or phone
  - Multi-level status filtering (all, active, pending, payment_confirmed, in_progress, ready, completed, cancelled)
  - Live statistics dashboard showing order counts by status
  - Intelligent new order detection using ID-based tracking (handles both `id` and `_id` fields)
- **Advanced Manager Dashboard**: 
  - Date range filtering (today, week, month, all time)
  - Enhanced KPI cards with growth rate indicators
  - Daily revenue trend visualization using area charts (Recharts)
  - Top-selling products bar chart with detailed revenue breakdown
  - Payment methods distribution pie chart with percentages
  - Employee performance comparison charts (order count & sales)
  - All analytics respect selected date filters with proper timestamp validation
  - Comprehensive tabs for Customers, Employees, Orders, Branches, and Analytics
- **Ingredient Management**: System to track 17 ingredients with availability, automatically affecting coffee item availability.
- **Employee Management System**: Secure authentication, cashier interface, and employee dashboard.
- **Customer Loyalty Program**: Web-based "My Card" system with stamp collection (7 stamps = 1 free coffee), QR code generation, card retrieval, and QR scanner integration for cashier.
- **WhatsApp Integration**: Automated invoices and order status notifications.
- **Multi-language Support**: Arabic-first with RTL layout.
- **Unified Hub Page**: Combines employee dashboard and menu view at `/0`.
- **Car Pickup System**: Drive-through/curbside pickup with vehicle information (type, color) for seamless order delivery.
- **Digital PDF Receipts**: Branded PDF invoices ("فاتورة استلام") with Qahwa Cup logo and complete order details.

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

## Data Visualization
- **recharts**: React charts library for rendering area, bar, pie, and line charts.

## Other Libraries
- **qrcode**: QR code generation.
- **html2canvas**: Used for client-side image generation.
- **jspdf**: PDF generation for digital receipts and invoices.

# Recent Changes (November 2025)

## Enhanced Employee Orders Page
- **Real-time Updates**: Implemented 3-second polling for automatic order refresh
- **New Order Notifications**: Audio and visual alerts with animated bell badge when new orders arrive
- **Advanced Search**: Search by order number, customer name, or phone number
- **Multi-level Filtering**: Status filters including all, active, pending, payment_confirmed, in_progress, ready, completed, cancelled
- **Live Statistics**: Dashboard showing order counts by status with auto-update
- **Robust ID Handling**: Normalized order ID detection supporting both `id` and `_id` fields

## Advanced Manager Dashboard Analytics
- **Date Range Filters**: Filter all analytics by today, week, month, or all time
- **Growth Rate Indicators**: Display revenue growth percentage compared to previous period
- **Revenue Trend Chart**: Area chart showing daily revenue over time
- **Top Products Analysis**: Bar chart and list of best-selling products with revenue breakdown
- **Payment Methods Distribution**: Pie chart showing payment method usage percentages
- **Employee Performance**: Comparison charts for order count and sales per employee
- **Data Validation**: All charts and metrics handle missing or invalid timestamps gracefully
- **Consistent Metrics**: All KPI cards respect selected date filter with validated data

## Car Pickup & Digital Receipts (November 8, 2025)
- **Customer Car Pickup Flow**:
  - Car information form appears when order status changes to "ready"
  - Captures vehicle type and color for easy identification
  - Optional: Save car details to customer profile for future orders
  - Automatic fallback to saved car info if previously saved
- **Digital PDF Invoice**:
  - Branded PDF with Qahwa Cup logo and Arabic branding
  - Complete order details: items, quantities, prices, total
  - Customer information and order number
  - Downloadable as "فاتورة استلام" (Receipt Invoice)
  - Available for orders in "ready" or "completed" status
- **Employee Interface**:
  - Car information displayed prominently for "ready" orders
  - Visual indicators (purple badge) for curbside pickup orders
  - Clear instructions to deliver order to customer's vehicle
- **Database Schema Updates**:
  - Added `carInfo` to Customer model (carType, carColor)
  - Added `carPickup` to Order model (carType, carColor)
  - New API endpoints: `/api/orders/:id/car-pickup` and PATCH `/api/customers/:id`
- **Technical Implementation**:
  - Uses jsPDF and html2canvas for PDF generation
  - Car information persisted in both Customer and Order collections
  - Seamless integration with existing order tracking workflow