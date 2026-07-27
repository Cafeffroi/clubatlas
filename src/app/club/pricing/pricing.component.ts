import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingPlan } from '../../models/club.model';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
})
export class PricingComponent {
  @Input({ required: true }) plans!: PricingPlan[];

  scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }
}
