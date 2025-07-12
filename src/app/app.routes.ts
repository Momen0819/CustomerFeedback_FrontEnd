import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback',
    loadComponent: () => import('./feedback/feedback.component').then(m => m.FeedbackComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback/create',
    loadComponent: () => import('./feedback/create/create.component').then(m => m.CreateFeedbackComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback/edit/:id',
    loadComponent: () => import('./feedback/edit/edit.component').then(m => m.EditFeedbackComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback/ratings/:id',
    loadComponent: () => import('./feedback/ratings/ratings.component').then(m => m.FeedbackRatingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'statistics',
    loadComponent: () => import('./statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'public/:id',
    loadComponent: () => import('./public/public.component').then(m => m.PublicComponent)
  },
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  }
];
