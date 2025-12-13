import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LoadingState } from "@/components/ui/states";

type UserType = "customer" | "employee" | "manager" | "admin";

interface AuthGuardProps {
  children: ReactNode;
  userType: UserType;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  userType, 
  allowedRoles = [],
  redirectTo 
}: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      try {
        let isAuthenticated = false;
        let userRole = "";

        switch (userType) {
          case "customer": {
            const customer = localStorage.getItem("currentCustomer");
            isAuthenticated = !!customer;
            break;
          }
          case "employee": {
            const employee = localStorage.getItem("currentEmployee");
            if (employee) {
              const parsed = JSON.parse(employee);
              isAuthenticated = true;
              userRole = parsed.role || "";
            }
            break;
          }
          case "manager": {
            const manager = localStorage.getItem("currentManager");
            if (manager) {
              const parsed = JSON.parse(manager);
              isAuthenticated = true;
              userRole = parsed.role || "manager";
            }
            break;
          }
          case "admin": {
            const admin = localStorage.getItem("currentAdmin");
            if (admin) {
              isAuthenticated = true;
              userRole = "admin";
            }
            break;
          }
        }

        if (!isAuthenticated) {
          const defaultRedirects: Record<UserType, string> = {
            customer: "/auth",
            employee: "/employee/gateway",
            manager: "/manager/login",
            admin: "/admin/login",
          };
          setLocation(redirectTo || defaultRedirects[userType]);
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          setLocation("/unauthorized");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation("/unauthorized");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [userType, allowedRoles, redirectTo, setLocation]);

  if (isChecking) {
    return <LoadingState message="جاري التحقق من الصلاحيات..." />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

interface BranchGuardProps {
  children: ReactNode;
  userType: "employee" | "manager";
  requiredBranchId?: string;
}

export function BranchGuard({ children, userType, requiredBranchId }: BranchGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storageKey = userType === "employee" ? "currentEmployee" : "currentManager";
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      setLocation("/unauthorized");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      
      if (parsed.role === "admin" || parsed.role === "owner") {
        setIsAuthorized(true);
        return;
      }

      if (requiredBranchId && parsed.branchId !== requiredBranchId) {
        setLocation("/unauthorized");
        return;
      }

      setIsAuthorized(true);
    } catch {
      setLocation("/unauthorized");
    }
  }, [userType, requiredBranchId, setLocation]);

  if (!isAuthorized) {
    return <LoadingState message="جاري التحقق..." />;
  }

  return <>{children}</>;
}
