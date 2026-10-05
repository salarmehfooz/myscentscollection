import React from 'react';
import { ShoppingBag, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({
  product,
  onSelectProduct,
  onShowToast
}) => {
  const { addToCart } = useCart();
  const savings = product.retail - product.discount;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    if (onShowToast) {
      onShowToast(
        `Added to Bag!`,
        `${product.name} (Rs. ${product.discount.toLocaleString()}) added to your shopping bag.`
      );
    }
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Media Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#0F2747] to-slate-800">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2747]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Discount Savings Badge */}
        {savings > 0 && (
          <div className="absolute top-3 left-3 bg-amber-400 text-[#0F2747] text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#0F2747]" /> Save Rs. {savings.toLocaleString()}
          </div>
        )}

        {/* Stock Level Real-time Indicator */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-red-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm">
              <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse backdrop-blur-sm">
              Limited Stock
            </span>
          ) : (
            <span className="bg-emerald-600/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
              In Stock
            </span>
          )}
        </div>

        {/* Quick View Floating Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="px-4 py-2 bg-white/90 text-[#0F2747] rounded-full text-xs font-semibold shadow-lg hover:bg-white hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-amber-600" /> View Perfume Notes
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-widest mb-1">
            {product.category}
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-[#0F2747] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 italic mt-1 line-clamp-2 min-h-[32px]">
            "{product.tagline}"
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-bold text-[#0F2747] font-serif">
              Rs. {product.discount.toLocaleString()}
            </span>
            {product.retail > product.discount && (
              <span className="text-xs text-slate-400 line-through">
                Rs. {product.retail.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#0F2747] text-white hover:bg-amber-500 hover:text-[#0F2747] active:scale-[0.98]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
};
