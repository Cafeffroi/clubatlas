import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SafePipe } from '../../../utils/safe.pipe';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, SafePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  contactForm: FormGroup;
  mapUrl = 'https://www.google.com/maps/embed?pb=YOUR_EMBED_URL';

  @Input({ required: true }) club!: Club;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      // Add your form submission logic here
    }
  }
}
