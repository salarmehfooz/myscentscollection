import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Search,
  Gem,
  Clock,
  PackageOpen,
  Crown,
  Star,
  MapPin,
  Phone,
  Mail,
  Send,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useInventory } from "../context/InventoryContext";

export const HomePage = ({ onSelectProduct, onShowToast, navigate }) => {
  const {
    products,
    loading,
    seedInitialProducts,
    isFirebaseConnected,
    submitInquiry,
  } = useInventory();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Categories extraction
  const categories = [
    "All",
    "Woody & Amber",
    "Oud & Oriental",
    "Fresh & Aquatic",
    "Floral Gourmand",
    "Warm Gourmand",
  ];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      p.category.toLowerCase() === activeCategory.toLowerCase();

    let matchesPrice = true;
    if (priceFilter === "under3000") matchesPrice = p.discount < 3000;
    if (priceFilter === "over3000") matchesPrice = p.discount >= 3000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedInitialProducts();
      onShowToast(
        "Database Seeded!",
        "Successfully populated Firebase with 7 signature perfumes.",
      );
    } catch (e) {
      onShowToast("Seeding Error", e.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      onShowToast(
        "Incomplete Form",
        "Please fill in your name, email, and message.",
      );
      return;
    }
    try {
      setIsSubmittingInquiry(true);
      await submitInquiry({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        subject: "General Perfume Inquiry",
      });
      setContactSuccess(true);
      setContactForm({ name: "", email: "", phone: "", message: "" });
      onShowToast(
        "Message Sent to Admin!",
        "Thank you for reaching out. Our concierge & store admin have received your message.",
      );
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      onShowToast("Error Sending Message", err.message || "Please try again.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans pt-16">
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-slate-950 overflow-hidden text-white">
        {/* Background Overlay with Unsplash Luxury Perfume Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="hero.webp"
            alt="Luxury Fragrance Atmosphere"
            className="w-full h-full object-cover object-center opacity-40 scale-105 filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2747] via-[#0F2747]/90 to-transparent" />
          <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Luxury
              Fragrance House
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              My{" "}
              <em className="not-italic text-amber-400 font-serif">Scents</em>{" "}
              Collection
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Luxury fragrances crafted for unforgettable moments.
              Hand-compounded Extrait De Parfum with exceptional sillage and
              longevity.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  document
                    .getElementById("catalogue")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-[#0F2747] text-sm font-bold shadow-xl hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-3.5 rounded-full border border-slate-400/50 hover:border-amber-400 text-white text-sm font-semibold hover:bg-white/10 transition-all"
              >
                Our Heritage
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US CARDS */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-widest uppercase">
              The Scents Difference
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0F2747] mt-1">
              Why Choose Us
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Four reasons our fragrances become part of your everyday story.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#0F2747] text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0F2747]">
                Premium Ingredients
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Carefully sourced rare oils blended for a refined, long-lasting
                signature scent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#0F2747] text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0F2747]">
                12+ Hour Longevity
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Formulated at 30% concentration to stay with you from morning
                meetings to evening moments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#0F2747] text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                <PackageOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0F2747]">
                Keepsake Packaging
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Every heavy glass bottle is presented as a keepsake, worthy of
                the liquid gold inside.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-full bg-[#0F2747] text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#0F2747]">
                Affordable Luxury
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Niche luxury perfume experiences priced directly to make luxury
                accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE SECTION */}
      <section
        id="catalogue"
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-amber-600 tracking-widest uppercase">
            Signature Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F2747] mt-1">
            Our Perfume Catalogue
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Explore our signature handcrafted luxury fragrances available
            directly from our boutique.
          </p>
        </div>

        {/* Empty State / Database Seed Banner if no products in Firestore */}
        {!loading && products.length === 0 && (
          <div className="mb-10 p-8 rounded-3xl bg-amber-500/10 border-2 border-dashed border-amber-400 text-center max-w-xl mx-auto">
            <Database className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#0F2747]">
              Firebase Inventory is Empty
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              Click below to seed the database with the 7 signature perfumes and
              live initial inventory.
            </p>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-6 py-2.5 rounded-full bg-[#0F2747] text-amber-400 text-xs font-bold hover:bg-amber-500 hover:text-[#0F2747] transition-all shadow-md inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />{" "}
              {isSeeding ? "Seeding Database..." : "Seed 7 Signature Products"}
            </button>
          </div>
        )}

        {/* Controls Bar: Search & Category Filter Pills */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by perfume name or notes..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800"
              />
            </div>

            {/* Price Filter Options */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Price:
              </span>
              <button
                onClick={() => setPriceFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  priceFilter === "all"
                    ? "bg-[#0F2747] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Prices
              </button>
              <button
                onClick={() => setPriceFilter("under3000")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  priceFilter === "under3000"
                    ? "bg-[#0F2747] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Under Rs. 3,000
              </button>
              <button
                onClick={() => setPriceFilter("over3000")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  priceFilter === "over3000"
                    ? "bg-[#0F2747] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Rs. 3,000 &amp; Above
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-amber-500 text-[#0F2747] font-bold shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-slate-500 text-sm">
              No perfumes found matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
                setPriceFilter("all");
              }}
              className="mt-4 px-4 py-2 bg-[#0F2747] text-white text-xs font-semibold rounded-full hover:bg-amber-500 hover:text-[#0F2747] transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id || product.sku || product.name || idx}
                product={product}
                onSelectProduct={onSelectProduct}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* ABOUT / HERITAGE SECTION */}
      <section
        id="about"
        className="py-20 bg-[#0F2747] text-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold text-amber-400 tracking-widest uppercase">
                Our Story
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                Crafting Signature Aromas For The Discerning Individual
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                My Scents Collection is a fragrance brand created to celebrate
                individuality and self-expression through scents designed for
                every gender. We believe perfume is more than a finishing touch
                — it is a reflection of your personality, confidence, and
                personal style. Our mission is to craft high-quality, elegant
                fragrances that empower you to feel confident, stylish, and
                effortlessly sophisticated in every moment of your life. With
                carefully curated notes and timeless compositions, we aim to
                create perfumes that become a true extension of who you are,
                allowing you to make a lasting impression while feeling
                authentically yourself.
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Our mission is to bring high-end artisanal perfumery to
                fragrance lovers without luxury retail markups.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-serif font-bold text-amber-400">
                    7+
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Signature Formulations
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-serif font-bold text-amber-400">
                    1,000+
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Delighted Customers
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20">
                <img
                  src="hero.webp"
                  alt="Crafting Perfumes"
                  className="w-full h-90 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-amber-600 tracking-widest uppercase">
              Customer Love
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0F2747] mt-1">
              What Fragrance Lovers Say
            </h2>

            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              <span className="font-serif text-xl font-bold text-[#0F2747]">
                4.9 / 5.0
              </span>
              <span className="text-xs text-slate-500">
                (1,000+ Verified Reviews)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 shadow-sm relative">
              <div className="flex text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "Dark Flame is absolute perfection. I get compliments everywhere
                I go. Sillage easily lasts past 12 hours!"
              </p>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                <span className="font-bold text-[#0F2747]">Ayesha K.</span>
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 shadow-sm relative">
              <div className="flex text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "Oud Al Qalb has the rich, authenticCambodi oud aroma that
                usually costs 10x more. Magnificent presentation!"
              </p>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                <span className="font-bold text-[#0F2747]">Ahmed R.</span>
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 shadow-sm relative">
              <div className="flex text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                "Delivery was super fast and the packaging is gorgeous. Sultan
                is my new staple signature scent."
              </p>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
                <span className="font-bold text-[#0F2747]">Sarah M.</span>
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="py-20 bg-[#F8F9FA] border-t border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-semibold text-amber-600 tracking-widest uppercase">
                Get In Touch
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#0F2747] mt-1 mb-6">
                Contact Our Fragrance Concierge
              </h2>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Direct Phone &amp; WhatsApp
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      +92 335 7117111
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Email Inquiry
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      myscentscollection01@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
              <h3 className="font-serif text-xl font-bold text-[#0F2747] mb-4">
                Send Us a Message
              </h3>

              {contactSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Thank you! Your message has been received. Our concierge will
                  get back to you shortly.
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      placeholder="e.g. Ayesha Khan"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="you@example.com"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+92 3XX XXXXXXX"
                        className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Tell us what you are looking for..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0F2747] text-white font-semibold rounded-xl hover:bg-amber-500 hover:text-[#0F2747] transition-all flex items-center justify-center gap-2 text-xs shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
