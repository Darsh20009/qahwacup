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
## Latest Fix: Orders Not Displaying in Cashier Panel (November 24, 2025 - Version 7.3)

### Problems Identified:
1. ✅ **Unassigned Orders Endpoint Issue**: `/api/orders/table/unassigned` was searching for `tableStatus: 'pending'` but orders were stored with `status: 'pending'`
2. ✅ **Customer Name Field Mismatch**: Frontend searched for `customerInfo.name` but API sent `customerInfo.customerName`
3. ✅ **Order ID Mismatch**: Frontend used `_id` but API serialized to `id`
4. ✅ **Items Parsing Error**: Frontend expected items as array but some endpoints returned JSON strings
5. ✅ **Type Definitions Out of Sync**: Local TypeScript interface didn't match API response

### Solutions Applied:

#### Backend Changes (server/routes.ts):
- Fixed `/api/orders/table/unassigned` query to use `$or` condition:
  - Searches for `tableStatus: 'pending'` OR
  - `status: 'pending'` with no `tableStatus` (for backward compatibility)
- Enhanced `/api/cashier/:cashierId/orders` endpoint:
  - Added `serializeDoc()` to convert `_id` to `id`
  - Parse `items` from JSON string to array
  - Enrich items with coffee details

#### Frontend Changes (client/src/pages/cashier-table-orders.tsx):
- Updated `IOrder` interface:
  - Changed `_id: string` to `id: string`
  - Updated `customerInfo` to include both `customerName` and fallback `name`
- Fixed all usages:
  - `order._id` → `order.id`
  - `order.customerInfo.name` → `order.customerInfo.customerName || order.customerInfo.name`
  - Added safety check: `Array.isArray(order.items)` before mapping

### Result:
✅ Unassigned table orders now display correctly in cashier panel
✅ Customer names show properly
✅ Items parse and display without errors
✅ Order IDs work correctly for mutations (accept/reject)
✅ No TypeScript errors

### Impact:
- Cashiers can now see pending table orders
- Accept/Reject buttons work properly
- Table order management is fully functional

## Major Update: Complete Emoji Removal (November 24, 2025 - Version 7.4)

### Objective:
Remove all emojis from the application UI to enhance professional appearance and adherence to design guidelines (Never use emoji in application UI).

### Files Updated:
1. **client/src/components/table-qr-card.tsx**
   - Changed QR card logo from "☕" to "C" for consistency

2. **client/src/pages/table-order-tracking.tsx**
   - Removed emojis from order status messages (✅, ☕, ✨, 🚶, 🎉)
   - Removed emoji from toast notification title (🔔)

3. **client/src/pages/cashier-table-orders.tsx**
   - Removed emojis from order status badges (🆕, ✅, ☕, ✨, 🚶, 🎉, ❌)
   - Removed emoji from toast notifications (🔔, ✅)

4. **client/src/pages/employee-cashier.tsx**
   - Removed emojis from toast titles (✅)
   - Removed emoji from register dialog indicator (❓)
   - Removed emoji from button text (✅)
   - Removed info emoji from helper text (ℹ️)
   - Removed emoji from customer points display (💎)
   - Removed emoji from customer email display (📧)

5. **client/src/pages/table-checkout.tsx**
   - Removed emojis from success toast title (✅)
   - Removed emoji from error toast title (⚠️)

6. **client/src/pages/table-reservation.tsx**
   - Removed emoji from success message (✅)
   - Removed emoji from empty state message (😔)
   - Removed emoji from reservation info message (📞)

7. **client/src/pages/table-menu-old.tsx**
   - Removed emojis from toast notification (✅)
   - Removed emoji from customer info display (✅)

### Result:
✅ All emojis have been systematically removed from the application
✅ Professional, polished UI throughout the application
✅ Adheres to universal design guidelines (never use emoji for application UI)
✅ Text is cleaner and more professional

### Impact:
- Enhanced professional appearance of the entire application
- Improved consistency across all pages and components
- Better alignment with modern design principles
- Maintains full functionality while improving visual professionalism

## Bug Fix: Cashier ID Undefined Error (November 24, 2025 - Version 7.5)

### Problem:
When clicking "Accept" (قبول) button in cashier table orders panel, an error appeared saying "معرف الكاشير غير متاح" (Cashier ID is not available). This occurred because:
1. Backend returns `id` field for employees
2. Frontend code was looking for `_id` field
3. Managers logging in as cashiers couldn't use the cashier interface

