import React, { useState, useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/Toast';

import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { AdminPosPage } from './pages/AdminPosPage';

function AppContent() {
  const { products } = useInventory();
  
  // Path state navigation router
  const [currentPath, setCurrentPath] = useState(() => {
    const pathname = window.location.pathname;
    return pathname || '/';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Always scroll to top of page on route change or product selection
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPath, selectedProduct?.id]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (!path.startsWith('/product')) {
      setSelectedProduct(null);
    }
  };

  const showToast = (title, description, type = 'success') => {
    const newToast = {
      id: Date.now().toString(),
      title,
      description,
      type
    };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  // Resolve product from URL if navigated directly or refreshed
  let activeProduct = selectedProduct;
  if (!activeProduct && currentPath.startsWith('/product/')) {
    const productId = currentPath.split('/product/')[1];
    if (productId) {
      activeProduct = products.find((p) => p.id === productId) || null;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-amber-400 selection:text-[#0F2747]">
      {/* Header Bar */}
      <Header currentPath={currentPath} navigate={navigate} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer navigate={navigate} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentPath.startsWith('/product') ? (
          activeProduct ? (
            <ProductDetailPage
              product={activeProduct}
              onBack={() => navigate('/')}
              onSelectProduct={handleSelectProduct}
              onShowToast={showToast}
            />
          ) : (
            <HomePage
              onSelectProduct={handleSelectProduct}
              onShowToast={showToast}
              navigate={navigate}
            />
          )
        ) : currentPath === '/cart' ? (
          <CartPage navigate={navigate} onShowToast={showToast} />
        ) : currentPath.startsWith('/admin') ? (
          <AdminPosPage navigate={navigate} onShowToast={showToast} />
        ) : (
          <HomePage
            onSelectProduct={handleSelectProduct}
            onShowToast={showToast}
            navigate={navigate}
          />
        )}
      </main>

      {/* Footer Bar */}
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </InventoryProvider>
  );
}
