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
import CheckoutPage from "@/pages/checkout";
import EmployeeGateway from "@/pages/employee-gateway";
import EmployeeLogin from "@/pages/employee-login";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployeeCashier from "@/pages/employee-cashier";
import EmployeeOrders from "@/pages/employee-orders";
import CartModal from "@/components/cart-modal";
import CheckoutModal from "@/components/checkout-modal";
import { CartProvider, useCartStore } from "@/lib/cart-store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/menu-view" component={MenuView} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/employee/gateway" component={EmployeeGateway} />
      <Route path="/employee/login" component={EmployeeLogin} />
      <Route path="/employee/dashboard" component={EmployeeDashboard} />
      <Route path="/employee/cashier" component={EmployeeCashier} />
      <Route path="/employee/orders" component={EmployeeOrders} />
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
          <CartProvider>
            <AppContent />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
