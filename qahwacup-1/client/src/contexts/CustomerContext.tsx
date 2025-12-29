import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Customer } from "@shared/schema";

interface CustomerContextType {
 customer: Customer | null;
 setCustomer: (customer: Customer | null) => void;
 logout: () => void;
 isAuthenticated: boolean;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
 const [customer, setCustomerState] = useState<Customer | null>(() => {
 const stored = localStorage.getItem("qahwa-customer");
 return stored ? JSON.parse(stored) : null;
 });

 const setCustomer = (newCustomer: Customer | null) => {
 setCustomerState(newCustomer);
 if (newCustomer) {
 localStorage.setItem("qahwa-customer", JSON.stringify(newCustomer));
 // Also set currentCustomer for AuthGuard compatibility
 localStorage.setItem("currentCustomer", JSON.stringify(newCustomer));
 } else {
 localStorage.removeItem("qahwa-customer");
 localStorage.removeItem("currentCustomer");
 }
 };

 const logout = () => {
 setCustomer(null);
 // Clear all customer-related storage
 localStorage.removeItem("qahwa-customer");
 localStorage.removeItem("currentCustomer");
 localStorage.removeItem("customer-phone");
 localStorage.removeItem("customer-id");
 };

 const isAuthenticated = !!customer;

 return (
 <CustomerContext.Provider value={{ customer, setCustomer, logout, isAuthenticated }}>
 {children}
 </CustomerContext.Provider>
 );
}

export function useCustomer() {
 const context = useContext(CustomerContext);
 if (!context) {
 throw new Error("useCustomer must be used within CustomerProvider");
 }
 return context;
}
