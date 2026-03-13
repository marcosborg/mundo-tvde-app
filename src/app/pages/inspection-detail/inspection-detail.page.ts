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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  private readonly preferredInteriorSlotOrder = [
    'dashboard',
    'odometer',
    'center_console',
    'front_seats',
    'rear_seats',
    'trunk',
  ];

  accessToken = '';
  inspectionId = 0;
  data: any = null;
  inspection: any = null;
  isManager = false;

  defaultDocumentKeys = ['dua', 'insurance', 'inspection_periodic', 'tvde_stickers', 'no_smoking_sticker'];
  documentLabels: any = {
    dua: 'DUA',
    insurance: 'Seguro',
    inspection_periodic: 'Inspecao periodica',
    tvde_stickers: 'Disticos TVDE',
    no_smoking_sticker: 'Autocolante proibicao de fumar'
  };
  defaultAccessoryKeys = ['via_verde', 'charging_cable', 'charging_adapter', 'spare_tire', 'anti_puncture_kit', 'jack_wrench', 'warning_triangle', 'reflective_vest'];
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
  signatureDataUrls: { responsible: string; driver: string } = { responsible: '', driver: '' };
  private signatureDrawing: { responsible: boolean; driver: boolean } = { responsible: false, driver: false };
  private autoAdvancing = false;

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
        this.isManager = !!resp?.meta?.is_manager;
        this.signatureDataUrls = { responsible: '', driver: '' };
        this.signatureDrawing = { responsible: false, driver: false };
        this.patchDraftFromChecklist(resp?.checklist || {});
        this.autoAdvanceRoutineInitialStepsIfNeeded();
        loading.dismiss();
      },
      error: (err) => {
        loading.dismiss();
        this.functions.errors(err);
      }
    });
  }

  private autoAdvanceRoutineInitialStepsIfNeeded() {
    if (this.autoAdvancing) {
      return;
    }

    const type = String(this.inspection?.type || '');
    const currentStep = Number(this.inspection?.current_step || 0);

    if (type !== 'routine' || currentStep >= 3) {
      return;
    }

    this.autoAdvancing = true;

    const run = async () => {
      if (currentStep <= 1) {
        await this.completeStepSilently(1);
      }

      if (currentStep <= 2) {
        await this.completeStepSilently(2, this.inspection?.driver?.id || this.draft.driver_id || null);
      }
    };

    run()
      .then(() => this.loadInspection())
      .catch(() => null)
      .finally(() => {
        this.autoAdvancing = false;
      });
  }

  private async completeStepSilently(step: number, driverId?: number | null): Promise<void> {
    const formData = new FormData();
    formData.append('step', String(step));
    formData.append('action', 'complete');

    if (step === 2 && driverId) {
      formData.append('driver_id', String(driverId));
    }

    await new Promise<void>((resolve, reject) => {
      this.api.appInspectionUpdateStep(this.accessToken, this.inspectionId, formData).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
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

  async selectFiles(event: any, key: string) {
    const selected = Array.from((event?.target?.files || []) as File[]);
    const optimized = await Promise.all(selected.map((file) => this.optimizeExistingFile(file, key)));
    this.filesMap[key] = optimized.filter((file): file is File => !!file);
  }

  async selectExtraFiles(event: any) {
    const selected = Array.from((event?.target?.files || []) as File[]);
    const optimized = await Promise.all(selected.map((file) => this.optimizeExistingFile(file, 'extra')));
    this.extraFiles = optimized.filter((file): file is File => !!file);
  }

  async capturePhoto(key: string) {
    const file = await this.captureAndProcessPhoto(CameraSource.Camera, key);
    if (file) {
      this.filesMap[key] = [...(this.filesMap[key] || []), file];
    }
  }

  async pickPhotoFromGallery(key: string) {
    const file = await this.captureAndProcessPhoto(CameraSource.Photos, key);
    if (file) {
      this.filesMap[key] = [...(this.filesMap[key] || []), file];
    }
  }

  async captureExtraPhoto() {
    const file = await this.captureAndProcessPhoto(CameraSource.Camera, 'extra');
    if (file) {
      this.extraFiles = [...this.extraFiles, file];
    }
  }

  async pickExtraPhotoFromGallery() {
    const file = await this.captureAndProcessPhoto(CameraSource.Photos, 'extra');
    if (file) {
      this.extraFiles = [...this.extraFiles, file];
    }
  }

  isStep(step: number): boolean {
    return Number(this.inspection?.current_step || 0) === step;
  }

  displayStepNumber(step: number): number {
    if (this.isRoutineInspection()) {
      return step >= 3 ? step - 2 : step;
    }

    return step;
  }

  canBackStep(): boolean {
    const currentStep = Number(this.inspection?.current_step || 0);
    if (this.isRoutineInspection()) {
      return currentStep > 3;
    }

    return currentStep > 1;
  }

  get documentKeys(): string[] {
    const fromApi = this.data?.document_keys;
    return Array.isArray(fromApi) && fromApi.length > 0 ? fromApi : this.defaultDocumentKeys;
  }

  get accessoryKeys(): string[] {
    const fromApi = this.data?.accessory_keys;
    return Array.isArray(fromApi) && fromApi.length > 0 ? fromApi : this.defaultAccessoryKeys;
  }

  hasOperationalCheck(key: string): boolean {
    const fromApi = this.data?.operational_checks;
    if (!Array.isArray(fromApi) || fromApi.length === 0) {
      return true;
    }
    return fromApi.includes(key);
  }

  getSlots(scope: 'exterior' | 'interior'): string[] {
    const slots = [...((this.data?.required_slots?.[scope] || []) as string[])];
    if (scope !== 'interior') {
      return slots;
    }

    const order = new Map(this.preferredInteriorSlotOrder.map((slot, index) => [slot, index]));
    return slots.sort((left, right) => {
      const leftOrder = order.has(left) ? (order.get(left) as number) : Number.MAX_SAFE_INTEGER;
      const rightOrder = order.has(right) ? (order.get(right) as number) : Number.MAX_SAFE_INTEGER;
      if (leftOrder === rightOrder) {
        return left.localeCompare(right);
      }
      return leftOrder - rightOrder;
    });
  }

  getSlotLabel(scope: 'exterior' | 'interior', slot: string): string {
    return this.data?.slot_labels?.[scope]?.[slot] || slot;
  }

  stepLabel(): string {
    const step = Number(this.inspection?.current_step || 0);
    return this.data?.steps?.[step] || '';
  }

  get damagePartOptions(): Array<{ key: string; label: string }> {
    const selectedLocation = String(this.draft?.damage?.location || '');
    if (!selectedLocation) {
      return [];
    }

    const parts = this.data?.damage_parts?.[selectedLocation]?.sections || {};
    return Object.entries(parts).map(([key, value]: [string, any]) => ({
      key,
      label: String(value || key),
    }));
  }

  onDamageLocationChanged(value: string | number | undefined) {
    const nextLocation = String(value || '');
    this.draft.damage.location = nextLocation;

    const pieceExists = this.damagePartOptions.some((item) => item.key === this.draft.damage.part);
    if (!pieceExists) {
      this.draft.damage.part = '';
    }
  }

  damagePieceLabel(locationKey: string, pieceKey: string): string {
    const pieces = this.data?.damage_parts?.[locationKey]?.sections || {};
    return String(pieces?.[pieceKey] || pieceKey);
  }

  getPhotoCount(slotPrefix: string): number {
    const key = `${slotPrefix}`;
    return this.filesMap[key]?.length || 0;
  }

  getExtraPhotoCount(): number {
    return this.extraFiles.length;
  }

  existingPhotoCount(slot: string): number {
    const list = this.data?.photos || [];
    return list.filter((p: any) => p?.slot === slot).length;
  }

  existingExtraPhotoCount(): number {
    const list = this.data?.photos || [];
    return list.filter((p: any) => String(p?.category || '') === 'extra').length;
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
      if (this.hasOperationalCheck('cleanliness')) {
        formData.append('checklist[cleanliness][external]', String(this.draft.checklist.cleanliness.external ?? 5));
        formData.append('checklist[cleanliness][interior]', String(this.draft.checklist.cleanliness.interior ?? 5));
      }
      if (this.hasOperationalCheck('fuel_energy')) {
        formData.append('checklist[fuel_energy][level]', String(this.draft.checklist.fuel_energy.level ?? 5));
      }
      if (this.hasOperationalCheck('tire_condition')) {
        formData.append('checklist[tire_condition][level]', String(this.draft.checklist.tire_condition.level ?? 5));
      }
      if (this.hasOperationalCheck('mileage') && this.draft.checklist.mileage.odometer_km !== null && this.draft.checklist.mileage.odometer_km !== '') {
        formData.append('checklist[mileage][odometer_km]', String(this.draft.checklist.mileage.odometer_km));
      }
      if (this.hasOperationalCheck('panel_warnings') && this.draft.checklist.panel_warnings?.panel_warning) {
        formData.append('checklist[panel_warnings][panel_warning]', '1');
      }

      if (this.hasOperationalCheck('fuel_energy')) {
        (this.filesMap['fuel_energy'] || []).forEach((file) => formData.append('checklist_photos[fuel_energy][]', file));
      }
      if (this.hasOperationalCheck('mileage')) {
        (this.filesMap['odometer'] || []).forEach((file) => formData.append('checklist_photos[odometer][]', file));
      }
      if (this.hasOperationalCheck('tire_condition')) {
        (this.filesMap['tires'] || []).forEach((file) => formData.append('checklist_photos[tires][]', file));
      }
      if (this.hasOperationalCheck('panel_warnings')) {
        (this.filesMap['panel_warning'] || []).forEach((file) => formData.append('checklist_photos[panel_warning][]', file));
      }
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
      if (this.signatureDataUrls.responsible) {
        formData.append('inspector_signature_data', this.signatureDataUrls.responsible);
      }
      if (this.signatureDataUrls.driver) {
        formData.append('driver_signature_data', this.signatureDataUrls.driver);
      }
    }

    this.api.appInspectionUpdateStep(this.accessToken, this.inspectionId, formData).subscribe({
      next: () => this.loadInspection(),
      error: (err) => this.functions.errors(err)
    });
  }

  backStep() {
    if (!this.canBackStep()) {
      return;
    }

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

  private isRoutineInspection(): boolean {
    return String(this.inspection?.type || '') === 'routine';
  }

  beginSignature(role: 'responsible' | 'driver', event: any, canvas: HTMLCanvasElement) {
    event.preventDefault();
    const ctx = this.signatureContext(canvas);
    if (!ctx) {
      return;
    }

    const point = this.signaturePoint(canvas, event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    this.signatureDrawing[role] = true;
  }

  drawSignature(role: 'responsible' | 'driver', event: any, canvas: HTMLCanvasElement) {
    if (!this.signatureDrawing[role]) {
      return;
    }
    event.preventDefault();
    const ctx = this.signatureContext(canvas);
    if (!ctx) {
      return;
    }

    const point = this.signaturePoint(canvas, event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  endSignature(role: 'responsible' | 'driver', canvas: HTMLCanvasElement) {
    if (!this.signatureDrawing[role]) {
      return;
    }
    this.signatureDrawing[role] = false;
    this.signatureDataUrls[role] = canvas.toDataURL('image/png');
  }

  clearSignature(role: 'responsible' | 'driver', canvas: HTMLCanvasElement) {
    const ctx = this.signatureContext(canvas);
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureDataUrls[role] = '';
    this.signatureDrawing[role] = false;
  }

  hasSignature(role: 'responsible' | 'driver'): boolean {
    return !!this.signatureDataUrls[role];
  }

  private async captureAndProcessPhoto(source: CameraSource, key: string): Promise<File | null> {
    try {
      const photo = await Camera.getPhoto({
        source,
        resultType: CameraResultType.DataUrl,
        quality: 72,
        allowEditing: false,
      });

      if (!photo?.dataUrl) {
        return null;
      }

      return await this.dataUrlToOptimizedFile(photo.dataUrl, key);
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('cancel')) {
        return null;
      }
      this.functions.errors(err);
      return null;
    }
  }

  private async optimizeExistingFile(file: File, key: string): Promise<File | null> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    const dataUrl = await this.fileToDataUrl(file);
    return this.dataUrlToOptimizedFile(dataUrl, key);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Nao foi possivel ler o ficheiro.'));
      reader.readAsDataURL(file);
    });
  }

  private async dataUrlToOptimizedFile(dataUrl: string, key: string): Promise<File> {
    const blob = await fetch(dataUrl).then((r) => r.blob());
    const optimizedBlob = await this.optimizeImageBlob(blob);
    const filename = `${key}-${Date.now()}.jpg`;
    return new File([optimizedBlob], filename, { type: 'image/jpeg' });
  }

  private optimizeImageBlob(blob: Blob): Promise<Blob> {
    return new Promise((resolve) => {
      const maxDimension = 1600;
      const quality = 0.78;
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const width = img.width || maxDimension;
        const height = img.height || maxDimension;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(blob);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (compressed) => {
            URL.revokeObjectURL(url);
            resolve(compressed || blob);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(blob);
      };

      img.src = url;
    });
  }

  private signatureContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';
    return ctx;
  }

  private signaturePoint(canvas: HTMLCanvasElement, event: any): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }
}
