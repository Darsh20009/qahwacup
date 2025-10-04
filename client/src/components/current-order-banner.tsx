import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, ArrowLeft, X } from "lucide-react";
import OrderTracker from "./order-tracker";
import type { Order } from "@shared/schema";
import { useState, useEffect } from "react";

export default function CurrentOrderBanner() {
  const [, setLocation] = useLocation();
  const [customerId, setCustomerId] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const savedCustomerId = localStorage.getItem("customer-id");
    if (savedCustomerId) {
      setCustomerId(savedCustomerId);
    }
  }, []);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/customers", customerId, "orders"],
    enabled: !!customerId && !dismissed,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get the most recent active order (not completed or cancelled)
  const currentOrder = orders.find(
    (order) => order.status !== "completed" && order.status !== "cancelled"
  );

  if (!currentOrder || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-xl relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 left-2 p-1 rounded-full hover:bg-amber-100 transition-colors z-10"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-amber-900">طلبك الحالي</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLocation("/my-orders")}
                className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
              >
                عرض التفاصيل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>

            <OrderTracker order={currentOrder} compact />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
