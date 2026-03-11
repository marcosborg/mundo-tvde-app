import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonRange,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonChip
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../components/header/header.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { PreferencesService } from '../../services/preferences.service';
import { ApiService } from '../../services/api.service';
import { FunctionsService } from '../../services/functions.service';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.page.html',
  styleUrls: ['./inspection-detail.page.scss'],
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
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonRange,
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonChip,
    HeaderComponent,
    ChatComponent
  ]
})
export class InspectionDetailPage {
  accessToken = '';
  inspectionId = 0;
  data: any = null;
  inspection: any = null;

  documentKeys = ['dua', 'insurance', 'inspection_periodic', 'tvde_stickers', 'no_smoking_sticker'];
  documentLabels: any = {
    dua: 'DUA',
    insurance: 'Seguro',
    inspection_periodic: 'Inspecao periodica',
    tvde_stickers: 'Disticos TVDE',
    no_smoking_sticker: 'Autocolante proibicao de fumar'
  };
  accessoryKeys = ['via_verde', 'charging_cable', 'charging_adapter', 'spare_tire', 'anti_puncture_kit', 'jack_wrench', 'warning_triangle', 'reflective_vest'];
  accessoryLabels: any = {
    via_verde: 'Via Verde',
    charging_cable: 'Cabos carregamento',
    charging_adapter: 'Adaptadores carregamento',
    spare_tire: 'Pneu suplente',
    anti_puncture_kit: 'Kit anti-furos',
    jack_wrench: 'Macaco e chave de rodas',
    warning_triangle: 'Triangulo sinalizacao',
    reflective_vest: 'Colete refletor'
  };

  draft: any = {
    driver_id: null,
    checklist: {
      documents: {},
      cleanliness: { external: 5, interior: 5 },
      fuel_energy: { level: 5 },
      mileage: { odometer_km: null },
      tire_condition: { level: 5 },
      panel_warnings: { panel_warning: false },
      accessories: { other_notes: '' }
    },
    damage: { location: '', part: '', part_section: '', damage_type: '', damage_notes: '' },
    extra_observations: '',
    inspector_name: '',
    driver_signature_name: ''
  };