### Solution:
Updated employee data loading in localStorage to ensure compatibility:
- In `cashier-table-orders.tsx`: Added conversion from `id` to `_id` for compatibility
- In `employee-cashier.tsx`: Applied same fix for consistency
- Now accepts both `id` and `_id` formats from the backend

### Code Changes:
```typescript
// Check if employee has id but not _id, convert for compatibility
if (!parsed._id && parsed.id) {
  parsed._id = parsed.id;
}
```

### Result:
✅ Managers can now use cashier interface without errors
✅ Accept/Reject buttons work correctly
✅ All user roles can now work as cashiers
✅ ID format compatibility maintained

## Fixed Status Options for Table Orders (November 25, 2025 - Version 8.6)

### Problem: خيارات الحالة كانت غير صحيحة لطلبات الطاولات
- **قبل**: كانت تعرض "في الانتظار" مع الخيارات العادية
- **بعد**: الخيارات الصحيحة فقط لطلبات الطاولات

### الخيارات الصحيحة الآن:
1. ✅ تم تأكيد الدفع (payment_confirmed)
2. ✅ قيد التحضير (preparing)
3. ✅ جاهز للتقديم (ready)
4. ✅ تم التقديم (delivered)
5. ✅ إلغاء (cancelled)

### الفرق بين الطلبات:
| نوع الطلب | الخيارات |
|---------|---------|
| **طلبات عادية** | إرسال الطلب، تأكيد الدفع، جاري التحضير، جاهز للاستلام، مكتمل، ملغي |
| **طلبات الطاولات** | تم تأكيد الدفع، قيد التحضير، جاهز للتقديم، تم التقديم، إلغاء |

**الملف:** `client/src/pages/cashier-table-orders.tsx`

## Branch Name in New Table Orders (November 25, 2025 - Version 8.5)

### Feature: عرض اسم الفرع في الطلبات الجديدة
الآن في قسم "الطلبات الجديدة" في `cashier-table-orders.tsx` يظهر:
- **Badge ذهبي** مع اسم الفرع
- **Icon الموقع** (📍 MapPin icon)
- **الموقع**: فوق رقم الطاولة مباشرة

### التغييرات:
1. ✅ إضافة `branchId` و `branchName` إلى `IOrder` interface
2. ✅ جلب بيانات الفروع من `/api/branches`
3. ✅ عرض اسم الفرع لكل طلب جديد
4. ✅ تصميم متطابق مع `employee-orders.tsx`

**الملف:** `client/src/pages/cashier-table-orders.tsx`

## Table Number Display in Employee Orders (November 25, 2025 - Version 8.4)

### Feature: عرض رقم الطاولة في الطلبات
الآن عند عرض الطلبات في لوحة موظف المطبخ، تظهر معلومة واضحة أن الطلب من طاولة:
- **Badge أزرق** يعرض: "طاولة 1"
- **Icon الطاولة** (👥 Users icon)
- **الموقع**: جانب رقم الطلب مباشرة

### المنطق:
- إذا كان الطلب يحتوي على `tableNumber`
- تظهر Badge بزرقاء واضحة مع رقم الطاولة
- يساعد الموظفين على التمييز بين:
  - ✅ طلبات الطاولات (مع رقم)
  - ✅ طلبات التسليم والاستلام (بدون رقم)

## Pending Order Display on Table Menu (November 25, 2025 - Version 8.3)

### New Feature: عرض الطلب المعلق عند سكن QR
عندما يعود العميل لنفس الطاولة باستخدام QR code:
1. **جلب الطلب المعلق تلقائياً** - في `table-menu.tsx`
   - عند تحميل بيانات الطاولة، إذا كانت `currentOrderId` موجودة، نجلب الطلب من `/api/orders/{orderId}`
2. **عرض رسالة تنبيه واضحة** - في أعلى المنيو
   - رسالة: "لديك طلب معلق!"
   - وصف: "لديك طلب تم طلبه سابقاً من هذه الطاولة ولا يزال في الانتظار"
   - زر: "متابعة الطلب السابق" - ينقل العميل مباشرة إلى صفحة تتبع الطلب
3. **تحديث الحالة** - عرض الرسالة فقط إذا كان الطلب لم يكتمل بعد

### المنطق:
- الطلب يظهر إذا:
  - الطاولة تحتوي على `currentOrderId` ✅
  - الطلب موجود ويمكن جلبه ✅
  - حالة الطلب ليست `completed` ✅

## Complete Table Order Management System (November 25, 2025 - Version 8.2)

### Four Major Issues Resolved:

