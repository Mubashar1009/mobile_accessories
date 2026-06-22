"use client";

import { useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, MessageCircle, FileText, Loader2, X } from "lucide-react";

interface PDFOrderPreviewProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function PDFOrderPreview({ isOpen, setIsOpen }: PDFOrderPreviewProps) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoiceNo] = useState(() => `INV-${Date.now().toString().slice(-6)}`);
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const totalAmount = getCartTotal();
  const [cacheBuster] = useState(() => Date.now().toString());

  const getBustedImageUrl = (url: string | null) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      u.searchParams.set("nocache", cacheBuster);
      return u.toString();
    } catch {
      return `${url}${url.includes("?") ? "&" : "?"}nocache=${cacheBuster}`;
    }
  };

  const handleDownloadPDF = async (): Promise<Blob | null> => {
    if (!invoiceRef.current) return null;
    setIsGenerating(true);
    try {
      // Dynamic imports to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 1.5, // 1.5 is standard, lower memory overhead than 2
        useCORS: true,
        allowTaint: false, // NEVER allow taint! Tainting canvas blocks canvas.toDataURL() reads
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");
      
      // Save / Download locally
      pdf.save(`order-${invoiceNo}.pdf`);
      
      return pdfBlob;
    } catch (err) {
      console.error("html2canvas PDF generation failed, trying direct text PDF fallback:", err);
      try {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        // Add document header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.setTextColor("#171717");
        pdf.text("REHVOX", 20, 25);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor("#71717a");
        pdf.text("Smart Wearables & Tech Accessories", 20, 31);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor("#27272a");
        pdf.text("INVOICE", 140, 25);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor("#71717a");
        pdf.text(`No: ${invoiceNo}`, 140, 31);
        pdf.text(`Date: ${currentDate}`, 140, 37);

        // Divider
        pdf.setDrawColor("#e4e4e7");
        pdf.setLineWidth(0.5);
        pdf.line(20, 42, 190, 42);

        // Addresses
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor("#27272a");
        pdf.text("Order From", 20, 50);
        pdf.text("Customer Details", 110, 50);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor("#52525b");
        pdf.text("Rehvox Store", 20, 56);
        pdf.text("Online Support: wa.me/rehvox", 20, 61);

        pdf.text(`Name: ${name || "Guest User"}`, 110, 56);
        pdf.text(`Phone: ${phone || "Not provided"}`, 110, 61);

        // Divider
        pdf.line(20, 68, 190, 68);

        // Table Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor("#27272a");
        pdf.text("Description", 20, 75);
        pdf.text("Qty", 120, 75);
        pdf.text("Price", 140, 75);
        pdf.text("Subtotal", 165, 75);

        pdf.line(20, 78, 190, 78);

        // Table Rows
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor("#52525b");
        let y = 85;
        cartItems.forEach((item) => {
          const titleLines = pdf.splitTextToSize(item.product.title, 80);
          pdf.text(titleLines, 20, y);
          pdf.text(String(item.quantity), 121, y);
          pdf.text(`Rs.${item.product.price.toLocaleString()}`, 140, y);
          pdf.text(`Rs.${(item.product.price * item.quantity).toLocaleString()}`, 165, y);
          y += Math.max(titleLines.length * 5, 8);

          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
        });

        // Totals Divider
        pdf.setDrawColor("#a1a1aa");
        pdf.line(20, y, 190, y);
        y += 8;

        // Totals
        pdf.setFont("helvetica", "normal");
        pdf.text("Payment Mode: Cash on Delivery (COD)", 20, y);
        pdf.text("Subtotal:", 135, y);
        pdf.text(`Rs.${totalAmount.toLocaleString()}`, 165, y);

        y += 7;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor("#171717");
        pdf.text("Grand Total:", 135, y);
        pdf.text(`Rs.${totalAmount.toLocaleString()}`, 165, y);

        // Footer note
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor("#a1a1aa");
        pdf.text("Thank you for shopping with Rehvox! For queries, contact online support.", 20, 280);

        const pdfBlob = pdf.output("blob");
        pdf.save(`order-${invoiceNo}.pdf`);
        return pdfBlob;
      } catch (fallbackErr) {
        console.error("Direct PDF generation failed too:", fallbackErr);
        alert("Failed to generate PDF. You can still proceed to place your order via WhatsApp.");
        return null;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    // 1. Generate and download PDF
    const pdfBlob = await handleDownloadPDF();

    // 2. Format WhatsApp text message summary
    const itemsSummary = cartItems
      .map(
        (item) =>
          `- ${item.quantity}x ${item.product.title} (Rs.${(
            item.product.price * item.quantity
          ).toLocaleString()})`
      )
      .join("\n");

    const message = `Hello Rehvox! I'd like to place an order:\n\n*Invoice No:* ${invoiceNo}\n*Date:* ${currentDate}\n\n*Customer Details:*\n- Name: ${name || "Not provided"}\n- Phone: ${phone || "Not provided"}\n\n*Items:*\n${itemsSummary}\n\n*Total Amount:* Rs.${totalAmount.toLocaleString()}\n\n_Note: I have downloaded the invoice PDF and will attach it to this chat._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // 3. Try to use Web Share API to send the actual file directly
    if (pdfBlob && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
      try {
        const file = new File([pdfBlob], `order-${invoiceNo}.pdf`, {
          type: "application/pdf",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Rehvox Order Summary ${invoiceNo}`,
            text: "Here is my order invoice. Please process it.",
          });
          // Clear cart on success
          clearCart();
          setIsOpen(false);
          return;
        }
      } catch (err) {
        console.warn("Sharing failed, falling back to URL redirect", err);
      }
    }

    // 4. Fallback to opening WhatsApp link
    window.open(whatsappUrl, "_blank");
    clearCart();
    setIsOpen(false);
  };

  if (cartItems.length === 0 && !isGenerating) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-zinc-950 border-zinc-800 z-50">
        <DialogHeader className="p-6 border-b border-zinc-800 shrink-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-white flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Order Preview & Confirmation
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Fill in your details below, preview your invoice, and proceed to WhatsApp to complete your order.
            </DialogDescription>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white rounded-lg cursor-pointer h-9 w-9 flex items-center justify-center border border-transparent hover:border-zinc-800 hover:bg-zinc-900 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Dialog body split into Form/Actions (left) and PDF Invoice Sheet (right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Inputs & Steps */}
          <div className="w-full md:w-80 border-r border-zinc-800 p-6 flex flex-col gap-6 bg-zinc-900 shrink-0 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                1. Customer Details
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-zinc-400">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs text-zinc-400">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="e.g. 03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg focus:ring-primary"
                    type="tel"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-6">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                2. Actions
              </h3>
              <Button
                onClick={() => handleDownloadPDF()}
                disabled={!name.trim() || !phone.trim() || isGenerating}
                className="w-full rounded-lg py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold cursor-pointer border border-zinc-700 hover:border-zinc-600 transition-all active:scale-[0.98] disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>

              <Button
                onClick={handleWhatsAppOrder}
                disabled={!name.trim() || !phone.trim() || isGenerating}
                className="w-full rounded-lg py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer border border-emerald-500 shadow-md transition-all active:scale-[0.98] disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Confirm & Order via WA
              </Button>
            </div>
          </div>

          {/* Right Panel: Invoice Sheet Preview */}
          <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto flex justify-center items-start">
            {/* The Actual Invoice Sheet rendered client-side */}
            <div
              ref={invoiceRef}
              className="w-full max-w-[595px] min-h-[842px] bg-white text-zinc-900 p-8 shadow-2xl flex flex-col justify-between border"
              style={{
                boxSizing: "border-box",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {/* Invoice Header */}
              <div>
                <div className="flex justify-between items-start border-b pb-6">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">REHVOX</h1>
                    <p className="text-xs text-zinc-500 mt-1">
                      Smart Wearables & Tech Accessories
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-700">Invoice</h2>
                    <p className="text-xs font-semibold text-zinc-500 mt-1">
                      No: {invoiceNo}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Date: {currentDate}
                    </p>
                  </div>
                </div>

                {/* Client / Order Details */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Order From
                    </h3>
                    <p className="text-sm font-bold text-zinc-800">Rehvox Store</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Online Support: wa.me/rehvox</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Customer Details
                    </h3>
                    <p className="text-sm font-bold text-zinc-800">
                      {name || <span className="text-zinc-300 italic">Enter name...</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Phone: {phone || <span className="text-zinc-300 italic">Enter phone...</span>}
                    </p>
                  </div>
                </div>

                {/* Invoice Table */}
                <table className="w-full mt-6 text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 text-xs font-bold uppercase tracking-wider text-zinc-500 font-sans">
                      <th className="pb-3 w-12">Item</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-center w-12">Qty</th>
                      <th className="pb-3 text-right w-24">Price</th>
                      <th className="pb-3 text-right w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-b text-sm text-zinc-700">
                        <td className="py-4 pr-3">
                          <div className="relative h-10 w-10 rounded border bg-zinc-50 overflow-hidden">
                            {item.product.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getBustedImageUrl(item.product.image_url)}
                                alt={item.product.title}
                                className="object-cover h-full w-full"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-zinc-200" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 font-medium text-zinc-900 pr-3">
                          {item.product.title}
                        </td>
                        <td className="py-4 text-center font-semibold">{item.quantity}</td>
                        <td className="py-4 text-right">Rs.{item.product.price.toLocaleString()}</td>
                        <td className="py-4 text-right font-semibold">
                          Rs.{(item.product.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Footer / Summary */}
              <div className="mt-8 border-t pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Payment Terms
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Cash on Delivery (COD). Please verify items upon receipt.
                    </p>
                  </div>
                  <div className="w-64 text-right space-y-1.5">
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>Subtotal</span>
                      <span>Rs.{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-zinc-900 border-t pt-1.5">
                      <span>Grand Total</span>
                      <span>Rs.{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-zinc-400 mt-12 border-t pt-6">
                  Thank you for shopping with Rehvox! For any queries, contact us on WhatsApp.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
