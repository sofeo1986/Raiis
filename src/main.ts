import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { RouterModule, provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

 bootstrapApplication(AppComponent, {
  providers:[provideRouter(routes),RouterModule,
    [provideHttpClient()], provideAnimationsAsync()  ],
})
  .catch((err) => console.error(err));
