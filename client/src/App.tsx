import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/guards/AuthGuard";
import SplashScreen from "@/pages/splash";
import MenuPage from "@/pages/menu";
import ProductDetails from "@/pages/product-details";
import MenuView from "@/pages/menu-view";
import CartPage from "@/pages/cart-page";
import DeliverySelectionPage from "@/pages/delivery-selection";
import DeliveryMapPage from "@/pages/delivery-map";
import CheckoutPage from "@/pages/checkout";
import OrderTrackingPage from "@/pages/tracking";
import EmployeeGateway from "@/pages/employee-gateway";
import EmployeeLogin from "@/pages/employee-login";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployeeCashier from "@/pages/employee-cashier";
import EmployeeOrders from "@/pages/employee-orders";
import EmployeeLoyalty from "@/pages/employee-loyalty";
import EmployeeMenuManagement from "@/pages/employee-menu-management";
import EmployeeIngredientsManagement from "@/pages/employee-ingredients-management";
import UnifiedHub from "@/pages/unified-hub";
import MyCard from "@/pages/my-card";
import CartModal from "@/components/cart-modal";
import CheckoutModal from "@/components/checkout-modal";
import { CartProvider, useCartStore } from "@/lib/cart-store";
import { CustomerProvider } from "@/contexts/CustomerContext";
import CustomerAuth from "@/pages/CustomerAuth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import CopyCard from "@/pages/CopyCard";
import MyOrdersPage from "@/pages/my-orders";
import ManagerEmployees from "@/pages/manager-employees";
import EmployeeActivation from "@/pages/employee-activation";
import ManagerDashboard from "@/pages/manager-dashboard";
import ManagerLogin from "@/pages/manager-login";
import ManagerDrivers from "@/pages/manager-drivers";
import ManagerTables from "@/pages/manager-tables";
import TableMenu from "@/pages/table-menu";
import TableCheckout from "@/pages/table-checkout";
import TableOrderTracking from "@/pages/table-order-tracking";
import TableReservation from "@/pages/table-reservation";
import CashierTableOrders from "@/pages/cashier-table-orders";
import CashierTables from "@/pages/cashier-tables";
import EmployeeForgotPassword from "@/pages/employee-forgot-password";
import ManagerForgotPassword from "@/pages/manager-forgot-password";
import EmployeeAttendance from "@/pages/employee-attendance";
import ManagerAttendance from "@/pages/manager-attendance";
import OwnerDashboard from "@/pages/owner-dashboard";
import InventoryDashboard from "@/pages/inventory-dashboard";
import InventoryRawItems from "@/pages/inventory-raw-items";
import InventorySuppliers from "@/pages/inventory-suppliers";
import InventoryPurchases from "@/pages/inventory-purchases";
import InventoryTransfers from "@/pages/inventory-transfers";
import InventoryRecipes from "@/pages/inventory-recipes";
import InventoryStock from "@/pages/inventory-stock";
import InventoryAlerts from "@/pages/inventory-alerts";
import InventoryMovements from "@/pages/inventory-movements";
import POSSystem from "@/pages/pos-system";
import KitchenDisplay from "@/pages/kitchen-display";
import AccountingDashboard from "@/pages/accounting-dashboard";
import IngredientsRecipesInventory from "@/pages/ingredients-recipes-inventory";
import OrderStatusDisplay from "@/pages/order-status-display";
import InventorySmartPage from "@/pages/inventory-smart";
import AccountingSmartPage from "@/pages/accounting-smart";
import UnauthorizedPage from "@/pages/unauthorized";

