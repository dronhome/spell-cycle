import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideEnvironmentInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@auth/interceptor';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEnvironmentInitializer(() => {
      const iconReg = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      iconReg.addSvgIcon(
        'cycle',
        sanitizer.bypassSecurityTrustResourceUrl('icons/cycle.svg')
      );
      iconReg.addSvgIcon(
        'error',
        sanitizer.bypassSecurityTrustResourceUrl('icons/error.svg')
      );
      iconReg.addSvgIcon(
        'login',
        sanitizer.bypassSecurityTrustResourceUrl('icons/login.svg')
      );
      iconReg.addSvgIcon(
        'edit',
        sanitizer.bypassSecurityTrustResourceUrl('icons/edit.svg')
      );
      iconReg.addSvgIcon(
        'male',
        sanitizer.bypassSecurityTrustResourceUrl('icons/gender/male.svg')
      );
      iconReg.addSvgIcon(
        'female',
        sanitizer.bypassSecurityTrustResourceUrl('icons/gender/female.svg')
      );
      iconReg.addSvgIcon(
        'trainee_icon',
        sanitizer.bypassSecurityTrustResourceUrl('icons/trainee_icon.svg')
      );
      iconReg.addSvgIcon(
        'crew_icon',
        sanitizer.bypassSecurityTrustResourceUrl('icons/crew_icon.svg')
      );
      iconReg.addSvgIcon(
        'trainer_icon',
        sanitizer.bypassSecurityTrustResourceUrl('icons/trainer_icon.svg')
      );
      iconReg.addSvgIcon(
        'manager_icon',
        sanitizer.bypassSecurityTrustResourceUrl('icons/manager_icon.svg')
      );
    }),
  ]
};
