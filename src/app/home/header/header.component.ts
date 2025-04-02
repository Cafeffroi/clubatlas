import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [RouterModule, CommonModule]
})
export class HeaderComponent implements OnInit {
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
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

  // Toggle search filter dropdowns
  toggleSearchDropdown(dropdown: 'location' | 'activity' | 'time'): void {
    this.activeDropdown = this.activeDropdown === dropdown ? null : dropdown;
    
    // Close other dropdowns when opening a new one
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
      days: this.selectedDays,
      times: this.selectedTimes
    });
    
    // Close dropdown after search
    this.activeDropdown = null;
    this.mobileSearchOpen = false;
  }
}