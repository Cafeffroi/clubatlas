import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private router: Router) {}

  @Input({ required: true }) club!: Club;

  navigateToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop(event: MouseEvent): void {
    if (this.router.url === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
