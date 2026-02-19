import { Component } from '@angular/core';
import { PreferencesService } from './services/preferences.service'; // Adjust the path as needed
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenuToggle,
  IonButton,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    RouterModule,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonMenuToggle,
    IonList,
    IonItem,
    CommonModule
  ]
})
export class AppComponent {

  access_token: string | null = null;

  constructor(
    private preferences: PreferencesService,
    private router: Router,
    private pushNotifications: PushNotificationService,
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.preferences.checkName('access_token').then((resp: any) => {
          this.access_token = resp.value;
          this.pushNotifications.onAccessTokenAvailable(this.access_token);
        });
      });
  }

  async ngOnInit() {
    await this.pushNotifications.init();
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      this.pushNotifications.onAccessTokenAvailable(this.access_token);
    });
  }
}
