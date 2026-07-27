import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment } from './environments/environment';

setOptions({
  key: environment.googleMaps.apiKey,
  v: 'weekly',
});

Promise.all([
  importLibrary('maps'),
  importLibrary('marker'),
  importLibrary('places'),
])
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
