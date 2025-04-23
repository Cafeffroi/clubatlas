// src/app/home/header/header.component.ts
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef, NgZone, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Import Google Maps types
declare var google: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule, FormsModule]
})
export class HeaderComponent implements OnInit {
  @Output() toggleView = new EventEmitter<void>();
  
  // Dropdown states
  activeDropdown: 'location' | 'activity' | 'time' | null = null;
  userDropdownOpen = false;
  mobileSearchOpen = false;

  // Day selection options
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  selectedDays: string[] = [];

  // Time of day options
  timesOfDay: string[] = ['Morning', 'Afternoon', 'Evening'];
  selectedTimes: string[] = [];

  // Map and location related properties
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('mobileLocationInput') mobileLocationInput!: ElementRef;
  @ViewChild('mapDiv') mapDiv!: ElementRef;
  @ViewChild('mobileMapDiv') mobileMapDiv!: ElementRef;
  map: any = null;
  mobileMap: any = null;
  radiusCircle: any = null;
  mobileRadiusCircle: any = null;
  searchRadius: number = 5; // Default radius
  locationEntered: boolean = false;
  selectedLocation: any = null;

  // Radius options
  radiusOptions = [1, 5, 10, 25, 50];

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('gmp-click', (event) => {
      const target = event.target as HTMLElement;
      // Only close if the click is outside any dropdown or trigger button
      if (!target.closest('.group') && !target.closest('[class*="dropdown"]')) {
        this.activeDropdown = null;
      }
      
      if (!target.closest('.relative') && !target.classList.contains('fa-user-circle')) {
        this.userDropdownOpen = false;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      console.log('After timeout - Location input exists:', !!this.locationInput);
      if (this.locationInput) {
        this.initializeAutocomplete();
      } else {
        console.error('Location input element not available after timeout');
      }
    }, 1000);
  }

  initializeAutocomplete() {
    console.log('Initializing autocomplete...');
    console.log('Google object exists:', typeof google !== 'undefined');
    console.log('Location input element exists:', !!this.locationInput?.nativeElement);
    
    if (typeof google !== 'undefined' && this.locationInput && this.mobileLocationInput) {
      console.log('Creating autocomplete instances...');
      
      try {
        // Desktop autocomplete setup
        const desktopAutocomplete = new google.maps.places.Autocomplete(this.locationInput.nativeElement, {
          fields: ['place_id', 'geometry', 'formatted_address', 'name']
        });
        console.log('Desktop autocomplete created successfully');
        
        // Mobile autocomplete setup
        const mobileAutocomplete = new google.maps.places.Autocomplete(this.mobileLocationInput.nativeElement, {
          fields: ['place_id', 'geometry', 'formatted_address', 'name']
        });
        console.log('Mobile autocomplete created successfully');
        
        // Add event listeners...
        desktopAutocomplete.addListener('place_changed', () => {
          console.log('Place changed event fired');
          this.ngZone.run(() => {
            const place = desktopAutocomplete.getPlace();
            this.handlePlaceSelection(place, false);
          });
        });
        
        mobileAutocomplete.addListener('place_changed', () => {
          console.log('Mobile place changed event fired');
          this.ngZone.run(() => {
            const place = mobileAutocomplete.getPlace();
            this.handlePlaceSelection(place, true);
          });
        });
      } catch (error) {
        console.error('Error creating autocomplete:', error);
      }
    } else {
      console.error('Required components for autocomplete not available');
    }
  }

  // Handle place selection from autocomplete
  handlePlaceSelection(place: any, isMobile: boolean) {
    if (!place.geometry) return;
    
    this.selectedLocation = place;
    this.locationEntered = true;
    
    // Initialize or update map
    setTimeout(() => {
      if (isMobile) {
        this.initializeMap(place, true);
      } else {
        this.initializeMap(place, false);
      }
    }, 100);
  }

  // Initialize or update the map with the selected location and radius
  initializeMap(place: any, isMobile: boolean) {
    const mapElement = isMobile ? this.mobileMapDiv.nativeElement : this.mapDiv.nativeElement;
    const location = place.geometry.location;
    
    if (isMobile) {
      if (!this.mobileMap) {
        this.mobileMap = new google.maps.Map(mapElement, {
          center: location,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });
      } else {
        this.mobileMap.setCenter(location);
      }
      
      // Update or create the radius circle
      if (this.mobileRadiusCircle) {
        this.mobileRadiusCircle.setMap(null);
      }
      
      this.mobileRadiusCircle = new google.maps.Circle({
        strokeColor: '#f84c00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f84c00',
        fillOpacity: 0.2,
        map: this.mobileMap,
        center: location,
        radius: this.searchRadius * 1000 // Convert km to meters
      });
      
      // Adjust zoom to fit the circle
      this.fitCircleToMap(this.mobileMap, this.mobileRadiusCircle);
    } else {
      if (!this.map) {
        this.map = new google.maps.Map(mapElement, {
          center: location,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });
      } else {
        this.map.setCenter(location);
      }
      
      // Update or create the radius circle
      if (this.radiusCircle) {
        this.radiusCircle.setMap(null);
      }
      
      this.radiusCircle = new google.maps.Circle({
        strokeColor: '#f84c00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f84c00',
        fillOpacity: 0.2,
        map: this.map,
        center: location,
        radius: this.searchRadius * 1000 // Convert km to meters
      });
      
      // Adjust zoom to fit the circle
      this.fitCircleToMap(this.map, this.radiusCircle);
    }
  }

