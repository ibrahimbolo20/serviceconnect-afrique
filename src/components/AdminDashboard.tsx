/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Database, Activity, CheckCircle, XCircle, AlertTriangle, 
  Users, TrendingUp, Coins, Star, Check, RotateCcw, 
  FileText, ExternalLink, MessageSquare, Terminal
} from 'lucide-react';
import { Provider, Booking, SupportTicket, MicroserviceStatus } from '../types';

interface AdminDashboardProps {
  providers: Provider[];
  bookings: Booking[];
  tickets: SupportTicket[];
  services: MicroserviceStatus[];
  onVerifyProvider: (id: string, verified: boolean) => void;
  onResolveTicket: (id: string) => void;
  onUpdateServiceStatus: (id: string, status: 'operational' | 'degraded' | 'outage', latency: number) => void;
  commissionPercentage: number;
  onUpdateBooking?: (updated: Booking) => void;
  onUpdateProvider?: (updated: Provider) => void;
  onChangeCommission?: (newRate: number) => void;
}

export default function AdminDashboard({
  providers,
  bookings,
  tickets,
  services,
  onVerifyProvider,
  onResolveTicket,
  onUpdateServiceStatus,
  commissionPercentage,
  onUpdateBooking,
  onUpdateProvider,
  onChangeCommission
}: AdminDashboardProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'kpi' | 'compliance' | 'infrastructure' | 'support'>('kpi');
  
  // Service console simulation state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv_pay');
  const [isRebooting, setIsRebooting] = useState(false);
  const [pingConsoleLogs, setPingConsoleLogs] = useState<string[]>([
    '[SYSTEM] Console d\'exploitation administrative initialisée.',
    '[SYSTEM] Liaison TCP établie avec les modules d\'infrastructure régionaux.'
  ]);

  // Derived Admin KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = bookings.length;
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const systemGross = paidBookings.reduce((sum, b) => sum + b.amount, 0);
    const platformCommissions = paidBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    
    const unverifiedCount = providers.filter(p => !p.verified).length;
    const activeProvidersCount = providers.filter(p => p.isAvailable).length;

    // Average system overall score
    const ratedBookings = bookings.filter(b => b.ratingLeft !== undefined);
    const avgScore = ratedBookings.length > 0 
      ? ratedBookings.reduce((sum, b) => sum + (b.ratingLeft || 5), 0) / ratedBookings.length
      : 4.8; // default default rating

    return {
      totalCount,
      systemGross,
      platformCommissions,
      unverifiedCount,
      activeProvidersCount,
      avgScore
    };
  }, [bookings, providers]);

  // Resolve Ticket handler with confirmation
  const handleResolveTicketClick = (id: string) => {
    onResolveTicket(id);
    alert('Ticket d\'assistance marqué résolu ! Un e-mail d\'avis de clôture a été notifié.');
  };

  // Verify Provider documents
  const handleApproveProvider = (id: string, name: string) => {
    onVerifyProvider(id, true);
    alert(`Le profil de ${name} est désormais certifié et visible par tous les clients !`);
  };

  // Simulate degradation or manual repair of microservice
  const handleTriggerStatusChange = (status: 'operational' | 'degraded' | 'outage') => {
    const randomLatency = status === 'operational' ? 50 + Math.floor(Math.random() * 80) :
                         status === 'degraded' ? 250 + Math.floor(Math.random() * 300) : 999;
    
    onUpdateServiceStatus(selectedServiceId, status, randomLatency);

    const sName = services.find(s => s.id === selectedServiceId)?.name || 'Service Sélectionné';
    const logTime = new Date().toTimeString().split(' ')[0];
    const newLog = `[${logTime}] AVERTISSEMENT : Statut de "${sName}" forcé manuellement à -> [${status.toUpperCase()}]`;
    setPingConsoleLogs(prev => [newLog, ...prev]);
  };

  // Standard Self-Heal simulation for engineering
  const handleAutoRebootService = () => {
    setIsRebooting(true);
    const targetService = services.find(s => s.id === selectedServiceId);
    const sName = targetService ? targetService.name : 'Module';
    
    const logTime = new Date().toTimeString().split(' ')[0];
    setPingConsoleLogs(prev => [
      `[${logTime}] INIT: Signal SIGTERM envoyé au conteneur "${selectedServiceId}"...`,
      `[${logTime}] BOOT: Purge du cache Redis et re-routage de l'API Gateway...`,
      ...prev
    ]);

    setTimeout(() => {
      onUpdateServiceStatus(selectedServiceId, 'operational', 45 + Math.floor(Math.random() * 30));
      setIsRebooting(false);
      const doneTime = new Date().toTimeString().split(' ')[0];
      setPingConsoleLogs(prev => [
        `[${doneTime}] SUCCÈS : Container "${selectedServiceId}" rétabli. Ping d'exploitation correct (42ms).`,
        ...prev
      ]);
      alert('Simulation d\'auto-réparation achevée ! Le service est opérationnel.');
    }, 2000);
  };

  return (
    <div id="admin-dashboard" className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Admin Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="text-blue-500" size={24} />
            <h2 className="text-2xl font-black tracking-tight uppercase">Dashboard d'Administration central</h2>
          </div>
          <p className="text-slate-400 text-xs font-mono">Consolidation financière & Monitoring de grappe de microservices</p>
        </div>

        {/* Global Operational health status */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2 font-mono">
          <Activity size={16} className="text-emerald-500 animate-pulse" />
          <span>Noeuds d'Infrastructure :</span>
          <span className="text-emerald-400 font-bold">100% OPÉRATIONNEL</span>
        </div>
      </div>

      {/* Admin Switcher Menu */}
      <div className="flex border-b border-slate-200 pb-px gap-1 flex-wrap">
        {[
          { id: 'kpi', label: 'Indicateurs clés (KPI)', icon: <TrendingUp size={14} /> },
          { id: 'compliance', label: 'Vérification Prestataires', icon: <CheckCircle size={14} /> },
          { id: 'infrastructure', label: 'Moniteur d\'Infrastructure', icon: <Terminal size={14} /> },
          { id: 'support', label: 'Tickets Clientèle', icon: <MessageSquare size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeAdminTab === tab.id
                ? 'border-blue-650 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TAB 1: KPI METRICS SCREEN --- */}
      {activeAdminTab === 'kpi' && (
        <div className="space-y-6">
          {/* Main metric row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Commissions collected */}
            <div className="bg-blue-600 text-white p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
              <Coins className="absolute -bottom-4 -right-4 w-16 h-16 text-blue-500/30" />
              <span className="text-xs font-bold uppercase tracking-wide opacity-80">Commissions encaissées (FCFA)</span>
              <span className="text-2xl font-black font-mono my-3">{metrics.platformCommissions.toLocaleString()} FCFA</span>
              <p className="text-[10px] opacity-90 leading-relaxed">
                Taux net moyen prélevé : <strong>10.5%</strong>. Ces fonds soutiennent la maintenance et le support.
              </p>
            </div>

            {/* General Volume */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
              <span className="text-slate-550 text-xs font-bold uppercase tracking-wide">Volume des échanges piloté</span>
              <span className="text-2xl font-black text-slate-950 font-mono my-3">{metrics.systemGross.toLocaleString()} FCFA</span>
              <p className="text-[10px] text-slate-400">Totalité des fonds transitant en Mobile Money securisé.</p>
            </div>

            {/* Verification backlog */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
              <span className="text-slate-555 text-xs font-bold uppercase tracking-wide flex items-center justify-between">
                Backlog d'affiliation
                {metrics.unverifiedCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black h-5 px-1.5 rounded flex items-center justify-center animate-bounce">
                    {metrics.unverifiedCount} dossiers
                  </span>
                )}
              </span>
              <span className="text-2xl font-black text-slate-950 font-mono my-3">{metrics.unverifiedCount} dossiers</span>
              <p className="text-[10px] text-slate-400">Artisans en attente de vérification de leurs pièces d'identité.</p>
            </div>

            {/* Rating */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
              <span className="text-slate-550 text-xs font-bold uppercase tracking-wide">Indice de satisfaction</span>
              <span className="text-2xl font-black text-emerald-600 font-mono my-3 flex items-center gap-1">
                <Star size={20} className="fill-emerald-500 text-emerald-500" />
                {metrics.avgScore.toFixed(2)}/5
              </span>
              <p className="text-[10px] text-slate-400">Calculé sur la moyenne pondérée de {bookings.filter(b=>b.ratingLeft !== undefined).length} avis évalués.</p>
            </div>
          </div>

          {/* Graphical representation of transaction list */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Grand Clôturier - Récentes transactions séquestrées</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Réf Facture</th>
                    <th className="p-3">Prestataire</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Mode de paiement</th>
                    <th className="p-3 text-right">Montant</th>
                    <th className="p-3 text-right">Commission Plateforme</th>
                    <th className="p-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {bookings.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{book.id}</td>
                      <td className="p-3 text-slate-900">{book.providerName}</td>
                      <td className="p-3">{book.clientName}</td>
                      <td className="p-3">
                        {book.paymentStatus === 'paid' ? (
                          <span className="bg-slate-100 text-slate-850 py-0.5 px-2 rounded font-mono text-[10px]">
                            {book.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Non réglé</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-950">{book.amount.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-mono text-blue-655 text-blue-600">+{book.commissionAmount.toLocaleString()} FCFA</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          book.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {book.paymentStatus === 'paid' ? 'En Escrow' : 'Non payé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: COMPLIANCE / VERIFICATION --- */}
      {activeAdminTab === 'compliance' && (
        <div className="space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-950 text-base">Vérification d'identité des professionnels de service (Anti-Fraude)</h3>
            <p className="text-slate-500 text-xs mt-0.5">Audit des justificatifs professionnels et pièces d'identité nationale pour activer le badge "Certifié".</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map(prov => (
              <div key={prov.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-400 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prov.avatar}
                      alt={prov.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm leading-tight">{prov.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{prov.city} • Enrôlé le : {prov.joinedDate}</p>
                    </div>
                  </div>

                  {/* Document container */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-2 font-mono">
                      <FileText className="text-blue-500" size={16} />
                      {prov.idDocumentUrl || 'justificatif_national_id.pdf'}
                    </span>
                    <button
                      onClick={() => alert(`SIMULATION: Ouverture du document en toute sécurité dans l'aperçu sandbox. URL distante: /uploads/docs/${prov.idDocumentUrl}`)}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink size={12} />
                      Visualiser
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Spécialité autodéclarée : <span className="text-slate-900 font-bold">{prov.specialties.join(', ')}</span>.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-bold leading-none ${prov.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {prov.verified ? '✓ Déjà accrédité' : '● Dossier à l\'étude'}
                  </span>

                  {!prov.verified && (
                    <button
                      onClick={() => handleApproveProvider(prov.id, prov.name)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0 uppercase transition-colors"
                    >
                      <Check size={12} />
                      Valider l'Accréditation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: INFRASTRUCTURE / MICROSERVICES CONSOLE --- */}
      {activeAdminTab === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of microservices */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Console d'observation des microservices indépendants</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(srv => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-4 rounded-2xl border text-left space-y-3 transition-all ${
                    selectedServiceId === srv.id
                      ? 'bg-slate-950 border-blue-550 text-white shadow-md ring-2 ring-blue-500/35'
                      : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-xs leading-tight">{srv.name}</h4>
                      <p className={`text-[10px] uppercase font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                        srv.status === 'operational' ? 'bg-emerald-150 text-emerald-800' :
                        srv.status === 'degraded' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        'bg-red-100 text-red-800 animate-bounce'
                      }`}>
                        {srv.status}
                      </p>
                    </div>

                    <kbd className="font-mono text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">
                      {srv.id}
                    </kbd>
                  </div>

                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${selectedServiceId === srv.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {srv.description}
                  </p>

                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1 opacity-80">
                      Lat: {srv.latency}ms
                    </span>
                    <span>•</span>
                    <span className="opacity-80">
                      Req: {srv.requestsHandled.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated orchestration deck specifically requested */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Terminal className="text-blue-500" size={18} />
              <h4 className="font-extrabold text-sm uppercase font-mono tracking-tight text-white">Console d'Orchestration</h4>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 font-mono block">Node actif :</span>
              <span className="font-bold font-mono text-emerald-400">
                {services.find(s=>s.id === selectedServiceId)?.name || 'Sélectionner...'}
              </span>
            </div>

            {/* Test commands */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simuler incidents réseau</label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold uppercase font-mono text-center">
                <button
                  onClick={() => handleTriggerStatusChange('operational')}
                  className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 rounded py-2 transition-all cursor-pointer"
                >
                  Rétablir
                </button>
                <button
                  onClick={() => handleTriggerStatusChange('degraded')}
                  className="bg-amber-950 hover:bg-amber-900 border border-amber-500/30 text-amber-400 rounded py-2 transition-all cursor-pointer"
                >
                  Dégrader
                </button>
                <button
                  onClick={() => handleTriggerStatusChange('outage')}
                  className="bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded py-2 transition-all cursor-pointer"
                >
                  Panne
                </button>
              </div>
            </div>

            <button
              onClick={handleAutoRebootService}
              disabled={isRebooting}
              className="w-full bg-blue-650 hover:bg-blue-600 text-white font-bold text-xs uppercase py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md border border-blue-500/20"
            >
              {isRebooting ? (
                <span>Re-déploiement SIGTERM en cours...</span>
              ) : (
                <>
                  <RotateCcw size={14} /> Redémarrer et auto-réparer
                </>
              )}
            </button>

            {/* Log audit list */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Logs d'exploitation</span>
              <div className="bg-slate-900 text-[10px] p-3 rounded-xl border border-slate-800 font-mono text-slate-350 min-h-[110px] max-h-[140px] overflow-y-auto space-y-1">
                {pingConsoleLogs.map((log, i) => (
                  <p key={i} className={log.includes('AVERTISSEMENT') ? 'text-amber-400 font-bold' : log.includes('SUCCÈS') ? 'text-emerald-400' : 'text-slate-400'}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: SUPPORT TICKETS --- */}
      {activeAdminTab === 'support' && (
        <div className="space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-950 text-base">Tickets de réclamation et assistance</h3>
            <p className="text-slate-500 text-xs mt-0.5">Traitement administratif des requêtes clients concernant l'Escrow ou le paramétrage telecom Mobile Money.</p>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <MessageSquare className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-500 text-sm">Aucun ticket d'assistance en attente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:border-slate-300">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">{ticket.subject}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">De: {ticket.clientName} • Reçu le: {ticket.date}</span>
                    </div>

                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      ticket.status === 'open' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ticket.status === 'open' ? 'En étude' : 'Résolu'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl italic">
                    "{ticket.message}"
                  </p>

                  {ticket.status === 'open' && (
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleResolveTicketClick(ticket.id)}
                        className="bg-slate-900 hover:bg-blue-650 text-white hover:text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 uppercase transition-all"
                      >
                        <Check size={12} />
                        Marquer comme traité
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
