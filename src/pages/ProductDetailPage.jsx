import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  Clock,
  Wind,
  Layers,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';

export const ProductDetailPage = ({
  product,
  onBack,
  onSelectProduct,
  onShowToast
}) => {
  const { addToCart } = useCart();
  const { products } = useInventory();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Live real-time version from inventory context
  const liveProduct = products.find((p) => p.id === product.id) || product;

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
  }, [liveProduct.id]);

  // Gallery Images Array
  const galleryImages =
    liveProduct.images && Array.isArray(liveProduct.images) && liveProduct.images.length > 0
      ? liveProduct.images
      : [liveProduct.img].filter(Boolean);

  const currentMainImage = galleryImages[activeImageIndex] || liveProduct.img;

  const isOutOfStock = liveProduct.stock <= 0;
  const isLowStock = liveProduct.stock > 0 && liveProduct.stock <= 4;
  const savings = liveProduct.retail - liveProduct.discount;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(liveProduct, quantity);
    onShowToast(
      `Added to Bag!`,
      `${quantity}x ${liveProduct.name} added to your shopping bag.`
    );
  };

  const handleWhatsAppOrder = () => {
    const text = `Hello My Scents Collection! 👋\nI would like to order:\n${quantity}x ${liveProduct.name} (${liveProduct.volume}) @ Rs. ${(
      liveProduct.discount * quantity
    ).toLocaleString()}\n\nIs this perfume currently in stock?`;
    const url = `https://wa.me/923001234567?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  };

  // Related Products
  const relatedProducts = products
    .filter((p) => p.id !== liveProduct.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 pb-20 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2747] hover:text-amber-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Perfume Collection
        </button>

        {/* Product Details Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg">
          {/* Left Column: Product Image Gallery Media */}
          <div className="space-y-4">
            <div className="relative h-96 sm:h-[480px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-[#0F2747] border border-slate-200 group">
              <motion.img
                key={currentMainImage}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={currentMainImage}
                alt={liveProduct.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Prev / Next Image Quick Buttons */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 text-white hover:bg-amber-500 hover:text-[#0F2747] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 text-white hover:bg-amber-500 hover:text-[#0F2747] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm"
                    title="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {savings > 0 && (
                <div className="absolute top-4 left-4 bg-amber-400 text-[#0F2747] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Save Rs. {savings.toLocaleString()}
                </div>
              )}

              {/* Real-time Stock Badge */}
              <div className="absolute top-4 right-4">
                {isOutOfStock ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                    Limited Stock Available
                  </span>
                ) : (
                  <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    In Stock
                  </span>
                )}
              </div>

              {/* Image Count Indicator */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-slate-950/70 text-white text-[11px] font-mono px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>

            {/* Multiple Product Images Thumbnails Row */}
            {galleryImages.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-[#0F2747] font-semibold">
                    <Eye className="w-3.5 h-3.5 text-amber-500" /> Multiple Angles &amp; Views:
                  </span>
                  <span>Click thumbnail to view</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-amber-500 ring-2 ring-amber-400/50 scale-105 shadow-md'
                          : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${liveProduct.name} View ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-slate-600 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">100% Authentic</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">{liveProduct.longevity || '12+ Hours'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1">
                <Wind className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">{liveProduct.sillage || 'Intense'} Sillage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Perfume Details & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {liveProduct.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {liveProduct.sku}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F2747]">
                {liveProduct.name}
              </h1>

              <p className="text-sm text-amber-700 italic font-medium">
                "{liveProduct.tagline}"
              </p>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-serif font-bold text-[#0F2747]">
                  Rs. {liveProduct.discount.toLocaleString()}
                </span>
                {liveProduct.retail > liveProduct.discount && (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {liveProduct.retail.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  ({liveProduct.volume})
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {liveProduct.description}
              </p>

              {/* Olfactory Notes Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-500" /> Olfactory Notes Pyramid
                </h3>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-800">Top Notes: </span>
                    <span className="text-slate-700">{liveProduct.topNotes || 'Bergamot, Spiced Citrus'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-[#0F2747]">Heart Notes: </span>
                    <span className="text-slate-700">{liveProduct.heartNotes || 'Damask Rose, Black Leather'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="font-bold text-amber-900">Base Notes: </span>
                    <span className="text-slate-700">{liveProduct.baseNotes || 'Cambodi Oud, Bourbon Vanilla, Amber'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Controls */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-full bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(liveProduct.stock > 0 ? liveProduct.stock : 99, quantity + 1))
                    }
                    disabled={isOutOfStock || quantity >= liveProduct.stock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0F2747] text-white hover:bg-amber-500 hover:text-[#0F2747]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  Quick WhatsApp Order
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Perfumes Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl font-bold text-[#0F2747] mb-6">
              You May Also Love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-all flex items-center gap-4 group"
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-900 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">
                      {p.category}
                    </span>
                    <h4 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#0F2747]">
                      {p.name}
                    </h4>
                    <p className="text-xs text-[#0F2747] font-bold mt-1">
                      Rs. {p.discount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
