import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface TableQRCardProps {
  tableNumber: string;
  qrToken: string;
  branchName: string;
  tableUrl: string;
}

export function TableQRCard({ tableNumber, qrToken, branchName, tableUrl }: TableQRCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCard = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size for premium print quality
      const width = 1000;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;

      // Clean white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Luxury gradient border frame (top accent)
      const accentGradient = ctx.createLinearGradient(0, 0, width, 0);
      accentGradient.addColorStop(0, "#1a1a1a");
      accentGradient.addColorStop(0.5, "#D4AF37");
      accentGradient.addColorStop(1, "#1a1a1a");
      ctx.fillStyle = accentGradient;
      ctx.fillRect(0, 0, width, 15);

      // Thin elegant border
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Premium decorative line
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(40, 40, width - 80, height - 80);
      ctx.setLineDash([]);

      // Logo circle - minimal and elegant
      const logoRadius = 55;
      const logoX = width / 2;
      const logoY = 110;

      // Gold circle background
      ctx.fillStyle = "#D4AF37";
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.fill();

      // White circle border
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Coffee cup icon
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 100px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", logoX, logoY);

      // Cafe name - bold and clean
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 72px 'Segoe UI', Cairo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("قهوة كوب", width / 2, 240);

      // Elegant separator line
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 290);
      ctx.lineTo(width - 200, 290);
      ctx.stroke();

      // Table number section - premium styling
      const tableBoxY = 330;
      const tableBoxHeight = 160;

      // Subtle background for table section
      ctx.fillStyle = "#F8F8F8";
      ctx.fillRect(width / 2 - 240, tableBoxY, 480, tableBoxHeight);

      // Gold border for table box
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 2;
      ctx.strokeRect(width / 2 - 240, tableBoxY, 480, tableBoxHeight);

      // "TABLE" label - minimal
      ctx.fillStyle = "#666666";
      ctx.font = "28px 'Segoe UI', Cairo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("الطاولة رقم", width / 2, tableBoxY + 40);

      // Table number - LARGE and prominent
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 140px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tableNumber, width / 2, tableBoxY + 120);

      // Generate QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(tableUrl, {
          width: 420,
          margin: 1,
          color: {
            dark: "#1a1a1a",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });

        const qrImage = new Image();
        qrImage.onload = () => {
          // QR code positioning
          const qrY = 530;
          const qrSize = 420;
          const qrX = (width - qrSize) / 2;

          // White background for QR
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

          // Gold accent border
          ctx.strokeStyle = "#D4AF37";
          ctx.lineWidth = 3;
          ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

          // Draw QR code
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // Subtle corner accents (minimal)
          ctx.fillStyle = "#D4AF37";
          const cornerLen = 25;
          const cornerW = 3;

          // Top left
          ctx.fillRect(qrX - 20, qrY - 20, cornerLen, cornerW);
          ctx.fillRect(qrX - 20, qrY - 20, cornerW, cornerLen);

          // Top right
          ctx.fillRect(qrX + qrSize + 20 - cornerLen, qrY - 20, cornerLen, cornerW);
          ctx.fillRect(qrX + qrSize + 20 - cornerW, qrY - 20, cornerW, cornerLen);

          // Bottom left
          ctx.fillRect(qrX - 20, qrY + qrSize + 20 - cornerW, cornerLen, cornerW);
          ctx.fillRect(qrX - 20, qrY + qrSize + 20 - cornerLen, cornerW, cornerLen);

          // Bottom right
          ctx.fillRect(qrX + qrSize + 20 - cornerLen, qrY + qrSize + 20 - cornerW, cornerLen, cornerW);
          ctx.fillRect(qrX + qrSize + 20 - cornerW, qrY + qrSize + 20 - cornerLen, cornerW, cornerLen);

          // Main instruction - clean typography
          ctx.fillStyle = "#1a1a1a";
          ctx.font = "bold 44px 'Segoe UI', Cairo, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("امسح الكود للطلب", width / 2, 1000);

          // English translation - subtle
          ctx.fillStyle = "#999999";
          ctx.font = "24px 'Segoe UI', Arial, sans-serif";
          ctx.fillText("Scan to Order", width / 2, 1040);

          // Decorative separator
          ctx.strokeStyle = "#D4AF37";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(300, 1070);
          ctx.lineTo(width - 300, 1070);
          ctx.stroke();

          // Branch name at bottom
          ctx.fillStyle = "#1a1a1a";
          ctx.font = "bold 36px 'Segoe UI', Cairo, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(branchName, width / 2, 1130);

          // Powered by text - minimal
          ctx.fillStyle = "#CCCCCC";
          ctx.font = "16px 'Segoe UI', Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Powered by QahwaCup", width / 2, 1170);
        };
        qrImage.src = qrCodeDataUrl;
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCard();
  }, [tableNumber, qrToken, branchName, tableUrl]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
}

export function downloadQRCard(canvas: HTMLCanvasElement, tableNumber: string) {
  const link = document.createElement("a");
  link.download = `table-${tableNumber}-qr-card.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