#### 1️⃣ **Automatic Table Occupancy Update**
- **Problem**: When customer ordered from a table, the table wasn't marked as occupied
- **Solution**: Added automatic table update when order is created
  - In `server/routes.ts`: After creating order, if `tableId` exists, call `updateTableOccupancy(tableId, 1, orderId)`
  - Table now shows: `isOccupied=1` with `currentOrderId` linking to the order
  
#### 2️⃣ **Order Tracking & Pending Order Detection**
- **Problem**: Customer had to start from scratch even if they had a pending order
- **Solution**: Enhanced customer lookup to fetch pending orders
  - In `server/routes.ts GET /api/customers/by-phone`: Also searches for pending table orders
  - Returns: `{ ...customerData, pendingTableOrder: {...} }` if order exists
  - In `client/src/pages/table-checkout.tsx`: Shows alert when pending order found with quick-link button
  
#### 3️⃣ **Correct Customer Data Retrieval**
- **Problem**: Customer data wasn't retrieved correctly when searching by phone
- **Solution**: Fixed field mapping
  - Now correctly reads customer `name` field (not just `fullName`)
  - Validates 9-digit phone format properly
  - Returns complete customer object with serialization
  
#### 4️⃣ **Table Order Visibility in Admin Panel**
- **Problem**: Cashier couldn't see orders from tables without opening admin panel
- **Solution**: Added order display in table management
  - In `client/src/pages/cashier-tables.tsx`:
    - New query fetches pending table orders (auto-refresh every 5 seconds)
    - Shows "عرض طلب الطاولة" (View Table Order) button when order exists
    - Quick link to `/table-order-tracking/{orderId}` without leaving table view

### Files Modified:
1. `server/routes.ts` - Table update + customer order lookup
2. `server/storage.ts` - Storage layer unchanged (already had methods)
3. `client/src/pages/table-checkout.tsx` - Pending order detection + UI
4. `client/src/pages/cashier-tables.tsx` - Order visibility in table cards

### User Experience Flow:
1. **Customer scans QR** → Orders from table
2. **System automatically** → Marks table occupied + links to order
3. **Customer returns** → Enters phone → System finds pending order
4. **Customer chooses** → Track existing order OR create new order
5. **Cashier views** → Sees all pending orders in table cards
6. **No need to leave** → Quick view button for any table's current order

## Table Release Bug Fix (November 25, 2025 - Version 8.1)

### Problem:
When cashier clicked "تحرير الطاولة" (Release Table), the table would show the reservation still exists instead of clearing it immediately.

### Root Cause:
MongoDB wasn't properly removing the `reservedFor` and `currentOrderId` fields when set to `undefined`. These fields persisted in the database document.

### Solution Applied:
1. **Backend (server/routes.ts)**: Changed `undefined` to `null` for fields to be deleted
2. **Storage Layer (server/storage.ts)**: Enhanced `updateTable()` to use MongoDB's `$unset` operator for proper field deletion:
   ```typescript
   // Convert null values to $unset operations
   if (updateObj[key] === null) {
     unsetObj[key] = 1;  // MongoDB will delete this field
     delete updateObj[key];
   }
   ```

### Frontend (already working):
- `refetchQueries` ensures immediate UI refresh after release/approve/cancel operations
- All mutations properly refetch table data

### Result:
✅ Tables now release correctly and immediately turn green (available) status

## Smart Reservation Time Window (November 25, 2025 - Version 8)

### Feature Overview:
Implemented a sophisticated time-window system for table reservations where the system automatically manages reservation lifecycle based on timing:

### Business Logic:
- **Booking Window**: -30 minutes before reservation time to +5 minutes after
  - Opens 30 mins before: Customers can place regular orders even if table is reserved
  - Active period: -30 to +5 minutes - requires reservation phone verification
  - Expires after +5 mins: Auto-cancellation if not approved by staff
  
### Frontend Implementation (client/src/pages/table-menu.tsx):
1. **Added time-window checker function**: `checkReservationWindow(reservationTime)` 
   - Calculates time difference between now and reservation time
   - Returns: `valid` | `before_window` | `after_window`

2. **Three distinct reservation states**:
   - `before_window` (-30+ mins): Shows amber message "الحجز لم يبدأ بعد" - allows normal order
   - `valid` (-30 to +5 mins): Shows blue verification - requires phone entry
   - `after_window` (+5+ mins): Shows red message "انتهت فترة الحجز" - allows normal order

3. **Updated checkout logic**: 
   - Auto-detects reservation status on table load
   - Shows appropriate UI message based on time window
   - Handles both reservation verification and normal orders seamlessly

