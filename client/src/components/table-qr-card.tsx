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

      // Set canvas size (larger for better print quality)
      const width = 1000;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;

      // Beige gradient background (warm and inviting)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#F5E6D3");
      gradient.addColorStop(0.5, "#EDD5C1");
      gradient.addColorStop(1, "#F5E6D3");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative top accent bar with gradient
      const accentGradient = ctx.createLinearGradient(0, 0, width, 0);
      accentGradient.addColorStop(0, "#8B6F47");
      accentGradient.addColorStop(0.5, "#A0826D");
      accentGradient.addColorStop(1, "#8B6F47");
      ctx.fillStyle = accentGradient;
      ctx.fillRect(0, 0, width, 20);

      // Premium border
      ctx.strokeStyle = "#8B6F47";
      ctx.lineWidth = 12;
      ctx.strokeRect(25, 25, width - 50, height - 50);

      // Inner golden border
      ctx.strokeStyle = "#C9A961";
      ctx.lineWidth = 3;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // Logo/Brand circle at top
      const logoRadius = 70;
      const logoX = width / 2;
      const logoY = 120;

      // Logo background circle with gradient
      const logoGradient = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, logoRadius);
      logoGradient.addColorStop(0, "#C9A961");
      logoGradient.addColorStop(1, "#8B6F47");
      ctx.fillStyle = logoGradient;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.fill();

      // Logo border
      ctx.strokeStyle = "#F5E6D3";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw coffee cup icon inside circle
      ctx.fillStyle = "#F5E6D3";
      ctx.font = "bold 120px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("C", logoX, logoY);

      // Cafe name with elegant styling
      ctx.fillStyle = "#8B6F47";
      ctx.font = "bold 80px Cairo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("قهوة كوب", width / 2, 280);

      // Elegant tagline
      ctx.fillStyle = "#A0826D";
      ctx.font = "italic 36px Cairo, Arial, sans-serif";
      ctx.fillText("تجربة القهوة الأصيلة", width / 2, 330);

      // Decorative separator
      ctx.strokeStyle = "#C9A961";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, 380);
      ctx.lineTo(width - 150, 380);
      ctx.stroke();

      // Table section with elegant design
      const tableBoxY = 420;
      const tableBoxHeight = 140;

      // Table background with gradient
      const tableGradient = ctx.createLinearGradient(width / 2 - 220, tableBoxY, width / 2 + 220, tableBoxY + tableBoxHeight);
      tableGradient.addColorStop(0, "#D9C7B8");
      tableGradient.addColorStop(0.5, "#C9A961");
      tableGradient.addColorStop(1, "#D9C7B8");
      ctx.fillStyle = tableGradient;
      ctx.fillRect(width / 2 - 220, tableBoxY, 440, tableBoxHeight);

      // Table box border
      ctx.strokeStyle = "#8B6F47";
      ctx.lineWidth = 3;
      ctx.strokeRect(width / 2 - 220, tableBoxY, 440, tableBoxHeight);

      // "TABLE" label
      ctx.fillStyle = "#8B6F47";
      ctx.font = "bold 32px Cairo, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("الطاولة رقم", width / 2, tableBoxY + 40);

      // Table number with large bold font
      ctx.fillStyle = "#8B6F47";
      ctx.font = "bold 100px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tableNumber, width / 2, tableBoxY + 120);

      // Generate QR code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(tableUrl, {
          width: 450,
          margin: 2,
          color: {
            dark: "#8B6F47",
            light: "#F5E6D3",
          },
          errorCorrectionLevel: "H",
        });

        const qrImage = new Image();
        qrImage.onload = () => {
          // QR code container
          const qrY = 590;
          const qrSize = 450;
          const qrX = (width - qrSize) / 2;

          // QR background with soft shadow effect
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(qrX - 30, qrY - 30, qrSize + 60, qrSize + 60);

          // QR border - elegant frame
          ctx.strokeStyle = "#8B6F47";
          ctx.lineWidth = 8;
          ctx.strokeRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);

          // Inner border accent
          ctx.strokeStyle = "#C9A961";
          ctx.lineWidth = 2;
          ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

          // Draw QR code
          ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

          // Decorative corner elements
          const cornerSize = 35;
          ctx.fillStyle = "#C9A961";
          
          // Corner decorations
          for (let i = 0; i < 4; i++) {
            const cornerX = i % 2 === 0 ? qrX - 25 : qrX + qrSize + 25;
            const cornerY = i < 2 ? qrY - 25 : qrY + qrSize + 25;
            ctx.fillRect(cornerX - cornerSize/2, cornerY - 4, cornerSize, 8);
            ctx.fillRect(cornerX - 4, cornerY - cornerSize/2, 8, cornerSize);
          }

          // Main instruction text
          ctx.fillStyle = "#8B6F47";
          ctx.font = "bold 42px Cairo, Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("امسح الكود للطلب", width / 2, 1080);

          // Secondary instruction with smaller font
          ctx.fillStyle = "#A0826D";
          ctx.font = "28px Cairo, Arial, sans-serif";
          ctx.fillText("Scan the QR to Order", width / 2, 1125);

          // Branch name at bottom
          ctx.fillStyle = "#8B6F47";
          ctx.font = "bold 32px Cairo, Arial, sans-serif";
          ctx.fillText(branchName, width / 2, 1175);
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
