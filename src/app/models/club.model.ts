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
  pricing: PricingPlan[];
  events: ClubEvent[];
  faq: FaqItem[];
  contact: ClubContact;
  videoUrl?: string;
}
