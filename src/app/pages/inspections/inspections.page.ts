import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,
  IonBadge,
  IonButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { PreferencesService } from '../../services/preferences.service';
import { ApiService } from '../../services/api.service';
import { FunctionsService } from '../../services/functions.service';

@Component({
  selector: 'app-inspections',
  templateUrl: './inspections.page.html',
  styleUrls: ['./inspections.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonLabel,
    IonBadge,
    IonButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent,
    HeaderComponent,
    ChatComponent
  ]
})
export class InspectionsPage {
  accessToken = '';
  inspections: any[] = [];
  filter: string = 'open';
  summary = { total: 0, open: 0, ready: 0, closed: 0 };

  constructor(
    private preferences: PreferencesService,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingController: LoadingController,
    private functions: FunctionsService
  ) {}

  ionViewWillEnter() {
    this.start();
  }

  async start() {
    const token = await this.preferences.checkName('access_token');
    this.accessToken = token?.value || '';
    if (!this.accessToken) {
      this.router.navigateByUrl('/');
      return;
    }
    const queryFilter = String(this.route.snapshot.queryParamMap.get('filter') || '').toLowerCase();
    if (queryFilter === 'all' || queryFilter === 'closed' || queryFilter === 'open') {
      this.filter = queryFilter;
    }
    this.loadInspections();
  }

  async loadInspections() {
    const loading = await this.loadingController.create({ message: 'A carregar inspeções...' });
    await loading.present();
    const status = this.filter === 'open' ? undefined : (this.filter === 'all' ? 'all' : 'closed');

    this.api.appInspections(this.accessToken, status).subscribe({
      next: (resp) => {
        this.inspections = resp?.data || [];
        this.computeSummary(this.inspections);
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.functions.errors(err);
      }
    });
  }

  segmentChanged(value: string | number | undefined) {
    this.filter = String(value || 'open');
    this.loadInspections();
  }

  refresh(event: any) {
    const status = this.filter === 'open' ? undefined : (this.filter === 'all' ? 'all' : 'closed');
    this.api.appInspections(this.accessToken, status).subscribe({
      next: (resp) => {
        this.inspections = resp?.data || [];
        this.computeSummary(this.inspections);
        event?.target?.complete?.();
      },
      error: (err) => {
        event?.target?.complete?.();
        this.functions.errors(err);
      }
    });
  }

  computeSummary(items: any[]) {
    const summary = { total: items.length, open: 0, ready: 0, closed: 0 };
    items.forEach((i) => {
      const status = String(i?.status || '');
      if (status === 'closed') {
        summary.closed++;
      } else {
        summary.open++;
      }
      if (status === 'ready_to_sign') {
        summary.ready++;
      }
    });
    this.summary = summary;
  }

  statusColor(status: string): string {
    if (status === 'closed') return 'success';
    if (status === 'ready_to_sign') return 'warning';
    return 'primary';
  }

  openInspection(inspection: any) {
    this.router.navigateByUrl(`/inspections/${inspection.id}`);
  }
}
