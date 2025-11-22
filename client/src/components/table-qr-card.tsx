import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Coffee } from "lucide-react";

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

      // Set canvas size (larger for better print quality)
      const width = 800;
      const height = 1000;
      canvas.width = width;
      canvas.height = height;

      // Background gradient (warm coffee colors)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#2D1810");
      gradient.addColorStop(0.5, "#4A2C1A");
      gradient.addColorStop(1, "#2D1810");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative border
      ctx.strokeStyle = "#D4A574";
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner border with accent color
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      ctx.strokeRect(35, 35, width - 70, height - 70);

      // Cafe name at top
      ctx.fillStyle = "#FBBF24";
      ctx.font = "bold 72px Cairo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("قهوة كوب", width / 2, 140);

      // Coffee icon decorations
      ctx.fillStyle = "#F59E0B";
      ctx.font = "48px Arial";
      ctx.fillText("☕", 150, 140);
      ctx.fillText("☕", width - 150, 140);

      // Subtitle
      ctx.fillStyle = "#FDE68A";
      ctx.font = "32px Cairo, Arial, sans-serif";
      ctx.fillText("لكل لحظة قهوة، لحظة نجاح", width / 2, 195);

      // Decorative line
      ctx.strokeStyle = "#D4A574";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 230);
      ctx.lineTo(width - 100, 230);
      ctx.stroke();

      // Table number with fancy background
      const tableBoxY = 270;
      const tableBoxHeight = 120;

      // Table number background box
      const boxGradient = ctx.createLinearGradient(width / 2 - 200, tableBoxY, width / 2 + 200, tableBoxY + tableBoxHeight);
      boxGradient.addColorStop(0, "#92400E");
      boxGradient.addColorStop(0.5, "#B45309");
      boxGradient.addColorStop(1, "#92400E");
      ctx.fillStyle = boxGradient;
      ctx.fillRect(width / 2 - 200, tableBoxY, 400, tableBoxHeight);

      // Table number border
      ctx.strokeStyle = "#FBBF24";
      ctx.lineWidth = 4;
      ctx.strokeRect(width / 2 - 200, tableBoxY, 400, tableBoxHeight);

      // Table number label
      ctx.fillStyle = "#FDE68A";
      ctx.font = "bold 36px Cairo, Arial, sans-serif";
      ctx.fillText("رقم الطاولة", width / 2, tableBoxY + 45);

      // Table number
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 56px Cairo, Arial, sans-serif";
      ctx.fillText(tableNumber, width / 2, tableBoxY + 100);

      // Generate QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(tableUrl, {
          width: 400,
          margin: 1,
          color: {
            dark: "#1F2937",
            light: "#FFFBEB",
          },
          errorCorrectionLevel: "H",
        });

        const qrImage = new Image();
        qrImage.onload = () => {
          // QR code white background with rounded corners
          const qrY = 430;
          const qrSize = 400;
          const qrX = (width - qrSize) / 2;

          // White background for QR
          ctx.fillStyle = "#FFFBEB";
          ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

          // Golden border around QR
          ctx.strokeStyle = "#D97706";
          ctx.lineWidth = 6;
          ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

          // Draw QR code
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // Decorative corners
          const cornerSize = 30;
          ctx.fillStyle = "#F59E0B";
          
          // Top-left corner
          ctx.fillRect(qrX - 20, qrY - 20, cornerSize, 6);
          ctx.fillRect(qrX - 20, qrY - 20, 6, cornerSize);
          
          // Top-right corner
          ctx.fillRect(qrX + qrSize + 20 - cornerSize, qrY - 20, cornerSize, 6);
          ctx.fillRect(qrX + qrSize + 14, qrY - 20, 6, cornerSize);
          
          // Bottom-left corner
          ctx.fillRect(qrX - 20, qrY + qrSize + 20 - cornerSize, 6, cornerSize);
          ctx.fillRect(qrX - 20, qrY + qrSize + 14, cornerSize, 6);
          
          // Bottom-right corner
          ctx.fillRect(qrX + qrSize + 14, qrY + qrSize + 20 - cornerSize, 6, cornerSize);
          ctx.fillRect(qrX + qrSize + 20 - cornerSize, qrY + qrSize + 14, cornerSize, 6);

          // Instructions below QR
          ctx.fillStyle = "#FDE68A";
          ctx.font = "bold 32px Cairo, Arial, sans-serif";
          ctx.fillText("امسح الكود للطلب", width / 2, 890);

          // Branch name
          ctx.fillStyle = "#D4A574";
          ctx.font = "28px Cairo, Arial, sans-serif";
          ctx.fillText(branchName, width / 2, 940);

          // Footer decoration
          ctx.strokeStyle = "#D4A574";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(100, 960);
          ctx.lineTo(width - 100, 960);
          ctx.stroke();
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
        className="max-w-full h-auto border-4 border-amber-900 rounded-lg shadow-2xl"
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
