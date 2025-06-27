import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  sandbox: boolean = true;
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
  ) {
    this.baseUrl = this.sandbox ? 'http://127.0.0.1:8000/api/' : 'https://mundotvde.pt/api/';
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Accept-Language': 'pt'
    })
  };

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

}