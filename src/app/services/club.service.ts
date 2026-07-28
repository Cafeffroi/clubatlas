import { Injectable } from '@angular/core';
import {
  Club,
  ClubEvent,
  DayPeriod,
  FaqItem,
  LocationSearch,
  PricingPlan,
  SearchCriteria,
  TrainingSlot,
  WeekDay,
} from '../models/club.model';

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

function slots(days: WeekDay[], periods: DayPeriod[]): TrainingSlot[] {
  return days.flatMap((day) => periods.map((period) => ({ day, period })));
}

function matchesSports(club: Club, sports: string[]): boolean {
  if (sports.length === 0) return true;
  return club.sportTypes.some((sport) => sports.includes(sport));
}

function matchesSchedule(club: Club, criteria: SearchCriteria): boolean {
  if (criteria.days.length === 0 && criteria.times.length === 0) return true;
  return club.schedule.some(
    (slot) =>
      (criteria.days.length === 0 || criteria.days.includes(slot.day)) &&
      (criteria.times.length === 0 || criteria.times.includes(slot.period)),
  );
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
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
      schedule: [
        ...slots(
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          ['Morning', 'Afternoon', 'Evening'],
        ),
        ...slots(['Sat', 'Sun'], ['Morning', 'Afternoon']),
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
    {
      id: 2,
      slug: 'tennis-club-roland-garros',
      name: 'Tennis Club Roland Garros',
      address: '2 Avenue Gordon Bennett, 75016 Paris',
      sportTypes: ['Tennis'],
      rating: 4.8,
      position: { lat: 48.8473, lng: 2.2526 },
      heroTitle: 'Neuf courts, douze mois par an',
      heroSubtitle:
        'Terre battue et résine couverte, à deux pas du Bois de Boulogne',
      presentation:
        'Cinq courts en terre battue et quatre en résine, dont trois couverts pour continuer à jouer l’hiver. Le club dispose de son propre mur d’entraînement et d’une machine lance-balles en libre accès pour les licenciés.',
      whyJoin:
        'Un club de compétition qui n’a pas oublié les joueurs du dimanche. Les créneaux libres sont réservables en ligne jusqu’à la veille, et notre équipe d’enseignants suit aussi bien les jeunes du groupe compétition que les adultes qui reprennent après quinze ans d’arrêt.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '9h00 - 21h00' },
        { days: 'Samedi', hours: '9h00 - 18h00' },
        { days: 'Dimanche', hours: '10h00 - 16h00' },
      ],
      schedule: [
        ...slots(
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          ['Morning', 'Afternoon', 'Evening'],
        ),
        ...slots(['Sat', 'Sun'], ['Morning', 'Afternoon']),
      ],
      pricing: pricingFor('tennis'),
      events: eventsFor('tennis'),
      faq: faqFor('Tennis Club Roland Garros'),
      contact: {
        phone: '01 47 43 48 00',
        email: 'accueil@tcrolandgarros.fr',
        instagram: '@tc_rolandgarros',
      },
    },
    {
      id: 3,
      slug: 'aqua-swimming-club',
      name: 'Aqua Swimming Club',
      address: '10 Rue du Faubourg Poissonnière, 75010 Paris',
      sportTypes: ['Swimming', 'Water Polo'],
      rating: 4.2,
      position: { lat: 48.8724, lng: 2.3476 },
      heroTitle: 'Du premier plongeon à la compétition',
      heroSubtitle: 'Bassin de 25 mètres, natation et water-polo dans le 10e',
      presentation:
        'Un bassin de vingt-cinq mètres sur six lignes d’eau, chauffé toute l’année à 27 degrés. Deux lignes restent réservées à la nage libre pendant les entraînements, et le club accueille une équipe de water-polo engagée en championnat régional.',
      whyJoin:
        'Nos maîtres-nageurs corrigent le geste dès la première séance, quel que soit le niveau. Beaucoup de nos adhérents sont arrivés en sachant à peine faire une longueur et nagent aujourd’hui le kilomètre sans s’arrêter.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '7h00 - 21h00' },
        { days: 'Samedi - Dimanche', hours: '8h00 - 18h00' },
      ],
      schedule: [
        ...slots(
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          ['Morning', 'Afternoon', 'Evening'],
        ),
        ...slots(['Sat', 'Sun'], ['Morning', 'Afternoon']),
      ],
      pricing: pricingFor('natation'),
      events: eventsFor('natation'),
      faq: faqFor('Aqua Swimming Club'),
      contact: {
        phone: '01 48 24 55 10',
        email: 'contact@aquaswimmingclub.fr',
        instagram: '@aquaswimmingclub',
      },
    },
    {
      id: 4,
      slug: 'paris-basketball-academy',
      name: 'Paris Basketball Academy',
      address: '35 Rue des Archives, 75004 Paris',
      sportTypes: ['Basketball'],
      rating: 4.0,
      position: { lat: 48.8583, lng: 2.3553 },
      heroTitle: 'Le basket après les cours et après le bureau',
      heroSubtitle: 'Deux terrains couverts au cœur du Marais',
      presentation:
        'Deux terrains couverts au parquet refait en 2024, un espace de préparation physique et des vestiaires rénovés. L’académie encadre six équipes, des U11 aux seniors, et ouvre ses créneaux du soir aux joueurs loisir non licenciés.',
      whyJoin:
        'Ici personne ne reste sur le banc. Les groupes sont constitués par niveau et non par âge, ce qui permet à un débutant de trente ans et à un lycéen confirmé de progresser chacun à sa place, sans se gêner.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '14h00 - 22h00' },
        { days: 'Samedi', hours: '10h00 - 18h00' },
      ],
      schedule: [
        ...slots(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Afternoon', 'Evening']),
        ...slots(['Sat'], ['Morning', 'Afternoon']),
      ],
      pricing: pricingFor('basket'),
      events: eventsFor('basket'),
      faq: faqFor('Paris Basketball Academy'),
      contact: {
        phone: '01 42 78 09 33',
        email: 'hello@parisbasketacademy.fr',
        instagram: '@parisbasketacademy',
      },
    },
    {
      id: 5,
      slug: 'urban-soccer-5',
      name: 'Urban Soccer 5',
      address: '168 Quai de Jemmapes, 75010 Paris',
      sportTypes: ['Soccer', 'Futsal'],
      rating: 4.6,
      position: { lat: 48.8721, lng: 2.3652 },
      heroTitle: 'Réservez un terrain, montez une équipe',
      heroSubtitle: 'Foot à 5 et futsal en soirée, au bord du canal',
      presentation:
        'Quatre terrains synthétiques de foot à 5, dont deux couverts, et une salle de futsal au parquet homologué. Location au créneau, mais aussi championnats internes du lundi au jeudi soir pour ceux qui cherchent de la régularité.',
      whyJoin:
        'Vous n’avez pas d’équipe complète ? Nos soirées joueurs isolés réunissent une trentaine de personnes chaque semaine et les équipes se forment sur place. C’est la façon la plus simple de rejouer sans avoir à convaincre dix copains.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '12h00 - 23h00' },
        { days: 'Samedi - Dimanche', hours: '10h00 - 22h00' },
      ],
      schedule: [
        ...slots(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Afternoon', 'Evening']),
        ...slots(['Sat', 'Sun'], ['Morning', 'Afternoon', 'Evening']),
      ],
      pricing: pricingFor('foot à 5'),
      events: eventsFor('foot à 5'),
      faq: faqFor('Urban Soccer 5'),
      contact: {
        phone: '01 40 03 71 45',
        email: 'reservation@urbansoccer5.fr',
        instagram: '@urbansoccer5',
      },
    },
    {
      id: 6,
      slug: 'crossfit-louvre',
      name: 'Crossfit Louvre',
      address: '15 Rue Montmartre, 75001 Paris',
      sportTypes: ['Crossfit', 'HIIT'],
      rating: 4.7,
      position: { lat: 48.8634, lng: 2.3488 },
      heroTitle: 'Un WOD différent chaque jour',
      heroSubtitle:
        'Cross-training et HIIT à quatre stations de métro du Louvre',
      presentation:
        'Une box de quatre cents mètres carrés équipée de douze racks, d’un rig de vingt mètres et d’une zone haltérophilie séparée. Le WOD change tous les jours et est affiché la veille au soir sur le compte du club.',
      whyJoin:
        'Chaque mouvement est scalable, ce qui veut dire concrètement qu’un coach adapte le travail du jour à votre niveau avant même que vous commenciez. Les créneaux de 6h30 et de 20h30 existent précisément pour ceux qui ont des journées serrées.',
      openingHours: [
        { days: 'Lundi - Vendredi', hours: '6h30 - 21h30' },
        { days: 'Samedi', hours: '9h00 - 17h00' },
        { days: 'Dimanche', hours: '10h00 - 15h00' },
      ],
      schedule: [
        ...slots(
          ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          ['Morning', 'Afternoon', 'Evening'],
        ),
        ...slots(['Sat', 'Sun'], ['Morning', 'Afternoon']),
      ],
      pricing: pricingFor('cross-training'),
      events: eventsFor('cross-training'),
      faq: faqFor('Crossfit Louvre'),
      contact: {
        phone: '01 45 08 62 17',
        email: 'box@crossfitlouvre.fr',
        instagram: '@crossfitlouvre',
      },
    },
  ];

  getClubs(): Club[] {
    return this.clubs;
  }

  getClubBySlug(slug: string): Club | undefined {
    return this.clubs.find((club) => club.slug === slug);
  }

  getSportTypes(): string[] {
    return [...new Set(this.clubs.flatMap((club) => club.sportTypes))].sort();
  }

  searchNearby(search: LocationSearch): Club[] {
    return this.clubs.filter(
      (club) => distanceKm(search.position, club.position) <= search.radiusKm,
    );
  }

  filter(clubs: Club[], criteria: SearchCriteria): Club[] {
    return clubs.filter(
      (club) =>
        matchesSports(club, criteria.sports) && matchesSchedule(club, criteria),
    );
  }
}
