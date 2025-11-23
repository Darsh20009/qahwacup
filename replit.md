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
The UI/UX emphasizes a modern, attractive design, especially evident in the QR card and employee badge designs.
- **QR Cards:** Feature a modern, attractive beige color scheme with warm tones (beige, light brown, gold), including a site logo (☕ in a gold gradient circle), golden borders, corner decorations, and professional print-ready quality. Enhanced QR codes ensure easy scanning.
- **Employee Badges:** Utilize warm beige gradients and a horizontal, three-column layout (employee photo, info, QR code for location) with creative elements like golden corner ornaments, a golden strip at the bottom, soft shadows, and the ☕ logo. The backside includes terms of use, responsibilities, and benefits.
- **Password Fields:** All password input fields across various pages include show/hide password icons for improved usability.

### Technical Implementations
- **Table Management:** Managers can create tables with QR codes. Customers scan QR codes to order as guests (name only). Cashiers manage table orders with real-time tracking and audio notifications for new orders.
- **Order Lifecycle:** Comprehensive order status tracking: `pending` → `payment_confirmed` → `preparing` → `delivering_to_table` → `delivered`/`cancelled`.
- **Branch Management:** Supports soft deletion of branches (`isActive: 0`) to hide them from customers while remaining visible to managers. Includes optional Google Maps links for branches.
- **Authentication & Employee Management:** Implemented "Forgot Password" flows for employees and managers. New seeded employees have a default password "1234" and are auto-activated.
- **Customer Registration:** For unregistered customers, phone number (9 digits starting with 5) and email (with format validation) are mandatory. An option to "create an account" during checkout allows automatic account creation with a password (min. 6 characters) and show/hide functionality.
- **Order Visibility:** All regular and table orders are consolidated in the order management view. Managers and employees can see all orders from all branches, with the branch name displayed above each order.
- **Geolocation:** Uses Point-in-Polygon for geographic area validation and Haversine Distance for distance calculations, though current coordinates are approximate.

### Feature Specifications
- **Product Management:** Add, modify, delete coffee products.
- **Order System:** Create and track orders (pickup from branch only).
- **Loyalty Cards:** Points and coupon system.
- **Employee Management:** Cashier and manager accounts.
- **Discount Codes:** Advanced discount system.
- **Ingredients Management:** Manage beverage components.
- **Payment System:** Cash, card, or electronic payment with receipt upload.
- **In-Store Pickup:** Customers select a pickup branch, with optional map links.
- **Table Reservations:** Cashiers can reserve tables for customers, specifying the number of guests.
- **Security:** Table ordering is guest-only to protect loyalty points. Registered customers use the main app/website to earn points. Phone number search is cashier-only with authentication.
- **High Print Quality:** Designs are created with high canvas sizes (e.g., 1000x1200 for QR cards) for professional printing.

### System Design Choices
- **Backend:** Node.js with Express.js for the server-side, MongoDB with Mongoose for database management, Zod for schema validation, and bcryptjs for password hashing.
- **Frontend:** React with TypeScript for the user interface, Vite as the build tool, TanStack Query for data fetching, shadcn/ui for UI components, Tailwind CSS for styling, and Wouter for routing.

## External Dependencies
- **MongoDB:** Database for storing application data.
- **Google Maps:** Used for displaying branch locations and providing navigation links.
- **qrcode library:** For generating QR codes.
## Latest Fix: GET /api/orders/:id Serialization (November 23, 2025 - Version 7)
- ✅ **Fixed serializeDoc() missing in GET endpoint**: Added `serializeDoc()` to convert `_id` to `id` in `/api/orders/:id` response
- ✅ **Resolved undefined orderId issue**: Now properly returns `id` field instead of `_id` from MongoDB documents
- ✅ **Table order tracking now works**: Customers can successfully track their table orders after placement
- **Impact**: Order ID is now correctly extracted from URL parameters and used to fetch order details

## Additional Fix: Items Parsing in Table Order Tracking (November 23, 2025 - Version 7.1)
- ✅ **Parse items from JSON string**: When fetching order, convert `items` from JSON string to array in query function
- ✅ **Add safety checks**: Added conditions to ensure `order.items` exists and is an array before rendering
- ✅ **Show loading state**: Display "جاري تحميل تفاصيل الطلب..." while order items are being loaded
- **Result**: Table order details now display correctly without "order.items.map is not a function" error

## Latest Fix: Order Status Not Displaying (November 23, 2025 - Version 7.2)
- ✅ **Fixed status field mapping**: Backend stores both `status` and `tableStatus` fields
- ✅ **Updated Frontend logic**: Now uses `tableStatus || status` fallback to display order status
- ✅ **Fixed notification detection**: Updated useEffect to check both status fields
- **Result**: Order status now displays correctly instead of "غير معروف" (unknown)
- **Impact**: Status changes are now properly detected and displayed in real-time
