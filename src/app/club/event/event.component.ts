import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Event {
  title: string;
  subtitle: string;
  price: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent {
  events: Event[] = [
    {
      title: 'EVG / EVJF',
      subtitle: 'Compétition amicale',
      price: '25€ / personne',
      description: 'Your bachelor or bachelorette party should be an epic night with your crew—no pressure, right? Skip the debates over clubs or flights and grab an axe instead. Axe throwing is the ultimate all-inclusive activity, perfect for every skill level, from your best friend to your third cousin. It’s a thrilling way to blow off steam, bond, and create unforgettable stories.',
      imageUrl: '../../assets/privatisation_400_320.png'
    },
    {
      title: 'Soirée Entreprise',
      subtitle: 'Team Building',
      price: '35€ / personne',
      description: 'For an axe throwing party, you’ll get private lanes, coaching from an experienced instructor, and organized games and tournaments. Safety is a priority, with no accidents since inception. The event promises a fun, memorable experience with photos and team-building opportunities.',
      imageUrl: '../../assets/privatisation_400_320.png'
    }
  ];

  get placeholders(): number[] {
    const remainingSlots = 3 - this.events.length;
    return remainingSlots > 0 ? Array(remainingSlots).fill(0) : [];
  }
}
