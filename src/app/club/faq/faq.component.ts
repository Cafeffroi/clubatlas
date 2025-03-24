import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})

export class FaqComponent {
  faqItems: FaqItem[] = [
    {
      question: "Est-ce que c'est une activité sécuritaire?",
      answer: "Le lancer de hache est sécuritaire. Comme toute autre activité sportive, il est très important de respecter les règles et les mesures de sécurité.",
      isOpen: true
    },    
    {
      question: "Est-ce qu'il y a des restrictions d'âge?",
      answer: "Il n'y a aucune restriction d'âge. Les enfants de 17 ans et moins doivent être accompagnés par un adulte.",
      isOpen: false
    },
    {
      question: "Dois-je porter des vêtements spéciaux?",
      answer: "Vous devez porter des chaussures qui couvrent les orteils, sans talons ou plate-forme.",
      isOpen: false
    },
    {
      question: "Est-ce qu'il y aura une formation?",
      answer: "Nos experts vont vous montrer les bases de lancer des haches et ils vont vous assister durant l'activité pour vous donner des conseils et aider à apprendre la technique.",
      isOpen: false
    },
    {
      question: "Est-ce que nous pouvons prendre des photos et vidéos?",
      answer: "Oui, absolument! Nous vous encourageons à prendre des photos et des vidéos ainsi que à partager vos meilleurs moments sur les réseaux sociaux #Tchak",
      isOpen: false
    },
    {
      question: "Quelles méthodes de paiement sont acceptées?",
      answer: "Nous acceptons les cartes de crédit ainsi que l'argent comptant.",
      isOpen: false
    },
    {
      question: "Est-il possible d’apporter sa propre hache ?",
      answer: "Non. Pour des raisons d’assurance, il n’est pas possible d’apporter sa propre hache. Nous fournissons tout l’équipement pour le lancer, haches comprises",
      isOpen: false
    }
  ];

  toggleFaq(item: FaqItem): void {
    item.isOpen = !item.isOpen;
  }

  getColumnItems(columnIndex: number): any[] {
    const itemsPerColumn = Math.ceil(this.faqItems.length / 2);
    const start = columnIndex * itemsPerColumn;
    return this.faqItems.slice(start, start + itemsPerColumn);
}
}
