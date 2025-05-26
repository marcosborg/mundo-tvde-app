import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { PublicHeaderComponent } from 'src/app/components/public-header/public-header.component';

@Component({
  selector: 'app-assistente-virtual',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, PublicHeaderComponent],
  providers: [ApiService],
  templateUrl: './assistente-virtual.page.html',
  styleUrls: ['./assistente-virtual.page.scss'],
})
export class AssistenteVirtualPage {
  email = '';
  message = '';
  conversation: { role: string, content: string }[] = [];
  started = false;
  loading = false;

  @ViewChild('chatBox', { static: false }) chatBox!: ElementRef;

  constructor(private api: ApiService) { }

  startChat() {
    if (!this.email || !this.email.includes('@')) {
      alert('Por favor, introduza um email válido.');
      return;
    }

    this.api.getWebsiteMessages(this.email).subscribe(
      res => {
        this.conversation = Array.isArray(res) ? res : [];
        this.started = true;
        this.scrollToBottom();
      },
      () => {
        this.started = true;
      }
    );
  }

  sendMessage() {
    if (!this.message.trim()) return;

    const msg = { role: 'user', content: this.message.trim() };
    this.conversation.push(msg);
    if (this.conversation.length > 10) this.conversation.shift();

    this.loading = true;
    this.api.assistenteVirtual({ email: this.email, conversation: this.conversation }).subscribe(
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
