import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private initialized = false;

  constructor(
    private toastController: ToastController,
  ) {}

  async init(): Promise<void> {
    if (this.initialized || !Capacitor.isNativePlatform()) {
      return;
    }

    this.initialized = true;

    await PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push token registered:', token.value);
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
    void accessToken;
  }

  private handleNotificationAction(action: ActionPerformed): void {
    // No app routing action for push payloads at this moment.
    void action;
  }

  private async showForegroundToast(notification: PushNotificationSchema): Promise<void> {
    const message = notification.body || 'Nova notificacao recebida.';

    const toast = await this.toastController.create({
      header: notification.title || 'Notificacao',
      message,
      duration: 3500,
      position: 'top',
    });

    await toast.present();
  }
}
