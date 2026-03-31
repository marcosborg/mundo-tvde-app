import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonText,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';
import { ApiService } from '../../services/api.service';

register();

@Component({
  selector: 'app-transfer-tour',
  templateUrl: './transfer-tour.page.html',
  styleUrls: ['./transfer-tour.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonText,
    PublicHeaderComponent,
  ]
})
export class TransferTourPage implements OnInit {
  transferTourId: string | null = null;
  transferTour: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private loadingController: LoadingController,
  ) {}

  ngOnInit() {
    this.transferTourId = this.route.snapshot.paramMap.get('id');
    this.loadTransferTour();
  }

  async loadTransferTour() {
    if (!this.transferTourId) {
      this.router.navigate(['/transfer-tours']);
      return;
    }

    const loading = await this.loadingController.create({ message: 'A carregar detalhe...' });
    await loading.present();

    this.api.transferTour(this.transferTourId).subscribe({
      next: (resp: any) => {
        this.transferTour = resp;
        loading.dismiss();
      },
      error: (err) => {
        console.error(err);
        loading.dismiss();
      }
    });
  }

  goBack() {
    this.router.navigate(['/transfer-tours']);
  }
}
