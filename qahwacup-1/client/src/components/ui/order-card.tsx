import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, DeliveryTypeBadge, TimerBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { Play, Check, Printer, Clock, Coffee, MapPin, User } from "lucide-react";

interface OrderItem {
  coffeeItemId: string;
  quantity: number;
  size: string;
  extras?: string[];
  sugarLevel?: string;
  notes?: string;
  coffeeItem?: {
    nameAr: string;
    nameEn?: string;
    price?: number;
    imageUrl?: string;
    category?: string;
  };
}

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    tableStatus?: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt?: string;
    tableNumber?: string;
    orderType?: string;
    deliveryType?: 'pickup' | 'delivery' | 'dine-in';
    customerNotes?: string;
    customerName?: string;
    branchId?: string;
  };
  variant?: "compact" | "detailed" | "kds";
  showActions?: boolean;
  showTimer?: boolean;
  onStartPreparing?: (id: string) => void;
  onMarkReady?: (id: string) => void;
  onPrint?: (id: string) => void;
  isPending?: boolean;
  className?: string;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

function getElapsedMinutes(dateString: string): number {
  const created = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60));
}

function getSizeAr(size: string): string {
  const sizes: Record<string, string> = {
    small: "صغير",
    medium: "وسط",
    large: "كبير",
  };
  return sizes[size] || size;
}

export function OrderCard({
  order,
  variant = "detailed",
  showActions = true,
  showTimer = true,
  onStartPreparing,
  onMarkReady,
  onPrint,
  isPending = false,
  className,
}: OrderCardProps) {
  const elapsedMinutes = getElapsedMinutes(order.createdAt);
  const isDelayed = elapsedMinutes >= 10;
  const isWarning = elapsedMinutes >= 5 && !isDelayed;
  const displayStatus = order.tableStatus || order.status;
  
  const lastThreeDigits = order.orderNumber.slice(-3);

  const cardBorderClass = isDelayed 
    ? "border-red-500/50" 
    : isWarning 
    ? "border-amber-500/50" 
    : "";

  if (variant === "compact") {
    return (
      <Card className={cn("p-3", cardBorderClass, className)} data-testid={`card-order-${order.id}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono" data-testid="text-order-number">
              #{lastThreeDigits}
            </span>
            <StatusBadge status={displayStatus} size="sm" />
          </div>
          {showTimer && <TimerBadge minutes={elapsedMinutes} />}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {order.items.length} عنصر
        </div>
      </Card>
    );
  }

  if (variant === "kds") {
    return (
      <Card className={cn("flex flex-col h-full", cardBorderClass, className)} data-testid={`card-order-kds-${order.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold font-mono text-primary" data-testid="text-order-number-kds">
                #{lastThreeDigits}
              </span>
              {order.deliveryType && (
                <DeliveryTypeBadge type={order.deliveryType} size="sm" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={displayStatus} size="sm" />
              {showTimer && <TimerBadge minutes={elapsedMinutes} />}
            </div>
          </div>
          {order.tableNumber && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>طاولة {order.tableNumber}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                data-testid={`item-order-${order.id}-${index}`}
              >
                <Coffee className="h-4 w-4 mt-0.5 text-primary" />
                <div className="flex-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {item.coffeeItem?.nameAr || item.coffeeItemId}
                    </span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSizeAr(item.size)}
                    {item.extras && item.extras.length > 0 && (
                      <span className="mr-2">+ {item.extras.join(", ")}</span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      ملاحظة: {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {order.customerNotes && (
            <div className="mt-3 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {order.customerNotes}
              </p>
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="pt-2 gap-2">
            {(displayStatus === "confirmed" || displayStatus === "pending" || displayStatus === "payment_confirmed") && onStartPreparing && (
              <Button 
                onClick={() => onStartPreparing(order.id)}
                disabled={isPending}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                data-testid={`button-start-preparing-${order.orderNumber}`}
              >
                <Play className="h-4 w-4 ml-2" />
                بدء التحضير
              </Button>
            )}
            {displayStatus === "in_progress" && onMarkReady && (
              <Button 
                onClick={() => onMarkReady(order.id)}
                disabled={isPending}
                className="flex-1 bg-green-500 hover:bg-green-600"
                data-testid={`button-mark-ready-${order.orderNumber}`}
              >
                <Check className="h-4 w-4 ml-2" />
                جاهز للتسليم
              </Button>
            )}
            {onPrint && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onPrint(order.id)}
                data-testid="button-print-order"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn(cardBorderClass, className)} data-testid={`card-order-${order.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono" data-testid="text-order-number">
              #{lastThreeDigits}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <StatusBadge status={displayStatus} />
            {order.deliveryType && (
              <DeliveryTypeBadge type={order.deliveryType} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(order.createdAt)}</span>
          </div>
          {order.tableNumber && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>طاولة {order.tableNumber}</span>
            </div>
          )}
          {order.customerName && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{order.customerName}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {item.coffeeItem?.nameAr || item.coffeeItemId}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({getSizeAr(item.size)})
                </span>
              </div>
              <span className="text-muted-foreground">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-2 gap-2">
          {(displayStatus === "confirmed" || displayStatus === "pending" || displayStatus === "payment_confirmed") && onStartPreparing && (
            <Button 
              onClick={() => onStartPreparing(order.id)}
              disabled={isPending}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
              data-testid={`button-start-preparing-${order.orderNumber}`}
            >
              <Play className="h-4 w-4 ml-2" />
              بدء التحضير
            </Button>
          )}
          {displayStatus === "in_progress" && onMarkReady && (
            <Button 
              onClick={() => onMarkReady(order.id)}
              disabled={isPending}
              className="flex-1 bg-green-500 hover:bg-green-600"
              data-testid={`button-mark-ready-${order.orderNumber}`}
            >
              <Check className="h-4 w-4 ml-2" />
              جاهز للتسليم
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
