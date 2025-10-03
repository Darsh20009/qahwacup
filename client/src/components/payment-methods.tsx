import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CreditCard, University, Zap, Building, Banknote, Gift } from "lucide-react";
import type { PaymentMethodInfo, PaymentMethod } from "@shared/schema";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethodInfo[];
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
}

export default function PaymentMethods({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'fas fa-gift':
        return <Gift className="w-6 h-6 text-primary" />;
      case 'fas fa-money-bill-wave':
        return <Banknote className="w-6 h-6 text-primary" />;
      case 'fas fa-mobile-alt':
        return <Smartphone className="w-6 h-6 text-primary" />;
      case 'fas fa-credit-card':
        return <CreditCard className="w-6 h-6 text-primary" />;
      case 'fas fa-university':
        return <University className="w-6 h-6 text-primary" />;
      case 'fas fa-bolt':
        return <Zap className="w-6 h-6 text-primary" />;
      case 'fas fa-building-columns':
        return <Building className="w-6 h-6 text-primary" />;
      default:
        return <CreditCard className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="space-y-4" data-testid="section-payment-methods">
      <h3 className="text-lg font-semibold text-foreground mb-4">اختر طريقة الدفع</h3>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover-elevate ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelectMethod(method.id)}
            data-testid={`payment-method-${method.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {getIcon(method.icon)}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground" data-testid={`text-payment-name-${method.id}`}>
                    {method.nameAr}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-payment-details-${method.id}`}>
                    {method.details}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
