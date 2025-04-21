import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonImg,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, logOutOutline } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonIcon,
    IonBackButton,
    IonMenuButton,
    CommonModule,
  ],
  standalone: true,
})
export class PublicHeaderComponent implements OnInit {

  constructor(
    public router: Router,
    private alertController: AlertController,
    private preferences: PreferencesService
  ) {
    addIcons({ logOutOutline, logInOutline });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.start();
      });
  }

  url: string = '';
  login_button: boolean = false;
  logout_button: boolean = false;
  back_button: boolean = false;
  menu_button: boolean = false;
  access_token: any;

  ngOnInit() {
    this.start();
  }

  start() {
    this.url = this.router.url;
    if (this.url === '/login') {
      this.login_button = false;
      this.logout_button = false;
      this.back_button = true;
      this.menu_button = false;
    } else {
      this.back_button = false;
      this.menu_button = true;
      this.preferences.checkName('access_token').then((data) => {
        this.access_token = data.value;
        if (this.access_token === null) {
          this.login_button = true;
          this.logout_button = false;
        } else {
          this.login_button = false;
          this.logout_button = true;
        }
      });
    }
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  onLogout() {
    this.alertController.create({
      message: 'Tem a certeza?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            this.preferences.removeName('access_token').then(() => {
              setTimeout(() => {
                this.start();
                setTimeout(() => {
                  this.router.navigateByUrl('home');
                }, 500);
              }, 500);
            });
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    }).then((alert) => {
      alert.present();
    });

  }

}
