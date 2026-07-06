/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider, Booking, SupportTicket, MicroserviceStatus } from '../types';

export const CITIES = [
  'Bamako (Mali)',
  'Sikasso (Mali)',
  'Ségou (Mali)',
  'Mopti (Mali)',
  'Kayes (Mali)',
  'Koutiala (Mali)',
  'Koulikoro (Mali)'
];

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'it_maintenance',
    name: 'IT & Maintenance',
    description: 'Réparation de téléphones, ordinateurs, installation réseau et dépannage wifi.',
    iconName: 'Laptop'
  },
  {
    id: 'bricolage',
    name: 'Bricolage & Électricité',
    description: 'Électriciens certifiés, plomberie avancée, peinture et réparations diverses.',
    iconName: 'Wrench'
  },
  {
    id: 'mecanique',
    name: 'Mécanique (Le plus proche)',
    description: 'Dépannage d\'urgence auto/moto, SOS panne de moteur, révision et remorquage rapide.',
    iconName: 'Wrench'
  },
  {
    id: 'delivery',
    name: 'Livraison & Transport',
    description: 'Chauffeurs rapides, coursiers à moto pour plis urgents, déménagement.',
    iconName: 'Truck'
  },
  {
    id: 'health',
    name: 'Santé & Bien-être',
    description: 'Soins infirmiers à domicile, kinésithérapie, massage et soins de bien-être.',
    iconName: 'HeartPulse'
  },
  {
    id: 'coaching_tutor',
    name: 'Soutien & Formation',
    description: 'Répétiteurs scolaires, cours d\'informatique, langues locales ou internationales.',
    iconName: 'GraduationCap'
  },
  {
    id: 'events_freelance',
    name: 'Événementiel & Freelance',
    description: 'Photographes de mariage, sonorisation événementielle, design graphique.',
    iconName: 'Camera'
  },
  {
    id: 'nettoyage_entretien',
    name: 'Nettoyage & Entretien',
    description: 'Services de grand ménage, nettoyage de bureaux, repassage et entretien de jardins.',
    iconName: 'Sparkles'
  }
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov_1',
    name: 'Mamadou Diallo',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
    phone: '+223 76 54 32 10',
    email: 'm.diallo@bricolage-mali.com',
    category: 'bricolage',
    specialties: ['Électricité Générale', 'Plomberie d\'urgence', 'Serrurerie'],
    rating: 4.8,
    reviewsCount: 14,
    hourlyRate: 5000,
    city: 'Bamako (Mali)',
    verified: true,
    isAvailable: true,
    description: 'Artisan électricien et plombier certifié avec plus de 10 ans d\'expérience à Bamako. Intervention rapide pour toutes vos pannes du quotidien.',
    joinedDate: '2024-01-15',
    completedJobs: 112,
    reviews: [
      {
        id: 'rev_1_1',
        clientName: 'Fatoumata Traoré',
        rating: 5,
        comment: 'Excellent travail pour mon installation de climatiseur. Très professionnel.',
        date: '2026-05-18'
      },
      {
        id: 'rev_1_2',
        clientName: 'Amadou Konaté',
        rating: 4,
        comment: 'Rapide et efficace pour une fuite d\'eau en plein milieu de la nuit.',
        date: '2026-05-10'
      }
    ]
  },
  {
    id: 'prov_2',
    name: 'Dramane Keïta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+223 66 12 45 78',
    email: 'dramane.keita@gmail.com',
    category: 'mecanique',
    specialties: ['Mécanique Auto', 'Dépannage Moto', 'SOS Panne Moteur'],
    rating: 4.9,
    reviewsCount: 22,
    hourlyRate: 7500,
    city: 'Ségou (Mali)',
    verified: true,
    isAvailable: true,
    description: 'Spécialiste de l\'entretien et de la réparation automobile toutes marques. Possède sa remorqueuse d\'urgence.',
    joinedDate: '2024-03-10',
    completedJobs: 184,
    reviews: [
      {
        id: 'rev_2_1',
        clientName: 'Ousmane Sow',
        rating: 5,
        comment: 'Dépannage fantastique sur l\'autoroute de Ségou. Il m\'a évité une grosse galère !',
        date: '2026-05-19'
      }
    ]
  },
  {
    id: 'prov_3',
    name: 'Mariam Sidibé',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    phone: '+223 75 01 02 03',
    email: 'mariam.sidibe@it-mali.net',
    category: 'it_maintenance',
    specialties: ['Réparation PC & Smartphones', 'Installation Réseau', 'Wifi & Fibre'],
    rating: 4.7,
    reviewsCount: 8,
    hourlyRate: 6000,
    city: 'Bamako (Mali)',
    verified: true,
    isAvailable: true,
    description: 'Ingénieure en systèmes et réseaux, j\'assure la maintenance rapide de vos équipements informatiques et de votre réseau internet domestique.',
    joinedDate: '2025-01-08',
    completedJobs: 43,
    reviews: [
      {
        id: 'rev_3_1',
        clientName: 'Saliou Diarra',
        rating: 5,
        comment: 'Configuration de notre box fibre et répéteurs wifi impeccable chez nous.',
        date: '2026-05-12'
      }
    ]
  },
  {
    id: 'prov_4',
    name: 'Ousmane Diarra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phone: '+223 60 90 80 70',
    email: 'diarra.delivery@orange.ml',
    category: 'delivery',
    specialties: ['Transport Urgent', 'Livreur Moto', 'Déménagement'],
    rating: 4.6,
    reviewsCount: 19,
    hourlyRate: 4000,
    city: 'Mopti (Mali)',
    verified: true,
    isAvailable: false,
    description: 'Coursier disponible pour tous vos plis et colis urgents, ainsi que l\'aide au déménagement professionnel.',
    joinedDate: '2024-06-20',
    completedJobs: 98,
    reviews: [
      {
        id: 'rev_4_1',
        clientName: 'Assetou Touré',
        rating: 4,
        comment: 'Livraison de colis fragiles à bon port et sans aucun dégât. Merci !',
        date: '2026-05-15'
      }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book_1',
    providerId: 'prov_1',
    providerName: 'Mamadou Diallo',
    providerCategory: 'bricolage',
    clientId: 'c_user_sim_1',
    clientName: 'Adama Coulibaly',
    clientPhone: '+223 71 23 45 67',
    date: '2026-05-22',
    time: '14:30',
    description: 'Prise de courant grillée dans le salon avec fumée suspecte. Électricité générale à restaurer.',
    status: 'pending',
    paymentStatus: 'unpaid',
    amount: 15000,
    isEmergency: true,
    commissionAmount: 1500
  },
  {
    id: 'book_2',
    providerId: 'prov_1',
    providerName: 'Mamadou Diallo',
    providerCategory: 'bricolage',
    clientId: 'c_user_sim_2',
    clientName: 'Fatoumata Traoré',
    clientPhone: '+223 65 43 21 00',
    date: '2026-05-18',
    time: '10:00',
    description: 'Changement complet thermique et raccordement de climatiseur split.',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Wave',
    paymentPhone: '+223 65 43 21 00',
    amount: 25000,
    isEmergency: false,
    commissionAmount: 2500,
    ratingLeft: 5,
    reviewLeft: 'Excellent travail pour mon installation de climatiseur. Très professionnel.'
  },
  {
    id: 'book_3',
    providerId: 'prov_2',
    providerName: 'Dramane Keïta',
    providerCategory: 'mecanique',
    clientId: 'c_user_sim_3',
    clientName: 'Ousmane Sow',
    clientPhone: '+223 79 12 34 56',
    date: '2026-05-19',
    time: '18:15',
    description: 'Dépannage de culasse moto qui cale suite à surchauffe à Ségou.',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'Orange Money',
    paymentPhone: '+223 79 12 34 56',
    amount: 12000,
    isEmergency: false,
    commissionAmount: 1200,
    ratingLeft: 5,
    reviewLeft: 'Dépannage fantastique sur l\'autoroute de Ségou. Il m\'a évité une grosse galère !'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_1',
    clientName: 'Lamine Sangaré',
    subject: 'Remboursement suite annulation',
    message: 'Mon prestataire s\'est désisté à cause d\'une crevaison. Je souhaite récupérer mon séquestre de 15 000 FCFA sur mon compte Wave.',
    status: 'open',
    date: '2026-05-20'
  }
];

