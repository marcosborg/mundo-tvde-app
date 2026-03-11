import { Component, EnvironmentInjector, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, receipt, documentText, business, person } from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { PreferencesService } from '../services/preferences.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss'],
    imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  pendingRoutineCount = 0;
  private routeSub?: Subscription;

  constructor(
    private api: ApiService,
    private preferences: PreferencesService,
    private router: Router
  ) {
    addIcons({ home, receipt, documentText, business, person });
  }

  ngOnInit(): void {
    this.loadPendingCount();
    this.routeSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.loadPendingCount());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private async loadPendingCount() {
    const token = await this.preferences.checkName('access_token');
    const accessToken = token?.value || '';
    if (!accessToken) {
      this.pendingRoutineCount = 0;
      return;
    }

    this.api.appInspections(accessToken).subscribe({
      next: (resp: any) => {
        const rows = Array.isArray(resp?.data) ? resp.data : [];
        this.pendingRoutineCount = rows.filter((row: any) =>
          String(row?.type) === 'routine' && String(row?.status) !== 'closed'
        ).length;
      },
      error: () => {
        this.pendingRoutineCount = 0;
      }
    });
  }
}
