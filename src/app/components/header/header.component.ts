import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription, filter } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carSportOutline, logOutOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton,
    IonBadge
],
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {

  pendingRoutineCount = 0;
  private routeSub?: Subscription;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private preferences: PreferencesService,
    private api: ApiService,
  ) {
    addIcons({ logOutOutline, carSportOutline });
  }

  ngOnInit() { 
    this.loadPendingCount();
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.loadPendingCount());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  onLogout() {
    this.alertController.create({
      message: 'Tem a certeza?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            this.preferences.removeName('access_token').then(() => {
              setTimeout(() => {
                this.router.navigateByUrl('home');
              }, 1000);
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then((alert) => {
      alert.present();
    });

  }

  goToInspections() {
    this.router.navigate(['/inspections'], { queryParams: { filter: 'all' } });
  }

  private async loadPendingCount() {
    const token = await this.preferences.checkName('access_token');
    const accessToken = token?.value || '';
    if (!accessToken) {
      this.pendingRoutineCount = 0;
      return;
    }

    this.api.appInspections(accessToken).subscribe({
      next: (resp: any) => {
        const rows = Array.isArray(resp?.data) ? resp.data : [];
        this.pendingRoutineCount = rows.filter((row: any) =>
          String(row?.type) === 'routine' && String(row?.status) !== 'closed'
        ).length;
      },
      error: () => {
        this.pendingRoutineCount = 0;
      }
    });
  }

}