export const INITIAL_SERVICES: MicroserviceStatus[] = [
  {
    id: 'srv_auth',
    name: 'Module Utilisateurs & Sécurité',
    description: 'Gère les inscriptions, les profils des clients/prestataires ainsi que la double-authentification par SMS.',
    status: 'operational',
    latency: 54,
    requestsHandled: 84321
  },
  {
    id: 'srv_prov',
    name: 'Module Prestataires & Agenda',
    description: 'Fouille géolocalisée par ville, gestion des plannings en temps réel et stockage des documents d\'identité.',
    status: 'operational',
    latency: 82,
    requestsHandled: 59120
  },
  {
    id: 'srv_book',
    name: 'Module Réservations & Matchmaking',
    description: 'Orchestrateur d\'étapes de réservations, dispatching d\'alertes express à moins de 2km d\'un sinistre.',
    status: 'operational',
    latency: 110,
    requestsHandled: 12402
  },
  {
    id: 'srv_pay',
    name: 'Passerelle PayAfrik (Aggregateur)',
    description: 'Intègre les APIs telecom Orange Money Webhook, MTN Momo, Wave Express Checkout & Stripe.',
    status: 'operational',
    latency: 195,
    requestsHandled: 9115
  },
  {
    id: 'srv_notif',
    name: 'Passerelle SMS & WhatsApp',
    description: 'Envoi autonome des notifications de confirmation, rappels d\'agenda et OTP de séquestre (Escrow).',
    status: 'operational',
    latency: 240,
    requestsHandled: 48312
  },
  {
    id: 'srv_eval',
    name: 'Moteur d\'Évaluation & Confiance',
    description: 'Compilation des notes moyennes pondérées, modération d\'avis diffamants et calcul de renommée.',
    status: 'operational',
    latency: 35,
    requestsHandled: 5410
  }
];
