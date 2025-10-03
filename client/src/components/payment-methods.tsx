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
        {paymentMethods.map((method) => {
          const isQahwaCard = method.id === 'qahwa-card';
          
          return (
            <div key={method.id} className="relative group">
              {/* Glow effect for Qahwa Card */}
              {isQahwaCard && (
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/40 via-yellow-500/40 to-orange-500/40 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
              )}
              
              <Card
                className={`cursor-pointer transition-all duration-300 relative ${
                  isQahwaCard
                    ? selectedMethod === method.id
                      ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 shadow-2xl scale-[1.02]'
                      : 'bg-gradient-to-br from-amber-50/80 via-yellow-50/80 to-orange-50/80 border-2 border-amber-300/60 hover:border-amber-400 shadow-xl hover:scale-[1.02]'
                    : selectedMethod === method.id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border hover:border-primary/50 hover-elevate'
                }`}
                onClick={() => onSelectMethod(method.id)}
                data-testid={`payment-method-${method.id}`}
              >
                {/* Decorative corner elements for Qahwa Card */}
                {isQahwaCard && (
                  <>
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/50 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/50 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/50 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/50 rounded-br-lg"></div>
                  </>
                )}

                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    {/* Icon with special styling for Qahwa Card */}
                    <div className={isQahwaCard ? "relative" : ""}>
                      {isQahwaCard && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-20 blur-md animate-pulse"></div>
                      )}
                      <div className={isQahwaCard ? "relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-3 text-white shadow-lg" : ""}>
                        {getIcon(method.icon)}
                      </div>
                      {isQahwaCard && (
                        <>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
                        </>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 
                        className={`font-bold ${
                          isQahwaCard 
                            ? 'font-amiri text-xl bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-clip-text text-transparent' 
                            : 'font-semibold text-foreground'
                        }`}
                        data-testid={`text-payment-name-${method.id}`}
                      >
                        {method.nameAr}
                        {isQahwaCard && <span className="mr-2 text-2xl">✨</span>}
                      </h4>
                      <p 
                        className={`text-sm ${
                          isQahwaCard 
                            ? 'text-amber-800 font-medium' 
                            : 'text-muted-foreground'
                        }`}
                        data-testid={`text-payment-details-${method.id}`}
                      >
                        {method.details}
                      </p>
                      {isQahwaCard && (
                        <p className="text-xs text-amber-700 mt-1 bg-amber-100/50 rounded-full px-3 py-1 inline-block border border-amber-200/50">
                          🎉 كل 5 مشروبات = المشروب السادس مجاني
                        </p>
                      )}
                    </div>

                    {selectedMethod === method.id && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                        isQahwaCard 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                          : 'bg-primary'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>

                  {/* Special badge for Qahwa Card when selected */}
                  {isQahwaCard && selectedMethod === method.id && (
                    <div className="mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-2 text-center text-sm font-bold shadow-lg">
                      🎊 تم اختيار المشروب المجاني - استمتع بقهوتك!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
