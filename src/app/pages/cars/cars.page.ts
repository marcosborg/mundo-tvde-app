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
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
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
export class CarsPage implements OnInit {

  cars: any[] = [];

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.cars().subscribe((response: any) => {
        this.cars = response;
        console.log(this.cars);
        loading.dismiss();
      }, (error) => {
        console.error(error);
        loading.dismiss();
      });
    });
  }

  goCar(car: any) {
    this.router.navigate(['/car', car.id]);
  }

}
