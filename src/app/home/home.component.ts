import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import {
  GoogleMapsModule,
  MapInfoWindow,
  MapMarker,
} from '@angular/google-maps';
import { HeaderComponent } from './header/header.component';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Club, SearchCriteria } from '../models/club.model';
import { ClubService } from '../services/club.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, GoogleMapsModule, HeaderComponent],
})
export class HomeComponent implements OnInit {
  // Access Google Maps components
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  // State management
  locationShared: boolean | null = null;
  viewMode: 'map' | 'grid' = 'map';
  isLoadingLocation: boolean = false;
  showLocationPrompt: boolean = true;

  // Clubs data
  allClubs: Club[] = [];
  clubs: Club[] = [];
  selectedClubId: number | null = null;
  selectedClub: Club | null = null;

  // Track active info window
  activeInfoWindow: google.maps.InfoWindow | null = null;

  // Map instance and markers
  map: google.maps.Map | null = null;
  advancedMarkers: Map<number, google.maps.marker.AdvancedMarkerElement> =
    new Map();

  // Map configuration
  mapOptions: google.maps.MapOptions = {
    center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
    zoom: 12,
    mapId: environment.googleMaps.mapId,
  };

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private clubService: ClubService,
  ) {}

  ngOnInit() {
    this.allClubs = this.clubService.getClubs();
    this.clubs = this.allClubs;

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

  onSearch(criteria: SearchCriteria) {
    this.clubs = this.clubService.search(criteria);
    this.deselectClub();

    if (this.map) {
      this.createAdvancedMarkers();
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

  onMapInitialized(map: google.maps.Map) {
    this.map = map;

    map.addListener('click', () => {
      this.ngZone.run(() => this.deselectClub());
    });

    this.createAdvancedMarkers();
  }

  openClubDetails(club: Club) {
    this.router.navigate(['/club', club.slug]);
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
        club.position.lng,
      );
      const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
        map: this.map,
        position,
        title: club.name,
      };

      const marker = new google.maps.marker.AdvancedMarkerElement(
        markerOptions,
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
    // If clicking already selected club, deselect it
    if (this.selectedClubId === club.id) {
      this.deselectClub();
      return;
    }

    this.selectedClubId = club.id;
    this.selectedClub = club;

    // Update marker styles and show info for selected club
    this.updateSelectedMarker();
    this.showInfoWindow(club);

    // Scroll the list to show the selected club
    this.scrollToClub(club.id);
  }

  // Deselect the current club
  deselectClub() {
    this.selectedClubId = null;
    this.selectedClub = null;
    this.updateSelectedMarker();
    this.closeActiveInfoWindow();
  }

  // Close the active info window
  closeActiveInfoWindow() {
    if (this.activeInfoWindow) {
      this.activeInfoWindow.close();
      this.activeInfoWindow = null;
    }
  }

  showInfoWindow(club: Club) {
    if (!this.map) return;

    this.closeActiveInfoWindow();

    const container = document.createElement('div');
    container.innerHTML = this.createInfoWindowContent(club);
    container
      .querySelector('[data-view-details]')
      ?.addEventListener('click', (event) => {
        event.preventDefault();
        this.ngZone.run(() => this.openClubDetails(club));
      });

    const infoWindow = new google.maps.InfoWindow({
      content: container,
      position: new google.maps.LatLng(club.position.lat, club.position.lng),
    });

    // Keep track of active info window
    this.activeInfoWindow = infoWindow;

    // Open the info window
    infoWindow.open(this.map);

    // Listen for info window close events
    infoWindow.addListener('closeclick', () => {
      this.ngZone.run(() => {
        this.activeInfoWindow = null;
        // Optionally deselect the club when info window is closed
        // this.deselectClub();
      });
    });
  }

  // Create HTML content for info window
  createInfoWindowContent(club: Club): string {
    const mainActivity = this.getMainActivity(club);

    return `
      <div class="info-window" style="padding: 10px; max-width: 250px;">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                    background-image: url('assets/activities/${mainActivity}.png');
                    background-size: cover; background-position: center; opacity: 0.7; z-index: -1;"></div>
        <div style="position: relative; z-index: 1; background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.7)); padding: 10px; border-radius: 6px;">
        <h3 style="margin: 0 0 8px 0; color: #f84c00; font-weight: bold;">${
          club.name
        }</h3>
        <div style="margin-bottom: 5px;">
          ${this.createStarRating(club.rating)}
          <span style="margin-left: 5px;">${club.rating}</span>
        </div>
        <p style="margin: 5px 0; font-size: 14px;">${club.address}</p>
        ${
          club.distance
            ? `<p style="margin: 5px 0; font-size: 13px; color: #666;"><i class="fas fa-location-arrow" style="margin-right: 5px;"></i>${club.distance} away</p>`
            : ''
        }
        <div style="margin: 8px 0;">
          ${club.sportTypes
            .map(
              (sport) =>
                `<span style="background: #eee; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px;">${sport}</span>`,
            )
            .join('')}
        </div>
        <a href="#" data-view-details style="display: inline-block; background: #f84c00; color: white; padding: 5px 12px; border-radius: 4px; text-decoration: none; margin-top: 5px; font-size: 14px;">View Details</a>
      </div>
    </div>
  `;
  }

  // Create HTML for star rating
  createStarRating(rating: number): string {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      const color = i <= rating ? '#ffc107' : '#e0e0e0';
      stars += `<i class="fas fa-star" style="color: ${color}; font-size: 14px;"></i>`;
    }
    return `<span>${stars}</span>`;
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

        // Create a default pin - FIX: Using the 'element' property
        const defaultPin = new google.maps.marker.PinElement({
          glyph: clubId.toString().charAt(0),
          background: '#4285F4',
          borderColor: '#4285F4',
        });

        // Update the marker content with the correct property
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
          console.warn('Geolocation unavailable:', error.message);
          this.locationShared = false;
          this.isLoadingLocation = false;
          localStorage.setItem('locationConsent', 'false');
        },
      );
    } else {
      console.error('Geolocation not supported by this browser');
      this.isLoadingLocation = false;
    }
  }

  // Calculate distances between user and clubs
  calculateDistances(userLocation: { lat: number; lng: number }) {
    this.allClubs.forEach((club) => {
      const distance = this.getDistance(
        userLocation.lat,
        userLocation.lng,
        club.position.lat,
        club.position.lng,
      );
      club.distance =
        distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`;
    });

    // Sort clubs by distance initially
    this.sortClubs({ target: { value: 'distance' } } as unknown as Event);
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
    // If clicking already selected club, deselect it
    if (this.selectedClubId === club.id) {
      this.deselectClub();
      return;
    }

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

  // Sort clubs based on selected criteria
  sortClubs(event: Event) {
    const sortValue = (event.target as HTMLSelectElement).value;

    switch (sortValue) {
      case 'distance':
        // Only available when location is shared
        if (this.locationShared) {
          this.clubs.sort((a, b) => {
            // Extract numeric value from distance string
            const distA = parseFloat(
              a.distance!.replace(' km', '').replace(' m', ''),
            );
            const distB = parseFloat(
              b.distance!.replace(' km', '').replace(' m', ''),
            );

            // Convert to same unit (km)
            const distAKm = a.distance!.includes(' m') ? distA / 1000 : distA;
            const distBKm = b.distance!.includes(' m') ? distB / 1000 : distB;

            return distAKm - distBKm;
          });
        }
        break;

      case 'rating':
        this.clubs.sort((a, b) => b.rating - a.rating);
        break;

      case 'activity':
        this.clubs.sort((a, b) => {
          const activityA = this.getMainActivity(a);
          const activityB = this.getMainActivity(b);
          return activityA.localeCompare(activityB);
        });
        break;
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'map' ? 'grid' : 'map';

    if (this.viewMode === 'grid') {
      this.map = null;
      this.advancedMarkers.clear();
      this.closeActiveInfoWindow();
    }
  }
}
