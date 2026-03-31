import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth/start/start.page').then(m => m.StartPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'time-logs',
    loadComponent: () => import('./pages/time-logs/time-logs.page').then(m => m.TimeLogsPage)
  },
  {
    path: 'article/:article_id',
    loadComponent: () => import('./pages/article/article.page').then(m => m.ArticlePage)
  },
  {
    path: 'content/:kind',
    loadComponent: () => import('./pages/content/content.page').then(m => m.ContentPage)
  },
  {
    path: 'content/:kind/:id',
    loadComponent: () => import('./pages/content/content.page').then(m => m.ContentPage)
  },
  {
    path: 'cars',
    loadComponent: () => import('./pages/cars/cars.page').then(m => m.CarsPage)
  },
  {
    path: 'stand-cars',
    loadComponent: () => import('./pages/stand-cars/stand-cars.page').then(m => m.StandCarsPage)
  },
  {
    path: 'assistente-virtual',
    loadComponent: () => import('./pages/assistente-virtual/assistente-virtual.page').then(m => m.AssistenteVirtualPage)
  },
  {
    path: 'car/:car_id',
    loadComponent: () => import('./pages/car/car.page').then(m => m.CarPage)
  },
  {
    path: 'assistente-motorista',
    loadComponent: () => import('./pages/assistente-motorista/assistente-motorista.page').then(m => m.AssistenteMotoristaPage)
  },
  {
    path: 'transfer-tours',
    loadComponent: () => import('./pages/transfer-tours/transfer-tours.page').then(m => m.TransferToursPage)
  },
  {
    path: 'transfer-tour/:id',
    loadComponent: () => import('./pages/transfer-tour/transfer-tour.page').then(m => m.TransferTourPage)
  },
  {
    path: 'inspections',
    loadComponent: () => import('./pages/inspections/inspections.page').then(m => m.InspectionsPage)
  },
  {
    path: 'inspections/:id',
    loadComponent: () => import('./pages/inspection-detail/inspection-detail.page').then(m => m.InspectionDetailPage)
  },
];
