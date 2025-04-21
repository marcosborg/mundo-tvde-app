import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ChatComponent } from '../components/chat/chat.component';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LoadingController } from '@ionic/angular';
import {
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    ChatComponent,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    CommonModule,
    FormsModule
  ]
})
export class Tab4Page {
  constructor(
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private router: Router,
    private api: ApiService
  ) { }

  access_token: any;
  documents: any;

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
          this.api.documents(data).subscribe((resp) => {
            loading.dismiss();
            this.documents = resp;
          });
        });
      }
    });
  }

  getDocument(link: any) {
    window.open(link, '_blank');
  }
}
