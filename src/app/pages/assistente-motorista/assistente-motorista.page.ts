import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonChip,
  IonLabel,
  IonFooter,
  IonItem,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';
import { ApiService } from 'src/app/services/api.service';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-assistente-motorista',
  templateUrl: './assistente-motorista.page.html',
  styleUrls: ['./assistente-motorista.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToolbar,
    CommonModule,
    FormsModule,
    PublicHeaderComponent,
    IonChip,
    IonLabel,
    IonFooter,
    IonItem,
    IonButton,
    IonSpinner,
  ],
})
export class AssistenteMotoristaPage {

  access_token: string = '';
  message = '';
  conversation: { role: string, content: string }[] = [];
  started = false;
  loading = false;

  @ViewChild('chatBox', { static: false }) chatBox!: ElementRef;

  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ionViewWillEnter() {
    this.startChat();
  }

  startChat() {
    this.preferences.checkName('access_token').then((resp: any) => {
      this.access_token = resp.value;
      if (!this.access_token) {
        this.router.navigateByUrl('/');
      } else {
        this.loadingController.create().then((loading) => {
          loading.present();
          this.api.getMotoristaMessages(this.access_token).subscribe(
            res => {
              this.conversation = Array.isArray(res) ? res : [];
              loading.dismiss();
              setTimeout(() => {
                this.started = true;
                this.scrollToBottom();
              }, 500);
            },
            () => {
              loading.dismiss();
              setTimeout(() => {
                this.started = true;
                this.scrollToBottom();
              }, 0);
            }
          );
        });
      }
    });
  }

  sendMessage() {
    if (!this.message.trim()) return;

    const msg = { role: 'user', content: this.message.trim() };
    this.conversation.push(msg);
    if (this.conversation.length > 10) this.conversation.shift();

    this.loading = true;
    this.api.assistenteMotorista({ conversation: this.conversation }, this.access_token).subscribe(
      (res: any) => {
        const reply = { role: 'assistant', content: res.reply };

        this.conversation.push(reply);
        if (this.conversation.length > 10) this.conversation.shift();
        this.message = '';
        this.loading = false;
        this.scrollToBottom();
      },
      () => {
        this.conversation.push({ role: 'assistant', content: 'Erro ao comunicar com o assistente.' });
        this.loading = false;
        this.scrollToBottom();
      }
    );
  }


  scrollToBottom() {
    setTimeout(() => {
      const el = this.chatBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

}