  // Fit the circle to the map
  fitCircleToMap(map: any, circle: any) {
    const bounds = new google.maps.LatLngBounds();
    const circleRadius = circle.getRadius();
    const circleLat = circle.getCenter().lat();
    const circleLng = circle.getCenter().lng();
    
    // Extend bounds to include radius points
    bounds.extend(new google.maps.LatLng(circleLat + 0.01*circleRadius/1000, circleLng));
    bounds.extend(new google.maps.LatLng(circleLat - 0.01*circleRadius/1000, circleLng));
    bounds.extend(new google.maps.LatLng(circleLat, circleLng + 0.01*circleRadius/1000));
    bounds.extend(new google.maps.LatLng(circleLat, circleLng - 0.01*circleRadius/1000));
    
    map.fitBounds(bounds);
  }

  // Update radius when slider changes
  updateRadius(event: any, isMobile: boolean = false) {
    this.searchRadius = event.target.value;
    
    if (this.selectedLocation) {
      if (isMobile) {
        if (this.mobileRadiusCircle) {
          this.mobileRadiusCircle.setRadius(this.searchRadius * 1000);
          this.fitCircleToMap(this.mobileMap, this.mobileRadiusCircle);
        }
      } else {
        if (this.radiusCircle) {
          this.radiusCircle.setRadius(this.searchRadius * 1000);
          this.fitCircleToMap(this.map, this.radiusCircle);
        }
      }
    }
  }

  // Toggle search filter dropdowns
  toggleSearchDropdown(dropdown: 'location' | 'activity' | 'time'): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
    
    // Close other dropdowns when opening a new one
    if (this.activeDropdown) {
      this.userDropdownOpen = false;
    }
    
    // Initialize autocomplete when location dropdown is opened
    if (dropdown === 'location') {
      setTimeout(() => {
        if (this.locationInput) {
          console.log('Location input available in dropdown toggle');
          this.initializeAutocomplete();
        }
        
        // Initialize map if location is already entered and location dropdown is opened
        if (this.locationEntered && this.selectedLocation) {
          this.initializeMap(this.selectedLocation, false);
        }
      }, 100);
    }
  }

  // Toggle user dropdown menu
  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
    
    // Close other dropdowns when opening user dropdown
    if (this.userDropdownOpen) {
      this.activeDropdown = null;
    }
  }

  // Toggle mobile search panel
  toggleMobileSearch(): void {
    this.mobileSearchOpen = !this.mobileSearchOpen;
    
    // Close other dropdowns when opening mobile search
    if (this.mobileSearchOpen) {
      this.activeDropdown = null;
      this.userDropdownOpen = false;
      
      // Initialize mobile map if location is already entered
      if (this.locationEntered && this.selectedLocation) {
        setTimeout(() => {
          this.initializeMap(this.selectedLocation, true);
        }, 100);
      }
    }
  }

  // Toggle day selection
  toggleDay(day: string): void {
    const index = this.selectedDays.indexOf(day);
    if (index === -1) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays.splice(index, 1);
    }
  }

  // Toggle time of day selection
  toggleTimeOfDay(timeOfDay: string): void {
    const index = this.selectedTimes.indexOf(timeOfDay);
    if (index === -1) {
      this.selectedTimes.push(timeOfDay);
    } else {
      this.selectedTimes.splice(index, 1);
    }
  }

  // Scroll to top when clicking the logo
  scrollToTop(event: Event): void {
    if (this.router.url === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Close all dropdowns when scrolling
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.activeDropdown = null;
    this.userDropdownOpen = false;
  }

  // Perform search
  search(): void {
    // Implement search functionality here
    console.log('Search with:', {
      location: this.selectedLocation ? this.selectedLocation.formatted_address : null,
      radius: this.searchRadius,
      days: this.selectedDays,
      times: this.selectedTimes
    });
    
    // Close dropdown after search
    this.activeDropdown = null;
    this.mobileSearchOpen = false;
  }

  // Clear location
  clearLocation(isMobile: boolean = false): void {
    this.locationEntered = false;
    this.selectedLocation = null;
    
    if (isMobile) {
      if (this.mobileLocationInput) {
        this.mobileLocationInput.nativeElement.value = '';
      }
      if (this.mobileRadiusCircle) {
        this.mobileRadiusCircle.setMap(null);
      }
    } else {
      if (this.locationInput) {
        this.locationInput.nativeElement.value = '';
      }
      if (this.radiusCircle) {
        this.radiusCircle.setMap(null);
      }
    }
  }

  onToggleView() {
    this.toggleView.emit();
  }
}