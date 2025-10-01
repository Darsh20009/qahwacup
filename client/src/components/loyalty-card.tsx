import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Wallet, Coffee, Award, Sparkles } from "lucide-react";
import type { LoyaltyCard } from "@shared/schema";

interface LoyaltyCardProps {
  card: LoyaltyCard;
  showActions?: boolean;
}

export default function LoyaltyCardComponent({ card, showActions = true }: LoyaltyCardProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (qrCanvasRef.current && card.qrToken) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        card.qrToken,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#1e293b",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );

      QRCode.toDataURL(card.qrToken, {
        width: 400,
        margin: 2,
      }).then((url) => {
        setQrDataUrl(url);
      }).catch(console.error);
    }
  }, [card.qrToken]);

  const downloadCard = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#92400e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
    ctx.beginPath();
    ctx.arc(100, 100, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(700, 400, 120, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px Cairo, Arial';
    ctx.textAlign = 'right';
    ctx.fillText('قهوة كوب', 750, 80);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Cairo, Arial';
    ctx.fillText('بطاقة الولاء', 750, 120);

    // Customer name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Cairo, Arial';
    ctx.fillText(card.customerName, 750, 200);

    // Phone
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px Arial';
    ctx.fillText(card.phoneNumber, 750, 240);

    // Tier badge
    const tierColors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    ctx.fillStyle = tierColors[card.tier] || '#CD7F32';
    ctx.fillRect(550, 280, 200, 50);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 28px Cairo, Arial';
    ctx.textAlign = 'center';
    const tierNames: Record<string, string> = {
      bronze: 'برونزي',
      silver: 'فضي',
      gold: 'ذهبي',
      platinum: 'بلاتيني'
    };
    ctx.fillText(tierNames[card.tier] || 'برونزي', 650, 315);

    // Stats
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px Cairo, Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${card.discountCount} مرة استخدام`, 750, 380);
    ctx.fillText(`${card.totalSpent} ر.س إجمالي`, 750, 420);

    // QR Code
    if (qrDataUrl) {
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, 220, 240, 240);
        ctx.drawImage(qrImage, 50, 230, 220, 220);

        // Download
        const link = document.createElement('a');
        link.download = `loyalty-card-${card.customerName}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      qrImage.src = qrDataUrl;
    }
  };

  const addToAppleWallet = async () => {
    try {
      // Generate a pass file URL (this would typically be generated server-side)
      const passData = {
        cardId: card.id,
        customerName: card.customerName,
        phoneNumber: card.phoneNumber,
        qrToken: card.qrToken
      };

      // Create a temporary download link for Apple Wallet pass
      const passUrl = `/api/loyalty/cards/${card.id}/apple-wallet-pass`;

      // For now, show instructions to the user
      alert(`
        لإضافة البطاقة إلى Apple Wallet:
        1. افتح هذا الرابط على iPhone/iPad
        2. انقر على "إضافة إلى Wallet"

        الرابط: ${window.location.origin}${passUrl}

        أو امسح رمز QR أدناه باستخدام كاميرا iPhone
      `);
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء ملف Apple Wallet");
    }
  };

  const tierInfo = {
    bronze: { nameAr: 'برونزي', color: 'from-amber-700 to-amber-900', icon: '🥉' },
    silver: { nameAr: 'فضي', color: 'from-slate-400 to-slate-600', icon: '🥈' },
    gold: { nameAr: 'ذهبي', color: 'from-yellow-400 to-yellow-600', icon: '🥇' },
    platinum: { nameAr: 'بلاتيني', color: 'from-gray-300 to-gray-500', icon: '💎' }
  };

  const currentTier = tierInfo[card.tier as keyof typeof tierInfo] || tierInfo.bronze;

  return (
    <div className="space-y-4" data-testid="loyalty-card">
      {/* Digital Card Display */}
      <Card className={`relative overflow-hidden bg-gradient-to-br ${currentTier.color} text-white shadow-2xl`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 text-6xl opacity-20">{currentTier.icon}</div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>

        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold" data-testid="text-brand">قهوة كوب</h3>
                <p className="text-sm opacity-90">بطاقة الولاء</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Award className="w-4 h-4" />
              <span className="text-sm font-bold" data-testid="text-tier">{currentTier.nameAr}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-1">
            <h4 className="text-2xl font-bold" data-testid="text-customer-name">{card.customerName}</h4>
            <p className="text-sm opacity-90" data-testid="text-phone">{card.phoneNumber}</p>
          </div>

          {/* QR Code */}
          <div className="flex items-center justify-between">
            <div className="bg-white p-3 rounded-lg shadow-lg">
              <canvas 
                ref={qrCanvasRef} 
                className="w-32 h-32"
                data-testid="canvas-qr"
              />
            </div>

            {/* Stats */}
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <div className="text-right">
                  <div className="text-3xl font-bold" data-testid="text-discount-count">{card.discountCount}</div>
                  <div className="text-xs opacity-90">مرة استخدام</div>
                </div>
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-sm opacity-90" data-testid="text-total-spent">
                إجمالي: {card.totalSpent} ر.س
              </div>
            </div>
          </div>

          {/* QR Token Display */}
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-xs opacity-75">رمز البطاقة</p>
            <p className="font-mono text-sm" data-testid="text-qr-token">{card.qrToken}</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={downloadCard}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            data-testid="button-download-card"
          >
            <Download className="w-4 h-4" />
            حفظ البطاقة
          </Button>

          <Button
            onClick={addToAppleWallet}
            className="gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black"
            data-testid="button-apple-wallet"
          >
            <Wallet className="w-4 h-4" />
            Apple Wallet
          </Button>
        </div>
      )}
    </div>
  );
}