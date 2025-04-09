import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
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
  // Access Google Maps components
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // State management
  locationShared: boolean | null = null;
  isLoadingLocation: boolean = false;
  showLocationPrompt: boolean = true;

  // Clubs data
  clubs: Club[] = [];
  selectedClubId: number | null = null;
  selectedClub: Club | null = null;

  // Map instance and markers
  map: google.maps.Map | null = null;
  advancedMarkers: Map<number, google.maps.marker.AdvancedMarkerElement> =
    new Map();

  // Map configuration
  mapOptions: google.maps.MapOptions = {
    center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
    zoom: 12,
    mapId: 'DEMO_MAP_ID', // You should use your own Map ID here
  };

  constructor(private ngZone: NgZone) {}

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

  // Get the main activity for image background
  getMainActivity(club: Club): string {
    if (club.sportTypes && club.sportTypes.length > 0) {
      // Get the first sport type and convert to lowercase for filename
      return club.sportTypes[0].toLowerCase();
    }
    // Default activity image if no sport types are available
    return 'fitness';
  }

  // Initialize map and create advanced markers once the map is loaded
  onMapInitialized(map: google.maps.Map) {
    this.map = map;

    // Now that we have the map instance, we can create advanced markers
    if (this.locationShared) {
      this.createAdvancedMarkers();
    }
  }

  // Create advanced markers for each club
  createAdvancedMarkers() {
    if (!this.map) return;

    // Make sure the Advanced Marker library is loaded
    if (!google.maps.marker || !google.maps.marker.AdvancedMarkerElement) {
      console.error('Google Maps Advanced Marker library not loaded!');
      return;
    }

    // Clear existing markers
    this.advancedMarkers.forEach((marker) => (marker.map = null));
    this.advancedMarkers.clear();

    // Create a marker for each club
    this.clubs.forEach((club) => {
      // Create a marker
      const position = new google.maps.LatLng(
        club.position.lat,
        club.position.lng
      );
      const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
        map: this.map,
        position,
        title: club.name,
      };

      const marker = new google.maps.marker.AdvancedMarkerElement(
        markerOptions
      );

      // Store the marker with club ID as key
      this.advancedMarkers.set(club.id, marker);

      // Add click event listener to marker
      marker.addListener('click', () => {
        this.ngZone.run(() => {
          this.onMarkerClick(club);
        });
      });
    });

    // If a club is already selected, update its marker appearance
    if (this.selectedClubId !== null) {
      this.updateSelectedMarker();
    }
  }

  // Handle marker click
  onMarkerClick(club: Club) {
    this.selectedClubId = club.id;
    this.selectedClub = club;

    // Update marker styles and show info for selected club
    this.updateSelectedMarker();
    this.showInfoWindow(club);

    // Scroll the list to show the selected club
    this.scrollToClub(club.id);
  }

  // Show the info window for a club
  showInfoWindow(club: Club) {
    if (!this.map) return;

    // Create an info window if it doesn't exist
    const infoWindow = new google.maps.InfoWindow({
      content: this.createInfoWindowContent(club),
      position: new google.maps.LatLng(club.position.lat, club.position.lng),
    });

    // Close any existing info windows and open this one
    google.maps.event.clearListeners(this.map, 'closeclick');
    infoWindow.open(this.map);

    // Listen for info window close events
    infoWindow.addListener('closeclick', () => {
      this.ngZone.run(() => {
        // Optionally deselect the club when info window is closed
        // this.selectedClubId = null;
        // this.selectedClub = null;
        // this.updateSelectedMarker();
      });
    });
  }

  // Create HTML content for info window
  createInfoWindowContent(club: Club): string {
    const mainActivity = this.getMainActivity(club);
    
    return `
      <div class="info-window" style="position: relative; min-height: 120px;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                    background-image: url('../../assets/activities/${mainActivity}.jpg');
                    background-size: cover; background-position: center; opacity: 0.7; z-index: -1;"></div>
        <div style="position: relative; z-index: 1; background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.7)); padding: 10px; border-radius: 6px;">
          <h3 class="info-window-title">${club.name}</h3>
          <div class="info-window-rating">
            ${this.createStarRating(club.rating)}
            <span class="rating-value">${club.rating}</span>
          </div>
          <p class="info-window-address">${club.address}</p>
          ${
            club.distance
              ? `<p class="info-window-distance">${club.distance} away</p>`
              : ''
          }
          <div class="info-window-sports">
            ${club.sportTypes
              .map((sport) => `<span class="sport-tag">${sport}</span>`)
              .join('')}
          </div>
          <a href="#" class="info-window-link">View Details</a>
        </div>
      </div>
    `;
  }

  // Create HTML for star rating
  createStarRating(rating: number): string {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fas fa-star ${
        i <= rating ? 'text-yellow-400' : 'text-gray-300'
      }"></i>`;
    }
    return `<span class="stars">${stars}</span>`;
  }

  // Update marker appearance based on selection
  updateSelectedMarker() {
    this.advancedMarkers.forEach((marker, clubId) => {
      if (clubId === this.selectedClubId) {
        // Make the selected marker stand out
        marker.zIndex = 999;

        // Apply custom styles to highlight the selected marker
        const pinElement = document.createElement('div');
        pinElement.innerHTML = `
        <div style="background-color: #f84c00; color: white; border-radius: 8px; padding: 6px 10px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          ${this.clubs.find((c) => c.id === clubId)?.name || ''}
        </div>
      `;

        // Update the marker content
        marker.content = pinElement;
      } else {
        // Reset non-selected markers to default appearance
        marker.zIndex = undefined;

        // Create a default pin
        const defaultPin = new google.maps.marker.PinElement({
          glyph: clubId.toString(),
          background: '#4285F4',
          borderColor: '#4285F4',
        });

        // Update the marker content - THIS IS THE FIX
        marker.content = defaultPin.element;
      }
    });
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
            lng: position.coords.longitude,
          };

          // Update map center to user location
          if (this.map) {
            this.map.setCenter(userLocation);
            this.map.setZoom(14);
          } else {
            this.mapOptions = {
              ...this.mapOptions,
              center: userLocation,
              zoom: 14,
            };
          }

          // Calculate distances to clubs
          this.calculateDistances(userLocation);
          this.isLoadingLocation = false;

          // Create markers if the map is ready
          if (this.map) {
            this.createAdvancedMarkers();
          }
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
  calculateDistances(userLocation: { lat: number; lng: number }) {
    this.clubs.forEach((club) => {
      const distance = this.getDistance(
        userLocation.lat,
        userLocation.lng,
        club.position.lat,
        club.position.lng
      );
      club.distance =
        distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`;
    });

    // Sort clubs by distance
    this.clubs.sort((a, b) => {
      // Extract numeric value from distance string
      const distA = parseFloat(
        a.distance!.replace(' km', '').replace(' m', '')
      );
      const distB = parseFloat(
        b.distance!.replace(' km', '').replace(' m', '')
      );

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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Handle club selection from the list
  selectClub(club: Club) {
    this.selectedClubId = club.id;
    this.selectedClub = club;

    // Center the map on the selected club
    if (this.map) {
      this.map.setCenter(club.position);
      this.map.setZoom(15);
    }

    // Update marker styles
    this.updateSelectedMarker();

    // Show info window for the selected club
    this.showInfoWindow(club);

    // Scroll the list to ensure the selected club is visible
    this.scrollToClub(club.id);
  }

  // Helper method to scroll to a specific club in the list
  scrollToClub(clubId: number) {
    setTimeout(() => {
      const element = document.getElementById(`club-${clubId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Check if a club is currently selected
  isClubSelected(clubId: number): boolean {
    return this.selectedClubId === clubId;
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
          { days: 'Sat-Sun', hours: '8:00-20:00' },
        ],
        rating: 4.5,
        position: { lat: 48.8624, lng: 2.3385 },
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
          { days: 'Sun', hours: '10:00-16:00' },
        ],
        rating: 4.8,
        position: { lat: 48.8473, lng: 2.2526 },
      },
      {
        id: 3,
        name: 'Aqua Swimming Club',
        address: '10 Rue du Faubourg Poissonnière, 75010 Paris',
        sportTypes: ['Swimming', 'Water Polo'],
        photo: '../../assets/club3.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '7:00-21:00' },
          { days: 'Sat-Sun', hours: '8:00-18:00' },
        ],
        rating: 4.2,
        position: { lat: 48.8724, lng: 2.3476 },
      },
      {
        id: 4,
        name: 'Paris Basketball Academy',
        address: '35 Rue des Archives, 75004 Paris',
        sportTypes: ['Basketball'],
        photo: '../../assets/club4.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '14:00-22:00' },
          { days: 'Sat', hours: '10:00-18:00' },
        ],
        rating: 4.0,
        position: { lat: 48.8583, lng: 2.3553 },
      },
      {
        id: 5,
        name: 'Urban Soccer 5',
        address: '168 Quai de Jemmapes, 75010 Paris',
        sportTypes: ['Soccer', 'Futsal'],
        photo: '../../assets/club5.jpg',
        openingHours: [
          { days: 'Mon-Fri', hours: '12:00-23:00' },
          { days: 'Sat-Sun', hours: '10:00-22:00' },
        ],
        rating: 4.6,
        position: { lat: 48.8721, lng: 2.3652 },
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
          { days: 'Sun', hours: '10:00-15:00' },
        ],
        rating: 4.7,
        position: { lat: 48.8634, lng: 2.3488 },
      },
    ];
  }
}