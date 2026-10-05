import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Phone, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';

export const Header = ({ currentPath, navigate }) => {
  const { totalItems, toggleCart } = useCart();
  const { products } = useInventory();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check low stock count across inventory for admin badge
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path, hash) => {
    setMobileMenuOpen(false);
    if (path === '/') {
      navigate('/');
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || currentPath !== '/'
          ? 'bg-[#0F2747]/95 backdrop-blur-md py-3 shadow-xl border-b border-amber-500/10'
          : 'bg-[#0F2747]/70 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('/')}
          className="text-left group flex items-center gap-2 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-[1px] shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0F2747] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide block leading-none">
              My <span className="text-amber-400 italic">Scents</span>
            </span>
            <span className="text-[10px] tracking-[0.25em] text-amber-200 uppercase font-sans font-semibold block mt-0.5">
              Collection
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <button
            onClick={() => handleNavClick('/')}
            className={`transition-colors py-1 relative ${
              currentPath === '/' ? 'text-amber-400 font-semibold' : 'text-slate-200 hover:text-amber-300'
            }`}
          >
            Home
            {currentPath === '/' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('/', '#catalogue')}
            className="text-slate-200 hover:text-amber-300 transition-colors py-1"
          >
            Catalogue
          </button>

          <button
            onClick={() => handleNavClick('/', '#about')}
            className="text-slate-200 hover:text-amber-300 transition-colors py-1"
          >
            Our Story
          </button>

          <button
            onClick={() => handleNavClick('/', '#reviews')}
            className="text-slate-200 hover:text-amber-300 transition-colors py-1"
          >
            Reviews
          </button>

          <button
            onClick={() => handleNavClick('/', '#contact')}
            className="text-slate-200 hover:text-amber-300 transition-colors py-1 flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            Contact
          </button>
        </nav>

        {/* Actions (Cart) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Cart Icon */}
          <button
            onClick={() => {
              if (currentPath === '/cart') {
                navigate('/cart');
              } else {
                toggleCart();
              }
            }}
            className="relative p-2.5 rounded-full text-slate-100 hover:text-amber-400 hover:bg-white/5 transition-all focus:outline-none"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-400 text-[#0F2747] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F2747] border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <button
            onClick={() => handleNavClick('/')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('/', '#catalogue')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400"
          >
            Catalogue Collection
          </button>
          <button
            onClick={() => handleNavClick('/cart')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400 flex items-center justify-between"
          >
            <span>Shopping Cart</span>
            {totalItems > 0 && (
              <span className="bg-amber-400 text-[#0F2747] text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} items
              </span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('/', '#about')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400"
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('/', '#reviews')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400"
          >
            Customer Reviews
          </button>
          <button
            onClick={() => handleNavClick('/', '#contact')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-[#F8F9FA] hover:text-amber-400"
          >
            Contact &amp; Location
          </button>
        </div>
      )}
    </header>
  );
};
