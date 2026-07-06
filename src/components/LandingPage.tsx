/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Laptop,
  Wrench,
  Truck,
  HeartPulse,
  GraduationCap,
  Camera,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { CATEGORIES, CITIES } from "../data/mockData";
import { Provider } from "../types";

const TRANSLATIONS = {
  fr: {
    heroTitle: "Trouvez un professionnel de confiance au Mali",
    heroSub: "La plateforme nationale de mise en relation directe avec des artisans certifiés et qualifiés. Simple, transparente et sécurisée.",
    searchPlaceholder: "De quel service ou artisan avez-vous besoin ?",
    searchBtn: "Rechercher",
    citiesLabel: "Toutes les villes",
    verifiedProviders: "Artisans Vérifiés",
    completedInterventions: "Interventions Réussies",
    satisfactionRate: "Satisfaction Client",
    becomeProviderBtn: "Devenir Prestataire",
    becomeProviderTitle: "Augmentez vos revenus",
    becomeProviderSub: "Rejoignez notre réseau national d'artisans qualifiés.",
    howItWorks: "Comment ça fonctionne ?"
  },
  en: {
    heroTitle: "Find a trusted professional in Mali",
    heroSub: "The national platform connecting you directly with certified, qualified artisans. Simple, transparent, and secure.",
    searchPlaceholder: "What service or artisan do you need?",
    searchBtn: "Search",
    citiesLabel: "All cities",
    verifiedProviders: "Verified Artisans",
    completedInterventions: "Successful Jobs",
    satisfactionRate: "Client Satisfaction",
    becomeProviderBtn: "Become a Provider",
    becomeProviderTitle: "Boost your income",
    becomeProviderSub: "Join our national network of qualified artisans.",
    howItWorks: "How it works"
  },
  wo: {
    heroTitle: "Wutal liggéeykat bu am kàttan ci saas yi",
    heroSub: "Dahbi liggéeykat yi gën a bari kàttan ak dëgër ci saas yi ci Mali. Yomb na te wòor na.",
    searchPlaceholder: "Lan nga bëgg wut tey ?",
    searchBtn: "Wut",
    citiesLabel: "Dëkk yépp",
    verifiedProviders: "Liggéeykat yu wóor",
    completedInterventions: "Liggéey yi dëgër",
    satisfactionRate: "Mbegte Réew",
    becomeProviderBtn: "Bokk ci Liggéeykat yi",
    becomeProviderTitle: "Yooral sa xaalis tey",
    becomeProviderSub: "Bokk ci ServiceConnect te am wërsëg bu dëgër.",
    howItWorks: "Naka la liggéeyé ?"
  },
  bm: {
    heroTitle: "Sɔrɔ baarakɛla kɛnyɛrɛyelen teliya la",
    heroSub: "Mali kono baarakɛlaw bɛɛ sɔrɔ yɔrɔ fitini sɔrɔ. A nɔgɔman dɔrɔn sanko teliya kɔnɔ.",
    searchPlaceholder: "A bɛ baara juman fɛ bi ?",
    searchBtn: "Ɲini",
    citiesLabel: "Duguw bɛɛ",
    verifiedProviders: "Baarakɛla sɛbɛnw",
    completedInterventions: "Baara kɛlen teliya",
    satisfactionRate: "Ɲɛnajɛ fanga",
    becomeProviderBtn: "Don baara la",
    becomeProviderTitle: "I ka sɔrɔ bonya",
    becomeProviderSub: "Don ServiceConnect la ka kɛ baarakɛla sɔrɔyelen ye.",
    howItWorks: "A bɛ kɛ cogo di ?"
  }
};

interface LandingPageProps {
  providers: Provider[];
  onNavigateToExplore: (filters: { category: string; city: string; search: string }) => void;
  onSelectRole: (role: "client" | "provider" | "admin") => void;
  currentLanguage: "fr" | "en" | "wo" | "bm";
  isLowBandwidth: boolean;
  onToggleLowBandwidth: () => void;
}

