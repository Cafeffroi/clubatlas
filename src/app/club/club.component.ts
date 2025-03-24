import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-club',
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, HomeComponent],
  templateUrl: './club.component.html'
})
export class ClubComponent {}