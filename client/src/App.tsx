import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
 return (
 <Switch>
 <Route path="/" component={SplashScreen} />
 <Route path="/0" component={UnifiedHub} />
 <Route path="/auth" component={CustomerAuth} />
 <Route path="/forgot-password" component={ForgotPassword} />
 <Route path="/reset-password" component={ResetPassword} />
 <Route path="/copy-card" component={CopyCard} />
 <Route path="/my-orders" component={MyOrdersPage} />
 <Route path="/menu" component={MenuPage} />
 <Route path="/menu-view" component={MenuView} />
 <Route path="/table-menu/:qrToken" component={TableMenu} />
 <Route path="/table-checkout/:tableId/:tableNumber" component={TableCheckout} />
 <Route path="/table-reservation" component={TableReservation} />
 <Route path="/table-order-tracking/:orderId" component={TableOrderTracking} />
 <Route path="/my-card" component={MyCard} />
 <Route path="/cart" component={CartPage} />
 <Route path="/delivery" component={DeliverySelectionPage} />
 <Route path="/delivery/map" component={DeliveryMapPage} />
 <Route path="/checkout" component={CheckoutPage} />
 <Route path="/tracking" component={OrderTrackingPage} />
 <Route path="/product/:id" component={ProductDetails} />
 <Route path="/employee/gateway" component={EmployeeGateway} />
 <Route path="/employee/login" component={EmployeeLogin} />
 <Route path="/employee/forgot-password" component={EmployeeForgotPassword} />
 <Route path="/employee/activate" component={EmployeeActivation} />
 <Route path="/employee/dashboard" component={EmployeeDashboard} />
 <Route path="/employee/cashier" component={EmployeeCashier} />
 <Route path="/employee/pos" component={POSSystem} />
 <Route path="/employee/kitchen" component={KitchenDisplay} />
 <Route path="/employee/tables" component={CashierTables} />
 <Route path="/employee/table-orders" component={CashierTableOrders} />
 <Route path="/employee/orders" component={EmployeeOrders} />
 <Route path="/employee/loyalty" component={EmployeeLoyalty} />
 <Route path="/employee/menu-management" component={EmployeeMenuManagement} />
 <Route path="/employee/ingredients" component={EmployeeIngredientsManagement} />
 <Route path="/manager" component={ManagerLogin} />
 <Route path="/manager/forgot-password" component={ManagerForgotPassword} />
 <Route path="/manager/login" component={ManagerLogin} />
 <Route path="/manager/employees" component={ManagerEmployees} />
 <Route path="/manager/drivers" component={ManagerDrivers} />
 <Route path="/manager/dashboard" component={ManagerDashboard} />
 <Route path="/manager/tables" component={ManagerTables} />
 <Route path="/manager/attendance" component={ManagerAttendance} />
 <Route path="/manager/inventory" component={InventoryDashboard} />
 <Route path="/manager/inventory/raw-items" component={InventoryRawItems} />
 <Route path="/manager/inventory/suppliers" component={InventorySuppliers} />
 <Route path="/manager/inventory/purchases" component={InventoryPurchases} />
 <Route path="/manager/inventory/transfers" component={InventoryTransfers} />
 <Route path="/manager/inventory/recipes" component={InventoryRecipes} />
 <Route path="/manager/inventory/stock" component={InventoryStock} />
 <Route path="/manager/inventory/alerts" component={InventoryAlerts} />
 <Route path="/manager/inventory/movements" component={InventoryMovements} />
 <Route path="/employee/attendance" component={EmployeeAttendance} />
 <Route path="/owner/dashboard" component={OwnerDashboard} />
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
