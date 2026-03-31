import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonImg,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.page.html',
  styleUrls: ['./content.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonImg,
    PublicHeaderComponent,
  ]
})
export class ContentPage implements OnInit {
  kind = '';
  id: string | null = null;
  content: any = null;
  title = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private loadingController: LoadingController,
  ) {}

  ngOnInit() {
    this.kind = String(this.route.snapshot.paramMap.get('kind') || '');
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadContent();
  }

  async loadContent() {
    const request = this.resolveRequest();
    if (!request) {
      this.router.navigate(['/home']);
      return;
    }

    const loading = await this.loadingController.create({ message: 'A carregar conteúdo...' });
    await loading.present();

    request.subscribe({
      next: (resp: any) => {
        this.content = resp;
        this.title = this.resolveTitle(resp);
        loading.dismiss();
      },
      error: (err) => {
        console.error(err);
        loading.dismiss();
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  private resolveRequest() {
    switch (this.kind) {
      case 'page':
        return this.id ? this.api.page(this.id) : null;
      case 'own-car':
        return this.api.ownCar();
      case 'courier':
        return this.id ? this.api.courier(this.id) : null;
      case 'training':
        return this.api.training();
      case 'consulting':
        return this.api.consulting();
      default:
        return null;
    }
  }

  private resolveTitle(content: any): string {
    return String(content?.title || content?.name || 'Conteúdo');
  }

  get imageUrl(): string {
    return String(this.content?.image?.url || '');
  }

  get descriptionHtml(): string {
    return String(this.content?.description || '');
  }

  get bodyHtml(): string {
    return String(this.content?.text || '');
  }
}
