import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/guards/AuthGuard";
import SplashScreen from "@/pages/splash";
import CartModal from "@/components/cart-modal";
import CheckoutModal from "@/components/checkout-modal";
import { CartProvider, useCartStore } from "@/lib/cart-store";
import { CustomerProvider } from "@/contexts/CustomerContext";

// Lazy load all non-critical pages
const MenuPage = lazy(() => import("@/pages/menu"));
const ProductDetails = lazy(() => import("@/pages/product-details"));
const MenuView = lazy(() => import("@/pages/menu-view"));
const CartPage = lazy(() => import("@/pages/cart-page"));
const DeliverySelectionPage = lazy(() => import("@/pages/delivery-selection"));
const DeliveryMapPage = lazy(() => import("@/pages/delivery-map"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const OrderTrackingPage = lazy(() => import("@/pages/tracking"));
const EmployeeSplash = lazy(() => import("@/pages/employee-splash"));
const EmployeeGateway = lazy(() => import("@/pages/employee-gateway"));
const EmployeeLogin = lazy(() => import("@/pages/employee-login"));
const EmployeeDashboard = lazy(() => import("@/pages/employee-dashboard"));
const EmployeeCashier = lazy(() => import("@/pages/employee-cashier"));
const EmployeeOrders = lazy(() => import("@/pages/employee-orders"));
const EmployeeLoyalty = lazy(() => import("@/pages/employee-loyalty"));
const EmployeeMenuManagement = lazy(() => import("@/pages/employee-menu-management"));
const EmployeeIngredientsManagement = lazy(() => import("@/pages/employee-ingredients-management"));
const EmployeeOrdersDisplay = lazy(() => import("@/pages/employee-orders-display"));
const UnifiedHub = lazy(() => import("@/pages/unified-hub"));
const MyCard = lazy(() => import("@/pages/my-card"));
const CustomerAuth = lazy(() => import("@/pages/CustomerAuth"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const CopyCard = lazy(() => import("@/pages/CopyCard"));
const CardCustomization = lazy(() => import("@/pages/card-customization"));
const MyOrdersPage = lazy(() => import("@/pages/my-orders"));
const ManagerEmployees = lazy(() => import("@/pages/manager-employees"));
const EmployeeActivation = lazy(() => import("@/pages/employee-activation"));
const ManagerDashboard = lazy(() => import("@/pages/manager-dashboard"));
const ManagerLogin = lazy(() => import("@/pages/manager-login"));
const ManagerDrivers = lazy(() => import("@/pages/manager-drivers"));
const ManagerTables = lazy(() => import("@/pages/manager-tables"));
const TableMenu = lazy(() => import("@/pages/table-menu"));
const TableCheckout = lazy(() => import("@/pages/table-checkout"));
const TableOrderTracking = lazy(() => import("@/pages/table-order-tracking"));
const TableReservation = lazy(() => import("@/pages/table-reservation"));
const CashierTableOrders = lazy(() => import("@/pages/cashier-table-orders"));
const CashierTables = lazy(() => import("@/pages/cashier-tables"));
const CashierReservations = lazy(() => import("@/pages/cashier-reservations"));
const EmployeeForgotPassword = lazy(() => import("@/pages/employee-forgot-password"));
const ManagerForgotPassword = lazy(() => import("@/pages/manager-forgot-password"));
const EmployeeAttendance = lazy(() => import("@/pages/employee-attendance"));
const LeaveRequestPage = lazy(() => import("@/pages/leave-request"));
const ManagerAttendance = lazy(() => import("@/pages/manager-attendance"));
const OwnerDashboard = lazy(() => import("@/pages/owner-dashboard"));
const InventoryDashboard = lazy(() => import("@/pages/inventory-dashboard"));
const InventoryRawItems = lazy(() => import("@/pages/inventory-raw-items"));
const InventorySuppliers = lazy(() => import("@/pages/inventory-suppliers"));
const InventoryPurchases = lazy(() => import("@/pages/inventory-purchases"));
const InventoryTransfers = lazy(() => import("@/pages/inventory-transfers"));
const InventoryRecipes = lazy(() => import("@/pages/inventory-recipes"));
const InventoryStock = lazy(() => import("@/pages/inventory-stock"));
const InventoryAlerts = lazy(() => import("@/pages/inventory-alerts"));
const InventoryMovements = lazy(() => import("@/pages/inventory-movements"));
const POSSystem = lazy(() => import("@/pages/pos-system"));
const KitchenDisplay = lazy(() => import("@/pages/kitchen-display"));
const AccountingDashboard = lazy(() => import("@/pages/accounting-dashboard"));
const IngredientsRecipesInventory = lazy(() => import("@/pages/ingredients-recipes-inventory"));
const OrderStatusDisplay = lazy(() => import("@/pages/order-status-display"));
const InventorySmartPage = lazy(() => import("@/pages/inventory-smart"));
const AccountingSmartPage = lazy(() => import("@/pages/accounting-smart"));
const EmployeeAvailability = lazy(() => import("@/pages/employee-availability"));
const UnauthorizedPage = lazy(() => import("@/pages/unauthorized"));
const ProductReviews = lazy(() => import("@/pages/product-reviews"));
const ReferralProgram = lazy(() => import("@/pages/referral-program"));
const NotificationsPage = lazy(() => import("@/pages/notifications"));
const CustomerReservations = lazy(() => import("@/pages/customer-reservations"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminEmployees = lazy(() => import("@/pages/admin-employees"));
const AdminReports = lazy(() => import("@/pages/admin-reports"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const TenantSignup = lazy(() => import("@/pages/tenant-signup"));
const RecipesManagement = lazy(() => import("@/pages/recipes-management"));
const InventorySmartDashboard = lazy(() => import("@/pages/inventory-smart-dashboard"));
const AccountingSmartDashboard = lazy(() => import("@/pages/accounting-smart-dashboard"));
const ReportsPage = lazy(() => import("@/pages/reports"));
const StockMovementsPage = lazy(() => import("@/pages/stock-movements"));

const OSInventoryManagement = lazy(() => import("@/pages/os-inventory-management"));
const OSRecipeManagement = lazy(() => import("@/pages/os-recipe-management"));
const OSAccountingDashboard = lazy(() => import("@/pages/os-accounting-dashboard"));
const OSStockManagement = lazy(() => import("@/pages/os-stock-management"));
const OSRolesManagement = lazy(() => import("@/pages/os-roles-management"));
const ExecutiveDashboard = lazy(() => import("@/pages/executive-dashboard"));
const UnifiedInventoryRecipes = lazy(() => import("@/pages/unified-inventory-recipes"));
const ZATCAInvoices = lazy(() => import("@/pages/zatca-invoices"));
const UserGuide = lazy(() => import("@/pages/user-guide"));
const AdvancedAnalytics = lazy(() => import("@/pages/advanced-analytics"));
const SupplierManagement = lazy(() => import("@/pages/supplier-management"));
const LoyaltyProgram = lazy(() => import("@/pages/loyalty-program"));
const ExternalIntegrations = lazy(() => import("@/pages/external-integrations"));
const SupportSystem = lazy(() => import("@/pages/support-system"));
const PageLoader = () => <div className="w-full h-screen flex items-center justify-center bg-background" />;

function Router() {
 return (
 <Suspense fallback={<PageLoader />}>
 <Switch>
 {/* Public routes */}
 <Route path="/" component={MenuPage} />
 <Route path="/0"><EmployeeSplash /></Route>
 <Route path="/tenant/signup"><TenantSignup /></Route>
 <Route path="/auth">
          <CustomerAuth />
        </Route>
 <Route path="/forgot-password">
          <ForgotPassword />
        </Route>
 <Route path="/reset-password">
          <ResetPassword />
        </Route>
 <Route path="/menu">
          <MenuPage />
        </Route>
 <Route path="/menu-view">
          <MenuView />
        </Route>
 <Route path="/product/:id">
          <ProductDetails />
        </Route>
 <Route path="/table-menu/:qrToken">
          <TableMenu />
        </Route>
 <Route path="/table-checkout/:tableId/:tableNumber">
          <TableCheckout />
        </Route>
 <Route path="/table-reservation">
          <TableReservation />
        </Route>
<Route path="/my-reservations">
          <CustomerReservations />
        </Route>
 <Route path="/table-order-tracking/:orderId">
          <TableOrderTracking />
        </Route>
 <Route path="/order-status">
          <OrderStatusDisplay />
        </Route>
 <Route path="/unauthorized">
          <UnauthorizedPage />
        </Route>
 
 {/* Notifications - for all users */}
 <Route path="/notifications">{() => <NotificationsPage />}</Route>
 
 {/* Customer protected routes */}
 <Route path="/copy-card">{() => <AuthGuard userType="customer"><CopyCard /></AuthGuard>}</Route>
 <Route path="/card-customization">{() => <AuthGuard userType="customer"><CardCustomization /></AuthGuard>}</Route>
 <Route path="/my-orders">{() => <AuthGuard userType="customer"><MyOrdersPage /></AuthGuard>}</Route>
 <Route path="/my-card">{() => <AuthGuard userType="customer"><MyCard /></AuthGuard>}</Route>
 <Route path="/referrals">{() => <AuthGuard userType="customer"><ReferralProgram /></AuthGuard>}</Route>
 <Route path="/cart">{() => <AuthGuard userType="customer"><CartPage /></AuthGuard>}</Route>
 <Route path="/delivery">{() => <AuthGuard userType="customer"><DeliverySelectionPage /></AuthGuard>}</Route>
 <Route path="/delivery/map">{() => <AuthGuard userType="customer"><DeliveryMapPage /></AuthGuard>}</Route>
 <Route path="/checkout">{() => <AuthGuard userType="customer"><CheckoutPage /></AuthGuard>}</Route>
 <Route path="/tracking">{() => <AuthGuard userType="customer"><OrderTrackingPage /></AuthGuard>}</Route>
 
 {/* Employee auth routes (public) */}
 <Route path="/employee"><EmployeeSplash /></Route>
 <Route path="/employee/gateway"><EmployeeGateway /></Route>
 <Route path="/employee/login"><EmployeeLogin /></Route>
 <Route path="/employee/forgot-password"><EmployeeForgotPassword /></Route>
 <Route path="/employee/activate"><EmployeeActivation /></Route>
 
 {/* Employee protected routes */}
 <Route path="/employee/dashboard">{() => <AuthGuard userType="employee"><EmployeeDashboard /></AuthGuard>}</Route>
 <Route path="/employee/cashier">{() => <AuthGuard userType="employee"><EmployeeCashier /></AuthGuard>}</Route>
 <Route path="/employee/pos">{() => <AuthGuard userType="employee"><POSSystem /></AuthGuard>}</Route>
 <Route path="/employee/kitchen">{() => <AuthGuard userType="employee"><KitchenDisplay /></AuthGuard>}</Route>
 <Route path="/employee/tables">{() => <AuthGuard userType="employee"><CashierTables /></AuthGuard>}</Route>
 <Route path="/employee/table-orders">{() => <AuthGuard userType="employee"><CashierTableOrders /></AuthGuard>}</Route>
 <Route path="/employee/orders">{() => <AuthGuard userType="employee"><EmployeeOrders /></AuthGuard>}</Route>
 <Route path="/employee/orders-display">{() => <AuthGuard userType="employee"><EmployeeOrdersDisplay /></AuthGuard>}</Route>
 <Route path="/employee/loyalty">{() => <AuthGuard userType="employee"><EmployeeLoyalty /></AuthGuard>}</Route>
 <Route path="/employee/menu-management">{() => <AuthGuard userType="employee" allowedRoles={["manager", "admin"]}><EmployeeMenuManagement /></AuthGuard>}</Route>
 <Route path="/employee/ingredients">{() => <AuthGuard userType="employee" allowedRoles={["manager", "admin"]}><EmployeeIngredientsManagement /></AuthGuard>}</Route>
 <Route path="/employee/availability">{() => <AuthGuard userType="employee"><EmployeeAvailability /></AuthGuard>}</Route>
 <Route path="/employee/attendance">{() => <AuthGuard userType="employee"><EmployeeAttendance /></AuthGuard>}</Route>
<Route path="/employee/leave-request">{() => <AuthGuard userType="employee"><LeaveRequestPage /></AuthGuard>}</Route>
<Route path="/employee/reservations">{() => <AuthGuard userType="employee"><CashierReservations /></AuthGuard>}</Route>
 
 {/* Manager auth routes (public) */}
 <Route path="/manager"><ManagerLogin /></Route>
 <Route path="/manager/forgot-password"><ManagerForgotPassword /></Route>
 <Route path="/manager/login"><ManagerLogin /></Route>
 
 {/* Manager protected routes */}
 <Route path="/manager/employees">{() => <AuthGuard userType="manager"><ManagerEmployees /></AuthGuard>}</Route>
 <Route path="/manager/drivers">{() => <AuthGuard userType="manager"><ManagerDrivers /></AuthGuard>}</Route>
 <Route path="/manager/dashboard">{() => <AuthGuard userType="manager"><ManagerDashboard /></AuthGuard>}</Route>
 <Route path="/manager/tables">{() => <AuthGuard userType="manager"><ManagerTables /></AuthGuard>}</Route>
 <Route path="/manager/attendance">{() => <AuthGuard userType="manager"><ManagerAttendance /></AuthGuard>}</Route>
 <Route path="/manager/inventory">{() => <AuthGuard userType="manager"><InventorySmartPage /></AuthGuard>}</Route>
 <Route path="/manager/inventory/raw-items">{() => <AuthGuard userType="manager"><InventoryRawItems /></AuthGuard>}</Route>
 <Route path="/manager/inventory/suppliers">{() => <AuthGuard userType="manager"><InventorySuppliers /></AuthGuard>}</Route>
 <Route path="/manager/inventory/purchases">{() => <AuthGuard userType="manager"><InventoryPurchases /></AuthGuard>}</Route>
 <Route path="/manager/inventory/transfers">{() => <AuthGuard userType="manager"><InventoryTransfers /></AuthGuard>}</Route>
 <Route path="/manager/inventory/recipes">{() => <AuthGuard userType="manager"><InventoryRecipes /></AuthGuard>}</Route>
 <Route path="/manager/inventory/stock">{() => <AuthGuard userType="manager"><InventoryStock /></AuthGuard>}</Route>
 <Route path="/manager/inventory/alerts">{() => <AuthGuard userType="manager"><InventoryAlerts /></AuthGuard>}</Route>
 <Route path="/manager/inventory/movements">{() => <AuthGuard userType="manager"><InventoryMovements /></AuthGuard>}</Route>
 <Route path="/manager/accounting">{() => <AuthGuard userType="manager"><AccountingDashboard /></AuthGuard>}</Route>
 <Route path="/manager/inventory/smart">{() => <AuthGuard userType="manager"><InventorySmartPage /></AuthGuard>}</Route>
 <Route path="/manager/accounting/smart">{() => <AuthGuard userType="manager"><AccountingSmartPage /></AuthGuard>}</Route>
 <Route path="/manager/ingredients-recipes">{() => <AuthGuard userType="manager"><IngredientsRecipesInventory /></AuthGuard>}</Route>
 <Route path="/manager/os-inventory">{() => <AuthGuard userType="manager"><OSInventoryManagement /></AuthGuard>}</Route>
 <Route path="/manager/unified-inventory">{() => <AuthGuard userType="manager"><UnifiedInventoryRecipes /></AuthGuard>}</Route>
 <Route path="/manager/zatca">{() => <AuthGuard userType="manager"><ZATCAInvoices /></AuthGuard>}</Route>
 <Route path="/manager/guide">{() => <AuthGuard userType="manager"><UserGuide /></AuthGuard>}</Route>
 <Route path="/guide">{() => <UserGuide />}</Route>
 <Route path="/manager/analytics">{() => <AuthGuard userType="manager"><AdvancedAnalytics /></AuthGuard>}</Route>
 <Route path="/manager/suppliers">{() => <AuthGuard userType="manager"><SupplierManagement /></AuthGuard>}</Route>
 <Route path="/manager/loyalty">{() => <AuthGuard userType="manager"><LoyaltyProgram /></AuthGuard>}</Route>
 <Route path="/manager/integrations">{() => <AuthGuard userType="manager"><ExternalIntegrations /></AuthGuard>}</Route>
 <Route path="/manager/support">{() => <AuthGuard userType="manager"><SupportSystem /></AuthGuard>}</Route>
 <Route path="/manager/os-recipes">{() => <AuthGuard userType="manager"><OSRecipeManagement /></AuthGuard>}</Route>
 <Route path="/manager/os-accounting">{() => <AuthGuard userType="manager"><OSAccountingDashboard /></AuthGuard>}</Route>
 <Route path="/manager/os-stock">{() => <AuthGuard userType="manager"><OSStockManagement /></AuthGuard>}</Route>
 <Route path="/manager/os-roles">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin"]}><OSRolesManagement /></AuthGuard>}</Route>
 
 {/* Owner protected routes */}
 <Route path="/owner/dashboard">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin"]}><OwnerDashboard /></AuthGuard>}</Route>
 <Route path="/executive">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><ExecutiveDashboard /></AuthGuard>}</Route>

 {/* Admin protected routes */}
 <Route path="/admin/dashboard">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><AdminDashboard /></AuthGuard>}</Route>
 <Route path="/admin/employees">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><AdminEmployees /></AuthGuard>}</Route>
 <Route path="/admin/reports">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><AdminReports /></AuthGuard>}</Route>
 <Route path="/admin/settings">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><AdminSettings /></AuthGuard>}</Route>

 {/* Phase 5 - New Dashboard Pages */}
 <Route path="/recipes/management">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><RecipesManagement /></AuthGuard>}</Route>
 <Route path="/inventory/dashboard">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><InventorySmartDashboard /></AuthGuard>}</Route>
 <Route path="/accounting/dashboard">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><AccountingSmartDashboard /></AuthGuard>}</Route>
 <Route path="/reports">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><ReportsPage /></AuthGuard>}</Route>
 <Route path="/stock-movements">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin", "manager"]}><StockMovementsPage /></AuthGuard>}</Route>
 
 <Route component={MenuPage} />
 </Switch>
 </Suspense>
 );
}

function AppContent() {
 const { isCartOpen, isCheckoutOpen } = useCartStore();

 return (
 <>
 <Router />
 {/* Only render modals when they are open */}
 {isCartOpen && <CartModal />}
 {isCheckoutOpen && <CheckoutModal />}
 <Toaster />
 </>
 );
}

function App() {
 return (
 <div className="dark">
 <QueryClientProvider client={queryClient}>
 <TooltipProvider>
 <CustomerProvider>
 <CartProvider>
 <AppContent />
 </CartProvider>
 </CustomerProvider>
 </TooltipProvider>
 </QueryClientProvider>
 </div>
 );
}

export default App;