### Backend Support (already in place):
- `/api/tables/:id/reserve`: Creates reservation with `reservationTime`
- `/api/tables/:id/approve-reservation`: Manual approval by staff
- `/api/tables/:id/cancel-reservation`: Manual cancellation by staff
- Automatic expiration logic in cashier-tables.tsx

### User Experience Flow:
1. **30+ minutes before**: Customer can order without reservation verification
2. **Within 30 mins**: Customer must verify reservation with phone number
3. **After 5 mins**: Reservation automatically expires, customer can order normally
4. **Staff can approve/cancel** at any time during valid window

## CRITICAL FIX: Branch-Restricted Table Access (November 25, 2025 - Version 7.6)

### Problem:
**CRITICAL REQUIREMENT NOT MET**: Each branch must display ONLY its own 10 tables. However, managers were able to access tables from ALL branches, including those outside their assigned branch.

### Root Cause:
In `/api/tables` GET endpoint (server/routes.ts, line 2717-2725):
- Manager role check allowed access to any branch via `queryBranchId` parameter
- API would return tables for ANY branch if manager requested it
- Security vulnerability: Multi-branch managers could see unauthorized branch data

### Solution Applied:
**Updated `/api/tables` GET endpoint** in `server/routes.ts`:
```typescript
// Manager can only see tables from their own branch
// CRITICAL: Each branch must display ONLY its own 10 tables
if (employee?.role === 'manager') {
  const managerBranch = employee?.branchId;
  
  // If queryBranchId is provided, verify it matches manager's branch
  if (queryBranchId && queryBranchId !== managerBranch) {
    return res.status(403).json({ error: "Unauthorized: Cannot access other branches" });
  }
  
  const tables = await storage.getTables(managerBranch);
  return res.json(tables);
}
```

### Verification:
✅ **Test Results:**
- Manager login: Status 200 ✅
- Get own branch tables: Status 200, Count: 10, All correct branchId ✅
- Access different branch: Status 403 (Forbidden) ✅
- Database: 40 tables total (10 per branch), all with correct branchId ✅

### Impact:
- ✅ Managers can ONLY see 10 tables from their assigned branch
- ✅ Attempting to access other branch tables returns 403 Forbidden
- ✅ CRITICAL REQUIREMENT: "Each branch must display ONLY its own 10 tables" - NOW SATISFIED
- ✅ Security hardening: Branch isolation is enforced at API level
- ✅ Admin role still has full access to all branches (as expected)

## Enhancements: Phone Verification & Reservation Check (November 25, 2025 - Version 7.7)

### Problems Fixed:
1. ✅ **Reservation validation incorrect**: Form showed "التحقق من الحجز" (verify reservation) even for non-reserved tables
2. ✅ **Phone field optional**: Phone was marked as "(اختياري)" but should be required for table orders
3. ✅ **No customer data lookup**: System didn't automatically fetch customer data when phone was entered

### Solutions Applied:

#### Frontend Changes (client/src/pages/table-menu.tsx):
- Updated reservation check: `table?.reservedFor?.customerName` instead of `table?.reservedFor`
- Only shows verification form when table is **actually reserved** with customer data

#### Frontend Changes (client/src/pages/table-checkout.tsx):
- Made phone field **required** (added asterisk *)
- Added `handlePhoneChange()` function to search for customer by phone
- Added auto-fill: When customer enters 9-digit phone, system automatically fetches and fills customer name
- Shows loading spinner during customer lookup
- Added validation: Phone must be exactly 9 digits
- Changed phone field from optional to required in form submission validation

#### Backend Changes (server/routes.ts):
- Added new GET endpoint: `/api/customers/by-phone/:phone` (lines 959-990)
  - Validates phone format (9 digits starting with 5)
  - Returns customer data if found, empty object if not found
  - Does not expose password field
  - Returns serialized customer data with proper ID format

### Result:
✅ **Reservation check**: Only shows verification form when table is reserved with actual customer data
✅ **Phone field**: Now required with proper validation (9 digits)
✅ **Customer lookup**: Auto-fetches customer name when phone is entered
✅ **User experience**: Seamless, intuitive flow with loading indicator
✅ **Data integrity**: Phone field properly validated before submission

### User Flow:
1. Customer enters phone (9 digits)
2. System automatically searches for registered customer
3. If found, customer name auto-fills (with toast: "تم العثور على العميل")
4. If not found, customer can manually enter name
5. All fields required for order submission
6. Form validates before sending order
