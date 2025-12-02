# قهوة كوب - Coffee Shop Management System

## Overview
قهوة كوب is a comprehensive coffee shop management system designed to streamline operations from order placement to loyalty programs. It supports in-store pickups, table ordering, and robust management of products, branches, employees, and loyalty cards. The system aims to enhance customer experience through efficient service and engaging loyalty features, while providing administrators with powerful tools for managing the business.

## User Preferences
- All texts are in Arabic with English support for data.
- The system fully supports RTL.
- I want iterative development.
- Ask before making major changes.
- Provide detailed explanations for complex solutions.

## System Architecture

### UI/UX Decisions
The UI/UX emphasizes a modern, attractive design. QR cards and employee badges feature a modern, attractive beige color scheme with warm tones, including a site logo and golden accents. Password fields across the system include show/hide icons for usability.

### Technical Implementations
- **Table Management:** Managers can create tables with QR codes. Customers order as guests via QR scan. Cashiers manage table orders with real-time tracking and audio notifications.
- **Order Lifecycle:** Orders track through statuses: `pending` → `payment_confirmed` → `preparing` → `delivering_to_table` → `delivered`/`cancelled`.
- **Branch Management:** Supports soft deletion of branches (`isActive: 0`) and optional Google Maps links.
- **Authentication & Employee Management:** Includes "Forgot Password" for employees and managers. New seeded employees use a default password.
- **Customer Registration:** Phone (9 digits starting with 5) and email (validated) are mandatory for unregistered customers. An option to "create an account" during checkout allows automatic account creation with a password.
- **Order Visibility:** Regular and table orders are consolidated. Managers and employees can view all orders from all branches, with branch names displayed.
- **Geolocation:** Uses Point-in-Polygon for geographic validation and Haversine Distance for calculations.
- **Admin Controls:** Features include an "Complete All Orders" button for quick order status updates (for testing) and an "Clear All Data" button (admin only) to delete all orders and customers (for development/testing).
- **Branch Filtering:** Cashiers can filter table orders by branch.
- **Smart Reservation Time Window:** Table reservations include a time-window system (-30 minutes to +5 minutes from reservation time) that automatically manages reservation lifecycle and customer ordering options.
- **Branch-Restricted Table Access:** Managers can only access tables within their assigned branch, with API-level enforcement of this security measure.
- **Phone Verification & Reservation Check:** Enhanced phone input for customer lookup and auto-fill, and accurate reservation verification logic for tables.
- **Attendance Location Verification:** Check-in/out requires employee to be within 100 meters of their assigned branch. Distance is calculated using Haversine formula and stored with each attendance record (isAtBranch, distanceFromBranch fields).
- **Enhanced Attendance Display:** Manager attendance page shows employee photos, branch names, location verification status (inside/outside branch), and distance from branch for both check-in and check-out.
- **Employee Role Selection:** When creating employees, admins can select employee role (cashier, accountant, manager, admin) and assign them to specific branches.
- **Branch Manager Assignment:** When creating a new branch, admins can either assign an existing manager or create a new manager account (without password - needs activation).
- **POS Connection Settings:** The cashier interface includes a POS settings dialog with toggle switch to connect/disconnect the POS device, real-time status monitoring, and connection information. Cashiers can click the POS status indicator to access settings.
- **Enhanced POS System:** Full-featured Point of Sale system similar to Foodics at `/employee/pos` with:
  - Quick order screen with category-based item filtering (Espresso, Latte, Cold Drinks, Tea, Specialty)
  - Multiple payment methods: Cash, Mada (POS), Alinma Pay, Ur Pay, Barq, Al Rajhi, Apple Pay
  - Order parking/holding functionality for managing multiple customers
  - Item-level and invoice-level discounts with discount code validation
  - Offline mode support with automatic sync when connection is restored
  - Hardware integration APIs for cash drawer and receipt printing
  - Customer lookup by phone number with loyalty points display
  - Receipt and tax invoice printing capabilities
