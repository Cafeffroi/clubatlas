import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClubEvent } from '../../models/club.model';

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css',
})
export class EventComponent {
  @Input({ required: true }) events!: ClubEvent[];

  get placeholders(): number[] {
    const remainingSlots = 3 - this.events.length;
    return remainingSlots > 0 ? Array(remainingSlots).fill(0) : [];
  }
}
