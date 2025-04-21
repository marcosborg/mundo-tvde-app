import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonImg,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-stand-cars',
  templateUrl: './stand-cars.page.html',
  styleUrls: ['./stand-cars.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    PublicHeaderComponent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonImg,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ]
})
export class StandCarsPage implements OnInit {

  standCars: any[] = [];

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.standCars().subscribe((response: any) => {
        this.standCars = response;
        console.log(this.standCars);
        loading.dismiss();
      }, (error) => {
        console.error(error);
        loading.dismiss();
      });
    });
  }

  openCarDetails(car_id: any) {
    
  }

}
