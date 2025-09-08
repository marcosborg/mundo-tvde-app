import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonImg,
  IonButton,
} from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.page.html',
  styleUrls: ['./article.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    PublicHeaderComponent,
    IonImg,
    IonButton,
  ]
})
export class ArticlePage implements OnInit {

  article_id: string | null = null;
  article: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.loadingController.create().then((loading) => {
      loading.present();
      this.article_id = this.route.snapshot.paramMap.get('article_id');
      console.log('ID do artigo:', this.article_id);
      if (this.article_id) {
        this.api.article(this.article_id).subscribe({
          next: (data) => {
            loading.dismiss();
            this.article = data;
            console.log('Artigo carregado:', this.article);
          },
          error: (err) => {
            console.error('Erro ao buscar artigo:', err);
            loading.dismiss();
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }


}
