import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { Club } from '../models/club.model';
import { ClubService } from '../services/club.service';

@Component({
  selector: 'app-club',
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
  ],
  templateUrl: './club.component.html',
})
export class ClubComponent {
  club: Club | undefined;

  constructor(route: ActivatedRoute, clubService: ClubService) {
    route.paramMap.subscribe((params) => {
      this.club = clubService.getClubBySlug(params.get('slug') ?? '');
    });
  }
}
