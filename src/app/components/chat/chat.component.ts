import { Component, OnInit } from '@angular/core';
import { IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoWhatsapp } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [
    IonFab,
    IonFabButton,
    IonIcon,
  ],
  standalone: true,
})
export class ChatComponent implements OnInit {

  constructor() {
    addIcons({ logoWhatsapp });
  }

  ngOnInit() { }

  openWhasapp() {
    const phoneNumber = '351964028006'; // Número com código do país
    const whatsappURL = `https://wa.me/${phoneNumber}`;
    window.open(whatsappURL, '_blank'); // Abre o link em uma nova aba ou aplicativo
  }

}
