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
import {
  Club,
  DayPeriod,
  DEFAULT_RADIUS_KM,
  LocationSearch,
  SearchCriteria,
  WeekDay,
} from '../../models/club.model';
import { ClubService } from '../../services/club.service';

declare var google: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class HeaderComponent implements OnInit {
  @Output() toggleView = new EventEmitter<void>();
  @Output() filtersChange = new EventEmitter<SearchCriteria>();
  @Output() locationSearch = new EventEmitter<LocationSearch | null>();

  // Dropdown states
  activeDropdown: 'location' | 'activity' | 'time' | null = null;
  userDropdownOpen = false;
  mobileSearchOpen = false;

  weekDays: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  timesOfDay: DayPeriod[] = ['Morning', 'Afternoon', 'Evening'];

  sportTypes: string[] = [];
  selectedSports: string[] = [];
  selectedDays: WeekDay[] = [];
  selectedTimes: DayPeriod[] = [];

  // Map and location related properties
  private autocompletes = new Map<boolean, Promise<any>>();
  private mapHost: HTMLElement | null = null;
  private mapDivEl: HTMLElement | null = null;
  private mobileMapHost: HTMLElement | null = null;

@ViewChild('mapDiv') set mapDivRef(host: ElementRef<HTMLElement> | undefined) {
    this.mapDivEl = host?.nativeElement ?? null;
    if (this.mapDivEl && this.selectedLocation) {
      this.initializeMap(this.selectedLocation, false);
    }
  }
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
  searchRadius: number = DEFAULT_RADIUS_KM;
  locationEntered: boolean = false;
  selectedLocation: any = null;

  // Radius options
  radiusOptions = [1, 5, 10, 25, 50];

  @Output() searchSubmit = new EventEmitter<SearchCriteria>();

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private clubService: ClubService,
  ) { }

  ngOnInit(): void {
    this.sportTypes = this.clubService.getSportTypes();
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
    element.setAttribute('no-clear-button', '');
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

  initializeMap(place: any, isMobile: boolean) {
    const location = place.location;

    const mapElement = isMobile
      ? this.mobileMapDiv?.nativeElement
      : this.mapDivEl;
    if (!mapElement) return;

    const mapOptions = {
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
    };

    if (isMobile) {
      if (!this.mobileMap || this.mobileMapHost !== mapElement) {
        this.mobileMap = new google.maps.Map(mapElement, mapOptions);
        this.mobileMapHost = mapElement;
      } else {
        this.mobileMap.setCenter(location);
      }

      this.mobileRadiusCircle?.setMap(null);
      this.mobileRadiusCircle = new google.maps.Circle({
        strokeColor: '#f84c00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f84c00',
        fillOpacity: 0.2,
        map: this.mobileMap,
        center: location,
        radius: this.searchRadius * 1000,
      });

      this.fitCircleToMap(this.mobileMap, this.mobileRadiusCircle);
    } else {
      if (!this.map || this.mapHost !== mapElement) {
        this.map = new google.maps.Map(mapElement, mapOptions);
        this.mapHost = mapElement;
      } else {
        this.map.setCenter(location);
      }

      this.radiusCircle?.setMap(null);
      this.radiusCircle = new google.maps.Circle({
        strokeColor: '#f84c00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#f84c00',
        fillOpacity: 0.2,
        map: this.map,
        center: location,
        radius: this.searchRadius * 1000,
      });

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

  private toggle<T>(list: T[], value: T): void {
    const index = list.indexOf(value);
    if (index === -1) {
      list.push(value);
    } else {
      list.splice(index, 1);
    }
  }

  private emitFilters(): void {
    this.filtersChange.emit({
      sports: [...this.selectedSports],
      days: [...this.selectedDays],
      times: [...this.selectedTimes],
    });
  }

  toggleSport(sport: string): void {
    this.toggle(this.selectedSports, sport);
    this.emitFilters();
  }

  toggleDay(day: WeekDay): void {
    this.toggle(this.selectedDays, day);
    this.emitFilters();
  }

  toggleTimeOfDay(period: DayPeriod): void {
    this.toggle(this.selectedTimes, period);
    this.emitFilters();
  }

  clearSports(): void {
    this.selectedSports = [];
    this.emitFilters();
  }

  clearWhen(): void {
    this.selectedDays = [];
    this.selectedTimes = [];
    this.emitFilters();
  }

  searchLocation(isMobile: boolean = false): void {
    if (!this.selectedLocation?.location) return;

    this.locationSearch.emit({
      address: this.selectedLocation.formattedAddress,
      position: {
        lat: this.selectedLocation.location.lat(),
        lng: this.selectedLocation.location.lng(),
      },
      radiusKm: this.searchRadius,
    });

    this.activeDropdown = null;
    if (isMobile) this.mobileSearchOpen = false;
  }

  // Scroll to top when clicking the logo
  scrollToTop(event: Event): void {
    if (this.router.url === '/') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get sportsLabel(): string {
    if (this.selectedSports.length === 0) return 'Any sport';
    if (this.selectedSports.length === 1) return this.selectedSports[0];
    return `${this.selectedSports.length} sports`;
  }

  get whenLabel(): string {
    return this.selectedDays.length || this.selectedTimes.length
      ? 'Custom schedule'
      : 'Any time';
  }

  // Close all dropdowns when scrolling
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.activeDropdown = null;
    this.userDropdownOpen = false;
  }

  search(): void {
    this.searchSubmit.emit({
      sports: [...this.selectedSports],
      days: [...this.selectedDays],
      times: [...this.selectedTimes],
    });

    this.activeDropdown = null;
    this.mobileSearchOpen = false;
  }

  async clearLocation(isMobile: boolean = false): Promise<void> {
    this.locationEntered = false;
    this.selectedLocation = null;

    const pending = this.autocompletes.get(isMobile);
    if (pending) {
      const element = await pending;
      element.value = '';
    }

    const circle = isMobile ? this.mobileRadiusCircle : this.radiusCircle;
    circle?.setMap(null);

    this.locationSearch.emit(null);
  }

  onToggleView() {
    this.toggleView.emit();
  }
}
