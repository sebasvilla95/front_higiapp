import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface LoginResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  // Agregar más campos posibles
  [key: string]: any;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Verificar si ya hay un token válido
    const token = localStorage.getItem('authToken');
    if (token && this.isTokenValid(token)) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.http.post<LoginResponse>('https://backend.svillalobos.com/api/v1/users/login/', credentials)
        .subscribe({
          next: (response) => {
            this.handleLoginSuccess(response);
          },
          error: (error) => {
            this.handleLoginError(error);
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleLoginSuccess(response: LoginResponse): void {
    console.log('Login exitoso:', response);
    console.log('Response access token:', response.access);
    console.log('Response refresh token:', response.refresh);
    
    // Determinar qué campos usar para los tokens
    const accessToken = response.access || response.access_token || response.token;
    const refreshToken = response.refresh || response.refresh_token;
    
    console.log('Access token encontrado:', !!accessToken);
    console.log('Refresh token encontrado:', !!refreshToken);
    
    // Verificar que tenemos al menos el access token
    if (!accessToken) {
      console.error('No se encontró access token en la respuesta');
      console.log('Estructura de respuesta:', JSON.stringify(response, null, 2));
      this.errorMessage = 'Error: No se encontró token de acceso en la respuesta';
      return;
    }
    
    // Guardar tokens
    try {
      localStorage.setItem('authToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log('Tokens guardados en localStorage');
    } catch (error) {
      console.error('Error guardando tokens:', error);
      this.errorMessage = 'Error guardando tokens';
      return;
    }
    
    // Verificar que se guardó correctamente
    const savedToken = localStorage.getItem('authToken');
    const savedRefresh = localStorage.getItem('refreshToken');
    console.log('Token guardado:', !!savedToken);
    console.log('Refresh guardado:', !!savedRefresh);
    console.log('Token value:', savedToken ? savedToken.substring(0, 20) + '...' : 'null');
    console.log('Refresh value:', savedRefresh ? savedRefresh.substring(0, 20) + '...' : 'null');
    
    // Guardar información del usuario
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Información del usuario guardada');
    } else {
      console.log('No se encontró información del usuario en la respuesta');
    }

    // Configurar recordarme
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    this.isLoading = false;
    
    // Redirigir al dashboard
    console.log('Intentando navegar a /dashboard');
    
    // Usar setTimeout para dar tiempo a que se procese
    setTimeout(() => {
      // Intentar navegación con router
      this.router.navigate(['/dashboard']).then(success => {
        console.log('Navegación con router exitosa:', success);
        if (!success) {
          console.log('Router falló, usando window.location');
          window.location.href = '/dashboard';
        }
      }).catch(error => {
        console.error('Error en navegación con router:', error);
        console.log('Usando window.location como fallback');
        window.location.href = '/dashboard';
      });
    }, 100);
  }

  private handleLoginError(error: HttpErrorResponse): void {
    this.isLoading = false;
    
    if (error.status === 401) {
      this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
    } else if (error.status === 400) {
      this.errorMessage = 'Datos inválidos. Revisa los campos del formulario.';
    } else if (error.status === 0) {
      this.errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.status >= 500) {
      this.errorMessage = 'Error del servidor. Inténtalo más tarde.';
    } else {
      this.errorMessage = 'Error inesperado. Inténtalo de nuevo.';
    }

    console.error('Error en el login:', error);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Método para limpiar mensajes de error
  clearError(): void {
    this.errorMessage = '';
  }

}