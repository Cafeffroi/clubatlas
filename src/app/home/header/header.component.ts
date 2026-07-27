// src/app/home/header/header.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Import Google Maps types
declare var google: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule, FormsModule],
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
  private autocompletes = new Map<boolean, Promise<any>>();

  @ViewChild('mapDiv') mapDiv!: ElementRef;
  @ViewChild('mobileMapDiv') mobileMapDiv!: ElementRef;
  @ViewChild('locationHost') set locationHost(
    host: ElementRef<HTMLElement> | undefined,
  ) {
    if (host) this.mountAutocomplete(host.nativeElement, false);
  }

  @ViewChild('mobileLocationHost') set mobileLocationHost(
    host: ElementRef<HTMLElement> | undefined,
  ) {
    if (host) this.mountAutocomplete(host.nativeElement, true);
  }
  map: any = null;
  mobileMap: any = null;
  radiusCircle: any = null;
  mobileRadiusCircle: any = null;
  searchRadius: number = 5; // Default radius
  locationEntered: boolean = false;
  selectedLocation: any = null;

  // Radius options
  radiusOptions = [1, 5, 10, 25, 50];

  constructor(
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }

  private onDocumentClick = (event: Event) => {
    const target = event.target as HTMLElement;
    this.ngZone.run(() => {
      if (!target.closest('.group') && !target.closest('[class*="dropdown"]')) {
        this.activeDropdown = null;
      }
      if (
        !target.closest('.relative') &&
        !target.classList.contains('fa-user-circle')
      ) {
        this.userDropdownOpen = false;
      }
    });
  };

  private async mountAutocomplete(
    host: HTMLElement,
    isMobile: boolean,
  ): Promise<void> {
    let pending = this.autocompletes.get(isMobile);
    if (!pending) {
      pending = this.createAutocomplete(isMobile);
      this.autocompletes.set(isMobile, pending);
    }
    host.appendChild(await pending);
  }

  private async createAutocomplete(isMobile: boolean): Promise<any> {
    const { PlaceAutocompleteElement } =
      await google.maps.importLibrary('places');
    const element = new PlaceAutocompleteElement();
    element.style.width = '100%';

    element.addEventListener('gmp-select', async (event: any) => {
      const place = event.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      this.ngZone.run(() => this.handlePlaceSelection(place, isMobile));
    });

    return element;
  }

  handlePlaceSelection(place: any, isMobile: boolean) {
    if (!place.location) return;

    this.selectedLocation = place;
    this.locationEntered = true;

    setTimeout(() => this.initializeMap(place, isMobile), 100);
  }

  // Initialize or update the map with the selected location and radius
  initializeMap(place: any, isMobile: boolean) {
    const location = place.location;

    const mapElement = isMobile
      ? this.mobileMapDiv?.nativeElement
      : this.mapDiv?.nativeElement;
    if (!mapElement) return;

    if (isMobile) {
      if (!this.mobileMap) {
        this.mobileMap = new google.maps.Map(mapElement, {
          center: location,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
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
        radius: this.searchRadius * 1000, // Convert km to meters
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
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
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
        radius: this.searchRadius * 1000, // Convert km to meters
      });

      // Adjust zoom to fit the circle
      this.fitCircleToMap(this.map, this.radiusCircle);
    }
  }

  // Fit the circle to the map
  fitCircleToMap(map: any, circle: any) {
    const bounds = circle.getBounds();
    if (bounds) map.fitBounds(bounds);
  }

  // Update radius when slider changes
  updateRadius(event: Event, isMobile: boolean = false) {
    this.searchRadius = Number((event.target as HTMLInputElement).value);

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

  toggleSearchDropdown(dropdown: 'location' | 'activity' | 'time'): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;

    if (this.activeDropdown) {
      this.userDropdownOpen = false;
    }

    if (
      this.activeDropdown === 'location' &&
      this.locationEntered &&
      this.selectedLocation
    ) {
      setTimeout(() => this.initializeMap(this.selectedLocation, false), 100);
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
      location: this.selectedLocation
        ? this.selectedLocation.formattedAddress
        : null,
      radius: this.searchRadius,
      days: this.selectedDays,
      times: this.selectedTimes,
    });

    // Close dropdown after search
    this.activeDropdown = null;
    this.mobileSearchOpen = false;
  }

  async clearLocation(isMobile: boolean = false): Promise<void> {
    this.locationEntered = false;
    this.selectedLocation = null;

    const pending = this.autocompletes.get(isMobile);
    if (pending) {
      const element = await pending;
      const host = element.parentElement;
      element.remove();
      this.autocompletes.delete(isMobile);
      if (host) this.mountAutocomplete(host, isMobile);
    }

    const circle = isMobile ? this.mobileRadiusCircle : this.radiusCircle;
    circle?.setMap(null);
  }

  onToggleView() {
    this.toggleView.emit();
  }
}
