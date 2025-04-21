import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';
import { ApiService } from 'src/app/services/api.service';
import { FunctionsService } from 'src/app/services/functions.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonImg,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-time-logs',
  templateUrl: './time-logs.page.html',
  styleUrls: ['./time-logs.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonImg,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCardSubtitle,
  ]
})
export class TimeLogsPage implements OnInit {

  constructor(
    private alertController: AlertController,
    private router: Router,
    private preferences: PreferencesService,
    private api: ApiService,
    private functions: FunctionsService,
    private loadingController: LoadingController,
  ) {
    addIcons({ logOutOutline });
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        let data = {
          access_token: this.access_token
        }
        console.log(data);
        this.loadingController.create().then((loading) => {
          loading.present();
          this.api.getTimeLogs(data).subscribe((resp: any) => {
            loading.dismiss();
            this.timeLogs = Object.keys(resp).map(date => ({
              date,
              timePeriods: resp[date].time_periods,
              drivingTime: resp[date].driving_time
            }));
          }, (err) => {
            loading.dismiss();
            this.preferences.removeName('access_token');
            this.router.navigateByUrl('/');
            this.functions.errors(err);
          });
        });
      }
    });
  }

  access_token: any;
  timeLogs: any;

  onLogout() {
    this.alertController.create({
      message: 'Tem a certeza?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            this.preferences.removeName('access_token').then(() => {
              this.router.navigateByUrl('/');
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

  changeLabel(status: string) {
    switch (status) {
      case 'start':
        return 'Início de turno';
      case 'pause':
        return 'Pausa de turno';
      case 'continue':
        return 'Retoma de turno';
      case 'end':
        return 'Fim de turno';
      default:
        return '...';
    }
  }

}
