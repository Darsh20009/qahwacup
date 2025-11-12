import { Card } from "@/components/ui/card";
import { Store, Truck } from "lucide-react";

interface DeliveryMethodSelectorProps {
 value: "pickup" | "delivery";
 onChange: (method: "pickup" | "delivery") => void;
}

export function DeliveryMethodSelector({ value, onChange }: DeliveryMethodSelectorProps) {
 return (
 <div className="space-y-3">
 <h3 className="text-lg font-semibold">ا� تر طريق� الاستلام</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <Card
 data-testid="button-pickup-method"
 className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
 value === "pickup"
 ? "border-2 border-primary bg-primary/5"
 : "border"
 }`}
 onClick={() => onChange("pickup")}
 >
 <div className="flex flex-col items-center gap-3 text-center">
 <div className={`p-3 rounded-full ${value === "pickup" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
 <Store className="w-6 h-6" />
 </div>
 <div>
 <h4 className="font-semibold text-base">استلام من الفرع</h4>
 <p className="text-sm text-muted-foreground mt-1">
 احصل على طلبك من أقرب فرع
 </p>
 </div>
 </div>
 </Card>

 <Card
 data-testid="button-delivery-method"
 className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
 value === "delivery"
 ? "border-2 border-primary bg-primary/5"
 : "border"
 }`}
 onClick={() => onChange("delivery")}
 >
 <div className="flex flex-col items-center gap-3 text-center">
 <div className={`p-3 rounded-full ${value === "delivery" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
 <Truck className="w-6 h-6" />
 </div>
 <div>
 <h4 className="font-semibold text-base">توصيل للمنزل</h4>
 <p className="text-sm text-muted-foreground mt-1">
 نوصل لك في البديع� وظهر� البديع� (10 ريال)
 </p>
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}
