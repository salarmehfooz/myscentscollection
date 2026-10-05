import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  Store,
  Heart,
} from "lucide-react";

export const Footer = ({ navigate }) => {
  const [secretClicks, setSecretClicks] = useState(0);

  const handleSecretClick = () => {
    setSecretClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        navigate("/admin");
        return 0;
      }
      return next;
    });

    setTimeout(() => {
      setSecretClicks(0);
    }, 2000);
  };
  return (
    <footer className="bg-[#0F2747] text-slate-300 pt-16 pb-12 border-t border-amber-500/20 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-[1px]">
                <div className="w-full h-full bg-[#0F2747] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                My <span className="text-amber-400 italic">Scents</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Luxury fragrances crafted for unforgettable moments. Premium
              quality, elegant packaging, and long-lasting signature scents at
              accessible prices.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Sparkles className="w-3 h-3 text-amber-400" /> 100% Original
                Extrait De Parfum
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-serif font-semibold text-lg mb-4 text-amber-200">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      document
                        .getElementById("catalogue")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Perfume Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/cart")}
                  className="hover:text-amber-400 transition-colors"
                >
                  Shopping Bag &amp; Checkout
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("/");
                    setTimeout(() => {
                      document
                        .getElementById("about")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="hover:text-amber-400 transition-colors"
                >
                  Our Perfumery Heritage
                </button>
              </li>
            </ul>
          </div>

          {/* Perfume Categories */}
          <div>
            <h4 className="text-white font-serif font-semibold text-lg mb-4 text-amber-200">
              Fragrance Families
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-400">Woody &amp; Amber (Dark Flame)</li>
              <li className="text-slate-400">
                Oud &amp; Oriental (Oud Al Qalb, Sultan)
              </li>
              <li className="text-slate-400">
                Fresh &amp; Aquatic (Deep Aura)
              </li>
              <li className="text-slate-400">Floral Gourmand (Eternal Love)</li>
              <li className="text-slate-400">Warm Gourmand (Red Velvet)</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-serif font-semibold text-lg mb-4 text-amber-200">
              Visit Our Boutique
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Shop 12, Zamzama Boulevard, Phase 5, DHA, Karachi, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>hello@myscentscollection.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mon - Sat: 11:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p
            onClick={handleSecretClick}
            className="cursor-default select-none transition-colors"
            title=""
          >
            © 2026 My Scents Collection. All Rights Reserved.
          </p>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-400">
              Made with{" "}
              <Heart className="w-3 h-3 text-amber-400 fill-amber-400 inline" />{" "}
              for Fragrance Lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
