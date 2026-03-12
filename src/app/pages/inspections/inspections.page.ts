import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
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
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent,
    FormsModule,
    HeaderComponent,
    ChatComponent
]
})
export class InspectionsPage {
  accessToken = '';
  inspections: any[] = [];
  filter: string = 'open';
  summary = { total: 0, open: 0, ready: 0, closed: 0 };
  isManager = false;
  createOptionsLoaded = false;
  showCreatePanel = false;
  createOptions = {
    types: [] as any[],
    vehicles: [] as any[],
    drivers: [] as any[],
  };
  createDraft = {
    type: 'initial',
    vehicle_id: null as number | null,
    driver_id: null as number | null,
    location_text: '',
  };

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
        this.isManager = !!resp?.meta?.is_manager;
        this.computeSummary(this.inspections);
        if (this.isManager && !this.createOptionsLoaded) {
          this.loadCreateOptions();
        }
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
        this.isManager = !!resp?.meta?.is_manager;
        this.computeSummary(this.inspections);
        if (this.isManager && !this.createOptionsLoaded) {
          this.loadCreateOptions();
        }
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

  loadCreateOptions() {
    this.api.appInspectionCreateOptions(this.accessToken).subscribe({
      next: (resp) => {
        this.createOptions.types = resp?.types || [];
        this.createOptions.vehicles = resp?.vehicles || [];
        this.createOptions.drivers = resp?.drivers || [];
        if (this.createOptions.types.length > 0 && !this.createDraft.type) {
          this.createDraft.type = this.createOptions.types[0].key;
        }
        this.createOptionsLoaded = true;
      },
      error: (err) => this.functions.errors(err),
    });
  }

  onVehicleChanged(vehicleId: number | null) {
    const id = Number(vehicleId || 0);
    if (!id) {
      return;
    }

    const vehicle = this.createOptions.vehicles.find((v: any) => Number(v.id) === id);
    if (vehicle?.driver_id) {
      this.createDraft.driver_id = Number(vehicle.driver_id);
    }
  }

  createInspection() {
    if (!this.createDraft.type || !this.createDraft.vehicle_id) {
      this.functions.errors({ error: { message: 'Selecione tipo e viatura.' } });
      return;
    }

    const payload: any = {
      type: this.createDraft.type,
      vehicle_id: this.createDraft.vehicle_id,
    };

    if (this.createDraft.driver_id) {
      payload.driver_id = this.createDraft.driver_id;
    }
    if (this.createDraft.location_text?.trim()) {
      payload.location_text = this.createDraft.location_text.trim();
    }

    this.api.appInspectionCreate(this.accessToken, payload).subscribe({
      next: (resp) => {
        const inspectionId = Number(resp?.inspection_id || 0);
        if (inspectionId > 0) {
          this.showCreatePanel = false;
          this.router.navigateByUrl(`/inspections/${inspectionId}`);
          return;
        }
        this.loadInspections();
      },
      error: (err) => this.functions.errors(err),
    });
  }

  toggleCreatePanel() {
    this.showCreatePanel = !this.showCreatePanel;
  }
}
