import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  sandbox: boolean = true;
  baseUrl: string;
  private readonly productionBaseUrl = 'https://mundotvde.pt/api/';
  private readonly localApiPort = '8000';
  private readonly apiPath = '/api/';

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {
    this.baseUrl = this.sandbox ? this.resolveSandboxBaseUrl() : this.productionBaseUrl;
    this.applyRuntimeBaseUrlOverride();
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

  private resolveSandboxBaseUrl(): string {
    const platform = Capacitor.getPlatform();
    const localhostBase = `http://127.0.0.1:${this.localApiPort}${this.apiPath}`;

    // Browser dev (ionic serve)
    if (platform === 'web') {
      const host = window?.location?.hostname || '127.0.0.1';
      const resolvedHost = host === 'localhost' ? '127.0.0.1' : host;
      return `http://${resolvedHost}:${this.localApiPort}${this.apiPath}`;
    }

    // Android emulator maps host machine localhost to 10.0.2.2
    if (platform === 'android') {
      return `http://10.0.2.2:${this.localApiPort}${this.apiPath}`;
    }

    // iOS simulator can access host localhost directly
    if (platform === 'ios') {
      return localhostBase;
    }

    return localhostBase;
  }

  private async applyRuntimeBaseUrlOverride() {
    if (!this.sandbox) {
      return;
    }

    const override = await Preferences.get({ key: 'api_base_url' });
    if (override?.value) {
      this.baseUrl = this.normalizeBaseUrl(override.value);
    }
  }

  async setRuntimeBaseUrl(baseUrl: string): Promise<void> {
    const normalized = this.normalizeBaseUrl(baseUrl);
    this.baseUrl = normalized;
    await Preferences.set({ key: 'api_base_url', value: normalized });
  }

  async clearRuntimeBaseUrl(): Promise<void> {
    await Preferences.remove({ key: 'api_base_url' });
    this.baseUrl = this.sandbox ? this.resolveSandboxBaseUrl() : this.productionBaseUrl;
  }

  private normalizeBaseUrl(baseUrl: string): string {
    let value = (baseUrl || '').trim();
    if (!value) {
      return this.resolveSandboxBaseUrl();
    }

    if (!/^https?:\/\//i.test(value)) {
      value = `http://${value}`;
    }

    if (!value.endsWith('/')) {
      value += '/';
    }

    if (!value.toLowerCase().endsWith('/api/')) {
      value = value.replace(/\/+$/, '') + '/api/';
    }

    return value;
  }

  //PUBLIC

  home() {
    return this.http.get(this.baseUrl + 'public/home', this.httpOptions);
  }

  article(article_id: any) {
    return this.http.get(this.baseUrl + 'public/article/' + article_id, this.httpOptions);
  }

  cars() {
    return this.http.get(this.baseUrl + 'public/cars', this.httpOptions);
  }

  car(car_id: any) {
    return this.http.get(this.baseUrl + 'public/car/' + car_id, this.httpOptions);
  }

  standCars() {
    return this.http.get(this.baseUrl + 'public/stand-cars', this.httpOptions);
  }

  // PRIVATE

  login(data: any) {
    return this.http.post(this.baseUrl + 'login', data, this.httpOptions);
  }

  user(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/user', this.httpOptions);
  }

  admin(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/admin', this.httpOptions);
  }

  myReceipts(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/my-receipts', this.httpOptions);
  }

  reports(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/reports', this.httpOptions);
  }

  documents(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/documents', this.httpOptions);
  }

  uploadReceipt(data: FormData, accessToken: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.post(`${this.baseUrl}app/send-receipt`, data, {
      headers
    });
  }

  myDocuments(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/my-documents', this.httpOptions);
  }

  contracts(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/contracts', this.httpOptions);
  }

  uploadDocument(data: FormData, accessToken: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    return this.http.post(`${this.baseUrl}app/send-document`, data, {
      headers
    });
  }

  lastTimeLog(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/time-log/last-time-log', this.httpOptions);
  }

  newTimeLog(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/time-log/new-time-log/' + data.status, this.httpOptions);
  }

  getTimeLogs(data: any) {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + data.access_token
      })
    };
    return this.http.get(this.baseUrl + 'app/time-log/get-time-logs', this.httpOptions);
  }

  // Chat - Assistente Virtual (Bot ID 2)
  assistenteVirtual(data: { email: string; conversation: any[] }) {
    return this.http.post(this.baseUrl + 'assistente-virtual', data, this.httpOptions);
  }

  getWebsiteMessages(email: string) {
    return this.http.get<any[]>(this.baseUrl + 'website-messages/' + encodeURIComponent(email), this.httpOptions);
  }

  assistenteMotorista(data: { conversation: any[] }, access_token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + access_token
      })
    };

    return this.http.post(this.baseUrl + 'assistente-motorista', data, httpOptions);
  }

  getMotoristaMessages(access_token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + access_token
      })
    };

    return this.http.get<any[]>(this.baseUrl + 'motorista-messages', httpOptions);
  }


  carRentalContact(data: any) {
    return this.http.post(this.baseUrl + 'public/car-rental-contact', data, this.httpOptions);
  }

  private authHeaders(access_token: string) {
    return {
      headers: new HttpHeaders({
        'Accept-Language': 'pt',
        'Authorization': 'Bearer ' + access_token
      })
    };
  }

  // Inspections
  driverInspectionNext(access_token: string) {
    return this.http.get(this.baseUrl + 'driver/inspections/next', this.authHeaders(access_token));
  }

  driverInspectionStart(access_token: string, assignmentId: number) {
    return this.http.post(this.baseUrl + 'driver/inspections/' + assignmentId + '/start', {}, this.authHeaders(access_token));
  }

  driverInspectionPhoto(access_token: string, assignmentId: number, data: FormData) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post(this.baseUrl + 'driver/inspections/' + assignmentId + '/photo', data, { headers });
  }

  driverInspectionDeletePhoto(access_token: string, assignmentId: number, photoId: number) {
    return this.http.delete(this.baseUrl + 'driver/inspections/' + assignmentId + '/photo/' + photoId, this.authHeaders(access_token));
  }

  driverInspectionSubmit(access_token: string, assignmentId: number, payload: any) {
    return this.http.post(this.baseUrl + 'driver/inspections/' + assignmentId + '/submit', payload, this.authHeaders(access_token));
  }

  registerDeviceToken(access_token: string, payload: { platform: 'android' | 'ios'; token: string; }) {
    return this.http.post(this.baseUrl + 'device-tokens/register', payload, this.authHeaders(access_token));
  }

  notifications(access_token: string) {
    return this.http.get(this.baseUrl + 'notifications', this.authHeaders(access_token));
  }

}
