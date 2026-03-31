import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonImg,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-transfer-tours',
  templateUrl: './transfer-tours.page.html',
  styleUrls: ['./transfer-tours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonImg,
    PublicHeaderComponent,
  ]
})
export class TransferToursPage implements OnInit {
  transferTours: any[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private loadingController: LoadingController,
  ) {}

  ngOnInit() {
    this.loadTransferTours();
  }

  async loadTransferTours() {
    const loading = await this.loadingController.create({ message: 'A carregar transfers...' });
    await loading.present();

    this.api.transferTours().subscribe({
      next: (resp: any) => {
        this.transferTours = Array.isArray(resp) ? resp : [];
        loading.dismiss();
      },
      error: (err) => {
        console.error(err);
        loading.dismiss();
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openTransferTour(item: any) {
    this.router.navigate(['/transfer-tour', item.id]);
  }

  coverImage(item: any): string {
    return String(item?.photo?.[0]?.url || '');
  }
}