export default function LandingPage({
  providers,
  onNavigateToExplore,
  onSelectRole,
  currentLanguage,
  isLowBandwidth,
  onToggleLowBandwidth
}: LandingPageProps) {
  const [searchVal, setSearchVal] = useState("");
  const [selCity, setSelCity] = useState("all");

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.fr;

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Laptop":
        return <Laptop className="w-5 h-5" />;
      case "Wrench":
        return <Wrench className="w-5 h-5" />;
      case "Truck":
        return <Truck className="w-5 h-5" />;
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5" />;
      case "Camera":
        return <Camera className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToExplore({
      category: "all",
      city: selCity,
      search: searchVal
    });
  };

  const sampleReviews = [
    {
      name: "Dramane Traoré",
      role: "Client • Bamako",
      quote: "Excellent service ! J'ai pu trouver un plombier qualifié pour une urgence de fuite d'eau en moins de 20 minutes.",
      stars: 5
    },
    {
      name: "Assa Maïga",
      role: "Cliente • Sikasso",
      quote: "Tranchant et transparent. Le payement sécurisé en séquestre redonne confiance dans le recrutement d'artisans.",
      stars: 5
    }
  ];

  return (
    <div id="simple-landing" className="relative min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0d0d0d] dark:text-white selection:bg-indigo-600 selection:text-white transition-colors duration-300">
      
      {/* Soft background visual flares */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-950/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        
        {/* Top Mini Header Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-650 dark:bg-indigo-400 animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Mali ServiceConnect — Pilote National
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="bandwidth-toggle"
              onClick={onToggleLowBandwidth}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              Mode Éco : <span className={isLowBandwidth ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400"}>{isLowBandwidth ? "Activé" : "Désactivé"}</span>
            </button>
          </div>
        </div>

        {/* Central Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-8 pb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-150 dark:border-indigo-500/20 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Vérifié &amp; Sécurisé
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Trouvez les meilleurs artisans de confiance <span className="text-indigo-600 dark:text-indigo-400">au Mali</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>

          {/* Clean, Simple Search form */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-[#141414] p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-stretch gap-2 shadow-xl dark:shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-3 py-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-white/5">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="bg-transparent border-0 outline-none text-slate-800 dark:text-white text-sm w-full focus:ring-0 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-3 shrink-0">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <select
                  value={selCity}
                  onChange={(e) => setSelCity(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all" className="bg-white dark:bg-[#141414] text-slate-800 dark:text-white">{t.citiesLabel}</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city} className="bg-white dark:bg-[#141414] text-slate-800 dark:text-white">
                      {city.split(" (")[0]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="search-main-button"
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition cursor-pointer shrink-0 text-sm flex items-center justify-center gap-1.5"
              >
                <span>{t.searchBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <span>Suggestions rapides :</span>
              {["Électricien", "Plombier d'urgence", "Réparation PC", "Coursier"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchVal(tag);
                    onNavigateToExplore({ category: "all", city: "all", search: tag });
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#ffffff] dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 border border-slate-205 dark:border-white/5 transition cursor-pointer text-[11px]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section - Clean Aesthetic Icons Grid */}
        <div className="space-y-6 pt-4 pb-12">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Secteurs d'intervention d'urgence &amp; du quotidien
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              Cliquez sur une catégorie pour parcourir les artisans correspondants près de chez vous.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigateToExplore({ category: cat.id, city: "all", search: "" })}
                className="bg-white dark:bg-[#141414] hover:bg-slate-50/50 dark:hover:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 p-5 rounded-2xl transition duration-300 cursor-pointer text-left flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-10 h-10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/10">
                    {renderCategoryIcon(cat.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-2 opacity-80 group-hover:opacity-100">
                  <span>Explorer</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Double Launch Bento Portals - Safe, simplified path direction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 pb-16">
          
          {/* Client Portal Block */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#141414] dark:to-[#1a1a1a] p-8 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-between text-left space-y-8 relative overflow-hidden shadow-sm hover:shadow-md transition duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-3">
              <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest font-mono">
                Espace Client
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Besoin de réparer ou réaliser des travaux ?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Recherchez parmi des techniciens de confiance, certifiés et localisés. Vos fonds restent en sécurité jusqu'à votre entière satisfaction.
              </p>
            </div>
            
            <div>
              <button
                id="client-portal-btn"
                onClick={() => onSelectRole("client")}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl transition cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2 inline-flex shadow-sm"
              >
                <span>Accéder à l'Espace Client</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Provider Portal Block */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#141414] dark:to-[#111111] p-8 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-between text-left space-y-8 relative overflow-hidden shadow-sm hover:shadow-md transition duration-300">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-550/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                Espace Artisan / Prestataire
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Vous êtes un artisan ou professionnel ?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Connectez-vous pour configurer des services, recevoir des offres de travail, planifier les missions et être rémunéré de façon fiable.
              </p>
            </div>

            <div>
              <button
                id="provider-portal-btn"
                onClick={() => onSelectRole("provider")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-white/10 dark:hover:bg-white/15 dark:text-white border border-slate-205 dark:border-white/10 font-bold px-6 py-3.5 rounded-xl transition cursor-pointer text-xs uppercase tracking-wider flex items-center gap-2 inline-flex shadow-sm"
              >
                <span>Devenir ou se connecter en tant que Prestataire</span>
                <ArrowRight className="w-4 h-4 text-white dark:text-indigo-400" />
              </button>
            </div>
          </div>

        </div>

        {/* How It Works Segment - Simplified 3 Simple Steps */}
        <div className="py-12 border-t border-slate-200 dark:border-white/5 text-left">
          <div className="max-w-3xl space-y-3 mb-10">
            <span className="text-xs uppercase font-bold text-indigo-650 dark:text-indigo-400 font-mono tracking-wider">
              Fonctionnement
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              La confiance nationale en 3 étapes simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Recherchez et comparez",
                desc: "Saisissez votre panne, explorez les artisans agréés et consultez leurs profils certifiés."
              },
              {
                num: "02",
                title: "Bloquez les fonds en Séquestre",
                desc: "Le client dépose la somme garantie sur un compte neutre (Escrow) de sécurité avant l'intervention."
              },
              {
                num: "03",
                title: "Validez et Libérez",
                desc: "Une fois les travaux achevés, validez la fin d'intervention pour reverser la rémunération à l'artisan."
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3 shadow-sm">
                <span className="text-2xl font-black text-indigo-650 dark:text-indigo-450 font-mono block">
                  {step.num}
                </span>
                <h4 className="font-bold text-slate-800 dark:text-white text-base">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-12 border-t border-slate-200 dark:border-white/5 text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Ce qu'en pensent nos utilisateurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleReviews.map((rev, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/5 space-y-4 shadow-sm">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{rev.quote}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 creative-testimonial-footer">
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">{rev.name}</span>
                    <span className="text-[10px] text-slate-550 dark:text-slate-500">{rev.role}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(rev.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