- **Automatic Tax Invoices:** Orders automatically send tax invoices via email (15% VAT) to customers who provide email addresses. Uses Maileroo SMTP integration.
- **Driver Role Support:** Employee creation supports "driver" role (سائق توصيل) in both job title and system role dropdowns for delivery personnel management.

### Feature Specifications
- **Product Management:** Add, modify, delete coffee products.
- **Order System:** Create and track orders (pickup and table).
- **Loyalty Cards:** Points and coupon system.
- **Employee Management:** Cashier and manager accounts.
- **Discount Codes:** Advanced discount system.
- **Ingredients Management:** Manage beverage components.
- **Payment System:** Cash, card, or electronic payment with receipt upload.
- **In-Store Pickup:** Customers select a pickup branch.
- **Table Reservations:** Cashiers can reserve tables.
- **Security:** Table ordering is guest-only. Phone number search is cashier-only.
- **High Print Quality:** Designs are created for professional printing.
- **Pending Order Display:** When a customer scans a table QR, if a pending order exists for that table, a notification is displayed with an option to continue the previous order.
- **Table Occupancy:** Tables are automatically marked as occupied upon order creation and released correctly upon action.

### Inventory Management System
- **Raw Materials:** Complete CRUD for raw materials with unit costs, suppliers, and stock levels. Enhanced UI with category-specific icons (Coffee, Milk, Package) and warm coffee-themed color palette.
- **Suppliers:** Manage supplier information with contact details and status tracking.
- **Branch Stock:** Track inventory levels per branch with automatic low-stock alerts.
- **Stock Transfers:** Transfer stock between branches with approval workflow. Statistics cards show pending, approved, and completed transfers with unit display.
- **Purchase Invoices:** Create and track purchase orders from suppliers. Statistics cards show total value, pending payments, and overdue invoices. Payment tracking with incremental payments and progress bars.
- **Recipe Management:** Define ingredient recipes for each product with exact quantities. Recipes store quantities in user's input unit (e.g., 18g coffee beans), normalization only occurs during COGS calculation. Enhanced with unit conversion helpers, cost previews, profit margin calculations, and quick ingredient templates for espresso-based, milk-based, and iced drinks.
- **Smart Inventory Deduction:** Automatically deducts raw materials when orders are placed based on product recipes. Example: A cappuccino order deducts 18g coffee beans + 120ml milk. Prevents negative stock by capping deductions at available quantity (partial deduction). Tracks shortage information per-order-item for actionable frontend feedback.
- **COGS Tracking:** Calculates Cost of Goods Sold for each order based on ingredient costs. Tracks gross profit per order. Order.inventoryDeducted status: 0=not deducted, 1=fully deducted, 2=partially deducted (shortages).
- **Order Deduction Display:** Employee order view includes collapsible inventory details panel showing deduction status badge, COGS, gross profit, profit margin percentage, and list of all deducted raw materials with quantities and costs.
- **Stock Movements:** Complete audit trail of all inventory changes with movement types (purchase, sale, transfer_in, transfer_out, adjustment, waste, return). Statistics show incoming movements, sales deductions, and waste counts.
- **Stock Alerts:** Automatic alerts for low stock and out-of-stock items. Statistics show counts by alert type (out of stock, low stock, expiring). Supports bulk "mark all as read" action. Shows deficit column indicating quantity shortage.
- **Inventory Dashboard:** Enhanced with coffee-themed KPI tiles showing raw materials count, low stock alerts, pending transfers, and COGS summary with gradient accents and warm beige/brown color palette.
- **Seeded Test Data:** System seeds 3 suppliers (coffee, dairy, packaging), 20 raw materials with proper units and costs, and 14 drink recipes with realistic ingredient quantities for testing the complete inventory flow.

### System Design Choices
- **Backend:** Node.js with Express.js, MongoDB with Mongoose, Zod for validation, bcryptjs for password hashing.
- **Frontend:** React with TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter for routing.

## External Dependencies
- **MongoDB:** Database for storing application data.
- **Google Maps:** Used for displaying branch locations and providing navigation links.
- **qrcode library:** For generating QR codes.