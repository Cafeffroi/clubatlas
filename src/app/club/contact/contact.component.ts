import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { Club } from '../../models/club.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, GoogleMapsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  @Input({ required: true }) club!: Club;

  contactForm: FormGroup;
  mapOptions!: google.maps.MapOptions;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.mapOptions = {
      center: this.club.position,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      mapId: environment.googleMaps.mapId,
    };
  }

  onMapInitialized(map: google.maps.Map): void {
    new google.maps.marker.AdvancedMarkerElement({
      map,
      position: this.club.position,
      title: this.club.name,
    });
  }

  get directionsUrl(): string {
    const { lat, lng } = this.club.position;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
    }
  }
}
