import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { LoadingController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
register();
import { ModalController } from '@ionic/angular';
import { ContactModalComponent } from 'src/app/components/contact-modal/contact-modal.component';


@Component({
  selector: 'app-car',
  templateUrl: './car.page.html',
  styleUrls: ['./car.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    PublicHeaderComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CarPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingController: LoadingController,
    private modalCtrl: ModalController
  ) { }

  car_id: any;
  car: any;

  ngOnInit() {
    this.car_id = this.route.snapshot.paramMap.get('car_id')!;
    this.loadingController.create().then((loading) => {
      loading.present();
      this.api.car(this.car_id).subscribe((resp: any) => {
        loading.dismiss();
        this.car = resp;
        console.log(this.car);
      });
    });

  }

  async openContactModal() {
    const modal = await this.modalCtrl.create({
      component: ContactModalComponent,
      componentProps: {
        carId: this.car?.id,
        carTitle: this.car?.title,
        carSubtitle: this.car?.subtitle
      }
    });
    await modal.present();
  }




}
