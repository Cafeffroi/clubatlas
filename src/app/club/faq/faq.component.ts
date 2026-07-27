import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class FaqComponent {
  @Input({ required: true }) items!: FaqItem[];

  toggleFaq(item: FaqItem): void {
    item.isOpen = !item.isOpen;
  }

  getColumnItems(columnIndex: number): any[] {
    const itemsPerColumn = Math.ceil(this.items.length / 2);
    const start = columnIndex * itemsPerColumn;
    return this.items.slice(start, start + itemsPerColumn);
  }
}
