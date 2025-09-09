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
import CartModal from "@/components/cart-modal";
import CheckoutModal from "@/components/checkout-modal";
import { CartProvider } from "@/lib/cart-store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/menu-view" component={MenuView} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route component={SplashScreen} />
    </Switch>
  );
}

function App() {
  return (
    <div className="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <Router />
            <CartModal />
            <CheckoutModal />
            <Toaster />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
