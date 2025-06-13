import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonCheckbox,
  IonLabel,
  IonItem,
  IonTextarea
} from '@ionic/angular/standalone';
import { ModalController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonCheckbox,
    IonLabel,
    IonItem,
    IonTextarea
  ],
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.scss'],
})
export class ContactModalComponent {
  @Input() carId!: number;
  @Input() carTitle!: string;
  @Input() carSubtitle!: string;

  name = '';
  phone = '';
  email = '';
  city = '';
  tvde = false;
  tvde_card = '';
  message = '';
  rgpd = false;

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService,
    private toastCtrl: ToastController
  ) { }

  close() {
    this.modalCtrl.dismiss();
  }

  async submit() {
    if (!this.rgpd) {
      const toast = await this.toastCtrl.create({
        message: 'É necessário autorizar o tratamento dos dados.',
        color: 'warning',
        duration: 2500
      });
      await toast.present();
      return;
    }

    const formData = {
      car_id: this.carId,
      name: this.name,
      phone: this.phone,
      email: this.email,
      city: this.city,
      tvde: this.tvde,
      tvde_card: this.tvde_card,
      message: this.message,
      rgpd: this.rgpd ? 1 : 0
    };

    this.api.carRentalContact(formData).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Pedido enviado com sucesso!',
          color: 'success',
          duration: 3000
        });
        await toast.present();
        this.modalCtrl.dismiss(formData);
      },
      error: async (error) => {
        const toast = await this.toastCtrl.create({
          message: 'Erro ao enviar pedido. Verifique os campos.',
          color: 'danger',
          duration: 3000
        });
        await toast.present();
      }
    });
  }

}
