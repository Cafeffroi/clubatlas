import { Injectable } from '@angular/core';
import { Club, ClubEvent, FaqItem, PricingPlan } from '../models/club.model';

function pricingFor(sport: string): PricingPlan[] {
  return [
    {
      title: 'Séance découverte',
      audience: '1 personne',
      description: `Un premier cours de ${sport} encadré, sans engagement.`,
      priceLines: ['15€ la séance'],
      ctaLabel: 'Réserver',
    },
    {
      title: 'Abonnement mensuel',
      audience: 'Accès illimité',
      description: 'Accès libre aux créneaux et à tous les cours collectifs.',
      priceLines: ['45€ / mois', '-10% pour les étudiants'],
      ctaLabel: "S'abonner",
    },
    {
      title: 'Licence annuelle',
      audience: 'Membres du club',
      description: 'Licence fédérale, compétitions et stages inclus.',
      priceLines: ['320€ / saison', 'Paiement en 3 fois possible'],
      ctaLabel: 'Adhérer',
    },
  ];
}

function eventsFor(sport: string): ClubEvent[] {
  return [
    {
      title: 'Stage vacances',
      subtitle: 'Tous niveaux',
      price: '80€ la semaine',
      description: `Cinq matinées de ${sport} encadrées par nos entraîneurs, du lundi au vendredi pendant les vacances scolaires. Groupes de dix personnes maximum.`,
      imageUrl: '',
    },
    {
      title: 'Tournoi interne',
      subtitle: 'Licenciés du club',
      price: 'Gratuit',
      description:
        'Notre rendez-vous mensuel, ouvert à tous les membres. Poules le matin, phases finales l’après-midi, et barbecue pour clôturer la journée.',
      imageUrl: '',
    },
  ];
}

function faqFor(name: string): FaqItem[] {
  return [
    {
      question: 'Faut-il déjà avoir pratiqué pour venir ?',
      answer:
        'Non. Nos créneaux débutants sont ouverts toute l’année et le matériel de base est prêté sur place.',
      isOpen: true,
    },
    {
      question: 'Y a-t-il un âge minimum ?',
      answer:
        'Nous accueillons à partir de 8 ans. Les mineurs doivent fournir une autorisation parentale signée.',
      isOpen: false,
    },
    {
      question: 'Un certificat médical est-il obligatoire ?',
      answer:
        'Il est demandé pour la licence annuelle et pour toute participation en compétition, pas pour une séance découverte.',
      isOpen: false,
    },
    {
      question: 'Peut-on essayer avant de s’inscrire ?',
      answer: `La première séance chez ${name} est sans engagement. Il suffit de réserver un créneau à l’avance.`,
      isOpen: false,
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer:
        'Carte bancaire, espèces, chèques vacances et coupons sport ANCV.',
      isOpen: false,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly clubs: Club[] = [
    {
      id: 1,
      slug: 'fitness-club-paris',
      name: 'Fitness Club Paris',
      address: '123 Rue de Rivoli, 75001 Paris',
      sportTypes: ['Fitness', 'Yoga', 'Pilates'],
      rating: 4.5,
      position: { lat: 48.8624, lng: 2.3385 },
      heroTitle: 'Bougez à votre rythme, toute l’année',
      heroSubtitle:
        'Salle, cours collectifs et coaching au cœur du 1er arrondissement',
      presentation:
        'Six cents mètres carrés répartis sur deux niveaux, un plateau de musculation entièrement rénové et trois salles dédiées aux cours collectifs. L’équipe compte quatre coachs diplômés, présents sur tous les créneaux.',
      whyJoin:
        'Parce qu’on progresse mieux entouré. Nos groupes restent volontairement petits, les coachs corrigent les postures en direct, et chaque membre repart avec un programme adapté à ses objectifs.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '6h00 - 22h00' },
        { days: 'Samedi - Dimanche', hours: '8h00 - 20h00' },
      ],
      pricing: pricingFor('fitness'),
      events: eventsFor('fitness'),
      faq: faqFor('Fitness Club Paris'),
      contact: {
        phone: '01 42 60 15 22',
        email: 'contact@fitnessclubparis.fr',
        instagram: '@fitnessclubparis',
      },
      videoUrl: 'assets/push_video.mp4',
    },
  ];

  getClubs(): Club[] {
    return this.clubs;
  }

  getClubBySlug(slug: string): Club | undefined {
    return this.clubs.find((club) => club.slug === slug);
  }
}
