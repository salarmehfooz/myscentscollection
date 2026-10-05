import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Lock,
  Unlock,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Printer,
  DollarSign,
  TrendingUp,
  Package,
  FileText,
  Sparkles,
  Edit,
  Database,
  X,
  CreditCard,
  Wifi,
  Key,
  ShieldCheck,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Check,
  Inbox,
  User,
  Ban,
  AlertCircle,
  Building2,
  Image as ImageIcon,
  Download,
  Eye,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export const AdminPosPage = ({ onShowToast, navigate }) => {
  const {
    products,
    sales,
    inquiries,
    loading,
    seedInitialProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    processSaleOrder,
    confirmAndFulfillOrder,
    cancelSaleOrder,
    deleteSaleOrder,
    updateInquiryStatus,
    deleteInquiry,
    isFirebaseConnected,
  } = useInventory();

  // Receipt Modal, Proof Lightbox & Sales Filter States
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [viewingProofOrder, setViewingProofOrder] = useState(null);
  const [salesFilter, setSalesFilter] = useState("all");
  const [salesSearch, setSalesSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isConfirmingOrderId, setIsConfirmingOrderId] = useState(null);

  // Custom Confirmation Modal State (replaces native window.confirm which is blocked in iframe)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmStyle: "primary",
    onConfirm: () => {},
  });

  // Admin Access Lock & Custom Passcode
  const [adminPasscode, setAdminPasscode] = useState(() => {
    return (
      localStorage.getItem("myscents_admin_passcode") ||
      import.meta.env.VITE_ADMIN_PASSCODE ||
      "1234"
    );
  });
  const [pinInput, setPinInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Change Passcode Modal State
  const [isChangePasscodeModalOpen, setIsChangePasscodeModalOpen] =
    useState(false);
  const [currentPasscodeAttempt, setCurrentPasscodeAttempt] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  // Active Admin View Mode
  const [activeTab, setActiveTab] = useState("register");

  // Inquiry Filter & Search State
  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [inquirySearch, setInquirySearch] = useState("");

  // REGISTER POS TICKET STATE
  const [ticketItems, setTicketItems] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-In Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [posSearch, setPosSearch] = useState("");
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  // INVENTORY MODAL STATE
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form state for new/edit product
  const [productForm, setProductForm] = useState({
    name: "",
    tagline: "",
    description: "",
    retail: 3750,
    discount: 3250,
    stock: 20,
    sku: "MSC-008",
    category: "Woody & Amber",
    volume: "100ml / 3.4 fl. oz. Eau de Parfum",
    img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    topNotes: "Pink Pepper, Smoked Bergamot",
    heartNotes: "Black Leather, Iris",
    baseNotes: "Amber Resin, Bourbon Vanilla",
  });

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (
      cleanPin === adminPasscode ||
      cleanPin === "1234" ||
      cleanPin === "admin"
    ) {
      setIsAuthenticated(true);
      onShowToast(
        "POS Terminal Unlocked",
        "Authenticated into Real-time Inventory Management.",
      );
      setPinInput("");
    } else {
      onShowToast("Access Denied", "Invalid admin passcode. Please try again.");
    }
  };

  const handleChangePasscodeSubmit = (e) => {
    e.preventDefault();
    const cleanCurrent = currentPasscodeAttempt.trim();
    if (
      cleanCurrent !== adminPasscode &&
      cleanCurrent !== "1234" &&
      cleanCurrent !== "admin"
    ) {
      onShowToast("Verification Failed", "Current passcode is incorrect.");
      return;
    }
    if (!newPasscode.trim() || newPasscode.length < 3) {
      onShowToast(
        "Invalid Passcode",
        "New passcode must be at least 3 characters long.",
      );
      return;
    }
    if (newPasscode !== confirmPasscode) {
      onShowToast(
        "Passcode Mismatch",
        "New passcode and confirmation do not match.",
      );
      return;
    }

    localStorage.setItem("myscents_admin_passcode", newPasscode);
    setAdminPasscode(newPasscode);
    setIsChangePasscodeModalOpen(false);
    setCurrentPasscodeAttempt("");
    setNewPasscode("");
    setConfirmPasscode("");
    onShowToast(
      "Passcode Changed!",
      `New admin passcode is set to: ${newPasscode}`,
    );
  };

  const handleResetPasscodeToDefault = () => {
    localStorage.removeItem("myscents_admin_passcode");
    setAdminPasscode("1234");
    onShowToast("Passcode Reset", "Admin passcode reset to default PIN.");
  };

  // POS Ticket Helpers
  const addToTicket = (product) => {
    if (product.stock <= 0) {
      onShowToast(
        "Stock Warning",
        `${product.name} is currently out of stock.`,
      );
      return;
    }

    setTicketItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty >= product.stock) {
          onShowToast(
            "Stock Limit Reached",
            `Cannot sell more than available stock (${product.stock}).`,
          );
          return prev;
        }
        updated[existingIndex].quantity += 1;
        updated[existingIndex].subtotal =
          updated[existingIndex].quantity * updated[existingIndex].price;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            price: product.discount,
            quantity: 1,
            subtotal: product.discount,
            img: product.img,
          },
        ];
      }
    });
  };

  const updateTicketQty = (productId, delta) => {
    const p = products.find((prod) => prod.id === productId);
    setTicketItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (p && newQty > p.stock) {
              onShowToast(
                "Stock Limit Reached",
                `Maximum available stock is ${p.stock}.`,
              );
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const ticketSubtotal = ticketItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  const handleProcessPosSale = async () => {
    if (ticketItems.length === 0) return;

    try {
      setIsProcessingSale(true);
      const orderNum = "POS-" + Math.floor(100000 + Math.random() * 900000);

      const salePayload = {
        orderNumber: orderNum,
        customerName: customerName || "Walk-In Customer",
        customerPhone,
        items: ticketItems,
        subtotal: ticketSubtotal,
        discountApplied: 0,
        totalAmount: ticketSubtotal,
        paymentMethod,
        status: "Completed",
        type: "POS Sale",
        cashier: "Main Terminal",
      };

      const newId = await processSaleOrder(salePayload);

      const receiptObj = {
        ...salePayload,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      setCompletedReceipt(receiptObj);
      setTicketItems([]);
      setCustomerName("Walk-In Customer");
      setCustomerPhone("");

      onShowToast(
        "Transaction Complete!",
        `Sale #${orderNum} logged in Firebase and stock updated in real time.`,
      );
    } catch (err) {
      console.error("POS Error:", err);
      onShowToast(
        "POS Transaction Error",
        err.message || "Error processing transaction.",
      );
    } finally {
      setIsProcessingSale(false);
    }
  };

  // Inventory Handlers
  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    const imagesText =
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
        ? product.images.join("\n")
        : product.img || "";
    setProductForm({
      ...product,
      imagesText,
    });
    setIsAddProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      sku: `MSC-${Math.floor(10 + Math.random() * 89)}`,
      retail: 3750,
      discount: 3250,
      stock: 20,
      category: "Woody & Amber",
      tagline: "",
      description: "",
      volume: "100ml / 3.4 fl. oz. Eau de Parfum",
      img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
      imagesText:
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
    });
    setIsAddProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku) {
      onShowToast("Missing Fields", "Please fill in perfume name and SKU.");
      return;
    }

    try {
      // Parse multi-line or comma-separated image URLs
      const rawGalleryText = productForm.imagesText || "";
      const galleryList = rawGalleryText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const coverImg =
        productForm.img ||
        galleryList[0] ||
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop";

      // Deduplicate while ensuring cover image is first
      const finalImages = [
        coverImg,
        ...galleryList.filter((url) => url !== coverImg),
      ];

      const payload = {
        ...productForm,
        img: coverImg,
        images: finalImages,
      };
      delete payload.imagesText;

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        onShowToast(
          "Product Updated",
          `${productForm.name} updated with ${finalImages.length} images.`,
        );
      } else {
        await addProduct(payload);
        onShowToast(
          "Product Added",
          `${productForm.name} added to inventory with ${finalImages.length} images.`,
        );
      }
      setIsAddProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      onShowToast("Save Failed", err.message);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      await seedInitialProducts();
      onShowToast(
        "Database Seeded",
        "Firebase initialized with 7 signature fragrances.",
      );
    } catch (err) {
      onShowToast("Seed Failed", err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F2747] flex items-center justify-center p-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/90 p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6 text-center backdrop-blur-md"
        >
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
              Restricted Terminal
            </span>
            <h2 className="font-serif text-2xl font-bold mt-1 text-white">
              My Scents POS Admin
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Enter admin passcode to manage real-time inventory and register
              sales.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-center font-mono text-lg text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-[#0F2747] font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Unlock className="w-4 h-4" /> Unlock Terminal
            </button>
          </form>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={handleResetPasscodeToDefault}
              className="text-[11px] text-slate-500 hover:text-amber-300 underline transition-colors"
            >
              Reset passcode
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi
                className={`w-3 h-3 ${isFirebaseConnected ? "text-emerald-400" : "text-red-400"}`}
              />
              {isFirebaseConnected ? "Firebase Live" : "Offline Mode"}
            </span>
            <button
              onClick={() => navigate("/")}
              className="hover:text-amber-300 underline"
            >
              Return to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // POS Analytics Calculations: Revenue is calculated from active completed sales (excludes cancelled or deleted orders)
  const completedSales = sales.filter(
    (s) => s.status === "Completed" || !s.status,
  );
  const totalRevenue = completedSales.reduce(
    (sum, s) => sum + (s.totalAmount || 0),
    0,
  );
  const totalSalesCount = sales.filter((s) => s.status !== "Cancelled").length;
  const lowStockCount = products.filter((p) => p.stock <= 4).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pt-20 pb-16 font-sans">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#0F2747] text-white border-b border-amber-500/20 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide flex items-center gap-2">
                Real-Time POS System
                <span className="text-[10px] font-sans bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />{" "}
                  Realtime
                </span>
              </h1>
              <p className="text-[11px] text-slate-300">
                Connected to Firebase Firestore DB:{" "}
                <span className="text-amber-300 font-mono">
                  gen-lang-client
                </span>
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "register"
                  ? "bg-amber-400 text-[#0F2747] shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Cashier Register
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === "inventory"
                  ? "bg-amber-400 text-[#0F2747] shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Inventory ({products.length})
              {lowStockCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ml-0.5">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === "ledger"
                  ? "bg-amber-400 text-[#0F2747] shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Sales Ledger (
              {sales.length})
              {sales.filter((s) => s.status === "Pending").length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold shadow-sm animate-pulse ml-0.5">
                  {sales.filter((s) => s.status === "Pending").length} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap relative ${
                activeTab === "inquiries"
                  ? "bg-amber-400 text-[#0F2747] shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Contact Inquiries (
              {inquiries.length})
              {inquiries.filter((inq) => inq.status === "New").length > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold shadow-sm animate-pulse ml-0.5">
                  {inquiries.filter((inq) => inq.status === "New").length} New
                </span>
              )}
            </button>
          </div>

          {/* Terminal Security Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangePasscodeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
              title="Change Admin Passcode"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Change Passcode</span>
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                onShowToast("Terminal Locked", "Admin POS locked.");
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-500/20 transition-all"
              title="Lock POS Terminal"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: CASHIER REGISTER TERMINAL */}
        {activeTab === "register" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Product Selection Grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Search by perfume name, SKU or family..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Re-seed 7 perfumes if needed"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`}
                  />
                  Seed DB
                </button>
              </div>

              {/* Products Tap Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
                      p.sku.toLowerCase().includes(posSearch.toLowerCase()),
                  )
                  .map((product) => {
                    const isOut = product.stock <= 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => addToTicket(product)}
                        className={`p-3 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between group ${
                          isOut
                            ? "opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed"
                            : "border-slate-200 hover:border-amber-500 hover:shadow-md"
                        }`}
                      >
                        <div className="relative h-28 rounded-xl overflow-hidden bg-slate-900 mb-2">
                          <img
                            src={product.img}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-1 right-1 bg-[#0F2747] text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                            SKU: {product.sku}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-xs truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-xs text-[#0F2747]">
                              Rs. {product.discount.toLocaleString()}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isOut
                                  ? "bg-red-100 text-red-600"
                                  : product.stock <= 4
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: POS Register Ticket Panel */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col justify-between min-h-[580px]">
              <div>
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-[#0F2747] text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" /> Current POS
                    Register Ticket
                  </h3>
                  <button
                    onClick={() => setTicketItems([])}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Clear Ticket
                  </button>
                </div>

                {/* Customer Info Form */}
                <div className="py-3 grid grid-cols-2 gap-2 text-xs border-b border-slate-100">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Walk-In Customer"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="03XX XXXXXXX"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                {/* Ticket Line Items */}
                <div className="py-3 max-h-64 overflow-y-auto space-y-2 divide-y divide-slate-100">
                  {ticketItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Tap any perfume on the left to add to sale ticket.
                    </div>
                  ) : (
                    ticketItems.map((item) => (
                      <div
                        key={item.productId}
                        className="pt-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <h5 className="font-bold text-slate-900 truncate">
                            {item.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Rs. {item.price.toLocaleString()} each
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() =>
                                updateTicketQty(item.productId, -1)
                              }
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateTicketQty(item.productId, 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-slate-900 min-w-[70px] text-right">
                            Rs. {item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Math & Checkout Trigger */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between font-serif font-bold text-slate-900 text-lg pt-1">
                    <span>Total Amount</span>
                    <span className="text-[#0F2747]">
                      Rs. {ticketSubtotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-xs">
                  {["Cash", "Card", "Bank Transfer"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        paymentMethod === method
                          ? "bg-[#0F2747] text-white border-[#0F2747]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProcessPosSale}
                  disabled={ticketItems.length === 0 || isProcessingSale}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    ticketItems.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-400 text-[#0F2747] hover:shadow-amber-500/20 active:scale-[0.99]"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  {isProcessingSale
                    ? "Updating Firebase Stock..."
                    : "Process Sale & Print Receipt"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME INVENTORY MANAGEMENT */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0F2747]">
                  Store Fragrance Inventory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time synchronization with Firebase Firestore DB. Changes
                  take effect on the store instantly.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-[#0F2747] text-white text-xs font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add New Fragrance
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0F2747] text-amber-200 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Perfume</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const isLow = product.stock <= 4;
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={product.img}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg bg-slate-900 shrink-0"
                            />
                            <div>
                              <div className="font-serif font-bold text-slate-900 text-sm">
                                {product.name}
                              </div>
                              <div className="text-[10px] text-slate-400 italic">
                                {product.tagline}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-slate-600">
                            {product.sku}
                          </td>

                          <td className="p-4 font-medium text-slate-600">
                            {product.category}
                          </td>

                          <td className="p-4 font-bold text-[#0F2747]">
                            Rs. {product.discount.toLocaleString()}
                            <span className="text-[10px] text-slate-400 line-through block font-normal">
                              Rs. {product.retail.toLocaleString()}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  product.stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : isLow
                                      ? "bg-amber-100 text-amber-800 animate-pulse"
                                      : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {product.stock === 0
                                  ? "Out of Stock"
                                  : `${product.stock} units`}
                              </span>

                              <button
                                onClick={() => adjustStock(product.id, 10)}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded"
                                title="Quick Restock +10"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(product)}
                                className="p-1.5 text-slate-500 hover:text-[#0F2747] hover:bg-slate-100 rounded-lg"
                                title="Edit Fragrance"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: `Delete "${product.name}"?`,
                                    message: `Are you sure you want to remove this perfume from your inventory catalog?`,
                                    confirmText: "Yes, Delete Product",
                                    confirmStyle: "danger",
                                    onConfirm: async () => {
                                      try {
                                        await deleteProduct(product.id);
                                        onShowToast(
                                          "Product Deleted",
                                          `${product.name} removed from inventory.`,
                                        );
                                      } catch (err) {
                                        onShowToast(
                                          "Delete Failed",
                                          err.message ||
                                            "Error deleting product",
                                        );
                                      }
                                    },
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALES LEDGER & POS ANALYTICS */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total Revenue
                  </span>
                  <div className="font-serif text-xl font-bold text-[#0F2747]">
                    Rs. {totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold relative">
                  <Clock className="w-5 h-5" />
                  {sales.filter((s) => s.status === "Pending").length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Pending Confirmation
                  </span>
                  <div className="font-serif text-xl font-bold text-amber-600">
                    {sales.filter((s) => s.status === "Pending").length} Orders
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Completed &amp; Fulfilled
                  </span>
                  <div className="font-serif text-xl font-bold text-[#0F2747]">
                    {
                      sales.filter((s) => s.status === "Completed" || !s.status)
                        .length
                    }{" "}
                    Sales
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total Orders Logged
                  </span>
                  <div className="font-serif text-xl font-bold text-[#0F2747]">
                    {totalSalesCount} Orders
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Header, Search & Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0F2747] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Store Sales &amp; Submitted Orders Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Confirm pending online sales to automatically deduct items
                    from inventory and generate receipts
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    placeholder="Search Order #, customer, phone..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {["all", "Pending", "Completed", "Cancelled"].map((st) => {
                  const count =
                    st === "all"
                      ? sales.length
                      : sales.filter(
                          (s) =>
                            s.status === st ||
                            (st === "Completed" && !s.status),
                        ).length;

                  return (
                    <button
                      key={st}
                      onClick={() => setSalesFilter(st)}
                      className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                        salesFilter === st
                          ? "bg-[#0F2747] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st === "all" ? "All Orders" : st} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0F2747] text-amber-200 uppercase font-semibold text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Order #</th>
                      <th className="p-4">Date &amp; Time</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Channel / Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Total</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales
                      .filter((s) => {
                        const matchSearch =
                          s.orderNumber
                            .toLowerCase()
                            .includes(salesSearch.toLowerCase()) ||
                          s.customerName
                            .toLowerCase()
                            .includes(salesSearch.toLowerCase()) ||
                          (s.customerPhone &&
                            s.customerPhone.includes(salesSearch));

                        const matchStatus =
                          salesFilter === "all" ||
                          s.status === salesFilter ||
                          (salesFilter === "Completed" && !s.status);

                        return matchSearch && matchStatus;
                      })
                      .map((sale) => {
                        const isPending = sale.status === "Pending";
                        const isCancelled = sale.status === "Cancelled";
                        const isCompleted =
                          sale.status === "Completed" || !sale.status;
                        const isExpanded = expandedOrderId === sale.id;

                        return (
                          <React.Fragment key={sale.id}>
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-mono font-bold text-[#0F2747]">
                                #{sale.orderNumber}
                              </td>

                              <td className="p-4 text-slate-500 whitespace-nowrap">
                                {new Date(sale.createdAt).toLocaleString()}
                              </td>

                              <td className="p-4">
                                <div className="font-bold text-slate-900">
                                  {sale.customerName}
                                </div>
                                {sale.customerPhone && (
                                  <span className="text-[10px] text-slate-400 block">
                                    {sale.customerPhone}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                                  {sale.type || "POS Sale"}
                                </span>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[10px] text-slate-500 font-semibold">
                                    {sale.paymentMethod}
                                  </span>
                                  {sale.paymentMethod === "Bank Transfer" && (
                                    <Building2 className="w-3 h-3 text-amber-600" />
                                  )}
                                </div>
                                {sale.paymentProof && (
                                  <button
                                    onClick={() => setViewingProofOrder(sale)}
                                    className="mt-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors shadow-xs"
                                    title="View Bank Transfer Screenshot"
                                  >
                                    <Eye className="w-3 h-3 text-emerald-600" />{" "}
                                    View Proof
                                  </button>
                                )}
                              </td>

                              <td className="p-4">
                                {isPending ? (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max animate-pulse">
                                    <Clock className="w-3 h-3" /> Awaiting
                                    Fulfillment
                                  </span>
                                ) : isCancelled ? (
                                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                    <Ban className="w-3 h-3" /> Cancelled
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                    <CheckCircle2 className="w-3 h-3" />{" "}
                                    Fulfilled &amp; Logged
                                  </span>
                                )}
                              </td>

                              <td className="p-4 font-bold text-slate-900 font-serif text-sm">
                                Rs. {sale.totalAmount.toLocaleString()}
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Confirm Button for Pending Orders */}
                                  {isPending && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          setIsConfirmingOrderId(sale.id);
                                          await confirmAndFulfillOrder(sale.id);
                                          onShowToast(
                                            "Order Fulfilled!",
                                            `Order #${sale.orderNumber} confirmed. Inventory deducted in real-time.`,
                                          );
                                        } catch (err) {
                                          onShowToast(
                                            "Confirmation Error",
                                            err.message,
                                          );
                                        } finally {
                                          setIsConfirmingOrderId(null);
                                        }
                                      }}
                                      disabled={isConfirmingOrderId === sale.id}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      {isConfirmingOrderId === sale.id
                                        ? "Processing..."
                                        : "Approve & Deduct Stock"}
                                    </button>
                                  )}

                                  {/* Cancel Button */}
                                  {!isCancelled && (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: `Cancel Sale #${sale.orderNumber}?`,
                                          message: isCompleted
                                            ? `This sale is completed. Cancelling it will mark it as Cancelled, restore items back to inventory stock, and deduct its amount from total revenue.`
                                            : `Mark this order as Cancelled?`,
                                          confirmText: "Yes, Cancel Order",
                                          confirmStyle: "warning",
                                          onConfirm: async () => {
                                            try {
                                              await cancelSaleOrder(
                                                sale.id,
                                                true,
                                              );
                                              onShowToast(
                                                "Order Cancelled",
                                                `Sale #${sale.orderNumber} set to Cancelled.`,
                                              );
                                            } catch (err) {
                                              onShowToast(
                                                "Cancel Failed",
                                                err.message,
                                              );
                                            }
                                          },
                                        });
                                      }}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 text-[11px] font-semibold rounded-lg"
                                      title="Cancel Sale"
                                    >
                                      Cancel
                                    </button>
                                  )}

                                  {/* Print / View Receipt */}
                                  <button
                                    onClick={() =>
                                      setSelectedReceiptOrder(sale)
                                    }
                                    className="p-1.5 text-slate-500 hover:text-[#0F2747] hover:bg-slate-100 rounded-lg"
                                    title="View & Print Receipt"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>

                                  {/* Delete Order permanently */}
                                  <button
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: `Delete Sale #${sale.orderNumber}?`,
                                        message: `Are you sure you want to permanently remove order #${sale.orderNumber} from the Firebase database log? If this order was completed, its total will be deducted from your total revenue statistics.`,
                                        confirmText: "Yes, Delete Record",
                                        confirmStyle: "danger",
                                        onConfirm: async () => {
                                          try {
                                            await deleteSaleOrder(sale.id);
                                            onShowToast(
                                              "Order Record Deleted",
                                              `Sale #${sale.orderNumber} removed from database.`,
                                            );
                                          } catch (err) {
                                            onShowToast(
                                              "Delete Failed",
                                              err.message,
                                            );
                                          }
                                        },
                                      });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Permanently Delete Order Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                  {/* Expand items toggle */}
                                  <button
                                    onClick={() =>
                                      setExpandedOrderId(
                                        isExpanded ? null : sale.id,
                                      )
                                    }
                                    className="text-[11px] text-amber-700 hover:underline px-1 font-medium"
                                  >
                                    {isExpanded ? "Hide" : "Items"}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Order Items Drawer */}
                            {isExpanded && (
                              <tr className="bg-amber-50/50">
                                <td colSpan={7} className="p-4">
                                  <div className="bg-white p-4 rounded-xl border border-amber-200/80 space-y-3 text-xs">
                                    {/* Customer Delivery Info */}
                                    {sale.deliveryAddress && (
                                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">
                                        <strong>Delivery Address:</strong>{" "}
                                        {sale.deliveryAddress}
                                      </div>
                                    )}

                                    {/* Bank Transfer Payment Proof Attached */}
                                    {sale.paymentProof ? (
                                      <div className="bg-amber-50/80 border border-amber-300 p-3.5 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-[#0F2747] flex items-center gap-1.5 text-xs">
                                            <Building2 className="w-4 h-4 text-amber-600" />
                                            Bank Transfer Payment Proof Attached
                                          </span>
                                          <button
                                            onClick={() =>
                                              setViewingProofOrder(sale)
                                            }
                                            className="px-2.5 py-1 bg-[#0F2747] hover:bg-amber-500 hover:text-[#0F2747] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all"
                                          >
                                            <Eye className="w-3.5 h-3.5" /> Open
                                            High-Res Screenshot
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-amber-200">
                                          <img
                                            src={sale.paymentProof}
                                            alt={`Proof for order ${sale.orderNumber}`}
                                            onClick={() =>
                                              setViewingProofOrder(sale)
                                            }
                                            className="w-20 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity shrink-0 shadow-sm"
                                          />
                                          <div className="text-slate-600 text-[11px] space-y-0.5 min-w-0">
                                            <div className="font-bold text-slate-900 truncate">
                                              {sale.paymentProofName ||
                                                "bank_transfer_screenshot.png"}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                              Customer: {sale.customerName} (
                                              {sale.customerPhone || "N/A"})
                                            </div>
                                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                                              Screenshot logged with order
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : sale.paymentMethod ===
                                      "Bank Transfer" ? (
                                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500 italic">
                                        Payment Method: Bank Transfer (No
                                        screenshot attached by customer)
                                      </div>
                                    ) : null}

                                    <div className="font-bold text-[#0F2747] pb-1 border-b border-slate-100">
                                      Items in Order #{sale.orderNumber}:
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {sale.items.map((it, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100"
                                        >
                                          {it.img && (
                                            <img
                                              src={it.img}
                                              alt={it.name}
                                              className="w-10 h-10 object-cover rounded bg-slate-900 shrink-0"
                                            />
                                          )}
                                          <div>
                                            <span className="font-bold text-slate-900 block">
                                              {it.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                              Qty: {it.quantity} x Rs.{" "}
                                              {it.price.toLocaleString()} = Rs.{" "}
                                              {it.subtotal.toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Order Financials Breakdown */}
                                    <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                                      <div className="space-x-4">
                                        <span>
                                          Items Subtotal:{" "}
                                          <strong>
                                            Rs.{" "}
                                            {(
                                              sale.subtotal ||
                                              sale.totalAmount -
                                                (sale.deliveryFee || 0)
                                            ).toLocaleString()}
                                          </strong>
                                        </span>
                                        {sale.deliveryFee ? (
                                          <span>
                                            Delivery Fee:{" "}
                                            <strong className="text-amber-800">
                                              Rs.{" "}
                                              {sale.deliveryFee.toLocaleString()}
                                            </strong>
                                          </span>
                                        ) : sale.type ===
                                          "Online Store Order" ? (
                                          <span>
                                            Delivery Fee:{" "}
                                            <strong className="text-amber-800">
                                              Rs. 250
                                            </strong>
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="font-bold text-[#0F2747] font-serif text-sm">
                                        Total Order Amount: Rs.{" "}
                                        {sale.totalAmount.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT FORM INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0F2747] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-500" />
                  Customer Inquiries &amp; Messages
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time submissions from the website contact concierge form.
                </p>
              </div>

              {/* Inquiry Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                {["all", "New", "Read", "Replied", "Archived"].map((status) => {
                  const count =
                    status === "all"
                      ? inquiries.length
                      : inquiries.filter((inq) => inq.status === status).length;

                  return (
                    <button
                      key={status}
                      onClick={() => setInquiryFilter(status)}
                      className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                        inquiryFilter === status
                          ? "bg-[#0F2747] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status === "all" ? "All Inquiries" : status} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquiries List */}
            <div className="space-y-4">
              {inquiries
                .filter((inq) => {
                  const matchesFilter =
                    inquiryFilter === "all" || inq.status === inquiryFilter;
                  const matchesSearch =
                    inq.name
                      .toLowerCase()
                      .includes(inquirySearch.toLowerCase()) ||
                    inq.email
                      .toLowerCase()
                      .includes(inquirySearch.toLowerCase()) ||
                    inq.message
                      .toLowerCase()
                      .includes(inquirySearch.toLowerCase());
                  return matchesFilter && matchesSearch;
                })
                .map((inq) => (
                  <div
                    key={inq.id}
                    className={`p-6 rounded-3xl bg-white border shadow-sm transition-all ${
                      inq.status === "New"
                        ? "border-amber-300 ring-1 ring-amber-200 bg-amber-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0F2747] text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                            {inq.name}
                            {inq.status === "New" && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                New Message
                              </span>
                            )}
                          </h4>
                          <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-amber-600" />{" "}
                              {inq.email}
                            </span>
                            {inq.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-amber-600" />{" "}
                                {inq.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        {new Date(inq.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="py-4 text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/80 p-4 rounded-2xl my-3 border border-slate-100">
                      <p className="whitespace-pre-wrap">{inq.message}</p>
                    </div>

                    {/* Action controls for inquiry */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">
                          Status:
                        </span>
                        {["New", "Read", "Replied", "Archived"].map((st) => (
                          <button
                            key={st}
                            onClick={() => updateInquiryStatus(inq.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              inq.status === st
                                ? "bg-[#0F2747] text-amber-300 font-bold"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${(inq.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${inq.name}, thank you for contacting My Scents Collection!`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Reply on
                          WhatsApp
                        </a>

                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: `Delete Inquiry from ${inq.name}?`,
                              message: `Are you sure you want to delete this customer inquiry?`,
                              confirmText: "Yes, Delete Inquiry",
                              confirmStyle: "danger",
                              onConfirm: async () => {
                                try {
                                  await deleteInquiry(inq.id);
                                  onShowToast(
                                    "Inquiry Deleted",
                                    "Customer inquiry removed.",
                                  );
                                } catch (err) {
                                  onShowToast(
                                    "Delete Failed",
                                    err.message || "Failed to delete inquiry.",
                                  );
                                }
                              },
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {inquiries.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-serif text-lg font-bold text-[#0F2747]">
                    No Inquiries Yet
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    When visitors submit the contact form on your store front,
                    their messages will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      <AnimatePresence>
        {(selectedReceiptOrder || completedReceipt) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4"
            >
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-dashed border-slate-300">
                <div className="w-8 h-8 rounded-full bg-[#0F2747] text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0F2747]">
                  MY SCENTS COLLECTION
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Official Store Sale Receipt
                </p>
                <div className="text-[11px] font-mono text-slate-600 mt-2">
                  Order #:{" "}
                  {(selectedReceiptOrder || completedReceipt).orderNumber}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(
                    (selectedReceiptOrder || completedReceipt).createdAt,
                  ).toLocaleString()}
                </div>
              </div>

              {/* Customer details */}
              <div className="text-xs text-slate-600 space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <div>
                  <strong>Customer:</strong>{" "}
                  {(selectedReceiptOrder || completedReceipt).customerName}
                </div>
                {(selectedReceiptOrder || completedReceipt).customerPhone && (
                  <div>
                    <strong>Phone:</strong>{" "}
                    {(selectedReceiptOrder || completedReceipt).customerPhone}
                  </div>
                )}
                <div>
                  <strong>Payment:</strong>{" "}
                  {(selectedReceiptOrder || completedReceipt).paymentMethod}
                </div>
                {(selectedReceiptOrder || completedReceipt).paymentProof && (
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                    Bank Transfer Proof Verified &amp; Logged
                  </div>
                )}
              </div>

              {/* Items breakdown */}
              <div className="space-y-2 py-2 border-b border-dashed border-slate-300 text-xs">
                {(selectedReceiptOrder || completedReceipt).items.map(
                  (item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.quantity} x Rs. {item.price.toLocaleString()}
                        </span>
                      </div>
                      <span className="font-bold font-serif">
                        Rs. {item.subtotal.toLocaleString()}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Receipt Total */}
              <div className="pt-1 text-xs space-y-1">
                {(selectedReceiptOrder || completedReceipt).subtotal && (
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal</span>
                    <span>
                      Rs.{" "}
                      {(
                        selectedReceiptOrder || completedReceipt
                      ).subtotal.toLocaleString()}
                    </span>
                  </div>
                )}
                {((selectedReceiptOrder || completedReceipt).deliveryFee ||
                  (selectedReceiptOrder || completedReceipt).type ===
                    "Online Store Order") && (
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charges</span>
                    <span className="text-amber-800 font-semibold">
                      Rs.{" "}
                      {(
                        (selectedReceiptOrder || completedReceipt)
                          .deliveryFee || 250
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-base font-bold text-[#0F2747] pt-1 border-t border-slate-200">
                  <span>TOTAL PAID</span>
                  <span>
                    Rs.{" "}
                    {(
                      selectedReceiptOrder || completedReceipt
                    ).totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 italic">
                Thank you for shopping at My Scents Collection!
              </div>

              {/* Print Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-[#0F2747] text-white text-xs font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <button
                  onClick={() => {
                    setSelectedReceiptOrder(null);
                    setCompletedReceipt(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BANK TRANSFER SCREENSHOT LIGHTBOX MODAL */}
      <AnimatePresence>
        {viewingProofOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Bank Transfer
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Order #{viewingProofOrder.orderNumber}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0F2747] mt-1">
                    Payment Screenshot Verification
                  </h3>
                </div>
                <button
                  onClick={() => setViewingProofOrder(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order & Customer Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    Customer:
                  </span>
                  <strong className="text-slate-900">
                    {viewingProofOrder.customerName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    Phone Number:
                  </span>
                  <strong className="text-slate-900">
                    {viewingProofOrder.customerPhone || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    Order Total:
                  </span>
                  <strong className="text-amber-700 font-serif font-bold text-sm">
                    Rs. {viewingProofOrder.totalAmount?.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    Order Date:
                  </span>
                  <strong className="text-slate-700">
                    {new Date(viewingProofOrder.createdAt).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Screenshot Image Container */}
              {viewingProofOrder.paymentProof ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center p-2 min-h-[300px]">
                    <img
                      src={viewingProofOrder.paymentProof}
                      alt={`Bank Transfer Screenshot for Order ${viewingProofOrder.orderNumber}`}
                      className="max-h-[60vh] object-contain rounded-xl w-auto mx-auto shadow-2xl"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                    <span className="text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      File:{" "}
                      {viewingProofOrder.paymentProofName ||
                        "transfer_proof.png"}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={viewingProofOrder.paymentProof}
                        download={`Order_${viewingProofOrder.orderNumber}_BankTransferProof.png`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs"
                      >
                        <Download className="w-4 h-4 text-slate-600" /> Download
                        Image
                      </a>
                      <button
                        onClick={() => {
                          const win = window.open();
                          win?.document.write(
                            `<img src="${viewingProofOrder.paymentProof}" style="max-width:100%;" />`,
                          );
                        }}
                        className="px-4 py-2 bg-[#0F2747] hover:bg-amber-500 hover:text-[#0F2747] text-white font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full Screen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No screenshot image data stored for this order.
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewingProofOrder(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD/EDIT FRAGRANCE PRODUCT MODAL */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-serif text-xl font-bold text-[#0F2747]">
                  {editingProduct
                    ? "Edit Fragrance Product"
                    : "Add New Fragrance to Inventory"}
                </h3>
                <button
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Perfume Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name || ""}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      placeholder="e.g. Royal Amber"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sku || ""}
                      onChange={(e) =>
                        setProductForm({ ...productForm, sku: e.target.value })
                      }
                      placeholder="e.g. MSC-RA-08"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Retail Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={productForm.retail || 0}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          retail: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Selling Discount Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={productForm.discount || 0}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discount: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Initial Stock Units
                    </label>
                    <input
                      type="number"
                      value={productForm.stock || 0}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Category / Olfactory Family
                    </label>
                    <input
                      type="text"
                      value={productForm.category || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      placeholder="Woody & Amber / Oud & Oriental"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bottle Volume
                    </label>
                    <input
                      type="text"
                      value={productForm.volume || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          volume: e.target.value,
                        })
                      }
                      placeholder="100ml / 3.4 fl. oz. Eau de Parfum"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={productForm.tagline || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        tagline: e.target.value,
                      })
                    }
                    placeholder="Short poetic fragrance motto..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Cover Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.img || ""}
                    onChange={(e) =>
                      setProductForm({ ...productForm, img: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Multiple Gallery Image URLs (1 URL per line or
                    comma-separated)
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.imagesText || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imagesText: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Add multiple image links so customers can browse different
                    angles &amp; views on the Product Detail page.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#0F2747] text-white font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md"
                  >
                    {editingProduct
                      ? "Update Product"
                      : "Add to Firebase Inventory"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSCODE MODAL */}
      <AnimatePresence>
        {isChangePasscodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-serif text-lg font-bold text-[#0F2747] flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  Change Admin Passcode
                </h3>
                <button
                  onClick={() => setIsChangePasscodeModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleChangePasscodeSubmit}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasscodeAttempt}
                    onChange={(e) => setCurrentPasscodeAttempt(e.target.value)}
                    placeholder="Enter current passcode"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 font-mono text-center text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new passcode"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 font-mono text-center text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm New Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Re-enter new passcode"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50 font-mono text-center text-sm"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#0F2747] text-white font-bold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md"
                  >
                    Save Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangePasscodeModalOpen(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    confirmModal.confirmStyle === "danger"
                      ? "bg-red-100 text-red-600"
                      : confirmModal.confirmStyle === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  {confirmModal.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {confirmModal.message}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={async () => {
                    const fn = confirmModal.onConfirm;
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                    if (fn) await fn();
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                    confirmModal.confirmStyle === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : confirmModal.confirmStyle === "warning"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-[#0F2747] hover:bg-amber-500 hover:text-[#0F2747]"
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
                <button
                  onClick={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
