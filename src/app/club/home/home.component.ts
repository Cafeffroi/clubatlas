import { Component, HostListener, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactComponent } from '../contact/contact.component';
import { FaqComponent } from '../faq/faq.component';
import { PricingComponent } from '../pricing/pricing.component';
import { EventComponent } from '../event/event.component';
import { InstagramFeedComponent } from '../instagram-feed/instagram-feed.component';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-home',
  imports: [
    CommonModule,
    RouterModule,
    ContactComponent,
    FaqComponent,
    PricingComponent,
    EventComponent,
    InstagramFeedComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnChanges {
  @Input({ required: true }) club!: Club;

  showBackToTop = false;
  videoFailed = false;

  ngOnChanges() {
    this.videoFailed = false;
  }

  get showVideo(): boolean {
    return !!this.club.videoUrl && !this.videoFailed;
  }

  get heroImage(): string {
    const sport = this.club.sportTypes[0]?.toLowerCase() ?? 'fitness';
    return `assets/activities/${sport}.png`;
  }

  scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 200;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
