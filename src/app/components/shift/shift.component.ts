import { Component, OnInit } from '@angular/core';
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timer } from 'ionicons/icons';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { FunctionsService } from 'src/app/services/functions.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss'],
  standalone: true,
  imports: [
    IonFab,
    IonFabButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonModal,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
    CommonModule
  ]
})
export class ShiftComponent implements OnInit {

  constructor(
    private loadingController: LoadingController,
    private api: ApiService,
    private functions: FunctionsService,
    private router: Router,
    private preferences: PreferencesService,
  ) {
    addIcons({ timer });
  }

  isModalOpen = false;
  access_token: any;
  status: string = 'end';

  presentingElement!: HTMLElement | null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.presentingElement = document.querySelector('.ion-page');
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.setOpen(false);
        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 200);
      } else {
        let data = {
          access_token: this.access_token
        }
        this.loadingController.create().then((loading) => {
          loading.present();
          this.api.lastTimeLog(data).subscribe((resp: any) => {
            loading.dismiss();
            if(resp != null) {
              this.status = resp.status;
            }
          });
        });
      }
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  async newTimeLog(status: string): Promise<void> {
    const loading = await this.loadingController.create();
    await loading.present();
    let data = {
      access_token: this.access_token,
      status: status
    }
    this.api.newTimeLog(data).subscribe((resp: any) => {
      this.status = resp.status;
      loading.dismiss();
    }, (err) => {
      loading.dismiss();
      this.functions.errors(err);
    });
  }

  openTimeLogs() {
    this.setOpen(false);
    setTimeout(() => {
      this.router.navigateByUrl('/time-logs');
    }, 200);
  }

}
