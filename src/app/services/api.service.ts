import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: string;
  private readonly productionBaseUrl = 'https://mundotvde.pt/api/';
  private readonly localApiPort = '8000';
  private readonly apiPath = '/api/';

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {
    this.baseUrl = this.resolveBaseUrl();
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

  private resolveBaseUrl(): string {
    const localBaseUrl = `http://127.0.0.1:${this.localApiPort}${this.apiPath}`;

    if (Capacitor.getPlatform() !== 'web') {
      return this.productionBaseUrl;
    }

    const host = window?.location?.hostname?.toLowerCase() || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return localBaseUrl;
    }

    return this.productionBaseUrl;
  }

  //PUBLIC

  home() {
    return this.http.get(this.baseUrl + 'public/home', this.httpOptions);
  }

  article(article_id: any) {
    return this.http.get(this.baseUrl + 'public/article/' + article_id, this.httpOptions);
  }

  page(pageId: any) {
    return this.http.get(this.baseUrl + 'public/page/' + pageId, this.httpOptions);
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

  ownCar() {
    return this.http.get(this.baseUrl + 'public/own-car', this.httpOptions);
  }

  courier(courierId: any) {
    return this.http.get(this.baseUrl + 'public/courier/' + courierId, this.httpOptions);
  }

  training() {
    return this.http.get(this.baseUrl + 'public/training', this.httpOptions);
  }

  consulting() {
    return this.http.get(this.baseUrl + 'public/consulting', this.httpOptions);
  }

  transferTours() {
    return this.http.get(this.baseUrl + 'public/transfer-tours', this.httpOptions);
  }

  transferTour(transferTourId: any) {
    return this.http.get(this.baseUrl + 'public/transfer-tour/' + transferTourId, this.httpOptions);
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

  appInspections(access_token: string, status?: string) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    const qs = status !== undefined ? `?status=${encodeURIComponent(status)}` : '';
    return this.http.get<any>(this.baseUrl + 'app/inspections' + qs, { headers });
  }

  appInspectionCreateOptions(access_token: string) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.get<any>(`${this.baseUrl}app/inspections/create-options`, { headers });
  }

  appInspectionCreate(access_token: string, data: any) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post<any>(`${this.baseUrl}app/inspections`, data, { headers });
  }

  appInspection(access_token: string, inspectionId: number) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.get<any>(`${this.baseUrl}app/inspections/${inspectionId}`, { headers });
  }

  appInspectionUpdateStep(access_token: string, inspectionId: number, data: FormData) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post<any>(`${this.baseUrl}app/inspections/${inspectionId}/step`, data, { headers });
  }

  appInspectionBackStep(access_token: string, inspectionId: number) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post<any>(`${this.baseUrl}app/inspections/${inspectionId}/back-step`, {}, { headers });
  }

  appInspectionResolveDamage(access_token: string, inspectionId: number, damageId: number) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post<any>(`${this.baseUrl}app/inspections/${inspectionId}/damages/${damageId}/resolve`, {}, { headers });
  }

  appInspectionClose(access_token: string, inspectionId: number) {
    const headers = new HttpHeaders({
      'Accept-Language': 'pt',
      'Authorization': 'Bearer ' + access_token
    });
    return this.http.post<any>(`${this.baseUrl}app/inspections/${inspectionId}/close`, {}, { headers });
  }


  carRentalContact(data: any) {
    return this.http.post(this.baseUrl + 'public/car-rental-contact', data, this.httpOptions);
  }
}
