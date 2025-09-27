import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  children?: MenuItem[];
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class DashboardComponent implements OnInit {
  isSidebarCollapsed = false;
  activeModule = '';
  activeItem = '';

  menuItems: MenuItem[] = [
    {
      id: 'admin',
      label: 'Administración',
      icon: 'settings',
      children: [
        { id: 'clients', label: 'Clientes', icon: 'people', route: '/dashboard/admin/clients' },
        { id: 'products', label: 'Productos', icon: 'inventory', route: '/dashboard/admin/products' },
        { id: 'stock', label: 'Inventario', icon: 'warehouse', route: '/dashboard/admin/stock' },
        { id: 'users', label: 'Usuarios', icon: 'person', route: '/dashboard/admin/users' }
      ]
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: 'shopping_cart',
      children: [
        { id: 'process', label: 'Procesos', icon: 'assignment', route: '/dashboard/sales/process' },
        { id: 'quote', label: 'Cotizaciones', icon: 'request_quote', route: '/dashboard/sales/quote' },
        { id: 'item-quote', label: 'Items Cotización', icon: 'list_alt', route: '/dashboard/sales/item-quote' }
      ]
    }
  ];

  constructor(private router: Router) {
    console.log('Dashboard constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('Dashboard ngOnInit ejecutado');
    console.log('URL actual:', window.location.href);
    console.log('Ruta actual:', this.router.url);
    
    // Verificar autenticación
    const token = localStorage.getItem('authToken');
    console.log('Token encontrado:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) {
      console.log('No hay token, redirigiendo al login');
      this.router.navigate(['/login']);
      return;
    }

    // Verificar si el token es válido (pero no redirigir inmediatamente)
    const isValid = this.isTokenValid(token);
    console.log('Token válido:', isValid);
    
    if (!isValid) {
      console.log('Token inválido, redirigiendo al login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Usuario autenticado, cargando dashboard');
    // Cargar información del usuario
    this.loadUserInfo();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleModule(moduleId: string): void {
    if (this.activeModule === moduleId) {
      this.activeModule = '';
    } else {
      this.activeModule = moduleId;
    }
  }

  selectItem(item: MenuItem): void {
    if (item.route) {
      console.log('Navegando a:', item.route);
      this.activeItem = item.id;
      this.router.navigate([item.route]).then(success => {
        console.log('Navegación a', item.route, 'exitosa:', success);
      }).catch(error => {
        console.error('Error navegando a', item.route, ':', error);
      });
    }
  }

  navigateToClients(): void {
    console.log('Navegando a clientes');
    this.router.navigate(['/dashboard/admin/clients']).then(success => {
      console.log('Navegación a clientes exitosa:', success);
    }).catch(error => {
      console.error('Error navegando a clientes:', error);
    });
  }

  navigateToProcess(): void {
    console.log('Navegando a procesos');
    this.router.navigate(['/dashboard/sales/process']).then(success => {
      console.log('Navegación a procesos exitosa:', success);
    }).catch(error => {
      console.error('Error navegando a procesos:', error);
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    this.router.navigate(['/login']);
  }

  private isTokenValid(token: string): boolean {
    try {
      // Verificar que el token tenga el formato JWT básico (3 partes separadas por puntos)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Token no tiene formato JWT válido');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;
      
      console.log('Token exp:', payload.exp);
      console.log('Tiempo actual:', currentTime);
      console.log('Token expirado:', !isValid);
      
      return isValid;
    } catch (error) {
      console.log('Error validando token:', error);
      return false;
    }
  }

  private loadUserInfo(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Usuario logueado:', user);
      } catch (error) {
        console.error('Error al cargar información del usuario:', error);
      }
    }
  }
}
