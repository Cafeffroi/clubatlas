import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps'
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

interface Club {
  id: number;
  name: string;
  address: string;
  distance?: string; // Only available when location is shared
  sportTypes: string[];
  photo: string;
  openingHours: {
    days: string;
    hours: string;
  }[];
  rating: number;
  position: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, GoogleMapsModule, HeaderComponent, FooterComponent],
})
export class HomeComponent implements OnInit {
  // State management
  locationShared: boolean | null = null;
  isLoadingLocation: boolean = false;
  showLocationPrompt: boolean = true;
  
  // Clubs data
  clubs: Club[] = [];
  
  // Map configuration
  mapOptions: google.maps.MapOptions = {
    center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
    zoom: 12
  };
  markers: any[] = [];

  constructor() {}

  ngOnInit() {
    // Mock data for clubs - in a real app, you would fetch this from an API
    this.loadMockClubs();
    
    // Check if user has already made a location choice
    const locationChoice = localStorage.getItem('locationConsent');
    if (locationChoice) {
      this.locationShared = locationChoice === 'true';
      this.showLocationPrompt = false;
      
      if (this.locationShared) {
        this.getUserLocation();
      }
    }
  }

  // Handle user's location sharing choice
  handleLocationChoice(choice: boolean) {
    this.showLocationPrompt = false;
    this.locationShared = choice;
    
    // Save user's choice for future visits
    localStorage.setItem('locationConsent', choice.toString());
    
    if (choice) {
      this.getUserLocation();
    }
  }

  // Get user's current location
  getUserLocation() {
    this.isLoadingLocation = true;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Update map center to user location
          this.mapOptions = {
            ...this.mapOptions,
            center: userLocation,
            zoom: 14
          };
          
          // Calculate distances to clubs
          this.calculateDistances(userLocation);
          this.isLoadingLocation = false;
        },
        (error) => {
          console.error('Error getting location:', error);
          this.locationShared = false;
          this.isLoadingLocation = false;
        }
      );
    } else {
      console.error('Geolocation not supported by this browser');
      this.locationShared = false;
      this.isLoadingLocation = false;
    }
  }

 // Calculate distances between user and clubs
calculateDistances(userLocation: { lat: number, lng: number }) {
  this.clubs.forEach(club => {
    const distance = this.getDistance(
      userLocation.lat, 
      userLocation.lng,
      club.position.lat,
      club.position.lng
    );
    club.distance = distance < 1 ? 
      `${Math.round(distance * 1000)} m` : 
      `${distance.toFixed(1)} km`;
  });
  
  // Sort clubs by distance
  this.clubs.sort((a, b) => {
    // Extract numeric value from distance string
    const distA = parseFloat(a.distance!.replace(' km', '').replace(' m', ''));
    const distB = parseFloat(b.distance!.replace(' km', '').replace(' m', ''));
    
    // Convert to same unit (km)
    const distAKm = a.distance!.includes(' m') ? distA / 1000 : distA;
    const distBKm = b.distance!.includes(' m') ? distB / 1000 : distB;
    
    return distAKm - distBKm;
  });
}

  // Calculate distance between two coordinates (Haversine formula)
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Load mock data for clubs
  loadMockClubs() {
    this.clubs = [
      {
        id: 1,
        name: 'Fitness Club Paris',
        address: '123 Rue de Rivoli, 75001 Paris',
        sportTypes: ['Fitness', 'Yoga', 'Pilates'],
        photo: '../../assets/club1.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '6:00-22:00' },
          { days: 'Sat-Sun', hours: '8:00-20:00' }
        ],
        rating: 4.5,
        position: { lat: 48.8624, lng: 2.3385 }
      },
      {
        id: 2,
        name: 'Tennis Club Roland Garros',
        address: '2 Avenue Gordon Bennett, 75016 Paris',
        sportTypes: ['Tennis'],
        photo: '../../assets/club2.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '9:00-21:00' },
          { days: 'Sat', hours: '9:00-18:00' },
          { days: 'Sun', hours: '10:00-16:00' }
        ],
        rating: 4.8,
        position: { lat: 48.8473, lng: 2.2526 }
      },
      {
        id: 3,
        name: 'Aqua Swimming Club',
        address: '10 Rue du Faubourg Poissonnière, 75010 Paris',
        sportTypes: ['Swimming', 'Water Polo'],
        photo: '../../assets/club3.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '7:00-21:00' },
          { days: 'Sat-Sun', hours: '8:00-18:00' }
        ],
        rating: 4.2,
        position: { lat: 48.8724, lng: 2.3476 }
      },
      {
        id: 4,
        name: 'Paris Basketball Academy',
        address: '35 Rue des Archives, 75004 Paris',
        sportTypes: ['Basketball'],
        photo: '../../assets/club4.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '14:00-22:00' },
          { days: 'Sat', hours: '10:00-18:00' }
        ],
        rating: 4.0,
        position: { lat: 48.8583, lng: 2.3553 }
      },
      {
        id: 5,
        name: 'Urban Soccer 5',
        address: '168 Quai de Jemmapes, 75010 Paris',
        sportTypes: ['Soccer', 'Futsal'],
        photo: '../../assets/club5.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '12:00-23:00' },
          { days: 'Sat-Sun', hours: '10:00-22:00' }
        ],
        rating: 4.6,
        position: { lat: 48.8721, lng: 2.3652 }
      },
      {
        id: 6,
        name: 'Crossfit Louvre',
        address: '15 Rue Montmartre, 75001 Paris',
        sportTypes: ['Crossfit', 'HIIT'],
        photo: '../../assets/club6.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '6:30-21:30' },
          { days: 'Sat', hours: '9:00-17:00' },
          { days: 'Sun', hours: '10:00-15:00' }
        ],
        rating: 4.7,
        position: { lat: 48.8634, lng: 2.3488 }
      }
    ];
  }
}