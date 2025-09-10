import { QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeProps {
  url: string;
  size?: "sm" | "md" | "lg" | "xl";
  showURL?: boolean;
  title?: string;
  className?: string;
}

export default function QRCodeComponent({ 
  url, 
  size = "md", 
  showURL = true, 
  title = "امسح للطلب",
  className = ""
}: QRCodeProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32", 
    lg: "w-48 h-48",
    xl: "w-64 h-64"
  };

  const generateQRDataURL = (text: string) => {
    // Simple QR code placeholder - in production, use a proper QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}&bgcolor=FEF3C7&color=92400E&qzone=2&format=png`;
  };

  return (
    <Card className={`bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-300 shadow-xl ${className}`}>
      <CardContent className="p-6 text-center space-y-4">
        {title && (
          <h3 className="font-amiri text-xl font-bold text-amber-800">
            {title}
          </h3>
        )}
        
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            <div className="relative bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-lg">
              <img
                src={generateQRDataURL(url)}
                alt={`QR Code for ${url}`}
                className={`${sizeClasses[size]} mx-auto rounded-lg`}
                loading="lazy"
                onError={(e) => {
                  // Fallback to simple QR icon if image fails
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center ${sizeClasses[size]} bg-amber-100 rounded-lg border-2 border-amber-300">
                        <div class="text-amber-600 mb-2">
                          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 11v8h8v-8H3zm2 6V13h4v4H5zm6-16v8h8V1h-8zm6 6V3h-4v4h4zM1 21V11H11V21H1zm2-8v6h6V13H3zm8-10V11H21V3H11zm8 6V5H13v4h6zM1 1V11H11V1H1zm8 8V3H3v6h6z"/>
                          </svg>
                        </div>
                        <span class="text-xs text-amber-700 font-bold">QR Code</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>
        </div>

        {showURL && (
          <div className="bg-white/80 rounded-lg p-3 border border-amber-200">
            <p className="text-amber-700 font-mono text-sm break-all">
              {url}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 space-x-reverse text-amber-600">
          <QrCode className="w-5 h-5" />
          <span className="text-sm font-semibold">
            وجّه الكاميرا نحو الرمز للطلب
          </span>
        </div>
      </CardContent>
    </Card>
  );
}