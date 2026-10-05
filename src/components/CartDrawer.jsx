import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export const CartDrawer = ({ navigate }) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalSavings,
    totalItems,
    deliveryFee,
    totalAmount,
  } = useCart();

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const lines = cart.map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} @ Rs. ${item.product.discount.toLocaleString()} = Rs. ${(
          item.product.discount * item.quantity
        ).toLocaleString()}`,
    );

    const message = [
      `Hello My Scents Collection! 👋`,
      `I would like to place an order:`,
      ...lines,
      ``,
      `*Items Subtotal:* Rs. ${subtotal.toLocaleString()}`,
      `*Delivery Charges:* Rs. ${deliveryFee.toLocaleString()}`,
      `*Total Order Amount:* Rs. ${totalAmount.toLocaleString()}`,
      `Please confirm stock availability and shipping details.`,
    ].join("\n");

    const whatsappNum = "923001234567";
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  };

  const handleGoToCartPage = () => {
    closeCart();
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#0F2747] text-white">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold tracking-wide">
                  Your Shopping Bag
                </h3>
                <span className="bg-amber-400 text-[#0F2747] text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-slate-700 mb-1">
                    Your Bag is Empty
                  </h4>
                  <p className="text-xs text-slate-500 mb-6 max-w-xs">
                    Discover our collection of handcrafted luxury fragrances and
                    add your signature scent.
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate("/");
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#0F2747] text-white text-xs font-semibold hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md"
                  >
                    Explore Perfumes
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group"
                  >
                    <img
                      src={item.product.img}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-serif font-bold text-slate-900 text-sm truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mb-2">
                        {item.product.volume}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-slate-300 rounded-full bg-white overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-serif font-bold text-sm text-[#0F2747]">
                          Rs.{" "}
                          {(
                            item.product.discount * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer summary & checkout actions */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <span className="flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Total
                      Savings
                    </span>
                    <span className="font-bold">
                      Rs. {totalSavings.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-baseline text-xs text-slate-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-800">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs text-slate-600">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-amber-800">
                      Rs. {deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                    <span className="text-sm font-bold text-slate-800">
                      Total Amount
                    </span>
                    <span className="font-serif text-xl font-bold text-[#0F2747]">
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Flat Rs. 250 delivery fee across Pakistan regardless of
                  perfume quantity.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleGoToCartPage}
                    className="w-full py-3 bg-[#0F2747] text-white rounded-xl text-xs font-semibold hover:bg-[#17345F] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    Proceed to Complete Order <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Quick Checkout via
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
