import { Component } from '@angular/core';
import { IonContent, LoadingController, AlertController } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ChatComponent } from '../components/chat/chat.component';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonList,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    ChatComponent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    CommonModule,
    FormsModule,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem,
  ]
})
export class Tab3Page {

  constructor(
    private loadingController: LoadingController,
    private preferences: PreferencesService,
    private api: ApiService,
    private router: Router,
    private alertController: AlertController,
  ) { }

  segment: string = 'documents';
  access_token: any;
  selectedFile: File | null = null;
  my_documents: any;
  selectedFileType: any = null;

  file_types: any = [
    { collection_name: 'citizen_card', name: 'Cartão de Cidadão' },
    { collection_name: 'tvde_driver_certificate', name: 'Certificado de motorista TVDE' },
    { collection_name: 'criminal_record', name: 'Certificado de registo criminal' },
    { collection_name: 'profile_picture', name: 'Fotografia de perfil' },
    { collection_name: 'driving_license', name: 'Carta de condução' },
    { collection_name: 'ipo_vehicle', name: 'IPO Viatura' },
    { collection_name: 'dua_vehicle', name: 'DUA Viatura' },
    { collection_name: 'car_insurance', name: 'Seguro Viatura' },
    { collection_name: 'iban', name: 'Comprovativo de IBAN' },
    { collection_name: 'address', name: 'Comprovativo de morada' },
  ];

  getTranslatedName(collection_name: string): string {
    const fileType = this.file_types.find((ft: { collection_name: string; name: string }) => ft.collection_name === collection_name);
    return fileType ? fileType.name : collection_name;
  }

  async ionViewWillEnter() {
    const loading = await this.loadingController.create();
    await loading.present();
    this.preferences.checkName('access_token').then((resp) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        let data = {
          access_token: this.access_token
        }
        this.api.myDocuments(data).subscribe((resp) => {
          loading.dismiss();
          this.my_documents = resp;
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Arquivo selecionado:', file.name);
    }
  }

  async captureImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 20,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        const imageBlob = this.dataURItoBlob(image.dataUrl);
        this.selectedFile = new File([imageBlob], 'camera_image.jpg', { type: 'image/jpeg' });
        console.log('Imagem capturada:', this.selectedFile);
      } else {
        console.error('Erro: dataUrl está indefinido.');
        alert('Erro: dataUrl está indefinido.');
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      alert('Erro ao capturar imagem: ' + error);
    }
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async onFileUpload(): Promise<void> {

    if (!this.selectedFile) {
      await this.alertController.create({
        header: 'Erro',
        message: 'Nenhum arquivo selecionado para upload.',
        buttons: ['OK']
      }).then((alert) => {
        alert.present();
      });
      return;
    }

    if (!this.selectedFileType) {
      await this.alertController.create({
        header: 'Erro',
        message: 'Tipo de ficheiro não encontrado. Abortando upload.',
        buttons: ['OK']
      }).then((alert) => {
        alert.present();
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('collection_name', this.selectedFileType);

    const loading = await this.loadingController.create({
      message: 'Enviando ficheiro...'
    });

    await loading.present();

    this.api.uploadDocument(formData, this.access_token).subscribe(
      async (response: any) => {
        loading.dismiss();
        await this.alertController.create({
          header: 'Sucesso',
          message: 'Documento enviado com sucesso.',
          backdropDismiss: false,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                location.reload();
              }
            }
          ]
        }).then((alert) => {
          alert.present();
        });
      },
      async (error) => {
        loading.dismiss();
        await this.alertController.create({
          header: 'Erro',
          message: 'Erro ao enviar o documento.',
          buttons: ['OK']
        }).then((alert) => {
          alert.present();
        });
      }
    );
  }

  openDocument(document: any) {
    window.open(document.original_url, '_blank');
  }

}
