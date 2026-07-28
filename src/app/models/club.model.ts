export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening';
export const DEFAULT_RADIUS_KM = 5;

export interface TrainingSlot {
  day: WeekDay;
  period: DayPeriod;
}

export interface SearchCriteria {
  sports: string[];
  days: WeekDay[];
  times: DayPeriod[];
}

export interface OpeningHours {
  days: string;
  hours: string;
}

export interface PricingPlan {
  title: string;
  audience?: string;
  description: string;
  priceLines: string[];
  ctaLabel: string;
}

export interface ClubEvent {
  title: string;
  subtitle: string;
  price: string;
  description: string;
  imageUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

export interface ClubContact {
  phone: string;
  email: string;
  instagram: string;
}

export interface Club {
  id: number;
  slug: string;
  name: string;
  address: string;
  distance?: string;
  sportTypes: string[];
  rating: number;
  position: { lat: number; lng: number };
  heroTitle: string;
  heroSubtitle: string;
  presentation: string;
  whyJoin: string;
  openingHours: OpeningHours[];
  schedule: TrainingSlot[];
  pricing: PricingPlan[];
  events: ClubEvent[];
  faq: FaqItem[];
  contact: ClubContact;
  videoUrl?: string;
}

export interface LocationSearch {
  address: string;
  position: { lat: number; lng: number };
  radiusKm: number;
}