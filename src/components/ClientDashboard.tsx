/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Star, Calendar, 
  Clock, CreditCard, Phone, ShieldAlert, Sparkles, Check, 
  Smartphone, Send, Wrench, Laptop, Truck, HeartPulse, 
  GraduationCap, Camera, Compass, ClipboardList, AlertCircle, Loader2,
  MessageSquare
} from 'lucide-react';
import { Provider, Booking, PaymentMethod, BookingStatus } from '../types';
import { CATEGORIES, CITIES, CategoryInfo } from '../data/mockData';
import InteractiveMap from './InteractiveMap';
import LiveChat from './LiveChat';

interface ClientDashboardProps {
  providers: Provider[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus, score?: number, text?: string) => void;
  onUpdateBookingPayment: (id: string, method: PaymentMethod, phone: string) => void;
  initialCategory?: string;
  initialCity?: string;
  initialSearch?: string;
  commissionPercentage?: number;
  onUpdateBooking?: (booking: Booking) => void;
  onUpdateProvider?: (provider: Provider) => void;
}

// Icon helper function based on string name
function getCategoryIcon(iconName: string, size = 18) {
  switch (iconName) {
    case 'Laptop': return <Laptop size={size} />;
    case 'Wrench': return <Wrench size={size} />;
    case 'Truck': return <Truck size={size} />;
    case 'HeartPulse': return <HeartPulse size={size} />;
    case 'GraduationCap': return <GraduationCap size={size} />;
    case 'Camera': return <Camera size={size} />;
    case 'Sparkles': return <Sparkles size={size} />;
    default: return <Wrench size={size} />;
  }
}

