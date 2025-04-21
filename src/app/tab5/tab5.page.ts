import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ChatComponent } from '../components/chat/chat.component';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
 } from '@ionic/angular/standalone';
@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    ChatComponent,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
  ]
})
export class Tab5Page {
  constructor(
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private router: Router,
    private api: ApiService
  ) { }

  access_token: any;
  documents: any;
  user: any;

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
          this.api.user(data).subscribe((resp: any) => {
            loading.dismiss();
            this.user = resp;
          });
        });
      }
    });
  }

}
