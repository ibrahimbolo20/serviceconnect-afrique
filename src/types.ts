/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  method: string;
  phone: string;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  category: string;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  hourlyRate: number; // In FCFA (XOF/XAF)
  city: string; // Bamako, Abidjan, Dakar, Douala, Yaoundé, Cotonou
  verified: boolean;
  idDocumentStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  idDocumentUrl?: string; // Verification document front
  idDocumentBackUrl?: string; // Validation document back
  isAvailable: boolean;
  description: string;
  joinedDate: string;
  completedJobs: number;
  reviews: Review[];
  walletBalance?: number; // cleared funds ready for payout
  withdrawnTotal?: number; // sum of success payouts
  withdrawals?: { id: string; amount: number; method: string; phone: string; status: 'pending' | 'completed' | 'rejected'; date: string }[];
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending_payment' | 'paid' | 'refunded';
export type PaymentMethod = 'Orange Money' | 'Wave' | 'MTN Mobile Money' | 'Carte Bancaire' | 'Espèces (Cash)';

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerCategory: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  description: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentPhone?: string;
  amount: number;
  isEmergency: boolean;
  isInstant?: boolean; // Premium instant booking flag
  commissionAmount: number; // 5-15% commission
  ratingLeft?: number;
  reviewLeft?: string;
  reported?: {
    reason: string;
    details: string;
    date: string;
    status: 'pending' | 'resolved';
    resolution?: string;
  };
}

export interface SupportTicket {
  id: string;
  clientName: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  date: string;
}

export interface MicroserviceStatus {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: number; // ms
  requestsHandled: number;
}
