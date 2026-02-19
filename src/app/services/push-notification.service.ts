import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';
import { PreferencesService } from './preferences.service';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly pushTokenKey = 'push_native_token';
  private accessToken: string | null = null;
  private initialized = false;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private preferences: PreferencesService,
    private api: ApiService,
    private toastController: ToastController,
  ) {}

  async init(): Promise<void> {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    this.initialized = true;

    await PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', (token: Token) => {
      this.preferences.setName(this.pushTokenKey, token.value);
      this.syncTokenWithBackend().catch(() => null);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received:', notification);
      this.showForegroundToast(notification).catch(() => null);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      this.handleNotificationAction(action);
    });

    const permStatus = await PushNotifications.checkPermissions();
    const receivePermission = permStatus.receive;

    if (receivePermission !== 'granted') {
      const requestStatus = await PushNotifications.requestPermissions();
      if (requestStatus.receive !== 'granted') {
        return;
      }
    }

    await PushNotifications.register();
  }

  onAccessTokenAvailable(accessToken: string | null): void {
    this.accessToken = accessToken;
    if (accessToken) {
      this.syncTokenWithBackend().catch(() => null);
    }
  }

  private async syncTokenWithBackend(): Promise<void> {
    if (!this.accessToken || !Capacitor.isNativePlatform()) {
      return;
    }

    const tokenResp: any = await this.preferences.checkName(this.pushTokenKey);
    const deviceToken = tokenResp?.value;

    if (!deviceToken) {
      return;
    }

    const platform = Capacitor.getPlatform();
    if (platform !== 'android' && platform !== 'ios') {
      return;
    }

    await firstValueFrom(this.api.registerDeviceToken(this.accessToken, {
      platform,
      token: deviceToken,
    }));
  }

  private handleNotificationAction(action: ActionPerformed): void {
    const data = action.notification?.data || {};
    const type = data['type'];

    if (type !== 'inspection_due') {
      return;
    }

    const assignmentId = Number(data['assignment_id'] || data['assignmentId'] || 0);
    const vehicleId = Number(data['vehicle_id'] || data['vehicleId'] || 0);

    this.ngZone.run(() => {
      this.router.navigate(['/inspection'], {
        queryParams: {
          assignment_id: assignmentId || null,
          vehicle_id: vehicleId || null,
          source: 'push',
        },
      });
    });
  }

  private async showForegroundToast(notification: PushNotificationSchema): Promise<void> {
    const data = notification.data || {};
    const type = data['type'];
    if (type !== 'inspection_due') {
      return;
    }

    const assignmentId = Number(data['assignment_id'] || data['assignmentId'] || 0);
    const vehicleId = Number(data['vehicle_id'] || data['vehicleId'] || 0);
    const message = notification.body || 'Tem uma inspecao de viatura por concluir.';

    const toast = await this.toastController.create({
      header: notification.title || 'Inspecao de viatura',
      message,
      duration: 5000,
      position: 'top',
      buttons: [
        {
          text: 'Abrir',
          role: 'info',
          handler: () => {
            this.ngZone.run(() => {
              this.router.navigate(['/inspection'], {
                queryParams: {
                  assignment_id: assignmentId || null,
                  vehicle_id: vehicleId || null,
                  source: 'push_toast',
                },
              });
            });
          },
        },
        {
          text: 'Fechar',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }
}