export default function ClientDashboard({ 
  providers, 
  bookings, 
  onAddBooking, 
  onUpdateBookingStatus,
  onUpdateBookingPayment,
  initialCategory = 'all',
  initialCity = 'all',
  initialSearch = '',
  commissionPercentage = 10,
  onUpdateBooking,
  onUpdateProvider
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'explore' | 'carte' | 'bookings' | 'chat' | 'sos'>('explore');
  const [chatProviderId, setChatProviderId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);

  // Sync state parameters from external navigation routes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialCity) setSelectedCity(initialCity);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialCity, initialSearch]);

  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'distance'>('rating');
  const [maxRadius, setMaxRadius] = useState<number>(15);

  // Favorites state persistent in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sc_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sc_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Pseudo-random physical distance coordinates computed from hashing
  const getProviderDistance = useMemo(() => {
    return (provId: string) => {
      let hash = 0;
      for (let i = 0; i < provId.length; i++) {
        hash = provId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const dist = 0.4 + (Math.abs(hash) % 125) / 10; // ranges from 0.4 km to 12.9 km
      return Number(dist.toFixed(1));
    };
  }, []);

  // Real-time tracking modal state
  const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);
  const [trackingProgress, setTrackingProgress] = useState<number>(0);
  const [trackingStepText, setTrackingStepText] = useState<string>('Préparation de l\'outillage');

  // Real-time tracking auto-increment animation
  useEffect(() => {
    let interval: any;
    if (trackingBookingId) {
      setTrackingProgress(5);
      setTrackingStepText('Validation de l\'adresse et départ de l\'artisan');
      interval = setInterval(() => {
        setTrackingProgress(prev => {
          const next = prev + 12;
          if (next >= 100) {
            setTrackingStepText('Arrivé sur votre lieu d\'intervention 📍');
            clearInterval(interval);
            return 100;
          }
          if (next > 75) setTrackingStepText('Approche imminente (moins de 2 minutes)');
          else if (next > 45) setTrackingStepText('Artisan en transit sur l\'artère principale');
          else if (next > 20) setTrackingStepText('Artisan en déplacement (circulation fluide)');
          return next;
        });
      }, 3500);
    } else {
      setTrackingProgress(0);
    }
    return () => clearInterval(interval);
  }, [trackingBookingId]);

  // Disputes state list
  const [reportingBooking, setReportingBooking] = useState<Booking | null>(null);
  const [reportReason, setReportReason] = useState<string>('Prestation non conforme');
  const [reportDetails, setReportDetails] = useState<string>('');

  const handleReportBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingBooking || !onUpdateBooking) return;

    const updatedBooking: Booking = {
      ...reportingBooking,
      status: 'pending', // Revert or hold status for investigation
      reported: {
        reason: reportReason,
        details: reportDetails,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }
    };
    onUpdateBooking(updatedBooking);
    setReportingBooking(null);
    setReportDetails('');
    alert('⚠️ Signalement de litige enregistré avec succès. Un modérateur ServiceConnect étudiera le dossier sous 24h.');
  };

  // Booking states
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingStep, setBookingStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [isInstantBookingInput, setIsInstantBookingInput] = useState<boolean>(true); // Enabled by default

  // Payment Simulation State
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'Orange Money' | 'Wave' | 'MTN Mobile Money'>('Orange Money');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [typedOtp, setTypedOtp] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Evaluation state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [reviewNote, setReviewNote] = useState('');

  // Emergency SOS state
  const [sosCategory, setSosCategory] = useState('bricolage');
  const [sosDescription, setSosDescription] = useState('Dépannage plomberie immédiat pour fuite d\'eau majeure.');
  const [sosCity, setSosCity] = useState('Bamako (Mali)');
  const [sosStep, setSosStep] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [sosMatchedProvider, setSosMatchedProvider] = useState<Provider | null>(null);
  const [sosCreatedBooking, setSosCreatedBooking] = useState<Booking | null>(null);

  // Filter and sort logic with Proximity + Favorites
  const filteredProviders = useMemo(() => {
    return providers.filter(prov => {
      const matchSearch = prov.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prov.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          prov.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || prov.category === selectedCategory;
      const matchCity = selectedCity === 'all' || prov.city === selectedCity;
      const matchVerified = !onlyVerified || prov.verified;
      const matchFavorite = !onlyFavorites || favorites.includes(prov.id);
      
      const distance = getProviderDistance(prov.id);
      const matchRadius = distance <= maxRadius;

      return matchSearch && matchCat && matchCity && matchVerified && matchFavorite && matchRadius;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price_desc') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'distance') return getProviderDistance(a.id) - getProviderDistance(b.id);
      return 0;
    });
  }, [providers, searchQuery, selectedCategory, selectedCity, onlyVerified, onlyFavorites, favorites, maxRadius, sortBy, getProviderDistance]);

  // Handle open booking wizard
  const handleOpenBooking = (provider: Provider) => {
    setBookingProvider(provider);
    setBookingDate('');
    setBookingTime('');
    setBookingDesc('');
    setBookingStep('form');
    setIsInstantBookingInput(true); // Default premium instant booking
  };

  // Propose standard reservation (trigger confirmation step)
  const handleProposeReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProvider) return;
    setBookingStep('confirm');
  };

  // Submit and finalize standard reservation after final confirmation
  const handleFinalizeReservation = () => {
    if (!bookingProvider) return;

    const baseAmount = bookingProvider.hourlyRate * 3; // Estimate default 3h job
    const commission = Math.round(baseAmount * (commissionPercentage / 100)); // Dynamic platform fee

    const newBooking: Booking = {
      id: 'book_' + Date.now(),
      providerId: bookingProvider.id,
      providerName: bookingProvider.name,
      providerCategory: bookingProvider.category,
      clientId: 'c_user_sim',
      clientName: 'Visiteur ServiceConnect', // Dynamic user inside simulation
      clientPhone: '+223 76 54 32 10',
      date: bookingDate || '2026-06-03',
      time: bookingTime || '10:00',
      description: bookingDesc || 'Demande de service standard.',
      status: isInstantBookingInput ? 'accepted' : 'pending',
      paymentStatus: 'unpaid',
      amount: baseAmount,
      isEmergency: false,
      isInstant: isInstantBookingInput,
      commissionAmount: commission
    };

    onAddBooking(newBooking);
    setBookingStep('success');
  };

  // Trigger paying via simulation
  const handleOpenPayment = (booking: Booking) => {
    setPayingBooking(booking);
    setPaymentPhone(booking.clientPhone || '');
    setOtpSent(false);
    setOtpCode('');
    setTypedOtp('');
    setPaymentSuccess(false);
    setPaymentProcessing(false);
  };

  // Generate mock telecom OTP
  const handleSendOtp = () => {
    if (!paymentPhone.match(/^\+?[0-9\s-]{8,15}$/)) {
      alert('Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    setPaymentProcessing(true);
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpCode(code);
      setOtpSent(true);
      setPaymentProcessing(false);
    }, 1200);
  };

  // Verify simulated Mobile money OTP
  const handleVerifyOtp = () => {
    if (typedOtp !== otpCode) {
      alert('Code OTP incorrect. Veuillez réessayer ou vérifier les notifications de simulation.');
      return;
    }
    setPaymentProcessing(true);
    setTimeout(() => {
      onUpdateBookingPayment(payingBooking!.id, paymentProvider, paymentPhone);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  // Submit Evaluation and Rating
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;

    onUpdateBookingStatus(ratingBooking.id, 'completed', selectedScore, reviewNote);
    setRatingBooking(null);
    setReviewNote('');
    alert('Merci pour votre évaluation ! Les scores d\'évaluation du prestataire ont été mis à jour.');
  };

  // High-fidelity Emergency SOS Dispatch Routine
  const handleSOSUrgenceLaunch = () => {
    setSosStep('searching');
    setSosMatchedProvider(null);
    setSosCreatedBooking(null);

    // Simulate network latency & geo-matchmaking of neighboring microservice
    setTimeout(() => {
      // Find someone in that category who is available
      const matching = providers.find(p => p.category === sosCategory && p.isAvailable);
      const chosen = matching || providers[0]; // fallback
      setSosMatchedProvider(chosen);
      setSosStep('matched');

      // Create booking instantly with Premium pricing (Hourly Rate * 2 base duration + 1.35x Emergency multiplier)
      const baseMinutesAmount = Math.round(chosen.hourlyRate * 2 * 1.35);
      const commission = Math.round(baseMinutesAmount * 0.15); // Higher administrative commission for emergency dispatch

      const emergencyBooking: Booking = {
        id: 'book_sos_' + Date.now(),
        providerId: chosen.id,
        providerName: chosen.name,
        providerCategory: chosen.category,
        clientId: 'c_user_sim',
        clientName: 'Visiteur ServiceConnect (S.O.S)',
        clientPhone: '+225 01 02 03 04 05',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        description: `🚨 URGENCE SIGNALÉE (Dépanned Express) : ${sosDescription}`,
        status: 'accepted', // Auto-accepted for express service
        paymentStatus: 'unpaid',
        amount: baseMinutesAmount,
        isEmergency: true,
        commissionAmount: commission
      };

      onAddBooking(emergencyBooking);
      setSosCreatedBooking(emergencyBooking);
    }, 2800);
  };

  const handleOpenChatForProvider = (providerId: string) => {
    setChatProviderId(providerId);
    setActiveTab('chat');
  };

  return (
    <div id="client-dashboard" className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Intro Greetings & Subtitle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Akwaba, Cher Client <Sparkles className="text-amber-500 fill-amber-500" size={20} />
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Trouvez les meilleurs techniciens et prestataires pour tous vos besoins du quotidien.
          </p>
        </div>

        {/* Client Sub Tabs */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl self-stretch md:self-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'explore' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Compass size={16} />
            <span>Découvrir</span>
          </button>
          
          <button
            onClick={() => setActiveTab('carte')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'carte' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <MapPin size={16} className="text-amber-500" />
            <span>Carte Live</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all relative cursor-pointer ${
              activeTab === 'bookings' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ClipboardList size={16} />
            <span>Mes Suivis</span>
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'chat' 
                ? 'bg-white text-slate-900 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <MessageSquare size={16} className="text-sky-500" />
            <span>Messagerie</span>
          </button>

          <button
            onClick={() => setActiveTab('sos')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'sos' 
                ? 'bg-red-600 text-white shadow-sm font-bold animate-pulse' 
                : 'text-red-600 hover:bg-red-50 hover:bg-opacity-50'
            }`}
          >
            <ShieldAlert size={16} className="animate-pulse" />
            <span>SOS Urgence</span>
          </button>
        </div>
      </div>

      {/* --- Tab 1: Catalog Catalog / Explore --- */}
      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 shadow-sm h-fit">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="font-bold text-slate-950 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-slate-500" />
                Filtres Avancés
              </span>
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setSearchQuery('');
                  setOnlyVerified(false);
                  setOnlyFavorites(false);
                  setMaxRadius(15);
                  setSortBy('rating');
                }}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold"
              >
                Réinitialiser
              </button>
            </div>

            {/* Country/City Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Localisation</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Toutes les villes du Mali</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Proximity Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Rayon de proximité</label>
                <span className="text-xs font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-full">{maxRadius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={maxRadius}
                onChange={(e) => setMaxRadius(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 italic">Masque les artisans situés au-delà de ce rayon.</p>
            </div>

            {/* Category Select Tag List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Catégorie</label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-slate-900 text-white font-semibold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  Tous les Services
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                      selectedCategory === cat.id 
                        ? 'bg-amber-500 text-slate-950 font-bold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(cat.iconName, 14)}
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox verified */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="checked-verified-only"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="checked-verified-only" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                  Certifiés uniquement
                </label>
              </div>

              {/* Checkbox favorites */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="checked-favorites-only"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="checked-favorites-only" className="text-sm font-semibold text-slate-700 select-none cursor-pointer flex items-center gap-1">
                  Favoris ⭐ ({favorites.length})
                </label>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="rating">Meilleures Évaluations (★)</option>
                <option value="price_asc">Tarif horaire : croissant</option>
                <option value="price_desc">Tarif horaire : décroissant</option>
                <option value="distance">Distance : plus proche d'abord 📍</option>
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search size={20} />
              </span>
              <input
                type="text"
                placeholder="Rechercher par compétence, nom, spécialités (ex: électricité, soudure, réseau, Mac)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Search metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-100/50 p-2 rounded-xl">
              <span>{filteredProviders.length} prestataires trouvés</span>
              {selectedCategory !== 'all' && (
                <span>Filtré par: <strong className="text-amber-600">{CATEGORIES.find(c=>c.id === selectedCategory)?.name}</strong></span>
              )}
            </div>

            {/* Grid of matches */}
            {filteredProviders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <AlertCircle size={40} className="mx-auto text-slate-300 mb-2" />
                <h3 className="font-bold text-slate-900 text-lg">Aucun prestataire trouvé</h3>
                <p className="text-slate-500 text-sm mt-1">Essayez d'élargir vos filtres ou de modifier votre recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map(prov => (
                  <div key={prov.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all gap-4">
                    
                    {/* Upper card block */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img 
                          src={prov.avatar} 
                          alt={prov.name} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-inner"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap w-full">
                            <h3 className="font-bold text-slate-950 text-base leading-tight">{prov.name}</h3>
                            {prov.verified ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check size={10} /> Vérifié
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full">En attente</span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(prov.id);
                              }}
                              className="ml-auto text-slate-400 hover:text-amber-500 transition-colors p-1"
                              title="Ajouter aux favoris"
                            >
                              <Star
                                size={18}
                                className={favorites.includes(prov.id) ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-amber-500"}
                              />
                            </button>
                          </div>
                          <span className="text-xs text-slate-500 block truncate font-mono mt-0.5 flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {prov.city} • <strong className="text-blue-600 font-bold">{getProviderDistance(prov.id)} km</strong> de vous
                          </span>
                        </div>
                      </div>

                      {/* Display Rating & Completed jobs */}
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl text-xs font-semibold">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star size={14} className="fill-amber-500" />
                          {prov.rating.toFixed(1)} <sub className="text-slate-400 font-normal">({prov.reviewsCount})</sub>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-700 font-mono">
                          {prov.completedJobs} missions réussies
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="ml-auto text-emerald-600 font-bold font-mono">
                          Inscription: {prov.hourlyRate.toLocaleString()} FCFA
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                        {prov.description}
                      </p>

                      {/* Specialties tags */}
                      <div className="flex flex-wrap gap-1">
                        {prov.specialties.map(spec => (
                          <span key={spec} className="bg-slate-100 border border-slate-1.5 text-slate-700 text-[10px] py-1 px-2 rounded-lg font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Trigger buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${prov.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                        <span className="text-xs font-semibold text-slate-600">
                          {prov.isAvailable ? 'Disponible de suite' : 'Indisponible'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenChatForProvider(prov.id)}
                          className="bg-slate-100 hover:bg-sky-100 text-slate-800 hover:text-sky-950 border border-slate-200 hover:border-sky-300 font-extrabold text-[11px] px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Ouvrir messagerie"
                        >
                          💬 Chat
                        </button>
                        <button
                          onClick={() => handleOpenBooking(prov)}
                          className="bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Tab: Carte interactive --- */}
      {activeTab === 'carte' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 border p-4.5 rounded-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-950 flex items-center gap-1.5">
                📍 Carte Géolocalisée Live (Simulée)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Retrouvez tous nos techniciens équipés de balise GPS autour de vous à {selectedCity === 'all' ? "votre position d'inscription" : selectedCity.split(' (')[0]}.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
              GPS Synchronisé ✓
            </span>
          </div>

          <InteractiveMap
            providers={providers}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
            onSelectProvider={(prov) => {
              handleOpenBooking(prov);
            }}
          />
        </div>
      )}

      {/* --- Tab: Chat Messenger --- */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 border p-4.5 rounded-2xl">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                💬 Salon de Messagerie Privé
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Négociez en direct, échangez des descriptifs ou des photos pour un diagnostic technique précis.
              </p>
            </div>
          </div>
          
          <LiveChat
            providers={providers}
            activeProviderId={chatProviderId}
          />
        </div>
      )}

      {/* --- Tab 2: Bookings Track list --- */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase">Historique des commandes et suivi des chantiers</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">Pilote national ServiceConnect • Séquestre intégré orange, Wave, MTN</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <ClipboardList size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm">Vous n'avez pas encore d'activité dans votre historique.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left column: Active Chantiers */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b pb-2 text-xs uppercase flex items-center gap-1.5 tracking-wider">
                  <span className="h-2 w-2 bg-amber-500 rounded-full animate-ping"></span>
                  Missions en cours & Suivi Live ({bookings.filter(b=> b.status === 'accepted' || b.status === 'pending').length})
                </h4>
                
                {bookings.filter(b=> b.status === 'accepted' || b.status === 'pending').length === 0 ? (
                  <div className="bg-slate-50 p-6 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    Aucune mission active en cours de réalisation de suite. Accédez au catalogue pour planifier des travaux.
                  </div>
                ) : (
                  bookings.filter(b=> b.status === 'accepted' || b.status === 'pending').map(book => (
                    <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 hover:border-amber-400 transition-all">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <span className="font-bold text-slate-950 text-sm">{book.providerName}</span>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded ml-2 font-mono uppercase">
                            {book.providerCategory.replace('_', ' ')}
                          </span>
                        </div>
                        {book.isInstant && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                            ⚡ Instantané
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-semibold text-slate-400">
                        <span>Horaires : {book.date} • {book.time}</span>
                        <span className="text-slate-950">Montant : {book.amount.toLocaleString()} FCFA</span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                        "{book.description}"
                      </p>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs">
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            book.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700 animate-pulse'
                          }`}>
                            {book.status === 'accepted' ? 'Accepté' : 'En attente'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Securisé : {book.paymentStatus === 'paid' ? 'Payé (En Escrow)' : 'Non payé'}</span>
                        </div>

                        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                          {book.status === 'accepted' && book.paymentStatus === 'unpaid' && (
                            <button
                              onClick={() => handleOpenPayment(book)}
                              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 uppercase"
                            >
                              <CreditCard size={10} /> Payer (Séquestre)
                            </button>
                          )}
                          {book.status === 'accepted' && (
                            <button
                              onClick={() => {
                                setTrackingBookingId(book.id);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1"
                            >
                              📍 Suivre l'artisan
                            </button>
                          )}
                          {book.status === 'pending' && (
                            <button
                              onClick={() => onUpdateBookingStatus(book.id, 'cancelled')}
                              className="text-red-500 hover:text-red-700 hover:underline text-[10px] font-bold px-2 py-1"
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right column: Historic Chantiers */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b pb-2 text-xs uppercase flex items-center gap-1.5 tracking-wider">
                  <ClipboardList size={14} className="text-slate-400" />
                  Historique Complet & Litiges ({bookings.filter(b=> b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined').length})
                </h4>

                {bookings.filter(b=> b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined').length === 0 ? (
                  <div className="bg-slate-50 p-6 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                    Aucun chantier clôturé dans l'historique complet pour le moment.
                  </div>
                ) : (
                  bookings.filter(b=> b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined').map(book => (
                    <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{book.providerName}</span>
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded ml-2 font-mono uppercase">
                            {book.providerCategory.replace('_', ' ')}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          book.status === 'completed' ? 'bg-blue-50 text-blue-850' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {book.status === 'completed' ? 'Terminé' : book.status === 'declined' ? 'Décliné' : 'Annulé'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-450 text-slate-400">
                        <span>Fait le: {book.date}</span>
                        <span className="text-slate-800">Cout total: {book.amount.toLocaleString()} FCFA</span>
                      </div>

                      {/* Display reviews left */}
                      {book.ratingLeft && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-2 text-xs rounded-xl flex items-start gap-2">
                          <Star className="text-amber-500 fill-amber-500 mt-0.5 shrink-0" size={13} />
                          <div>
                            <span className="font-bold text-amber-955 text-amber-900 text-[10px]">Avis ({book.ratingLeft}/5) :</span>
                            <span className="text-slate-700 italic block">"{book.reviewLeft}"</span>
                          </div>
                        </div>
                      )}

                      {/* Display dispute/signalement logs if exist */}
                      {book.reported ? (
                        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl space-y-1">
                          <div className="flex items-center gap-1 text-red-700 font-extrabold text-[10px] uppercase">
                            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></span>
                            Litige en cours de médiation
                          </div>
                          <p className="text-[10px] font-bold text-slate-850">Motif : {book.reported.reason}</p>
                          <p className="text-[10px] text-slate-500 italic">"{book.reported.details}"</p>
                          {book.reported.resolution && (
                            <div className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg text-[10px] font-semibold">
                              💡 Résolution définitive de l'Admin : {book.reported.resolution}
                            </div>
                          )}
                        </div>
                      ) : (
                        book.status === 'completed' && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <button
                              onClick={() => setReportingBooking(book)}
                              className="text-red-500 hover:text-red-700 active:underline text-[10px] font-bold flex items-center gap-1 uppercase"
                            >
                              ⚠️ Signaler un problème / Litige
                            </button>

                            {!book.ratingLeft && (
                              <button
                                onClick={() => setRatingBooking(book)}
                                className="bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 px-2.5 py-1 rounded text-[10px] uppercase font-bold"
                              >
                                Évaluer ★
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* --- Tab 3: Emergency Dispatch SOS --- */}
      {activeTab === 'sos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 text-white rounded-3xl p-6 lg:p-8 flex flex-col justify-between border border-slate-800 space-y-6 relative overflow-hidden">
            {/* Ambient Red glow decoration for Emergency */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-600/20 blur-3xl rounded-full"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-red-100 text-red-800 p-2.5 rounded-2xl font-black text-xl animate-pulse">
                  🚨
                </span>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-white uppercase sm:text-2xl">
                    Service Sécurisé SOS EXPRESS
                  </h3>
                  <p className="text-slate-400 text-xs font-mono">Dispatcheur autonome pour urgences locales</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Une panne d'électricité générale avant un événement important ? Une fuite d'eau critique chez vous ? 
                L'algorithme de ServiceConnect recherche les prestataires certifiés les plus proches à moins de 2 kilomètres, 
                les contacte instantanément par SMS/WhatsApp automatisés, et attribue le travail en moins de 3 minutes.
              </p>

              {/* Warning Premium badge */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-amber-200 leading-relaxed font-semibold">
                  Tarification Express Premium : Ce service est soumis à une majoration de <strong className="text-amber-400 font-extrabold">+35%</strong> par rapport aux tarifs ordinaires pour réactivité prioritaire.
                </p>
              </div>

              {/* SOS input form */}
              {sosStep === 'idle' && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Catégorie d'Urgence</label>
                      <select
                        value={sosCategory}
                        onChange={(e) => setSosCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-sm p-3 rounded-xl text-white"
                      >
                        <option value="bricolage">Plomberie & Électricité</option>
                        <option value="mecanique">⚙️ Mécanique & SOS Panne Moto/Auto</option>
                        <option value="nettoyage_entretien">✨ Nettoyage & Entretien d'urgence</option>
                        <option value="it_maintenance">Assistance IT urgence</option>
                        <option value="delivery">Transport & Livraison Express</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Votre Ville</label>
                      <select
                        value={sosCity}
                        onChange={(e) => setSosCity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-sm p-3 rounded-xl text-white"
                      >
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Décrivez le problème critique en quelques mots</label>
                    <textarea
                      rows={2}
                      value={sosDescription}
                      onChange={(e) => setSosDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-sm p-3 rounded-xl text-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      placeholder="Ex: canalisation bouchée causant une légère inondation..."
                    />
                  </div>

                  <button
                    onClick={handleSOSUrgenceLaunch}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all uppercase flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={16} />
                    Déclencher l'alerte d'urgence express
                  </button>
                </div>
              )}

              {/* SOS progress screen simulation */}
              {sosStep === 'searching' && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="text-red-500 animate-spin" size={42} />
                  <div>
                    <h4 className="font-bold text-white text-base">Recherche de prestataires de secours...</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Notre microservice ping les gares de coursiers et artisans à proximité par liaison WhatsApp automatisée...
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden max-w-xs">
                    <div className="bg-red-500 h-full animate-pulse" style={{ width: '80%' }}></div>
                  </div>
                </div>
              )}

              {/* SOS Matched view */}
              {sosStep === 'matched' && sosMatchedProvider && (
                <div className="bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Check size={16} />
                    <span>PRESTATAIRE EN ROUTE !</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={sosMatchedProvider.avatar}
                      alt={sosMatchedProvider.name}
                      className="w-14 h-14 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white leading-tight">{sosMatchedProvider.name}</h4>
                      <p className="text-xs text-slate-400">{sosMatchedProvider.phone}</p>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 mt-1 inline-block">
                        Arrivée estimée : ~15 minutes
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tarif standard :</span>
                      <span>{(sosMatchedProvider.hourlyRate * 2).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>Majorations d'Urgence (+35%) :</span>
                      <span>+{Math.round(sosMatchedProvider.hourlyRate * 2 * 0.35).toLocaleString()} FCFA</span>
                    </div>
                    <hr className="border-slate-800 my-1" />
                    <div className="flex justify-between font-bold text-white text-sm">
                      <span>Total Séquestre :</span>
                      <span>{sosCreatedBooking?.amount.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Un SMS de tracking avec coordonnées exactes a été envoyé à votre numéro. Le paiement reste bloqué en caution jusqu'à validation de fin de mission.
                  </p>

                  <button
                    onClick={() => {
                      setSosStep('idle');
                      setActiveTab('bookings');
                    }}
                    className="w-full bg-white text-slate-950 font-bold py-2 rounded-xl text-xs transition-hover hover:bg-slate-100"
                  >
                    Voir dans mes réservations
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right explanation panel for African Market specifics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm h-fit">
            <h4 className="font-bold text-slate-950 text-sm flex items-center gap-1.5 uppercase">
              <Sparkles size={16} className="text-amber-500" />
              Spécificités Mali connecté
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Smartphone className="text-amber-500 mt-0.5" size={16} />
                <div>
                  <h5 className="font-bold text-slate-900">Notifications Hors-Ligne</h5>
                  <p className="mt-0.5 leading-relaxed">Vos prestataires reçoivent des notifications immédiates même avec peu de réseau grâce à nos ponts WhatsApp & SMS automatisés.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CreditCard className="text-emerald-500 mt-0.5" size={16} />
                <div>
                  <h5 className="font-bold text-slate-900">Simuler le Mobile Money</h5>
                  <p className="mt-0.5 leading-relaxed">Gérez vos paiements en toute confiance via Orange, Wave ou MTN. Pas de carte bancaire requise pour le marché pilote.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="text-blue-500 mt-0.5" size={16} />
                <div>
                  <h5 className="font-bold text-slate-900">Assistance client direct</h5>
                  <p className="mt-0.5 leading-relaxed">Une équipe de modérateurs révise vos retours hebdomadaires pour garantir le professionnalisme de chaque artisan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WIZARD MODAL: Standard Bookings Creator --- */}
      {bookingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">Nouvelle Réservation</h3>
                <p className="text-slate-500 text-xs">Avec {bookingProvider.name}</p>
              </div>
              <button 
                onClick={() => setBookingProvider(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {bookingStep === 'form' ? (
              <form onSubmit={handleProposeReservation} className="space-y-4">
                
                {/* Visual cost preview */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-900">
                  <span className="font-medium">Estimation de durée standard (3h) :</span>
                  <span className="font-bold font-mono">{(bookingProvider.hourlyRate * 3).toLocaleString()} FCFA</span>
                </div>

                {/* Date & Time selection */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date souhaitée</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Heure d'intervention</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                {/* Task description */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Description des travaux ou de la panne</label>
                  <textarea
                    rows={3}
                    required
                    value={bookingDesc}
                    onChange={(e) => setBookingDesc(e.target.value)}
                    placeholder="Précisez votre besoin (ex: poser 3 appliques, réparer le raccordement de douche)..."
                    className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Instant approval option */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="checkbox-is-instant-booking"
                    checked={isInstantBookingInput}
                    onChange={(e) => setIsInstantBookingInput(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 border-slate-300 mt-1 cursor-pointer pointer-events-auto"
                  />
                  <div className="text-[11px] leading-snug">
                    <label htmlFor="checkbox-is-instant-booking" className="font-extrabold text-amber-950 flex items-center gap-1 cursor-pointer">
                      ⚡ Réservation instantanée (Premium)
                    </label>
                    <p className="text-slate-600 mt-0.5">Le prestataire est engagé automatiquement et la mission commence immédiatement sans attente d'acceptation manuelle.</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-500 leading-relaxed font-mono">
                  Le prestataire recevra une notification ping et pourra accepter ou planifier avec vous un ajustement d'horaire.
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all text-xs uppercase shadow-sm cursor-pointer"
                >
                  Continuer vers le résumé
                </button>
              </form>
            ) : bookingStep === 'confirm' ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-250 pb-2 flex items-center gap-1.5 uppercase">
                    <Sparkles size={14} className="text-amber-500" />
                    Résumé de la réservation
                  </h4>
                  
                  {/* Provider Avatar & Info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={bookingProvider.avatar} 
                      alt={bookingProvider.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-slate-950 text-sm">{bookingProvider.name}</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">{bookingProvider.city}</p>
                    </div>
                  </div>

                  {/* Scheduled Date/Time block */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-150 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Date</span>
                        <span className="text-slate-800 font-bold">{bookingDate || 'Non spécifiée'}</span>
                      </div>
                    </div>
                    <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-150 flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Heure</span>
                        <span className="text-slate-800 font-bold">{bookingTime || 'Non spécifiée'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description block */}
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Description du besoin :</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic leading-relaxed max-h-24 overflow-y-auto">
                      "{bookingDesc || 'Service standard'}"
                    </p>
                  </div>

                  {/* Pricing grid */}
                  <div className="border-t border-slate-200 pt-3 space-y-1.5 text-slate-600 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>Tarif horaire :</span>
                      <span>{bookingProvider.hourlyRate.toLocaleString()} FCFA / h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimation (3h minimum) :</span>
                      <span>{(bookingProvider.hourlyRate * 3).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de mise en relation (10%) :</span>
                      <span>{Math.round(bookingProvider.hourlyRate * 3 * 0.1).toLocaleString()} FCFA</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-1.5 flex justify-between font-bold text-slate-950 text-xs text-sans">
                      <span>TOTAL ESTIMÉ :</span>
                      <span>{(bookingProvider.hourlyRate * 3).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingStep('form')}
                    className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all font-sans cursor-pointer uppercase tracking-wider text-[10px]"
                  >
                    Retour / Modifier
                  </button>
                  <button
                    onClick={handleFinalizeReservation}
                    className="flex-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold py-3 rounded-xl transition-all font-sans cursor-pointer uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check size={13} />
                    Confirmer & Envoyer
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex bg-emerald-100 text-emerald-800 p-3 rounded-full">
                  <Check size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Demande envoyée avec succès !</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Le prestataire {bookingProvider.name} a été averti par notification push et se prononcera sous peu. Vous pouvez suivre l'état de votre demande dans la rubrique "Mes Réservations".
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBookingProvider(null);
                    setActiveTab('bookings');
                  }}
                  className="bg-slate-950 text-white text-xs font-bold py-2 px-6 rounded-lg cursor-pointer"
                >
                  Voir mes réservations
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: Interactive Sandbox Mobile Money Payment --- */}
      {payingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-1">
                  <CreditCard size={18} className="text-amber-500" />
                  Passerelle de Paiement Sécurisé
                </h3>
                <p className="text-slate-400 text-xs font-mono">Simulateur Mobile Money Escrow v1.2</p>
              </div>
              <button 
                onClick={() => setPayingBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {!paymentSuccess ? (
              <div className="space-y-4">
                {/* Cost Detail Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Prestataire :</span>
                    <span className="font-bold text-slate-950">{payingBooking.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Service :</span>
                    <span className="font-bold text-slate-950 uppercase text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded">
                      {payingBooking.providerCategory}
                    </span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between font-bold text-slate-950 text-sm font-mono">
                    <span>Total à valider :</span>
                    <span className="text-emerald-600">{payingBooking.amount.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* Choose Provider with distinct visual styles matching actual operators */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">1. Choisissez votre opérateur</label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Orange orange */}
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('Orange Money')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                        paymentProvider === 'Orange Money'
                          ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="h-5 w-5 bg-orange-500 rounded flex items-center justify-center text-white text-[9px] font-black">OM</span>
                      <span className="text-[10px]">Orange Money</span>
                    </button>

                    {/* Wave blue */}
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('Wave')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                        paymentProvider === 'Wave'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="h-5 w-5 bg-sky-400 rounded-full flex items-center justify-center text-white text-[9px] font-black">W</span>
                      <span className="text-[10px]">Wave</span>
                    </button>

                    {/* MTN Yellow */}
                    <button
                      type="button"
                      onClick={() => setPaymentProvider('MTN Mobile Money')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                        paymentProvider === 'MTN Mobile Money'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-950 font-bold shadow-sm'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="h-5 w-5 bg-yellow-400 rounded flex items-center justify-center text-slate-950 text-[9px] font-black">MTN</span>
                      <span className="text-[10px]">MTN MoMo</span>
                    </button>
                  </div>
                </div>

                {/* Enter telephone */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 uppercase">2. Entrez votre numéro de compte Mobile Money</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Smartphone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="+225 07 12 34 56 78"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-250 rounded-xl font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Send/verify block */}
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={paymentProcessing}
                    className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {paymentProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Demande de code OTP...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Recevoir le Code de Validation (OTP)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3.5 border-t pt-3.5 border-slate-100">
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                      <p className="text-[10px] text-amber-900 leading-relaxed font-mono font-semibold">
                        [DEMO PAYSAGE TELECOM] Un SMS simulé contenant le code OTP suivant vient d'être dépêché sur votre terminal : 
                        <strong className="text-amber-700 bg-amber-100 font-extrabold text-sm px-2 py-0.5 rounded ml-1.5">{otpCode}</strong>
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <label className="font-bold text-slate-700 uppercase">Entrez le code OTP reçu</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={typedOtp}
                        onChange={(e) => setTypedOtp(e.target.value)}
                        placeholder="Ex: 5821"
                        className="w-full tracking-widest text-center text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono text-slate-950 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={paymentProcessing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-1.5"
                    >
                      {paymentProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Validation en cours...
                        </>
                      ) : (
                        'Sécuriser et Confirmer le paiement'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex bg-emerald-100 text-emerald-800 p-3 rounded-full">
                  <Check size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Paiement Validé !</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Le montant de {payingBooking.amount.toLocaleString()} FCFA est à présent séquestré (Escrow) sur la plateforme. Le virement sera automatiquement émis sur le compte de {payingBooking.providerName} une fois que vous aurez déclaré l'intervention comme "Rétablie/Terminée".
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPayingBooking(null);
                    setActiveTab('bookings');
                  }}
                  className="bg-slate-950 text-white text-xs font-bold py-2.5 px-6 rounded-xl"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL: Rate and Review Completed Booking --- */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Évaluer le service de {ratingBooking.providerName}</h3>
                <p className="text-slate-400 text-xs">Aidez la communauté à identifier les prestataires de confiance.</p>
              </div>
              <button 
                onClick={() => setRatingBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Stars selection */}
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-slate-700 block text-left">Sélectionnez une note :</label>
                <div className="flex justify-center gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSelectedScore(score)}
                      className="transition-transform duration-200 hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={score <= selectedScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment detail */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">Votre évaluation détaillée</label>
                <textarea
                  rows={3}
                  required
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Ex: Ponction de suite, amical et très soigneux. Matériel adéquat."
                  className="w-full bg-slate-50 border border-slate-250 p-2.5 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 font-bold py-2.5 rounded-xl text-white text-xs uppercase"
              >
                Enregistrer l'évaluation
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
