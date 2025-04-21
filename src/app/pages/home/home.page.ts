import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonImg,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    PublicHeaderComponent,
    IonImg,
    IonText,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
  ]
})
export class HomePage implements OnInit {

  constructor(
    private router: Router,
    private api: ApiService,
    private loadingController: LoadingController,
  ) { }

  hero_banner: any;
  home_info: any;
  articles: any[] = [];

  ngOnInit() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.home().subscribe((data: any) => {
        loading.dismiss();
        this.hero_banner = data.hero_banner;
        this.home_info = data.home_info;
        this.articles = data.articles;
      }, (error) => {
        loading.dismiss();
        console.error(error);
      });
    });
  }

  login() {
    this.router.navigate(['/login']);
  }

  goArticle(id: number) {
    this.router.navigate(['/article', id]);
  }

}