  filesMap: { [key: string]: File[] } = {};
  extraFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private preferences: PreferencesService,
    private api: ApiService,
    private loadingController: LoadingController,
    private functions: FunctionsService
  ) {}

  async ionViewWillEnter() {
    const token = await this.preferences.checkName('access_token');
    this.accessToken = token?.value || '';
    if (!this.accessToken) {
      this.router.navigateByUrl('/');
      return;
    }

    this.inspectionId = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.inspectionId) {
      this.router.navigateByUrl('/inspections');
      return;
    }

    this.loadInspection();
  }

  async loadInspection() {
    const loading = await this.loadingController.create({ message: 'A carregar inspeção...' });
    await loading.present();

    this.api.appInspection(this.accessToken, this.inspectionId).subscribe({
      next: (resp) => {
        this.data = resp;
        this.inspection = resp?.inspection;
        this.patchDraftFromChecklist(resp?.checklist || {});
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.functions.errors(err);
      }
    });
  }

  patchDraftFromChecklist(checklist: any) {
    this.draft.driver_id = this.inspection?.driver?.id || null;
    this.draft.checklist.documents = checklist.documents || {};
    this.draft.checklist.cleanliness = checklist.cleanliness || { external: 5, interior: 5 };
    this.draft.checklist.fuel_energy = checklist.fuel_energy || { level: 5 };
    this.draft.checklist.mileage = checklist.mileage || { odometer_km: null };
    this.draft.checklist.tire_condition = checklist.tire_condition || { level: 5 };
    this.draft.checklist.panel_warnings = checklist.panel_warnings || { panel_warning: false };
    this.draft.checklist.accessories = checklist.accessories || { other_notes: '' };
    this.draft.extra_observations = this.inspection?.extra_observations || '';
  }

  selectFiles(event: any, key: string) {
    const selected = Array.from((event?.target?.files || []) as File[]);
    this.filesMap[key] = selected;
  }

  selectExtraFiles(event: any) {
    this.extraFiles = Array.from((event?.target?.files || []) as File[]);
  }

  isStep(step: number): boolean {
    return Number(this.inspection?.current_step || 0) === step;
  }

  getSlots(scope: 'exterior' | 'interior'): string[] {
    return (this.data?.required_slots?.[scope] || []) as string[];
  }

  getSlotLabel(scope: 'exterior' | 'interior', slot: string): string {
    return this.data?.slot_labels?.[scope]?.[slot] || slot;
  }

  stepLabel(): string {
    const step = Number(this.inspection?.current_step || 0);
    return this.data?.steps?.[step] || '';
  }

  getPhotoCount(slotPrefix: string): number {
    const key = `${slotPrefix}`;
    return this.filesMap[key]?.length || 0;
  }

  existingPhotoCount(slot: string): number {
    const list = this.data?.photos || [];
    return list.filter((p: any) => p?.slot === slot).length;
  }

  saveStep(action: 'save' | 'complete') {
    const step = Number(this.inspection?.current_step || 1);
    const formData = new FormData();
    formData.append('step', String(step));
    formData.append('action', action);

    if (step === 2 && this.draft.driver_id) {
      formData.append('driver_id', String(this.draft.driver_id));
    }

    if (step === 3) {
      this.documentKeys.forEach((key) => {
        if (this.draft.checklist.documents?.[key]) {
          formData.append(`checklist[documents][${key}]`, '1');
        }
        (this.filesMap[`doc_${key}`] || []).forEach((file) => {
          formData.append(`checklist_photos[${key}][]`, file);
        });
      });
    }

    if (step === 4) {
      formData.append('checklist[cleanliness][external]', String(this.draft.checklist.cleanliness.external ?? 5));
      formData.append('checklist[cleanliness][interior]', String(this.draft.checklist.cleanliness.interior ?? 5));
      formData.append('checklist[fuel_energy][level]', String(this.draft.checklist.fuel_energy.level ?? 5));
      formData.append('checklist[tire_condition][level]', String(this.draft.checklist.tire_condition.level ?? 5));
      if (this.draft.checklist.mileage.odometer_km !== null && this.draft.checklist.mileage.odometer_km !== '') {
        formData.append('checklist[mileage][odometer_km]', String(this.draft.checklist.mileage.odometer_km));
      }
      if (this.draft.checklist.panel_warnings?.panel_warning) {
        formData.append('checklist[panel_warnings][panel_warning]', '1');
      }

      (this.filesMap['fuel_energy'] || []).forEach((file) => formData.append('checklist_photos[fuel_energy][]', file));
      (this.filesMap['odometer'] || []).forEach((file) => formData.append('checklist_photos[odometer][]', file));
      (this.filesMap['tires'] || []).forEach((file) => formData.append('checklist_photos[tires][]', file));
      (this.filesMap['panel_warning'] || []).forEach((file) => formData.append('checklist_photos[panel_warning][]', file));
    }

    if (step === 5) {
      this.accessoryKeys.forEach((key) => {
        const present = this.draft.checklist.accessories?.[`${key}_present`];
        const state = this.draft.checklist.accessories?.[`${key}_state`];
        if (present !== undefined && present !== null && present !== '') {
          formData.append(`checklist[accessories][${key}_present]`, String(present));
        }
        if (state) {
          formData.append(`checklist[accessories][${key}_state]`, String(state));
        }
        (this.filesMap[`acc_${key}`] || []).forEach((file) => {
          formData.append(`checklist_photos[${key}][]`, file);
        });
      });
      if (this.draft.checklist.accessories?.other_notes) {
        formData.append('checklist[accessories][other_notes]', this.draft.checklist.accessories.other_notes);
      }
    }

    if (step === 6) {
      this.getSlots('exterior').forEach((slot) => {
        (this.filesMap[`ext_${slot}`] || []).forEach((file) => {
          formData.append(`exterior_photos[${slot}][]`, file);
        });
      });
    }

    if (step === 7) {
      this.getSlots('interior').forEach((slot) => {
        (this.filesMap[`int_${slot}`] || []).forEach((file) => {
          formData.append(`interior_photos[${slot}][]`, file);
        });
      });
    }

    if (step === 8 || step === 9) {
      if (this.draft.damage.location) {
        formData.append('location', this.draft.damage.location);
      }
      if (this.draft.damage.part) {
        formData.append('part', this.draft.damage.part);
      }
      if (this.draft.damage.part_section) {
        formData.append('part_section', this.draft.damage.part_section);
      }
      if (this.draft.damage.damage_type) {
        formData.append('damage_type', this.draft.damage.damage_type);
      }
      if (this.draft.damage.damage_notes) {
        formData.append('damage_notes', this.draft.damage.damage_notes);
      }
      (this.filesMap['damage'] || []).forEach((file) => {
        formData.append('damage_photo[]', file);
      });
    }

    if (step === 10) {
      formData.append('extra_observations', this.draft.extra_observations || '');
      this.extraFiles.forEach((file) => formData.append('extra_photos[]', file));
    }

    if (step === 11) {
      if (this.draft.inspector_name) {
        formData.append('inspector_name', this.draft.inspector_name);
      }
      if (this.draft.driver_signature_name) {
        formData.append('driver_signature_name', this.draft.driver_signature_name);
      }
    }

    this.api.appInspectionUpdateStep(this.accessToken, this.inspectionId, formData).subscribe({
      next: () => this.loadInspection(),
      error: (err) => this.functions.errors(err)
    });
  }

  backStep() {
    this.api.appInspectionBackStep(this.accessToken, this.inspectionId).subscribe({
      next: () => this.loadInspection(),
      error: (err) => this.functions.errors(err)
    });
  }

  resolveDamage(damageId: number) {
    this.api.appInspectionResolveDamage(this.accessToken, this.inspectionId, damageId).subscribe({
      next: () => this.loadInspection(),
      error: (err) => this.functions.errors(err)
    });
  }

  closeInspection() {
    this.api.appInspectionClose(this.accessToken, this.inspectionId).subscribe({
      next: () => this.loadInspection(),
      error: (err) => this.functions.errors(err)
    });
  }

  backToList() {
    this.router.navigateByUrl('/inspections');
  }
}
