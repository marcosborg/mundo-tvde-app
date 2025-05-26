import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-assistente-motorista',
  templateUrl: './assistente-motorista.page.html',
  styleUrls: ['./assistente-motorista.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AssistenteMotoristaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
