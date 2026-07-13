"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/core/cart/useCart";
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

import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";

interface PDFOrderPreviewProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Helper to convert an image URL to a Base64 data URL via the proxy
const convertImageToBase64 = async (url: string): Promise<string> => {
  if (!url) return "";
  try {
    let fetchUrl = url;
    // Only proxy absolute URLs that are external
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      if (!url.startsWith(currentOrigin)) {
        fetchUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      }
    }
    
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`Failed to fetch image from ${fetchUrl}`);
    
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    // Return original url as fallback
    return url;
  }
};

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

  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [isImagesLoading, setIsImagesLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadImages = async () => {
      setIsImagesLoading(true);
      const newMap: Record<string, string> = {};
      
      try {
        await Promise.all(
          cartItems.map(async (item) => {
            const url = item.product.image_url;
            if (!url) return;
            const base64 = await convertImageToBase64(url);
            if (isMounted) {
              newMap[item.product.id] = base64;
            }
          })
        );
        if (isMounted) {
          setImageMap(newMap);
        }
      } catch (err) {
        console.error("Error loading images:", err);
      } finally {
        if (isMounted) {
          setIsImagesLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [isOpen, cartItems]);

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
      const html2canvas = (await import("html2canvas-pro")).default;
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
        pdf.text("AL-REHMAN MOBILE SHOP", 20, 25);

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
        pdf.text("Al-Rehman Mobile Shop", 20, 56);
        pdf.text("Online Support: wa.me/923056872063", 20, 61);

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
        let y = 82;
        cartItems.forEach((item) => {
          const imgBase64 = imageMap[item.product.id];
          
          const textX = imgBase64 && imgBase64.startsWith("data:") ? 33 : 20;
          const titleLines = pdf.splitTextToSize(item.product.title, textX === 33 ? 82 : 95);
          const rowHeight = Math.max(titleLines.length * 5 + 4, 14);

          if (y + rowHeight > 275) {
            pdf.addPage();
            y = 20;
          }

          if (imgBase64 && imgBase64.startsWith("data:")) {
            try {
              const format = imgBase64.includes("png") ? "PNG" : "JPEG";
              const imgY = y + (rowHeight - 10) / 2;
              pdf.addImage(imgBase64, format, 20, imgY, 10, 10);
            } catch (imgErr) {
              console.error("Failed to add image to fallback PDF:", imgErr);
            }
          }

          const textY = y + (rowHeight - (titleLines.length - 1) * 5) / 2 + 1;
          pdf.text(titleLines, textX, textY);
          pdf.text(String(item.quantity), 121, textY);
          pdf.text(`Rs.${item.product.price.toLocaleString()}`, 140, textY);
          pdf.text(`Rs.${(item.product.price * item.quantity).toLocaleString()}`, 165, textY);

          pdf.setDrawColor("#e4e4e7");
          pdf.setLineWidth(0.3);
          pdf.line(20, y + rowHeight, 190, y + rowHeight);

          y += rowHeight;
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
        pdf.text("Thank you for shopping with Al-Rehman Mobile Shop! For queries, contact online support.", 20, 280);

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
    await handleDownloadPDF();

    // 2. Format WhatsApp text message summary
    const itemsSummary = cartItems
      .map(
        (item) =>
          `- ${item.quantity}x ${item.product.title} (Rs.${(
            item.product.price * item.quantity
          ).toLocaleString()})`
      )
      .join("\n");

    const message = `Hello Al-Rehman Mobile Shop! I'd like to place an order:\n\n*Invoice No:* ${invoiceNo}\n*Date:* ${currentDate}\n\n*Customer Details:*\n- Name: ${name || "Not provided"}\n- Phone: ${phone || "Not provided"}\n\n*Items:*\n${itemsSummary}\n\n*Total Amount:* Rs.${totalAmount.toLocaleString()}\n\n_Note: I have downloaded the invoice PDF and will attach it to this chat._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923056872063?text=${encodedMessage}`;

    // 3. Open WhatsApp link directly
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
          <Box className="space-y-1">
            <DialogTitle className="text-white flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Order Preview & Confirmation
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Fill in your details below, preview your invoice, and proceed to WhatsApp to complete your order.
            </DialogDescription>
          </Box>
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
        <Flex className="flex-1 flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Inputs & Steps */}
          <Flex direction="col" gap="lg" className="w-full md:w-80 border-r border-zinc-800 p-6 bg-zinc-900 shrink-0 overflow-y-auto">
            <Box className="space-y-4">
              <Heading level="h3" className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                1. Customer Details
              </Heading>
              <Box className="space-y-3">
                <Box className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs text-zinc-400">
                    Your Name <Box as="span" className="text-red-500">*</Box>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </Box>
                <Box className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs text-zinc-400">
                    Phone Number <Box as="span" className="text-red-500">*</Box>
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
                </Box>
              </Box>
            </Box>

            <Box className="mt-auto space-y-3 pt-6">
              <Heading level="h3" className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                2. Actions
              </Heading>
              <Button
                onClick={() => handleDownloadPDF()}
                disabled={!name.trim() || !phone.trim() || isGenerating || isImagesLoading}
                className="w-full rounded-lg py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold cursor-pointer border border-zinc-700 hover:border-zinc-600 transition-all active:scale-[0.98] disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating || isImagesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isImagesLoading ? "Loading images..." : "Download PDF"}
              </Button>

              <Button
                onClick={handleWhatsAppOrder}
                disabled={!name.trim() || !phone.trim() || isGenerating || isImagesLoading}
                className="w-full rounded-lg py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer border border-emerald-500 shadow-md transition-all active:scale-[0.98] disabled:bg-zinc-950 disabled:text-zinc-600 disabled:border-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating || isImagesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                {isImagesLoading ? "Loading images..." : "Confirm & Order via WA"}
              </Button>
            </Box>
          </Flex>

          {/* Right Panel: Invoice Sheet Preview */}
          <Flex align="start" justify="center" className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
            {/* The Actual Invoice Sheet rendered client-side */}
            <div
              ref={invoiceRef}
              className="w-full max-w-[595px] min-h-[842px] p-8 shadow-2xl flex flex-col justify-between"
              style={{
                boxSizing: "border-box",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                backgroundColor: "#ffffff",
                color: "#18181b",
                border: "1px solid #e4e4e7",
              }}
            >
              {/* Invoice Header */}
              <div>
                <div
                  className="flex justify-between items-start pb-6"
                  style={{ borderBottom: "1px solid #e4e4e7" }}
                >
                  <div>
                    <h1
                      className="text-3xl font-black tracking-tight"
                      style={{ color: "#0d9488" }}
                    >
                      AL-REHMAN MOBILE SHOP
                    </h1>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#71717a" }}
                    >
                      Smart Wearables & Tech Accessories
                    </p>
                  </div>
                  <div className="text-right">
                    <h2
                      className="text-xl font-bold uppercase tracking-wider"
                      style={{ color: "#3f3f46" }}
                    >
                      Invoice
                    </h2>
                    <p
                      className="text-xs font-semibold mt-1"
                      style={{ color: "#71717a" }}
                    >
                      No: {invoiceNo}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "#71717a" }}
                    >
                      Date: {currentDate}
                    </p>
                  </div>
                </div>

                {/* Client / Order Details */}
                <div
                  className="grid grid-cols-2 gap-4 py-6"
                  style={{ borderBottom: "1px solid #e4e4e7" }}
                >
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "#a1a1aa" }}
                    >
                      Order From
                    </h3>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#27272a" }}
                    >
                      Al-Rehman Mobile Shop
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#71717a" }}
                    >
                      Online Support: wa.me/923056872063
                    </p>
                  </div>
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "#a1a1aa" }}
                    >
                      Customer Details
                    </h3>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#27272a" }}
                    >
                      {name || <span style={{ color: "#d4d4d8", fontStyle: "italic" }}>Enter name...</span>}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#71717a" }}
                    >
                      Phone: {phone || <span style={{ color: "#d4d4d8", fontStyle: "italic" }}>Enter phone...</span>}
                    </p>
                  </div>
                </div>

                {/* Invoice Table (Div-based Grid layout for perfect pdf rendering of spacing and borders) */}
                <div className="w-full mt-6 text-left">
                  {/* Table Header */}
                  <div
                    className="pb-3 text-xs font-bold uppercase tracking-wider font-sans flex items-center"
                    style={{
                      borderBottom: "2px solid #e4e4e7",
                      color: "#71717a",
                    }}
                  >
                    <div className="w-16 flex-shrink-0">Item</div>
                    <div className="flex-1 pr-3">Description</div>
                    <div className="w-12 text-center flex-shrink-0">Qty</div>
                    <div className="w-24 text-right flex-shrink-0">Price</div>
                    <div className="w-24 text-right flex-shrink-0">Subtotal</div>
                  </div>
                  {/* Table Body */}
                  <div>
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 text-sm flex items-center"
                        style={{
                          borderBottom: "1px solid #e4e4e7",
                          color: "#3f3f46",
                        }}
                      >
                        <div className="w-16 pr-4 flex-shrink-0">
                          <div
                            className="relative h-12 w-12 rounded overflow-hidden"
                            style={{
                              border: "1px solid #e4e4e7",
                              backgroundColor: "#f4f4f5",
                            }}
                          >
                            {item.product.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageMap[item.product.id] || getBustedImageUrl(item.product.image_url)}
                                alt={item.product.title}
                                className="object-cover h-full w-full"
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div
                                className="h-full w-full flex items-center justify-center"
                                style={{ backgroundColor: "#e4e4e7" }}
                              />
                            )}
                          </div>
                        </div>
                        <div
                          className="flex-1 font-medium pr-3 min-w-0 break-words"
                          style={{ color: "#18181b" }}
                        >
                          {item.product.title}
                        </div>
                        <div className="w-12 text-center font-semibold flex-shrink-0">
                          {item.quantity}
                        </div>
                        <div className="w-24 text-right flex-shrink-0">
                          Rs.{item.product.price.toLocaleString()}
                        </div>
                        <div className="w-24 text-right font-semibold flex-shrink-0">
                          Rs.{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoice Footer / Summary */}
              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid #e4e4e7" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#a1a1aa" }}
                    >
                      Payment Terms
                    </h4>
                    <p
                      className="text-xs"
                      style={{ color: "#71717a" }}
                    >
                      Cash on Delivery (COD). Please verify items upon receipt.
                    </p>
                  </div>
                  <div className="w-64 text-right space-y-1.5">
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: "#52525b" }}
                    >
                      <span>Subtotal</span>
                      <span>Rs.{totalAmount.toLocaleString()}</span>
                    </div>
                    <div
                      className="flex justify-between text-lg font-black"
                      style={{
                        color: "#18181b",
                        borderTop: "1px solid #e4e4e7",
                        paddingTop: "6px",
                      }}
                    >
                      <span>Grand Total</span>
                      <span>Rs.{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="text-center text-[10px] mt-12 pt-6"
                  style={{
                    color: "#a1a1aa",
                    borderTop: "1px solid #e4e4e7",
                  }}
                >
                  Thank you for shopping with Al-Rehman Mobile Shop! For any queries, contact us on WhatsApp.
                </div>
              </div>
            </div>
          </Flex>
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
