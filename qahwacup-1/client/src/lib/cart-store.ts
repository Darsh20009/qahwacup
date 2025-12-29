import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { CoffeeItem } from "@shared/schema";

// Enhanced cart item type with coffee details
interface EnrichedCartItem {
 coffeeItemId: string;
 quantity: number;
 sessionId: string;
 coffeeItem?: CoffeeItem;
}

export interface DeliveryInfo {
 type: 'pickup' | 'delivery' | 'dine-in';
 branchId?: string;
 branchName?: string;
 branchAddress?: string;
 dineIn?: boolean;
 tableId?: string;
 tableNumber?: string;
 arrivalTime?: string;
 address?: {
 fullAddress: string;
 lat: number;
 lng: number;
 zone: string;
 };
 deliveryFee?: number;
}

interface CartContextType {
 // State
 cartItems: EnrichedCartItem[];
 isCartOpen: boolean;
 isCheckoutOpen: boolean;
 sessionId: string;
 isLoading: boolean;
 deliveryInfo: DeliveryInfo | null;

 // Actions
 addToCart: (coffeeItemId: string, quantity?: number) => void;
 removeFromCart: (coffeeItemId: string) => void;
 updateQuantity: (coffeeItemId: string, quantity: number) => void;
 clearCart: () => void;
 
 // Delivery Actions
 setDeliveryInfo: (info: DeliveryInfo) => void;
 clearDeliveryInfo: () => void;
 
 // UI Actions
 showCart: () => void;
 hideCart: () => void;
 showCheckout: () => void;
 hideCheckout: () => void;

 // Computed
 getTotalPrice: () => number;
 getTotalItems: () => number;
 getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartStore = (): CartContextType => {
 const context = useContext(CartContext);
 if (!context) {
 throw new Error("useCartStore must be used within a CartProvider");
 }
 return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [isCartOpen, setIsCartOpen] = useState(false);
 const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
 const [deliveryInfo, setDeliveryInfoState] = useState<DeliveryInfo | null>(() => {
 const saved = localStorage.getItem("delivery-info");
 return saved ? JSON.parse(saved) : null;
 });
 const [sessionId] = useState(() => {
 // Get or create session ID
 let id = localStorage.getItem("coffee-session-id");
 if (!id) {
 id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 localStorage.setItem("coffee-session-id", id);
 }
 return id;
 });

 const queryClient = useQueryClient();

 // Fetch cart items - always enabled so cart updates are immediately visible
 const { data: cartItems = [], isLoading } = useQuery<EnrichedCartItem[]>({
 queryKey: ["/api/cart", sessionId],
 enabled: true, // Always fetch to show cart updates immediately
 refetchOnWindowFocus: false,
 staleTime: 30000, // 30 seconds
 });

 // Add to cart mutation
 const addToCartMutation = useMutation({
 mutationFn: async ({ coffeeItemId, quantity }: { coffeeItemId: string; quantity: number }) => {
 const response = await apiRequest("POST", "/api/cart", {
 sessionId,
 coffeeItemId,
 quantity,
 });
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
 },
 });

 // Update quantity mutation
 const updateQuantityMutation = useMutation({
 mutationFn: async ({ coffeeItemId, quantity }: { coffeeItemId: string; quantity: number }) => {
 const response = await apiRequest("PUT", `/api/cart/${sessionId}/${coffeeItemId}`, {
 quantity,
 });
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
 },
 });

 // Remove from cart mutation
 const removeFromCartMutation = useMutation({
 mutationFn: async (coffeeItemId: string) => {
 const response = await apiRequest("DELETE", `/api/cart/${sessionId}/${coffeeItemId}`);
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
 },
 });

 // Clear cart mutation
 const clearCartMutation = useMutation({
 mutationFn: async () => {
 const response = await apiRequest("DELETE", `/api/cart/${sessionId}`);
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["/api/cart", sessionId] });
 },
 });

 // Cart actions
 const addToCart = (coffeeItemId: string, quantity: number = 1) => {
 addToCartMutation.mutate({ coffeeItemId, quantity });
 };

 const removeFromCart = (coffeeItemId: string) => {
 removeFromCartMutation.mutate(coffeeItemId);
 };

 const updateQuantity = (coffeeItemId: string, quantity: number) => {
 if (quantity <= 0) {
 removeFromCart(coffeeItemId);
 } else {
 updateQuantityMutation.mutate({ coffeeItemId, quantity });
 }
 };

 const clearCart = () => {
 clearCartMutation.mutate();
 clearDeliveryInfo();
 };

 // Delivery actions
 const setDeliveryInfo = (info: DeliveryInfo) => {
 setDeliveryInfoState(info);
 localStorage.setItem("delivery-info", JSON.stringify(info));
 };

 const clearDeliveryInfo = () => {
 setDeliveryInfoState(null);
 localStorage.removeItem("delivery-info");
 };

 // UI actions
 const showCart = () => setIsCartOpen(true);
 const hideCart = () => setIsCartOpen(false);
 const showCheckout = () => setIsCheckoutOpen(true);
 const hideCheckout = () => setIsCheckoutOpen(false);

 // Computed values
 const getTotalPrice = (): number => {
 return cartItems.reduce((total, item) => {
 if (!item.coffeeItem?.price) return total;
 
 // Handle MongoDB Decimal128 and other formats
 let price = 0;
 if (typeof item.coffeeItem.price === 'number') {
 price = item.coffeeItem.price;
 } else if (typeof item.coffeeItem.price === 'string') {
 price = parseFloat(item.coffeeItem.price);
 } else if (item.coffeeItem.price && typeof item.coffeeItem.price === 'object' && '$numberDecimal' in item.coffeeItem.price) {
 // Handle MongoDB Decimal128 format
 price = parseFloat((item.coffeeItem.price as any).$numberDecimal);
 } else {
 price = parseFloat(String(item.coffeeItem.price));
 }
 
 return total + (isNaN(price) ? 0 : price * item.quantity);
 }, 0);
 };

 const getTotalItems = (): number => {
 return cartItems.reduce((total, item) => total + item.quantity, 0);
 };

 const getFinalTotal = (): number => {
 const subtotal = getTotalPrice();
 const deliveryFee = deliveryInfo?.deliveryFee || 0;
 return subtotal + deliveryFee;
 };

 // Auto-close cart when checkout opens
 useEffect(() => {
 if (isCheckoutOpen) {
 setIsCartOpen(false);
 }
 }, [isCheckoutOpen]);

 const contextValue: CartContextType = {
 cartItems,
 isCartOpen,
 isCheckoutOpen,
 sessionId,
 isLoading,
 deliveryInfo,
 addToCart,
 removeFromCart,
 updateQuantity,
 clearCart,
 setDeliveryInfo,
 clearDeliveryInfo,
 showCart,
 hideCart,
 showCheckout,
 hideCheckout,
 getTotalPrice,
 getTotalItems,
 getFinalTotal,
 };

 return React.createElement(
 CartContext.Provider,
 { value: contextValue },
 children
 );
};
