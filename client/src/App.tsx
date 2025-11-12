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
import CashierPhoneLookup from "@/pages/cashier-phone-lookup";
import ManagerDrivers from "@/pages/manager-drivers";

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
 <Route path="/my-card" component={MyCard} />
 <Route path="/cart" component={CartPage} />
 <Route path="/delivery" component={DeliverySelectionPage} />
 <Route path="/delivery/map" component={DeliveryMapPage} />
 <Route path="/checkout" component={CheckoutPage} />
 <Route path="/tracking" component={OrderTrackingPage} />
 <Route path="/product/:id" component={ProductDetails} />
 <Route path="/employee/gateway" component={EmployeeGateway} />
 <Route path="/employee/login" component={EmployeeLogin} />
 <Route path="/employee/activate" component={EmployeeActivation} />
 <Route path="/employee/dashboard" component={EmployeeDashboard} />
 <Route path="/employee/cashier" component={EmployeeCashier} />
 <Route path="/employee/cashier/phone-lookup" component={CashierPhoneLookup} />
 <Route path="/employee/orders" component={EmployeeOrders} />
 <Route path="/employee/loyalty" component={EmployeeLoyalty} />
 <Route path="/employee/menu-management" component={EmployeeMenuManagement} />
 <Route path="/employee/ingredients" component={EmployeeIngredientsManagement} />
 <Route path="/manager" component={ManagerLogin} />
 <Route path="/manager/employees" component={ManagerEmployees} />
 <Route path="/manager/drivers" component={ManagerDrivers} />
 <Route path="/manager/dashboard" component={ManagerDashboard} />
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
