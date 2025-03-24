import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  showBackToTop = false;
  videoUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/push_video.mp4');
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 200;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
