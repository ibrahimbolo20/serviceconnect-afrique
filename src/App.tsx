/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RoleSelector, { RoleType } from './components/RoleSelector';
import LandingPage from './components/LandingPage';
import ClientDashboard from './components/ClientDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import AdminDashboard from './components/AdminDashboard';

import { 
  INITIAL_PROVIDERS, 
  INITIAL_BOOKINGS, 
  INITIAL_TICKETS, 
  INITIAL_SERVICES 
} from './data/mockData';
import { Provider, Booking, SupportTicket, MicroserviceStatus, PaymentMethod, BookingStatus } from './types';

export default function App() {
  const [role, setRole] = useState<RoleType>('landing');

  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'en' | 'wo' | 'bm'>('fr');
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [clientFilters, setClientFilters] = useState({
    category: 'all',
    city: 'all',
    search: ''
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [services, setServices] = useState<MicroserviceStatus[]>([]);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);

  // ==================== CONNEXION AU BACKEND ====================
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les prestataires depuis le Backend
        const res = await fetch('http://localhost:5000/api/providers');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProviders(data);
          } else {
            setProviders(INITIAL_PROVIDERS);
          }
        } else {
          setProviders(INITIAL_PROVIDERS);
        }
      } catch (error) {
        console.warn("Backend non joignable → utilisation des données locales", error);
        setProviders(INITIAL_PROVIDERS);
      }

      // Charger le reste depuis localStorage
      try {
        const storedBookings = localStorage.getItem('sc_bookings');
        const storedTickets = localStorage.getItem('sc_tickets');
        const storedServices = localStorage.getItem('sc_services');
        const storedComm = localStorage.getItem('sc_commission');

        if (storedBookings) setBookings(JSON.parse(storedBookings));
        else setBookings(INITIAL_BOOKINGS);

        if (storedTickets) setTickets(JSON.parse(storedTickets));
        else setTickets(INITIAL_TICKETS);

        if (storedServices) setServices(JSON.parse(storedServices));
        else setServices(INITIAL_SERVICES);

        if (storedComm) setCommissionPercentage(Number(storedComm));

        const storedLang = localStorage.getItem('sc_language') as any;
        if (storedLang) setCurrentLanguage(storedLang);

        const storedBandwidth = localStorage.getItem('sc_low_bandwidth');
        if (storedBandwidth) setIsLowBandwidth(storedBandwidth === 'true');

        const storedTheme = localStorage.getItem('sc_dark_mode');
        if (storedTheme) setIsDarkMode(storedTheme === 'true');
      } catch (e) {
        console.warn('Erreur localStorage', e);
      }
    };

    loadData();
  }, []);

  // Mise à jour du thème
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sauvegarde localStorage
  useEffect(() => { localStorage.setItem('sc_providers', JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem('sc_bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('sc_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('sc_services', JSON.stringify(services)); }, [services]);

  const handleLanguageChange = (lang: 'fr' | 'en' | 'wo' | 'bm') => {
    setCurrentLanguage(lang);
    localStorage.setItem('sc_language', lang);
  };

  const handleToggleLowBandwidth = () => {
    const nextVal = !isLowBandwidth;
    setIsLowBandwidth(nextVal);
    localStorage.setItem('sc_low_bandwidth', String(nextVal));
  };

  const handleToggleDarkMode = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    localStorage.setItem('sc_dark_mode', String(nextVal));
  };

  const handleNavigateToExplore = (filters: { category: string; city: string; search: string }) => {
    setClientFilters(filters);
    setRole('client');
  };

  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (id: string, status: BookingStatus, score?: number, text?: string) => {
    setBookings(prev => prev.map(book => {
      if (book.id !== id) return book;
      const updatedBook: Booking = { ...book, status };
      
      if (score !== undefined) {
        updatedBook.ratingLeft = score;
        updatedBook.reviewLeft = text || '';
        
        setProviders(prevProviders => prevProviders.map(p => {
          if (p.id !== book.providerId) return p;
          const newReview = {
            id: 'rev_' + Date.now(),
            clientName: book.clientName,
            rating: score,
            comment: text || '',
            date: new Date().toISOString().split('T')[0]
          };
          const newReviews = [newReview, ...p.reviews];
          const total = p.reviews.reduce((sum, r) => sum + r.rating, 0) + score;
          const newAvg = total / (p.reviews.length + 1);

          return {
            ...p,
            reviews: newReviews,
            reviewsCount: p.reviewsCount + 1,
            rating: Number(newAvg.toFixed(1)),
            completedJobs: p.completedJobs + 1
          };
        }));
      }
      return updatedBook;
    }));
  };

  const handleUpdateBookingPayment = (id: string, method: PaymentMethod, phone: string) => {
    setBookings(prev => prev.map(book => 
      book.id === id ? { ...book, paymentStatus: 'paid', paymentMethod: method, paymentPhone: phone } : book
    ));
  };

  const handleUpdateBooking = (updated: Booking) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const handleUpdateProvider = (updated: Provider) => {
    setProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleUpdateCommission = (pct: number) => {
    setCommissionPercentage(pct);
    localStorage.setItem('sc_commission', String(pct));
  };

  const handleUpdateProviderAvailability = (id: string, isAvailable: boolean) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, isAvailable } : p));
  };

  const handleUpdateProviderProfile = (id: string, updatedFields: Partial<Provider>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const handleAddProvider = (newProvider: Provider) => {
    setProviders(prev => [newProvider, ...prev]);
  };

  const handleVerifyProvider = (id: string, verified: boolean) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, verified } : p));
  };

  const handleResolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };

  const handleUpdateServiceStatus = (id: string, status: 'operational' | 'degraded' | 'outage', latency: number) => {
    setServices(prev => prev.map(srv => srv.id === id ? { ...srv, status, latency, requestsHandled: srv.requestsHandled + 1 } : srv));
  };

  const handleResetSandbox = () => {
    if (window.confirm('Réinitialiser toutes les données ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="app-root-wrapper" className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${isDarkMode ? 'bg-[#0d0d0d] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <RoleSelector 
        currentRole={role} 
        onChangeRole={setRole}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleLanguageChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isLowBandwidth={isLowBandwidth}
      />

      <main className="flex-grow">
        {role === 'landing' && (
          <LandingPage
            providers={providers}
            onNavigateToExplore={handleNavigateToExplore}
            onSelectRole={setRole}
            currentLanguage={currentLanguage}
            isLowBandwidth={isLowBandwidth}
            onToggleLowBandwidth={handleToggleLowBandwidth}
          />
        )}

        {role === 'client' && (
          <ClientDashboard
            providers={providers}
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBookingPayment={handleUpdateBookingPayment}
            initialCategory={clientFilters.category}
            initialCity={clientFilters.city}
            initialSearch={clientFilters.search}
            commissionPercentage={commissionPercentage}
            onUpdateBooking={handleUpdateBooking}
            onUpdateProvider={handleUpdateProvider}
          />
        )}

        {role === 'provider' && (
          <ProviderDashboard
            providers={providers}
            bookings={bookings}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateProviderAvailability={handleUpdateProviderAvailability}
            onUpdateProviderProfile={handleUpdateProviderProfile}
            onAddProvider={handleAddProvider}
            onUpdateBooking={handleUpdateBooking}
            onUpdateProvider={handleUpdateProvider}
          />
        )}

        {role === 'admin' && (
          <AdminDashboard
            providers={providers}
            bookings={bookings}
            tickets={tickets}
            services={services}
            onVerifyProvider={handleVerifyProvider}
            onResolveTicket={handleResolveTicket}
            onUpdateServiceStatus={handleUpdateServiceStatus}
            commissionPercentage={commissionPercentage}
            onUpdateBooking={handleUpdateBooking}
            onUpdateProvider={handleUpdateProvider}
            onChangeCommission={handleUpdateCommission}
          />
        )}
      </main>

      <footer id="app-footer" className="bg-[#0d0d0d] border-t border-slate-900 text-slate-500 py-6 text-xs text-center select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ServiceConnect Mali • MVP Pilote National. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <button onClick={handleResetSandbox} className="text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer">
              Réinitialiser la simulation locale
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}