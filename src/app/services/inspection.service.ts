import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PreferencesService } from './preferences.service';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

type PendingUpload = {
  assignmentId: number;
  angle: string;
  dataUrl: string;
  capturedAt: string;
};

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  private readonly queueKey = 'inspection_upload_queue';

  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
  ) {
    window.addEventListener('online', () => {
      this.flushQueue().catch(() => null);
    });
  }

  async getToken(): Promise<string | null> {
    const resp: any = await this.preferences.checkName('access_token');
    return resp?.value || null;
  }

  async nextInspection() {
    const token = await this.getToken();
    if (!token) {
      return null;
    }

    const response: any = await firstValueFrom(this.api.driverInspectionNext(token));
    return response?.data ?? null;
  }

  async startInspection(assignmentId: number) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Sem token de autenticação.');
    }

    return firstValueFrom(this.api.driverInspectionStart(token, assignmentId));
  }

  async captureAndUploadPhoto(assignmentId: number, angle: string): Promise<{ queued: boolean; data?: any; error?: any }> {
    const photo = await Camera.getPhoto({
      quality: 75,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (!photo.dataUrl) {
      return { queued: false, error: 'Falha ao capturar a fotografia.' };
    }

    const capturedAt = new Date().toISOString();

    if (!navigator.onLine) {
      await this.queueUpload({ assignmentId, angle, dataUrl: photo.dataUrl, capturedAt });
      return { queued: true };
    }

    try {
      const result = await this.uploadDataUrl(assignmentId, angle, photo.dataUrl, capturedAt);
      return { queued: false, data: result };
    } catch (error) {
      await this.queueUpload({ assignmentId, angle, dataUrl: photo.dataUrl, capturedAt });
      return { queued: true, error };
    }
  }

  async submitInspection(assignmentId: number, payload: any) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Sem token de autenticação.');
    }

    await this.flushQueue();
    return firstValueFrom(this.api.driverInspectionSubmit(token, assignmentId, payload));
  }

  async pendingQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async flushQueue(): Promise<number> {
    const token = await this.getToken();
    if (!token || !navigator.onLine) {
      return 0;
    }

    const queue = await this.getQueue();
    if (!queue.length) {
      return 0;
    }

    const remaining: PendingUpload[] = [];
    let uploaded = 0;

    for (const item of queue) {
      try {
        await this.uploadDataUrl(item.assignmentId, item.angle, item.dataUrl, item.capturedAt);
        uploaded++;
      } catch (_) {
        remaining.push(item);
      }
    }

    await this.preferences.setName(this.queueKey, JSON.stringify(remaining));
    return uploaded;
  }

  private async uploadDataUrl(assignmentId: number, angle: string, dataUrl: string, capturedAt: string) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('Sem token de autenticação.');
    }

    const blob = this.dataUrlToBlob(dataUrl);
    const formData = new FormData();
    formData.append('angle', angle);
    formData.append('captured_at', capturedAt);
    formData.append('file', new File([blob], `${angle}_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' }));

    return firstValueFrom(this.api.driverInspectionPhoto(token, assignmentId, formData));
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  private async queueUpload(item: PendingUpload): Promise<void> {
    const queue = await this.getQueue();
    queue.push(item);
    await this.preferences.setName(this.queueKey, JSON.stringify(queue));
  }

  private async getQueue(): Promise<PendingUpload[]> {
    const raw: any = await this.preferences.checkName(this.queueKey);
    if (!raw?.value) {
      return [];
    }

    try {
      return JSON.parse(raw.value) as PendingUpload[];
    } catch (_) {
      return [];
    }
  }
}
