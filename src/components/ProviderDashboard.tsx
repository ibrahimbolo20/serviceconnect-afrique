/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, DollarSign, Star, Award, TrendingUp, Clock, 
  MapPin, Sparkles, Bell, Check, X, ShieldCheck, 
  ToggleLeft, ToggleRight, Phone, Mail, Percent, BookOpen,
  UserPlus, Smartphone, CreditCard, Lock, CheckCircle2,
  ShieldAlert, UploadCloud, ArrowRight, User
} from 'lucide-react';
import { Provider, Booking, BookingStatus } from '../types';

interface ProviderDashboardProps {
  providers: Provider[];
  bookings: Booking[];
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdateProviderAvailability: (id: string, isAvailable: boolean) => void;
  onUpdateProviderProfile: (id: string, updatedFields: Partial<Provider>) => void;
  onAddProvider?: (newProvider: Provider) => void;
  onUpdateBooking?: (updated: Booking) => void;
  onUpdateProvider?: (updated: Provider) => void;
}

export default function ProviderDashboard({
  providers,
  bookings,
  onUpdateBookingStatus,
  onUpdateProviderAvailability,
  onUpdateProviderProfile,
  onAddProvider
}: ProviderDashboardProps) {
  // Let's assume we are acting as Mamadou Diallo (prov_1) as the default logged in provider
  const [selectedProviderId, setSelectedProviderId] = useState<string>('prov_1');
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'calendar' | 'earnings' | 'stats' | 'profile' | 'reviews'>('requests');

  // Withdrawal States for e-wallet
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawPhone, setWithdrawPhone] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'Orange Money' | 'Wave' | 'MTN Mobile Money'>('Wave');
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'otp' | 'success'>('form');
  const [withdrawOtp, setWithdrawOtp] = useState<string>('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string>('');

  // Selected calendar day highlighting
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('');

  // Registration & Payment States for New Provider
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [registerStep, setRegisterStep] = useState<number>(1); // 1: Info, 2: Pièce d'identité, 3: Paiement Frais, 4: OTP & Success

  // Form inputs for registration
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCategory, setRegCategory] = useState('bricolage');
  const [regRate, setRegRate] = useState('5000');
  const [regCity, setRegCity] = useState('Bamako (Mali)');
  const [regBio, setRegBio] = useState('');
  const [regGender, setRegGender] = useState<'homme' | 'femme'>('homme');
  const [regDocName, setRegDocName] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Payment states for registration fees (5000 FCFA)
  const [selectedPaymethod, setSelectedPaymethod] = useState<'Orange Money' | 'Wave' | 'MTN Mobile Money'>('Wave');
  const [regPaymentPhone, setRegPaymentPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentOtpCode, setPaymentOtpCode] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Input states for profile edit
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRate, setEditRate] = useState(5000);
  const [editBio, setEditBio] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  // FIX: AnimatePresence (`motion/react`) manages exit-animation DOM nodes
  // itself. If we flip `isRegisterMode` (which swaps between two entirely
  // separate JSX trees via early `return`) while a step's exit animation is
  // still in flight, React can unmount/rip out the subtree before motion has
  // finished its own `removeChild` cleanup → "Failed to execute 'removeChild'
  // on 'Node': the node to be removed is not a child of this node."
  //
  // Fix: never flip `isRegisterMode` synchronously inside the same tick as
  // a registerStep change. We defer the mode switch to the next animation
  // frame so AnimatePresence's onExitComplete has a chance to run first.
  // ─────────────────────────────────────────────────────────────────────────
  const exitRegistrationMode = useCallback(() => {
    requestAnimationFrame(() => {
      setIsRegisterMode(false);
      setRegisterStep(1);
    });
  }, []);

  // Find targeted active provider object
  const activeProvider = useMemo(() => {
    const prov = providers.find(p => p.id === selectedProviderId) || providers[0] || {
      id: 'none',
      name: 'Aucun Prestataire enregistré',
      avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
      phone: '',
      email: '',
      category: 'bricolage',
      specialties: [],
      rating: 5.0,
      reviewsCount: 0,
      hourlyRate: 5000,
      city: 'Bamako (Mali)',
      verified: false,
      isAvailable: false,
      description: '',
      joinedDate: '',
      completedJobs: 0,
      reviews: []
    };
    // Sync local input values once provider loads
    if (prov && prov.id !== 'none' && editPhone === '') {
      setEditPhone(prov.phone);
      setEditEmail(prov.email);
      setEditRate(prov.hourlyRate);
      setEditBio(prov.description);
    }
    return prov;
  }, [providers, selectedProviderId]);

  // Sync state if provider selection manually changes
  const handleSwapProvider = (id: string) => {
    setSelectedProviderId(id);
    const prov = providers.find(p => p.id === id);
    if (prov) {
      setEditPhone(prov.phone);
      setEditEmail(prov.email);
      setEditRate(prov.hourlyRate);
      setEditBio(prov.description);
    }
  };

  // Filter bookings belonging to this provider
  const providerBookings = useMemo(() => {
    return bookings.filter(b => b.providerId === activeProvider.id);
  }, [bookings, activeProvider]);

  // Financial compilation
  const financials = useMemo(() => {
    // Only count completed or accepted (which the client paid)
    const eligibleBookings = providerBookings.filter(b => b.paymentStatus === 'paid');
    const gross = eligibleBookings.reduce((sum, b) => sum + b.amount, 0);
    const commission = eligibleBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const net = gross - commission;

    return { gross, commission, net, count: eligibleBookings.length };
  }, [providerBookings]);

  // Handle completed registration logic
  const handleCompleteRegistration = () => {
    const newId = 'prov_reg_' + Date.now();
    const avatarUrl = regGender === 'homme'
      ? 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face';

    const newProvider: Provider = {
      id: newId,
      name: regName || 'Artisan Innovateur',
      avatar: avatarUrl,
      phone: regPhone || '+225 07 00 00 00 00',
      email: regEmail || 'contact@artisan-afrique.net',
      category: regCategory,
      specialties: ['Général', regCategory === 'it_maintenance' ? 'Réseau & Wifi' : 'Intervention Rapide'],
      rating: 5.0,
      reviewsCount: 1,
      hourlyRate: Number(regRate) || 5000,
      city: regCity,
      verified: true, // Approved immediately upon fee settlement!
      isAvailable: true,
      description: regBio || 'Expert qualifié agréé sur le réseau ServiceConnect. Prêt pour les dépannages urgents.',
      joinedDate: new Date().toISOString().split('T')[0],
      completedJobs: 0,
      reviews: [
        {
          id: 'welcome_rev_' + Date.now(),
          clientName: 'ServiceConnect Mali',
          rating: 5,
          comment: 'Dossier d\'adhésion officiel validé. Frais d\'inscription de 5 000 FCFA soldés et sécurisés via Séquestre Mobile Money.',
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };

    if (onAddProvider) {
      onAddProvider(newProvider);
    }

    // Direct selected provider to our newly built active account
    setSelectedProviderId(newId);

    // FIX: this used to call setIsRegisterMode(false) + setRegisterStep(1)
    // synchronously right after step 4's motion.div was still mounted,
    // which is exactly the kind of abrupt tree-swap that triggers the
    // AnimatePresence removeChild crash. Defer it via the shared helper.
    exitRegistrationMode();

    // Reset fields
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegBio('');
    setRegPaymentPhone('');
    setPaymentOtpCode('');
    setIsOtpSent(false);

    alert(`🎉 FÉLICITATIONS !\n\nVotre profil Artisan a été créé avec succès et activé par le paiement de d'inscription de 5 000 FCFA.\n\nVous êtes redirigé maintenant sur votre nouvel Espace Prestataire personnel !`);
  };

  // Profile update submit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProviderProfile(activeProvider.id, {
      phone: editPhone,
      email: editEmail,
      hourlyRate: Number(editRate),
      description: editBio
    });
    alert('Votre profil a été mis à jour avec succès sur le réseau !');
  };

  if (isRegisterMode) {
    return (
      <div id="provider-registration-workspace" className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="text-emerald-600" /> Page d'Inscription & Activation d'Artisan
            </h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
              Processus d'adhésion sécurisé ServiceConnect Mali
            </p>
          </div>
          <button
            type="button"
            onClick={exitRegistrationMode}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-slate-700"
          >
            <X size={14} />
            Annuler l'inscription
          </button>
        </div>

        {/* Visual Progress Steps Indicator Tracker */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900 text-white p-4 rounded-2xl select-none text-center border border-slate-800">
          {[
            { step: 1, label: "📋 Profil & Métier" },
            { step: 2, label: "🆔 Justificatif" },
            { step: 3, label: "💳 Dépôt & Frais" },
            { step: 4, label: "🔑 Validation OTP" }
          ].map((item) => {
            const isActive = registerStep === item.step;
            const isDone = registerStep > item.step;
            return (
              <div 
                key={item.step} 
                className={`p-2.5 rounded-xl transition duration-300 ${
                  isActive ? "bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.2)]" :
                  isDone ? "bg-emerald-950/85 text-emerald-400 font-bold border border-emerald-900/50" :
                  "bg-slate-950 text-slate-500 font-medium"
                }`}
              >
                <p className="text-xs uppercase tracking-tight md:block hidden">{item.label}</p>
                <p className="text-xs md:hidden block font-bold font-mono">E{item.step}</p>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: Profil / Contact / Metier */}
          {registerStep === 1 && (
            <motion.div
              key="reg-step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-205 p-6 shadow-sm space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-950 text-lg">Étape 1 : Informations professionnelles</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ces informations construiront la fiche publique affichée aux clients dans les listes de recherche.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Nom Complet (Prénom & Nom)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amadou Coulibaly"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Genre (Sélection d'avatar pro)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegGender('homme')}
                      className={`py-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        regGender === 'homme'
                          ? "bg-slate-900 text-white border-slate-800"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      🧔 Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('femme')}
                      className={`py-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        regGender === 'femme'
                          ? "bg-slate-900 text-white border-slate-800"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      👩 Femme
                    </button>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-1.5 font-sans">
                  <label className="text-slate-700 uppercase">Spécialité & Métier</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all font-bold"
                  >
                    <option value="bricolage">🔧 Bricolage & Électricité</option>
                    <option value="mecanique">⚙️ Mécanicien (Le plus proche)</option>
                    <option value="it_maintenance">💻 IT & Maintenance Informatique</option>
                    <option value="nettoyage_entretien">✨ Nettoyage & Entretien</option>
                    <option value="delivery">🚚 Livraison & Transport rapide</option>
                    <option value="health">🩺 Santé & Bien-être à domicile</option>
                    <option value="coaching_tutor">🎓 Soutien Scolaire & Coaching</option>
                    <option value="events_freelance">📸 Événementiel & Freelance Pro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Tarif d'inscription requis (FCFA)</label>
                  <input
                    type="number"
                    min={1500}
                    max={40000}
                    step={500}
                    required
                    disabled
                    placeholder="Ex: 5000"
                    value={regRate}
                    onChange={(e) => setRegRate(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-500 cursor-not-allowed outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Fixé par la réglementation standard d'adhésion</span>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Téléphone Public de contact</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: +225 07 77 88 99 10"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Adresse E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: nom@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Ville principale de couverture géographique</label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all font-sans font-bold"
                  >
                    <option value="Bamako (Mali)">Bamako (Mali)</option>
                    <option value="Sikasso (Mali)">Sikasso (Mali)</option>
                    <option value="Ségou (Mali)">Ségou (Mali)</option>
                    <option value="Mopti (Mali)">Mopti (Mali)</option>
                    <option value="Kayes (Mali)">Kayes (Mali)</option>
                    <option value="Koutiala (Mali)">Koutiala (Mali)</option>
                    <option value="Koulikoro (Mali)">Koulikoro (Mali)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 uppercase">Description & Présentation de vos compétences</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Électricien diplômé avec 8 ans d'expérience dans le résidentiel."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white p-3 rounded-xl text-slate-900 outline-none transition-all text-xs"
                  />
                </div>

              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  disabled={!regName || !regPhone || !regEmail}
                  onClick={() => setRegisterStep(2)}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    regName && regPhone && regEmail
                      ? "bg-slate-950 hover:bg-slate-850 text-amber-400 shadow-md cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Suivant : Joindre Justificatif
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: KYC Identity Documents */}
          {registerStep === 2 && (
            <motion.div
              key="reg-step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-left"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-950 text-lg">Étape 2 : Justificatif d'activité ou d'identité</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pour rassurer les ménages, ServiceConnect exige un audit de document d'identité (Carte d'identité nationale, passeport ou registre de commerce).</p>
              </div>

              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4">
                <div className="flex justify-center">
                  <UploadCloud className="w-14 h-14 text-slate-400 animate-pulse" />
                </div>
                
                {regDocName ? (
                  <div className="space-y-1">
                    <p className="text-emerald-600 font-extrabold text-sm flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} /> Document importé avec succès !
                    </p>
                    <p className="text-xs text-slate-600 font-mono font-bold bg-white px-3 py-1 rounded-full border border-slate-200 inline-block">{regDocName}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-700 text-sm font-bold">Sélectionnez la photo ou le PDF de votre document</p>
                    <p className="text-slate-400 text-xs text-center max-w-sm mx-auto">Le fichier sera audité numériquement pour valider l'exactitude de votre nom complet.</p>
                  </div>
                )}

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isUploadingDoc}
                    onClick={() => {
                      setIsUploadingDoc(true);
                      setTimeout(() => {
                        setRegDocName("ID_NATIONAL_CNI_AFRIQUE_PRO_" + Math.floor(100+Math.random()*900) + ".PDF");
                        setIsUploadingDoc(false);
                      }, 1000);
                    }}
                    className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      isUploadingDoc ? "bg-slate-200 text-slate-400 cursor-wait" : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700"
                    }`}
                  >
                    {isUploadingDoc ? "Analyse cyber-dossier..." : "📎 Charger un document d'identité de Simulation"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ➔ Retour à l'étape 1
                </button>

                <button
                  type="button"
                  disabled={!regDocName}
                  onClick={() => setRegisterStep(3)}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    regDocName
                      ? "bg-slate-950 hover:bg-slate-850 text-amber-400 shadow-md cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Suivant : Acquitter les frais d'inscription
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT OF REGISTRATION FEES */}
          {registerStep === 3 && (
            <motion.div
              key="reg-step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-left"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-950 text-lg">Étape 3 : Paiement d'inscription & Validation de dossier</h3>
                <p className="text-xs text-slate-500 mt-0.5">Le dépôt réglementaire requis pour l'activation est de 5 000 FCFA. Ce montant assure l'activation à vie, la délivrance du badge "Vérifié" et l'assistance juridique de la plateforme.</p>
              </div>

              {/* Price Tag Highlight */}
              <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-805 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-extrabold">MONTANT UNIQUE D'INSCRIPTION</span>
                  <p className="text-3xl font-black font-mono">5 000 FCFA</p>
                  <p className="text-[10px] text-slate-400">Sécurisé et interfacé aux opérateurs Panafricains principaux.</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-center">
                  <span className="text-xs font-bold block">✓ Agrément Immédiat</span>
                  <span className="text-[9px] font-mono opacity-80">Réseau d'élites du Mali</span>
                </div>
              </div>

              {/* Mobile Money Carrier Selection menu */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase block">Opérateur de paiement Mobile Money</label>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Wave", flag: "🌊", desc: "0% frais de retrait", color: "border-sky-300 text-sky-600 bg-sky-50" },
                    { name: "Orange Money", flag: "🍊", desc: "Couverture Panafricaine", color: "border-orange-300 text-orange-600 bg-orange-50" },
                    { name: "MTN Mobile Money", flag: "🟡", desc: "MoMo Instant Pay", color: "border-yellow-400 text-yellow-800 bg-yellow-50" }
                  ].map((carrier) => {
                    const isSelected = selectedPaymethod === carrier.name;
                    return (
                      <button
                        key={carrier.name}
                        type="button"
                        onClick={() => setSelectedPaymethod(carrier.name as any)}
                        className={`p-4 border-2 rounded-2xl text-center cursor-pointer transition-all ${
                          isSelected 
                            ? "border-slate-950 bg-slate-100 ring-2 ring-amber-500/30 font-black text-slate-950" 
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xl block">{carrier.flag}</span>
                        <span className="text-xs font-extrabold block mt-1.5">{carrier.name}</span>
                        <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{carrier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number Phone Input for MM */}
              <div className="space-y-1.5 text-xs font-semibold">
                <label className="text-slate-700 uppercase">Numéro de téléphone ({selectedPaymethod}) pour le paiement</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Smartphone size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 0789120614 (sans espaces)"
                    value={regPaymentPhone}
                    onChange={(e) => setRegPaymentPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 focus:border-amber-500 focus:bg-white p-3.5 pl-10 rounded-xl font-mono text-xs outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Une demande de débit de 5 000 FCFA va être envoyée sur ce numéro de téléphone par SMS.</p>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* Actions Footer line */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegisterStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ➔ Retour à l'étape 2
                </button>

                <button
                  type="button"
                  disabled={!regPaymentPhone || isProcessingPayment}
                  onClick={() => {
                    setIsProcessingPayment(true);
                    setPaymentError("");
                    setTimeout(() => {
                      setIsProcessingPayment(false);
                      setIsOtpSent(true);
                      setRegisterStep(4);
                    }, 1400);
                  }}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    regPaymentPhone && !isProcessingPayment
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isProcessingPayment ? "Appel de la passerelle de paiement..." : `Payer 5 000 FCFA via ${selectedPaymethod}`}
                  <CreditCard size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: OTP CONFIRMATION & WELCOME SUCCESS */}
          {registerStep === 4 && (
            <motion.div
              key="reg-step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-center max-w-md mx-auto"
            >
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center border border-amber-200 animate-bounce">
                    <Lock size={20} />
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-950 text-base">Vérification de sécurité OTP</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Saisissez le code d'autorisation d'inscription envoyé par SMS sur votre compte <span className="font-black text-slate-800">{regPaymentPhone}</span>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">Code simulé de transaction (SMS) : <strong className="text-amber-600 font-bold">4912</strong></span>
                <input
                  type="text"
                  required
                  placeholder="Entrer le code de 4 chiffres"
                  value={paymentOtpCode}
                  onChange={(e) => setPaymentOtpCode(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-center text-sm font-black font-mono tracking-widest outline-none focus:border-emerald-500"
                />
              </div>

              {/* Countdown or resend details */}
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Code expire dans : <strong className="text-amber-500">45s</strong></span>
                <button
                  type="button"
                  onClick={() => alert("Un nouveau SMS OTP a été généré via notre routage (simulé).")}
                  className="text-amber-500 font-bold hover:underline"
                >
                  Renvoyer le code SMS WhatsApp
                </button>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider transition-all"
                >
                  Confirmer le paiement de l'inscription
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterStep(3)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all border border-slate-200"
                >
                  Modifier le numéro de paiement
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    );
  }

  return (
    <div id="provider-dashboard" className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">

      {/* Dynamic CTA Banner to launch the new provider Inscription & activation page */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-emerald-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-1 my-1 text-left flex-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-amber-400 flex items-center gap-1.5 font-display uppercase tracking-wider">
            🚀 DEVENIR PRESTATAIRE PARTENAIRE SUR SERVICECONNECT
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal max-w-3xl">
            Gagnez jusqu'à 250 000 FCFA par semaine d'activité. L'adhésion requiert de s'acquitter de frais de validation et d'activation uniques de <strong className="text-amber-600 dark:text-amber-400">5 000 FCFA</strong> (Wave, Orange Money, MTN MoMo) pour la vérification réglementaire d'identité et de compétences.
          </p>
        </div>
        <button
          onClick={() => {
            setIsRegisterMode(true);
            setRegisterStep(1);
          }}
          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-black text-xs px-5 py-3.5 rounded-2xl uppercase tracking-wider transition-all shadow-md shrink-0 border border-amber-600/20 cursor-pointer"
        >
          S'inscrire comme Nouveau Prestataire (5 000 FCFA)
        </button>
      </div>

      {/* Upper Provider Switcher & State Brief */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={activeProvider.avatar}
            alt={activeProvider.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 leading-tight">{activeProvider.name}</h2>
              {activeProvider.verified ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                  <ShieldCheck size={11} /> Profil Certifié
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-200">
                  Vérification en cours
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider font-mono">
              Spécialité : {activeProvider.category.replace('_', ' ')}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold font-mono">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star size={12} className="fill-amber-500" />
                {activeProvider.rating.toFixed(1)} ({activeProvider.reviewsCount})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" /> {activeProvider.city}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic simulation controls: Toggle provider availability & Swap profile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Active Artisan Selection Dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider font-mono">
              Changer de prestataire (simulation)
            </span>
            <select
              value={activeProvider.id}
              onChange={(e) => handleSwapProvider(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.verified ? 'Vérifié' : 'Attente'})</option>
              ))}
            </select>
          </div>

          {/* Availability State trigger toggle */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider font-mono">
              Disponibilité immédiate
            </span>
            <button
              onClick={() => onUpdateProviderAvailability(activeProvider.id, !activeProvider.isAvailable)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all ${
                activeProvider.isAvailable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <span>{activeProvider.isAvailable ? 'Disponible de suite' : 'En Pause de service'}</span>
              {activeProvider.isAvailable ? (
                <ToggleRight className="text-emerald-600" size={18} />
              ) : (
                <ToggleLeft className="text-slate-400" size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Primary tab select menu (sub-dashboard) */}
      <div className="flex border-b border-slate-200 pb-px flex-wrap gap-1">
        {[
          { id: 'requests', label: 'Demandes (SMS/WA)', icon: <Bell size={14} /> },
          { id: 'calendar', label: 'Calendrier Chantiers 🗓️', icon: <Calendar size={14} /> },
          { id: 'earnings', label: 'Portefeuille (Payout) 💳', icon: <CreditCard size={14} /> },
          { id: 'stats', label: 'Revenus & Stats 📈', icon: <TrendingUp size={14} /> },
          { id: 'profile', label: 'Pièces & Compte', icon: <BookOpen size={14} /> },
          { id: 'reviews', label: 'Évaluations clients', icon: <Star size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'border-emerald-500 text-emerald-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- SUBTAB 1: REQUESTS / DEMANDES --- */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 select-none">Demandes d'intervention en attente ou acceptées</h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
              {providerBookings.length} réservations au total
            </span>
          </div>

          {providerBookings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-2" size={36} />
              <p className="text-slate-500 text-sm">Aucune activité de réservation enregistrée pour l'instant.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {providerBookings.map(book => (
                <div key={book.id} className="bg-white rounded-2xl border border-slate-250 p-5 shadow-sm block sm:flex justify-between items-start gap-4 hover:shadow-md transition-all">
                  
                  {/* Left task details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-950 text-base">{book.clientName}</span>
                      {book.isEmergency && (
                        <span className="bg-red-150 text-red-800 text-[10px] font-extrabold border border-red-200 px-2 py-0.5 rounded uppercase animate-pulse">
                          🚨 Intervention Prioritaire (S.O.S)
                        </span>
                      )}
                      
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        book.status === 'accepted' ? 'bg-emerald-150 text-emerald-800' :
                        book.status === 'pending' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        book.status === 'declined' ? 'bg-red-100 text-red-800' :
                        book.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                        'bg-blue-100 text-blue-800' // completed
                      }`}>
                        {book.status === 'completed' ? 'Opération Terminée' : book.status === 'pending' ? 'À valider' : book.status === 'accepted' ? 'En cours' : book.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold text-slate-500 font-mono">
                      <span>Date : {book.date}</span>
                      <span>Heure : {book.time}</span>
                      <span className="text-slate-800">Montant : {book.amount.toLocaleString()} FCFA</span>
                      <span className={`font-semibold ${book.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        Paiement : {book.paymentStatus === 'paid' ? 'Séquestré' : 'Non encaissé'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl italic">
                      "{book.description}"
                    </p>
                  </div>

                  {/* Right actions to accept/refuse/complete */}
                  <div className="sm:text-right flex sm:flex-col justify-end items-end gap-3 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 self-stretch sm:self-auto shrink-0">
                    <div className="text-xs font-mono text-slate-400 sm:block hidden">
                      Réf: {book.id}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* 1. Accept / Decline during pending state */}
                      {book.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateBookingStatus(book.id, 'accepted')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm uppercase w-full sm:w-auto justify-center"
                          >
                            <Check size={12} />
                            Accepter
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(book.id, 'declined')}
                            className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-200 w-full sm:w-auto justify-center"
                          >
                            <X size={12} />
                            Décliner
                          </button>
                        </>
                      )}

                      {/* 2. Declare completed if accepted */}
                      {book.status === 'accepted' && (
                        <button
                          onClick={() => onUpdateBookingStatus(book.id, 'completed')}
                          className="bg-slate-900 hover:bg-emerald-500 text-white hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md w-full sm:w-auto justify-center uppercase"
                        >
                          <Check size={14} className="animate-bounce" />
                          Marquer Rétabli / Signaler Fin
                        </button>
                      )}

                      {/* 3. Completed label */}
                      {book.status === 'completed' && (
                        <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl">
                          ✓ Mission Accomplie
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SUBTAB 1.5: CALENDAR OF BOOKINGS --- */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          <div className="border-b pb-3 text-left">
            <h3 className="font-bold text-slate-950 text-base">🗓️ Emploi du temps & Calendrier des Chantiers</h3>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">Retrouvez vos interventions confirmées réparties sur le planning mensuel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Interactive Month Grid */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 border-b pb-2">
                <span>📅 Juin 2026</span>
                <span className="text-xs text-emerald-600 font-mono">Pilote National Mali connected</span>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-slate-400 text-[10px] uppercase">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
              </div>

              {/* 30 days calendar grid for June 2026 */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const datestring = `2026-06-${dayStr}`;
                  
                  const dayBookings = providerBookings.filter(b => b.date === datestring);
                  const isToday = dayNum === 2; // simulated today as June 2nd
                  const isSelected = selectedCalendarDate === datestring;
                  const hasPending = dayBookings.some(b => b.status === 'pending');
                  const hasAccepted = dayBookings.some(b => b.status === 'accepted');
                  const hasCompleted = dayBookings.some(b => b.status === 'completed');

                  let cellColor = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                  if (isSelected) {
                    cellColor = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                  } else if (hasPending) {
                    cellColor = "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 font-extrabold";
                  } else if (hasAccepted) {
                    cellColor = "bg-blue-50 text-blue-950 border-blue-300 hover:bg-blue-100 font-extrabold";
                  } else if (hasCompleted) {
                    cellColor = "bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100";
                  }

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedCalendarDate(datestring)}
                      className={`h-12 border p-1 rounded-xl text-xs font-mono font-bold flex flex-col justify-between items-center transition-all cursor-pointer relative ${cellColor}`}
                    >
                      <span className="self-start text-[10px]">{dayNum}</span>
                      
                      {dayBookings.length > 0 && !isSelected && (
                        <span className="flex gap-0.5 pb-0.5 justify-center w-full">
                          {dayBookings.map((b, bi) => (
                            <span 
                              key={bi} 
                              className={`h-1.5 w-1.5 rounded-full ${
                                b.status === 'pending' ? 'bg-amber-500' :
                                b.status === 'accepted' ? 'bg-blue-500 animate-pulse' :
                                'bg-emerald-500'
                              }`} 
                            />
                          ))}
                        </span>
                      )}
                      
                      {isToday && !isSelected && (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" title="Aujourd'hui"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 pt-3 border-t">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> À valider</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Confirmé</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Accomplie / Terminé</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-550 h-1.5 w-1.5 rounded-full bg-red-500"></span> Aujourd'hui</span>
              </div>
            </div>

            {/* Right Column: Day details card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-205 shadow-sm space-y-4 text-left">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Détail des Chantiers du {selectedCalendarDate || "Sélectionnez un jour" }
              </h4>

              {!selectedCalendarDate ? (
                <div className="text-center py-6 text-slate-400">
                  <Calendar size={28} className="mx-auto mb-1 opacity-40 text-slate-400" />
                  <p className="text-xs italic">Sélectionnez une date de calendrier à gauche pour voir les fiches correspondantes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerBookings.filter(b => b.date === selectedCalendarDate).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucune réservation d'intervention prévue à cette date.</p>
                  ) : (
                    providerBookings.filter(b => b.date === selectedCalendarDate).map(b => (
                      <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                          <span className="font-bold text-slate-900">{b.clientName}</span>
                          <span className="text-[9px] font-mono text-slate-450">{b.time} l'heure</span>
                        </div>
                        <p className="text-slate-600 leading-normal italic bg-slate-50/50 p-1 rounded">"{b.description}"</p>
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Statut de mission :</span>
                          <span className={`font-bold uppercase ${b.status === 'accepted' ? 'text-blue-600' : 'text-slate-700'}`}>{b.status}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono border-t pt-1">
                          <span className="text-slate-500">Net d'activité :</span>
                          <span className="font-bold text-emerald-600">{(b.amount - b.commissionAmount).toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- SUBTAB 2: EARNINGS ANALYTICS & E-WALLET ---- */}
      {activeSubTab === 'earnings' && (() => {
        const currentBalance = activeProvider.walletBalance !== undefined ? activeProvider.walletBalance : financials.net;
        const currentWithdrawn = activeProvider.withdrawnTotal !== undefined ? activeProvider.withdrawnTotal : 15000;
        const withdrawalsHistory = activeProvider.withdrawals || [
          { id: 'w_init_1', amount: 10000, date: '2026-05-15', method: 'Wave', phone: activeProvider.phone, status: 'completed' },
          { id: 'w_init_2', amount: 5000, date: '2026-05-28', method: 'Orange Money', phone: activeProvider.phone, status: 'completed' }
        ];

        const handleRequestWithdrawSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const amountNum = Number(withdrawAmount);
          if (isNaN(amountNum) || amountNum <= 0) {
            setWithdrawError("Veuillez entrer un montant numérique valide.");
            return;
          }
          if (amountNum > currentBalance) {
            setWithdrawError("Solde insuffisant dans votre portefeuille électronique.");
            return;
          }
          if (amountNum < 1000) {
            setWithdrawError("Le montant minimum de retrait est de 1 000 FCFA.");
            return;
          }
          
          setWithdrawError("");
          setWithdrawStep('otp');
        };

        const handleConfirmWithdrawOTP = () => {
          if (withdrawOtp !== '8821') {
            setWithdrawError("Code OTP de sécurité incorrect. Rapprochez-vous du code 8821 simulé.");
            return;
          }

          const amountNum = Number(withdrawAmount);
          const newBalance = currentBalance - amountNum;
          const newWithdrawn = currentWithdrawn + amountNum;
          
          const newWithdrawalRecord = {
            id: 'withdraw_' + Date.now(),
            amount: amountNum,
            date: new Date().toISOString().split('T')[0],
            method: withdrawMethod,
            phone: withdrawPhone || activeProvider.phone,
            status: 'completed' as const
          };

          const updatedWithdrawals = [newWithdrawalRecord, ...withdrawalsHistory];

          // Persist back
          onUpdateProviderProfile(activeProvider.id, {
            walletBalance: newBalance,
            withdrawnTotal: newWithdrawn,
            withdrawals: updatedWithdrawals
          });

          // Move to success
          setWithdrawStep('success');
          setWithdrawError("");
        };

        return (
          <div className="space-y-6">
            <div className="border-b pb-3 text-left">
              <h3 className="font-bold text-slate-950 text-base">💳 Portefeuille Électronique & Retrait Mobile Money</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-mono">Retirez vos gains accumulés instantanément sans commission intermédiaire.</p>
            </div>

            {/* Electronic Wallet metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Core Withdrawable Balance card */}
              <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl"></div>
                <div>
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase font-mono tracking-wider">Solde Retirable</span>
                  <span className="text-3xl font-black block font-mono text-emerald-400 mt-1">{currentBalance.toLocaleString()} FCFA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">Fonds sécurisés et prêts pour le reversement direct.</p>
              </div>

              {/* Cumulated Withdrawn card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase font-mono tracking-wider">Total Déjà Retiré</span>
                  <span className="text-2xl font-black text-slate-950 block font-mono mt-1">{currentWithdrawn.toLocaleString()} FCFA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">Cumulé de tous vos transferts Mobile Money réussis.</p>
              </div>

              {/* Financial bruto volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-slate-500 text-[10px] font-extrabold uppercase font-mono tracking-wider">Historique de Volume Brut</span>
                  <span className="text-2xl font-black text-slate-950 block font-mono mt-1">{financials.gross.toLocaleString()} FCFA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">Comprend les commissions de {financials.commission.toLocaleString()} FCFA acquittées.</p>
              </div>

            </div>

            {/* Withdraw Operations block */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Form Withdraw setup panel */}
              <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-left">
                <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="text-emerald-600" size={15} />
                  Initier un Retrait de Gains (Payout Connect)
                </h4>

                {withdrawStep === 'form' && (
                  <form onSubmit={handleRequestWithdrawSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                      
                      <div className="space-y-1">
                        <label className="text-slate-700">Montant à retirer (FCFA)</label>
                        <input
                          type="number"
                          required
                          min="1000"
                          max={currentBalance}
                          placeholder="Ex: 5000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-slate-950 text-sm outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-medium">Min: 1 000 FCFA • Max: {currentBalance.toLocaleString()} FCFA</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-700">Opérateur de Mobile Money</label>
                        <select
                          value={withdrawMethod}
                          onChange={(e) => setWithdrawMethod(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-pointer"
                        >
                          <option value="Wave">Wave 🌊</option>
                          <option value="Orange Money">Orange Money 🍊</option>
                          <option value="MTN Mobile Money">MTN MoMo 🟡</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      <label className="text-slate-700">Numéro de téléphone de réception ({withdrawMethod})</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 0702030405"
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 p-3 rounded-xl font-mono text-slate-950 outline-none"
                      />
                    </div>

                    {withdrawError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        ⚠️ {withdrawError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={currentBalance <= 0}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        currentBalance > 0 ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Demander le virement immédiat
                    </button>
                  </form>
                )}

                {withdrawStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1 text-xs">
                      <span className="font-extrabold text-amber-950">🔑 Code de sécurité OTP généré par SMS</span>
                      <p className="text-slate-600">Saisissez le code de transaction à 4 chiffres simulé <strong className="text-amber-700">8821</strong> destiné à valider le virement de <strong className="text-slate-900">{Number(withdrawAmount).toLocaleString()} FCFA</strong>.</p>
                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      <label className="text-slate-700">Code de Validation OTP</label>
                      <input
                        type="text"
                        placeholder="Saisissez 8821"
                        value={withdrawOtp}
                        onChange={(e) => setWithdrawOtp(e.target.value)}
                        className="w-full p-3 font-mono text-center tracking-widest text-lg font-black bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    {withdrawError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                        ⚠️ {withdrawError}
                      </p>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setWithdrawStep('form')}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold text-slate-800"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleConfirmWithdrawOTP}
                        className="flex-1 p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider"
                      >
                        Confirmer le virement
                      </button>
                    </div>
                  </div>
                )}

                {withdrawStep === 'success' && (
                  <div className="text-center py-6 space-y-3">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-250 animate-bounce">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-black text-emerald-950 text-sm">VIREMENT ENVOYÉ !</h5>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                        Félicitations, la somme de <strong>{Number(withdrawAmount).toLocaleString()} FCFA</strong> est en cours d'acheminement vers votre compte <strong>{withdrawMethod}</strong> au numéro <strong>{withdrawPhone || activeProvider.phone}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setWithdrawAmount('');
                        setWithdrawOtp('');
                        setWithdrawStep('form');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg uppercase"
                    >
                      Nouveau retrait
                    </button>
                  </div>
                )}
              </div>

              {/* Withdrawals List history logs panel */}
              <div className="lg:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Derniers mouvements de reversement (Payouts)
                </h4>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                  {withdrawalsHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Aucun reversement de fonds Mobile Money initié à ce jour.</p>
                  ) : (
                    withdrawalsHistory.map((w: any) => (
                      <div key={w.id} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-900 font-mono">-{w.amount.toLocaleString()} FCFA</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{w.date}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Via: {w.method}</span>
                          <span className="text-green-600 uppercase font-bold">{w.status}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 block break-all tracking-tight truncate">Sur: {w.phone}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* --- SUBTAB 2.5: STATISTICS & PERFORMANCE --- */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b pb-3 text-left">
            <h3 className="font-bold text-slate-950 text-base">📈 Rapports d'Activité & Statistiques Mensuelles</h3>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">Suivez vos indicateurs de performance, taux de conversion et volumes financiers d'intervention.</p>
          </div>

          {/* Performance stats gauge cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-sm space-y-1">
              <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider font-mono">Taux d'Éligibilité GPS</span>
              <span className="text-2xl font-black text-slate-900 block font-mono">98.2%</span>
              <span className="text-[10px] text-emerald-600 font-bold block">✓ Excellent positionnement local</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-sm space-y-1">
              <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider font-mono">Taux d'Acceptation de Chantiers</span>
              <span className="text-2xl font-black text-slate-900 block font-mono">96.7%</span>
              <span className="text-[10px] text-emerald-600 font-bold block">✓ Supérieur aux standards (90%)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-sm space-y-1">
              <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider font-mono">Temps de Réponse Moyen</span>
              <span className="text-2xl font-black text-slate-950 block font-mono">4.5 min</span>
              <span className="text-[10px] text-blue-600 font-extrabold block">⚡ Hyper Rapide (+ Notification SMS)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-sm space-y-1">
              <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider font-mono">Score de satisfaction artisan</span>
              <span className="text-2xl font-black text-slate-950 block font-mono">{activeProvider.rating.toFixed(1)} / 5</span>
              <span className="text-[10px] text-amber-500 font-bold block">★ {activeProvider.reviewsCount} avis certifiés</span>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Bar visual representations using flexible tailwind bar stacks (perfect for non-canvas robust rendering) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
              <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>📊 Courbe d'Évolution des Revenus Mensuels (Simulée)</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">Janvier - Juin 2026</span>
              </h4>

              {/* Dynamic Styled pure HTML/CSS histogram/charts mapping */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 border-b border-l border-slate-200">
                {[
                  { month: 'Jan 26', revenue: 95000, height: '40%' },
                  { month: 'Fév 26', revenue: 145000, height: '60%' },
                  { month: 'Mar 26', revenue: 120000, height: '50%' },
                  { month: 'Avr 26', revenue: 180000, height: '75%' },
                  { month: 'Mai 26', revenue: 210000, height: '88%' },
                  { month: 'Juin 26', revenue: financials.net, height: financials.net > 0 ? `${Math.min(100, (financials.net / 250000) * 100)}%` : '5%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group font-mono">
                    <span className="text-[9px] font-black text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white px-1 py-0.5 rounded leading-none text-center block">
                      {item.revenue.toLocaleString()}
                    </span>
                    {/* Visual filled rounded gauge */}
                    <div 
                      style={{ height: item.height }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 group-hover:bg-amber-500 rounded-t-lg transition-all duration-300 relative shadow-sm"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/30 rounded-t-lg"></div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 mt-2 font-mono whitespace-nowrap">{item.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500 justify-center">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-emerald-500 rounded"></span> Revenus Reçus</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-amber-500 rounded"></span> Sélection Actuelle</span>
              </div>
            </div>

            {/* List breakdown of revenue streams */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Recettes Mensuelles Détaillées
              </h4>

              <div className="space-y-3 font-mono">
                {[
                  { month: 'Janvier 2026', gross: '105 500 FCFA', net: '95 000 FCFA', status: 'Terminé' },
                  { month: 'Février 2026', gross: '161 000 FCFA', net: '145 000 FCFA', status: 'Terminé' },
                  { month: 'Mars 2026', gross: '133 300 FCFA', net: '120 000 FCFA', status: 'Terminé' },
                  { month: 'Avril 2026', gross: '200 000 FCFA', net: '180 000 FCFA', status: 'Terminé' },
                  { month: 'Mai 2026', gross: '233 000 FCFA', net: '210 000 FCFA', status: 'Terminé' },
                  { month: 'Juin 2026 (En cours)', gross: `${financials.gross.toLocaleString()} FCFA`, net: `${financials.net.toLocaleString()} FCFA`, status: 'Actif' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-extrabold">
                      <span className="text-slate-800 text-[11px] font-sans">{item.month}</span>
                      <span className="text-emerald-600 text-[11px]">{item.net}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>Volume Brut: {item.gross}</span>
                      <span className={item.status === 'Actif' ? 'text-blue-500 font-extrabold animate-pulse' : 'text-slate-400'}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SUBTAB 3: EDIT PROFILE --- */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 max-w-2xl shadow-sm">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-950 text-base">Éditer vos informations professionnelles</h3>
            <p className="text-slate-500 text-xs mt-0.5">Ces informations seront projetées instantanément sur l'espace de recherche des clients.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">Téléphone Professionnel</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Phone size={14} />
                </span>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-9 rounded-xl font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">E-mail de contact</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-9 rounded-xl font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">Tarif d'inscription réglé (FCFA)</label>
              <input
                type="number"
                min={1000}
                max={50000}
                step={500}
                required
                disabled
                value={5000}
                className="w-full bg-slate-100 border border-slate-200 p-2.5 rounded-xl font-mono text-slate-500 font-bold cursor-not-allowed"
              />
              <span className="text-[10px] text-emerald-600 font-semibold block">✓ Acquitté lors de l'activation du compte</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">Ville d'opération</label>
              <input
                type="text"
                disabled
                value={activeProvider.city}
                className="w-full bg-slate-105 border border-slate-200 p-2.5 rounded-xl text-slate-500 font-semibold select-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-700 uppercase">Présentation / Expérience / Bio professionnelle</label>
            <textarea
              rows={4}
              required
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all"
          >
            Enregistrer les modifications du Profil
          </button>
        </form>
      )}

      {/* --- SUBTAB 4: REVIEWS LEFT --- */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-950 text-base">Commentaires et réputation</h3>
            <p className="text-slate-500 text-xs mt-0.5">Les avis clients influencent directement votre visibilité et votre positionnement dans la liste de recherche.</p>
          </div>

          {activeProvider.reviews.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Star className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-500 text-sm">Aucune évaluation n'a encore été soumise pour votre profil par les clients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProvider.reviews.map(rev => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm space-y-3 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{rev.clientName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">{rev.date}</span>
                    </div>

                    <div className="bg-amber-50 text-amber-600 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Star size={12} className="fill-amber-500" />
                      {rev.rating}/5
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}