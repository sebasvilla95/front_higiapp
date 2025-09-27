import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './app/auth/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { ClientsComponent } from './app/dashboard/admin/clients/clients.component';

// Configuración de rutas
const routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard/admin/clients', component: ClientsComponent },
  { path: '**', redirectTo: 'login' } // Redirigir cualquier ruta no encontrada al login
];

bootstrapApplication(LoginComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
