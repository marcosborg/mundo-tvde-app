import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ChatComponent } from 'src/app/components/chat/chat.component';
import { InspectionService } from 'src/app/services/inspection.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inspection',
  templateUrl: './inspection.page.html',
  styleUrls: ['./inspection.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    HeaderComponent,
    ChatComponent,
  ]
})
export class InspectionPage {
  loading = false;
  assignment: any = null;
  requiredAngles: string[] = [];
  photosByAngle: Record<string, number[]> = {};
  queueCount = 0;
  summaryNotes = '';
  defects: Array<{ title: string; description: string; severity: 'non_critical' | 'critical' }> = [];
  notificationAssignmentId: number | null = null;
  openedFromPush = false;

  constructor(
    private inspectionService: InspectionService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private route: ActivatedRoute,
  ) {}

  async ionViewWillEnter() {
    this.readNotificationParams();
    await this.loadInspection();
  }

  async loadInspection() {
    this.loading = true;
    const loader = await this.loadingController.create({ message: 'A carregar inspecao...' });
    await loader.present();

    try {
      const next = await this.inspectionService.nextInspection();
      this.assignment = next?.assignment || null;
      this.requiredAngles = next?.required_angles || [];
      this.photosByAngle = {};

      if (this.assignment?.id) {
        await this.inspectionService.startInspection(this.assignment.id);
      }

      this.queueCount = await this.inspectionService.pendingQueueCount();
    } catch (_) {
      await this.presentToast('Nao foi possivel carregar a inspecao.', 'danger');
    } finally {
      this.loading = false;
      await loader.dismiss();
    }
  }

  async takePhoto(angle: string) {
    if (!this.assignment?.id) {
      return;
    }

    const result = await this.inspectionService.captureAndUploadPhoto(this.assignment.id, angle);

    if (result.queued) {
      this.queueCount = await this.inspectionService.pendingQueueCount();
      await this.presentToast(`Foto ${angle} guardada em fila offline.`, 'warning');
      return;
    }

    const photoId = result?.data?.data?.photo_id;
    if (!photoId) {
      await this.presentToast('Foto capturada, mas sem confirmacao do servidor.', 'warning');
      return;
    }

    if (!this.photosByAngle[angle]) {
      this.photosByAngle[angle] = [];
    }
    this.photosByAngle[angle].push(photoId);
    await this.presentToast(`Foto ${angle} enviada com sucesso.`, 'success');
  }

  isAngleDone(angle: string): boolean {
    return (this.photosByAngle[angle] || []).length > 0;
  }

  addDefect() {
    this.defects.push({ title: '', description: '', severity: 'non_critical' });
  }

  removeDefect(index: number) {
    this.defects.splice(index, 1);
  }

  async syncQueue() {
    const uploaded = await this.inspectionService.flushQueue();
    this.queueCount = await this.inspectionService.pendingQueueCount();

    if (uploaded > 0) {
      await this.presentToast(`${uploaded} foto(s) sincronizadas.`, 'success');
    } else {
      await this.presentToast('Sem itens para sincronizar.', 'medium');
    }
  }

  async submitInspection() {
    if (!this.assignment?.id) {
      return;
    }

    const defectsPayload = this.defects
      .filter((item) => item.title?.trim())
      .map((item) => ({
        title: item.title,
        description: item.description,
        severity: item.severity,
      }));

    try {
      await this.inspectionService.submitInspection(this.assignment.id, {
        summary_notes: this.summaryNotes,
        defects: defectsPayload,
      });

      await this.presentToast('Inspecao submetida com sucesso.', 'success');
      this.summaryNotes = '';
      this.defects = [];
      await this.loadInspection();
    } catch (error: any) {
      const message = error?.error?.message || 'Falha ao submeter inspecao.';
      await this.presentToast(message, 'danger');
    }
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
    });

    await toast.present();
  }

  private readNotificationParams() {
    const assignmentId = Number(this.route.snapshot.queryParamMap.get('assignment_id') || 0);
    this.notificationAssignmentId = assignmentId > 0 ? assignmentId : null;
    this.openedFromPush = this.route.snapshot.queryParamMap.get('source') === 'push';
  }
}