import { Component } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonItem,
  IonButton,
  IonButtons,
  IonInput,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { ChatComponent } from '../components/chat/chat.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../components/chart/chart.component';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { FunctionsService } from '../services/functions.service';
import { ShiftComponent } from '../components/shift/shift.component';
import { InspectionService } from '../services/inspection.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonContent,
    HeaderComponent,
    ChatComponent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonItem,
    IonButton,
    ChartComponent,
    ShiftComponent,
    IonButtons,
    IonInput,
  ]
})
export class Tab1Page {

  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController,
    private functions: FunctionsService,
    private inspectionService: InspectionService
  ) { }

  ionViewWillEnter() {
    this.start();
  }

  start() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        let data = {
          access_token: this.access_token
        }
        this.loadingController.create().then((loading) => {
          loading.present();
          this.api.admin(data).subscribe((resp: any) => {
            this.activityLaunches = resp.activityLaunches;
            this.last_receipt = resp.last_receipt;
            this.total = parseFloat(Number(resp.total).toFixed(2));
            this.value = resp.total ?? 0;
            this.can_create_receipt = resp.can_create_receipt;
            loading.dismiss();
          }, (err) => {
            loading.dismiss();
            this.preferences.removeName('access_token');
            this.router.navigateByUrl('/');
            this.functions.errors(err);
          });
        });
      }
    });
  }

  segment: string = 'graph';
  selectedFile: File | null = null;
  access_token: any;
  activityLaunches: any;
  last_receipt: any;
  allIncome: boolean = false;
  allexpense: boolean = false;
  can_create_receipt: boolean = false;
  value: number = 0;
  total: number = 0;
  isUploading: boolean = false;
  hasDueInspection: boolean = false;
  dueInspectionId: number | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Arquivo selecionado:', file.name);
    }
  }

  async onFileUpload(): Promise<void> {
    if (!this.selectedFile || !this.access_token || this.isUploading) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('value', this.value.toString());

    const loading = await this.loadingController.create({
      message: 'Enviando recibo...'
    });

    await loading.present();

    this.api.uploadReceipt(formData, this.access_token).subscribe(
      (response: any) => {
        loading.dismiss();
        this.isUploading = false;
        this.start();
        console.log('Resposta do servidor:', response);
      },
      (error) => {
        loading.dismiss();
        this.isUploading = false;
        console.error('Erro no upload:', error);
      }
    );
  }

  async ionViewDidEnter() {
    try {
      const next: any = await this.inspectionService.nextInspection();
      this.hasDueInspection = !!next?.assignment?.id;
      this.dueInspectionId = next?.assignment?.id ?? null;
    } catch (_) {
      this.hasDueInspection = false;
      this.dueInspectionId = null;
    }
  }

  openInspection() {
    this.router.navigateByUrl('/inspection');
  }

}
