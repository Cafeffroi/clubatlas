import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ClubComponent } from './club/club.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'club', component: ClubComponent }
];