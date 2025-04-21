import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ChatComponent } from '../components/chat/chat.component';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonNote,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    ChatComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonNote,
  ]
})
export class Tab2Page {
  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private functions: FunctionsService
  ) { }

  segment: string = 'statements';
  receipts: any;
  reports: any;
  access_token: any;

  ionViewWillEnter() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        this.loadingController.create().then((loading) => {
          loading.present();
          let data = {
            access_token: this.access_token
          }
          this.api.myReceipts(data).subscribe((resp) => {
            this.receipts = resp;
            this.api.reports(data).subscribe((resp) => {
              this.reports = resp;
              loading.dismiss();
            });
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

  openReceipt(link: any) {
    window.open(link, '_blank');
  }

  openPdf(activity_launch_id: any) {
    window.open('https://mundotvde.pt/api/app/reports/pdf/' + activity_launch_id, '_blank');
  }
}