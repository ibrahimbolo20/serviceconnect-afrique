/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoImg from "../assets/images/service_connect_logo_1779306113388.png";
import {
  User,
  ShieldCheck,
  Award,
  Bell,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  Menu,
  X,
  Home,
  CheckCircle,
  Clock,
  Briefcase,
  Sliders,
  Download,
  Smartphone
} from "lucide-react";

export type RoleType = "landing" | "client" | "provider" | "admin";

interface RoleSelectorProps {
  currentRole: RoleType;
  onChangeRole: (role: RoleType) => void;
  currentLanguage: "fr" | "en" | "wo" | "bm";
  onChangeLanguage: (lang: "fr" | "en" | "wo" | "bm") => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLowBandwidth: boolean;
}

export default function RoleSelector({
  currentRole,
  onChangeRole,
  currentLanguage,
  onChangeLanguage,
  isDarkMode,
  onToggleDarkMode,
  isLowBandwidth
}: RoleSelectorProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Handle scroll detection for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle PWA installation and detection listeners
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallAppPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("PWA Installation prompt feedback decision:", outcome);
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  // Multi-language names
  const languageNames = {
    fr: { label: "Français", flag: "🇫🇷" },
    en: { label: "English", flag: "🇬🇧" },
    wo: { label: "Wolof", flag: "🇸🇳" },
    bm: { label: "Bambara", flag: "🇲🇱" }
  };

  // Mock Notification Logs for simulation
  const dummyNotifications = [
    {
      id: 1,
      title: "Paiement Séquestré Reçu",
      text: "Fatoumata Traoré a provisionné 15 000 FCFA pour Mamadou Diallo via Wave.",
      time: "Il y a 2 min",
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />
    },
    {
      id: 2,
      title: "🚨 SOS Dispatch Actif",
      text: "Recherche en cours d'un plombier d'urgence à Sébénikoro, Bamako.",
      time: "Il y a 10 min",
      icon: <Clock className="w-4 h-4 text-amber-500" />
    },
    {
      id: 3,
      title: "Artisan Certifié !",
      text: "Le profil de Aminata Diop est désormais vérifié par la console administrative.",
      time: "Il y a 1 h",
      icon: <CheckCircle className="w-4 h-4 text-blue-500" />
    }
  ];

  return (
    <nav
      id="main-premium-navbar"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-md border-b border-slate-100 dark:border-slate-850"
          : "bg-white dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => {
              onChangeRole("landing");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-indigo-500/20 dark:border-indigo-500/20 bg-slate-950 shadow-md transform group-hover:scale-105 transition-all flex items-center justify-center">
              <img
                src={logoImg}
                alt="ServiceConnect Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-slate-950 dark:text-white font-black text-lg md:text-xl tracking-tight block">
                ServiceConnect <span className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">Mali</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono block uppercase tracking-widest mt-0.5">
                CONFIANCE & SIMPLICITÉ • PILOTE NATIONAL
              </span>
            </div>
          </div>

          {/* Desktop Central Navigation Tabs (Spaces) */}
          <div className="hidden lg:flex items-center bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => onChangeRole("landing")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                currentRole === "landing"
                  ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => onChangeRole("client")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                currentRole === "client"
                  ? "bg-indigo-650 text-white shadow-md transform scale-102"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/55 dark:hover:bg-slate-900/40"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Espace Client</span>
            </button>

            <button
              onClick={() => onChangeRole("provider")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                currentRole === "provider"
                  ? "bg-indigo-650 text-white shadow-md transform scale-102"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/55 dark:hover:bg-slate-900/40"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Espace Prestataire</span>
            </button>

            <button
              onClick={() => onChangeRole("admin")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                currentRole === "admin"
                  ? "bg-slate-900 dark:bg-slate-800 text-white shadow-md transform scale-102"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/55 dark:hover:bg-slate-900/40"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Console Admin</span>
            </button>
          </div>

          {/* Right Side Options & Actions */}
          <div className="hidden lg:flex items-center gap-3.5">
            
            {/* PWA Integration status or installation prompt */}
            {deferredPrompt && (
              <button
                onClick={handleInstallAppPWA}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase shadow-md transition-all duration-300 cursor-pointer border border-amber-600 active:scale-95 transform hover:scale-103"
                title="Installer ServiceConnect sur votre écran d'accueil d'appareil"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Installer PWA 📱</span>
              </button>
            )}

            {isStandalone && (
              <span className="flex items-center gap-1.5 px-3 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>PWA ACTIVE</span>
              </span>
            )}

            {/* Low-Bandwidth simple indicator badge */}
            {isLowBandwidth && (
              <span className="text-[10px] bg-indigo-550/10 text-indigo-600 dark:text-indigo-400 border border-indigo-550/30 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
                Mode Éco Bandwith Active
              </span>
            )}

            {/* Dark Mode Icon Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Changer de thème"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsLangOpen(!isLangOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer text-xs font-bold"
              >
                <Globe className="w-4 h-4 text-slate-400 font-bold" />
                <span>
                  {languageNames[currentLanguage].flag} {languageNames[currentLanguage].label}
                </span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-44 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 text-xs"
                  >
                    {Object.entries(languageNames).map(([code, value]) => (
                      <button
                        key={code}
                        onClick={() => {
                          onChangeLanguage(code as "fr" | "en" | "wo" | "bm");
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition cursor-pointer font-semibold ${
                          currentLanguage === code
                            ? "bg-indigo-600 text-white"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-white"
                        }`}
                      >
                        <span className="text-sm">{value.flag}</span>
                        <span>{value.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Dropper Panel */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsLangOpen(false);
                }}
                className="p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 shadow-2xl z-50 text-xs space-y-3.5 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-2">
                      <span className="font-extrabold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Notifications de Simulation</span>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">Actuel</span>
                    </div>

                    <div className="space-y-2.5">
                      {dummyNotifications.map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-[11px]">
                            {n.icon}
                            <span>{n.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{n.text}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block text-right font-mono">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Small Quick Help Profile avatar representation */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 pl-2.5 pr-3.5 py-1.5 rounded-full border border-slate-250 dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">PILOTE_USER</span>
            </div>

          </div>

          {/* Mobile Right Hamburguer Menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-indigo-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0d0d0d] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile navigation side menu drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-[#141414] border-t border-slate-205 dark:border-slate-850 p-4 space-y-4 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onChangeRole("landing");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  currentRole === "landing" ? "bg-indigo-650 text-white" : "text-slate-705 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Accueil / Landing Page</span>
              </button>

              <button
                onClick={() => {
                  onChangeRole("client");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  currentRole === "client" ? "bg-indigo-650 text-white" : "text-slate-705 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Espace Client / Trouver Service</span>
              </button>

              <button
                onClick={() => {
                  onChangeRole("provider");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  currentRole === "provider" ? "bg-indigo-650 text-white" : "text-slate-705 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <Award className="w-5 h-5" />
                <span>Espace Prestataire / Gérer Agenda</span>
              </button>

              <button
                onClick={() => {
                  onChangeRole("admin");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  currentRole === "admin" ? "bg-slate-900 dark:bg-slate-800 text-white" : "text-slate-705 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Console Admin / Logs Infrastructure</span>
              </button>
            </div>

            {/* Mobile PWA Installation Promotion */}
            {(deferredPrompt || isStandalone) && (
              <div className="border-t border-slate-200 dark:border-slate-850 pt-4 pb-1">
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest mb-2.5">Application Mobile (PWA)</p>
                {deferredPrompt && (
                  <button
                    onClick={() => {
                      handleInstallAppPWA();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase rounded-xl shadow-md transition-all border border-amber-600 cursor-pointer text-center"
                  >
                    <Download className="w-4 h-4 animate-bounce" />
                    <span>Installer l'application 📱</span>
                  </button>
                )}
                {isStandalone && (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-wider font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Application Installée (PWA)</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Language Mobile Selector */}
            <div className="border-t border-slate-200 dark:border-slate-850 pt-4">
              <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest mb-2.5">Changer de langue</p>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(languageNames).map(([code, value]) => (
                  <button
                    key={code}
                    onClick={() => {
                      onChangeLanguage(code as "fr" | "en" | "wo" | "bm");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2 rounded-lg text-center transition ${
                      currentLanguage === code ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30" : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="text-lg block">{value.flag}</span>
                    <span className="text-[10px] block mt-0.5">{value.label.substring(0, 3)}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
