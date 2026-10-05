import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Send,
  Building2,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  Eye,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useInventory } from "../context/InventoryContext";

export const CartPage = ({ navigate, onShowToast }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalSavings,
    clearCart,
    deliveryFee,
    totalAmount,
  } = useCart();

  const { submitPendingOrder } = useInventory();

  // Customer Details Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState(null);
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);

  // Bank Transfer Screenshot Attachment State
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofName, setPaymentProofName] = useState("");
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  const BANK_DETAILS = {
    bankName: "Meezan Bank Limited",
    accountTitle: "My Scents Collection",
    accountNumber: "0102 0108 9231 04",
    iban: "PK78 MEZN 0001 0201 0892 3104",
    branch: "Main Boulevard, Gulberg III, Lahore",
  };

  const handleCopyIban = (ibanText) => {
    navigator.clipboard.writeText(ibanText);
    setCopiedIban(true);
    onShowToast("IBAN Copied", "Account IBAN copied to clipboard.");
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast(
        "Invalid File",
        "Please upload a valid image file (PNG, JPG, WEBP).",
      );
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      onShowToast(
        "File Too Large",
        "Please upload a screenshot image smaller than 12MB.",
      );
      return;
    }

    setIsUploadingProof(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 900;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIM) {
            height = Math.round(height * (MAX_DIM / width));
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round(width * (MAX_DIM / height));
            height = MAX_DIM;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.72);
          setPaymentProof(compressed);
          setPaymentProofName(file.name);
          setIsUploadingProof(false);
          onShowToast(
            "Screenshot Attached",
            "Bank transfer receipt screenshot attached.",
          );
        } catch (_) {
          setPaymentProof(event.target.result);
          setPaymentProofName(file.name);
          setIsUploadingProof(false);
          onShowToast(
            "Screenshot Attached",
            "Bank transfer receipt screenshot attached.",
          );
        }
      };
      img.onerror = () => {
        setIsUploadingProof(false);
        onShowToast("Upload Failed", "Failed to process screenshot image.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsUploadingProof(false);
      onShowToast("Upload Failed", "Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setPaymentProof(null);
    setPaymentProofName("");
    onShowToast("Attachment Removed", "Payment proof screenshot removed.");
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !deliveryAddress?.trim()
    ) {
      onShowToast(
        "Missing Information",
        "Please provide your name, phone number, and delivery address.",
      );
      return;
    }

    if (paymentMethod === "Bank Transfer" && !paymentProof) {
      onShowToast(
        "Payment Proof Recommended",
        "Please attach a screenshot of your bank transfer so admin can verify your payment quickly.",
      );
    }

    try {
      setIsSubmitting(true);
      const orderNum = "MSC-" + Math.floor(100000 + Math.random() * 900000);

      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        price: item.product.discount,
        quantity: item.quantity,
        subtotal: item.product.discount * item.quantity,
        img: item.product.img,
      }));

      const deliveryCharges = 250;
      const orderTotal = subtotal + deliveryCharges;

      // Submit Pending Order to Store Inventory (persisted locally & synced to Firestore)
      await submitPendingOrder({
        orderNumber: orderNum,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || "").trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: itemsPayload,
        subtotal,
        deliveryFee: deliveryCharges,
        discountApplied: totalSavings,
        totalAmount: orderTotal,
        paymentMethod,
        paymentProof: paymentMethod === "Bank Transfer" ? paymentProof : null,
        paymentProofName:
          paymentMethod === "Bank Transfer" ? paymentProofName : null,
        status: "Pending",
        type: "Online Store Order",
      });

      setCompletedOrderDetails({
        orderNumber: orderNum,
        subtotal,
        deliveryFee: deliveryCharges,
        totalAmount: orderTotal,
      });
      setCompletedOrderNumber(orderNum);
      clearCart();
      onShowToast(
        "Order Placed Successfully!",
        `Order #${orderNum} received. Thank you!`,
      );
    } catch (err) {
      console.error("Checkout error:", err);
      onShowToast("Checkout Status", err.message || "Order received.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrderNumber) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Order Confirmed
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0F2747] mt-1">
              Thank You For Your Order!
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Your order{" "}
              <strong className="text-slate-900">
                #{completedOrderNumber}
              </strong>{" "}
              has been logged into our real-time store inventory.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5 text-left">
            <div>
              <strong>Customer:</strong> {customerName}
            </div>
            <div>
              <strong>Phone:</strong> {customerPhone}
            </div>
            <div>
              <strong>Delivery Address:</strong> {deliveryAddress}
            </div>
            <div>
              <strong>Payment Method:</strong> {paymentMethod}
            </div>
            {completedOrderDetails && (
              <div className="pt-2 border-t border-slate-200 mt-2 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>
                    Rs. {completedOrderDetails.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-amber-800">
                    Rs. {completedOrderDetails.deliveryFee?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#0F2747]">
                    Rs. {completedOrderDetails.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {paymentProof && (
              <div className="pt-2 border-t border-slate-200 mt-2">
                <span className="font-bold text-amber-700 block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                  Payment Screenshot Attached:
                </span>
                <div className="relative inline-block border border-amber-300 rounded-xl overflow-hidden shadow-sm bg-white p-1">
                  <img
                    src={paymentProof}
                    alt="Attached Transfer Screenshot"
                    className="w-28 h-28 object-cover rounded-lg"
                  />
                  <div className="text-[10px] text-slate-500 font-mono mt-1 text-center truncate max-w-[110px]">
                    {paymentProofName || "screenshot.jpg"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setCompletedOrderNumber(null);
              navigate("/");
            }}
            className="w-full py-3 bg-[#0F2747] text-white text-xs font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-20 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2747] hover:text-amber-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Continue Shopping
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F2747] mb-8">
          Your Shopping Bag &amp; Checkout
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0F2747]">
              Your Bag is Currently Empty
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Explore our range of 7 luxury perfumes and discover your next
              signature scent.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-[#0F2747] text-white rounded-full text-xs font-bold hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md"
            >
              Browse Perfume Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0F2747] pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Selected Fragrances ({cart.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:underline font-normal"
                  >
                    Clear All
                  </button>
                </h3>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 flex gap-4 items-center"
                    >
                      <img
                        src={item.product.img}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl bg-slate-900 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-slate-900 text-sm">
                              {item.product.name}
                            </h4>
                            <span className="text-[11px] text-slate-400 block">
                              {item.product.volume}
                            </span>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-slate-300 rounded-full bg-slate-50 overflow-hidden">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-serif font-bold text-slate-900 text-base">
                            Rs.{" "}
                            {(
                              item.product.discount * item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantees bar */}
              <div className="bg-amber-500/10 border border-amber-200 rounded-2xl p-4 flex items-center justify-around text-xs text-amber-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" /> Flat Rs. 250
                  Delivery Across Pakistan
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" /> Real-time
                  Stock Secured
                </span>
              </div>
            </div>

            {/* Checkout Customer Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleCheckoutSubmit}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5 text-xs"
              >
                <h3 className="font-serif text-lg font-bold text-[#0F2747] pb-3 border-b border-slate-100">
                  Shipping &amp; Order Details
                </h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="03XX XXXXXXX"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House/Apartment #, Street, Area, City"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash")}
                      className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                        paymentMethod === "Cash"
                          ? "border-amber-500 bg-amber-50 text-[#0F2747]"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      Cash on Delivery
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Bank Transfer")}
                      className={`p-3 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                        paymentMethod === "Bank Transfer"
                          ? "border-amber-500 bg-amber-50 text-[#0F2747]"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span>Bank Transfer</span>
                      <Building2 className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>

                {/* Bank Account Details & Transfer Screenshot Uploader */}
                {paymentMethod === "Bank Transfer" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-200/80 text-[#0F2747] font-serif font-bold text-sm">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      Official Bank Transfer Details
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-200/60 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Bank Name:</span>
                        <strong className="text-[#0F2747]">
                          {BANK_DETAILS.bankName}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Title:</span>
                        <strong className="text-[#0F2747]">
                          {BANK_DETAILS.accountTitle}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {BANK_DETAILS.accountNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-slate-500">IBAN:</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          <span>{BANK_DETAILS.iban}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyIban(BANK_DETAILS.iban)}
                            className="p-1 text-slate-500 hover:text-amber-700 hover:bg-slate-200 rounded transition-colors"
                            title="Copy IBAN"
                          >
                            {copiedIban ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Upload Dropzone */}
                    <div className="space-y-2">
                      <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[#0F2747]">
                          <Upload className="w-3.5 h-3.5 text-amber-600" />{" "}
                          Attach Payment Proof Screenshot
                        </span>
                        {paymentProof && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                            Attached
                          </span>
                        )}
                      </label>

                      {paymentProof ? (
                        <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-sm flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={paymentProof}
                              alt="Payment Screenshot Preview"
                              className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block text-xs truncate">
                                {paymentProofName || "transfer_proof.jpg"}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-medium block">
                                Payment proof attached successfully
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveScreenshot}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            title="Remove screenshot"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs text-[#0F2747]">
                            Click or Drag to Upload Screenshot
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG or WEBP (Max 8MB)
                          </span>
                        </label>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Order Summary breakdown */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>Total Savings</span>
                      <span>- Rs. {totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="text-[#0F2747] font-bold">
                      Rs. {deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-serif font-bold text-[#0F2747] pt-2 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span>Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#0F2747] text-white font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? "Processing Order..."
                    : "Confirm & Place Order"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
