import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-location-popup',
  templateUrl: './location-popup.component.html',
  styleUrls: ['./location-popup.component.css']
})
export class LocationPopupComponent {
  @Output() locationChoice = new EventEmitter<boolean>();

  onAccept() {
    this.locationChoice.emit(true);
  }

  onDecline() {
    this.locationChoice.emit(false);
  }
}