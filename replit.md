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

### System Design Choices
- **Backend:** Node.js with Express.js, MongoDB with Mongoose, Zod for validation, bcryptjs for password hashing.
- **Frontend:** React with TypeScript, Vite, TanStack Query, shadcn/ui, Tailwind CSS, Wouter for routing.

## External Dependencies
- **MongoDB:** Database for storing application data.
- **Google Maps:** Used for displaying branch locations and providing navigation links.
- **qrcode library:** For generating QR codes.