function Router() {
 return (
 <Switch>
 {/* Public routes */}
 <Route path="/" component={SplashScreen} />
 <Route path="/0" component={UnifiedHub} />
 <Route path="/auth" component={CustomerAuth} />
 <Route path="/forgot-password" component={ForgotPassword} />
 <Route path="/reset-password" component={ResetPassword} />
 <Route path="/menu" component={MenuPage} />
 <Route path="/menu-view" component={MenuView} />
 <Route path="/product/:id" component={ProductDetails} />
 <Route path="/table-menu/:qrToken" component={TableMenu} />
 <Route path="/table-checkout/:tableId/:tableNumber" component={TableCheckout} />
 <Route path="/table-reservation" component={TableReservation} />
 <Route path="/table-order-tracking/:orderId" component={TableOrderTracking} />
 <Route path="/order-status" component={OrderStatusDisplay} />
 <Route path="/unauthorized" component={UnauthorizedPage} />
 
 {/* Customer protected routes */}
 <Route path="/copy-card">{() => <AuthGuard userType="customer"><CopyCard /></AuthGuard>}</Route>
 <Route path="/my-orders">{() => <AuthGuard userType="customer"><MyOrdersPage /></AuthGuard>}</Route>
 <Route path="/my-card">{() => <AuthGuard userType="customer"><MyCard /></AuthGuard>}</Route>
 <Route path="/cart">{() => <AuthGuard userType="customer"><CartPage /></AuthGuard>}</Route>
 <Route path="/delivery">{() => <AuthGuard userType="customer"><DeliverySelectionPage /></AuthGuard>}</Route>
 <Route path="/delivery/map">{() => <AuthGuard userType="customer"><DeliveryMapPage /></AuthGuard>}</Route>
 <Route path="/checkout">{() => <AuthGuard userType="customer"><CheckoutPage /></AuthGuard>}</Route>
 <Route path="/tracking">{() => <AuthGuard userType="customer"><OrderTrackingPage /></AuthGuard>}</Route>
 
 {/* Employee auth routes (public) */}
 <Route path="/employee/gateway" component={EmployeeGateway} />
 <Route path="/employee/login" component={EmployeeLogin} />
 <Route path="/employee/forgot-password" component={EmployeeForgotPassword} />
 <Route path="/employee/activate" component={EmployeeActivation} />
 
 {/* Employee protected routes */}
 <Route path="/employee/dashboard">{() => <AuthGuard userType="employee"><EmployeeDashboard /></AuthGuard>}</Route>
 <Route path="/employee/cashier">{() => <AuthGuard userType="employee"><EmployeeCashier /></AuthGuard>}</Route>
 <Route path="/employee/pos">{() => <AuthGuard userType="employee"><POSSystem /></AuthGuard>}</Route>
 <Route path="/employee/kitchen">{() => <AuthGuard userType="employee"><KitchenDisplay /></AuthGuard>}</Route>
 <Route path="/employee/tables">{() => <AuthGuard userType="employee"><CashierTables /></AuthGuard>}</Route>
 <Route path="/employee/table-orders">{() => <AuthGuard userType="employee"><CashierTableOrders /></AuthGuard>}</Route>
 <Route path="/employee/orders">{() => <AuthGuard userType="employee"><EmployeeOrders /></AuthGuard>}</Route>
 <Route path="/employee/loyalty">{() => <AuthGuard userType="employee"><EmployeeLoyalty /></AuthGuard>}</Route>
 <Route path="/employee/menu-management">{() => <AuthGuard userType="employee" allowedRoles={["manager", "admin"]}><EmployeeMenuManagement /></AuthGuard>}</Route>
 <Route path="/employee/ingredients">{() => <AuthGuard userType="employee" allowedRoles={["manager", "admin"]}><EmployeeIngredientsManagement /></AuthGuard>}</Route>
 <Route path="/employee/attendance">{() => <AuthGuard userType="employee"><EmployeeAttendance /></AuthGuard>}</Route>
 
 {/* Manager auth routes (public) */}
 <Route path="/manager" component={ManagerLogin} />
 <Route path="/manager/forgot-password" component={ManagerForgotPassword} />
 <Route path="/manager/login" component={ManagerLogin} />
 
 {/* Manager protected routes */}
 <Route path="/manager/employees">{() => <AuthGuard userType="manager"><ManagerEmployees /></AuthGuard>}</Route>
 <Route path="/manager/drivers">{() => <AuthGuard userType="manager"><ManagerDrivers /></AuthGuard>}</Route>
 <Route path="/manager/dashboard">{() => <AuthGuard userType="manager"><ManagerDashboard /></AuthGuard>}</Route>
 <Route path="/manager/tables">{() => <AuthGuard userType="manager"><ManagerTables /></AuthGuard>}</Route>
 <Route path="/manager/attendance">{() => <AuthGuard userType="manager"><ManagerAttendance /></AuthGuard>}</Route>
 <Route path="/manager/inventory">{() => <AuthGuard userType="manager"><InventoryDashboard /></AuthGuard>}</Route>
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
 
 {/* Owner protected routes */}
 <Route path="/owner/dashboard">{() => <AuthGuard userType="manager" allowedRoles={["owner", "admin"]}><OwnerDashboard /></AuthGuard>}</Route>
 
 <Route component={SplashScreen} />
 </Switch>
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
