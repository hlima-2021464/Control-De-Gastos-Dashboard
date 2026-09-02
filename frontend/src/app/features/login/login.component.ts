import { Component, OnInit, inject, signal, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment.development';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly ngZone  = inject(NgZone);

  // ─── Estado ─────────────────────────────────────────────────
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loggedUser   = signal<UserProfile | null>(null);
  readonly showPassword = signal(false);

  // ─── Formulario Principal ───────────────────────────────────
  readonly loginForm: FormGroup = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password:   ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const user = this.authSvc.currentUser();
    if (user) {
      this.loggedUser.set(user);
    }
  }

  /**
   * Flujo Oficial Google Identity Services (GIS) OAuth 2.0
   * Abre la ventana emergente oficial de Google para seleccionar cuenta.
   */
  iniciarConGoogle(): void {
    this.errorMessage.set(null);

    const clientId = environment.googleClientId?.trim();
    if (!clientId) {
      this.errorMessage.set('No se ha configurado el Client ID de Google en el archivo environment.development.ts.');
      return;
    }

    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      this.errorMessage.set('El servicio de Google no se encuentra cargado. Por favor, verifique su conexión e intente nuevamente.');
      return;
    }

    try {
      this.isLoading.set(true);

      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: (response: any) => {
          if (response?.error) {
            this.ngZone.run(() => {
              this.isLoading.set(false);
              if (response.error === 'access_denied') {
                this.errorMessage.set('Inicio de sesión cancelado en la ventana de Google.');
              } else {
                this.errorMessage.set(`Error de autenticación con Google (${response.error}): ${response.error_description || 'Compruebe la configuración del cliente OAuth.'}`);
              }
            });
            return;
          }

          if (response?.access_token) {
            this.fetchGoogleUserProfile(response.access_token);
          }
        },
        error_callback: (err: any) => {
          this.ngZone.run(() => {
            this.isLoading.set(false);
            if (err?.type === 'popup_closed') {
              this.errorMessage.set('La ventana emergente de Google fue cerrada antes de completar la selección de cuenta.');
            } else {
              this.errorMessage.set(`Error en la ventana emergente de Google: ${err?.message || err?.type || 'No se pudo abrir la ventana.'}`);
            }
          });
        },
      });

      // Abre la ventana emergente oficial de Google para selección de cuenta
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      this.isLoading.set(false);
      this.errorMessage.set(`Error al iniciar la autenticación con Google: ${err?.message || 'Error inesperado.'}`);
    }
  }

  /**
   * Obtiene la información real del perfil del usuario mediante la API de Google
   */
  private fetchGoogleUserProfile(accessToken: string): void {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Respuesta inválida de la API de Google (Código ${res.status}).`);
        }
        return res.json();
      })
      .then((googleProfile) => {
        this.ngZone.run(() => {
          const user = this.authSvc.loginWithGoogleProfile({
            name: googleProfile.name || googleProfile.given_name || googleProfile.email.split('@')[0],
            email: googleProfile.email,
            picture: googleProfile.picture,
          });
          this.loggedUser.set(user);
          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        });
      })
      .catch((err: any) => {
        this.ngZone.run(() => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.message || 'Error al obtener los datos del perfil de Google.');
        });
      });
  }

  // ─── Getters para template ──────────────────────────────────
  get identifierCtrl() { return this.loginForm.get('identifier')!; }
  get passwordCtrl()   { return this.loginForm.get('password')!; }

  get identifierError(): string | null {
    const ctrl = this.identifierCtrl;
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('required'))   return 'El usuario o correo electrónico es requerido.';
    if (ctrl.hasError('minlength'))  return 'Mínimo 3 caracteres.';
    return null;
  }

  get passwordError(): string | null {
    const ctrl = this.passwordCtrl;
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('required'))   return 'La contraseña es requerida.';
    if (ctrl.hasError('minlength'))  return 'Mínimo 6 caracteres.';
    return null;
  }

  // ─── Manejo de logo ─────────────────────────────────────────
  logoFallback(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const svgDiv = document.createElement('div');
      svgDiv.className = 'logo-icon';
      svgDiv.setAttribute('aria-hidden', 'true');
      svgDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      `;
      parent.insertBefore(svgDiv, img);
    }
  }

  // ─── Acciones ───────────────────────────────────────────────
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { identifier, password } = this.loginForm.value as {
      identifier: string;
      password:   string;
    };

    this.authSvc.login({ identifier, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.loggedUser.set(response.data.user);
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  onLogout(): void {
    this.authSvc.logout();
    this.loggedUser.set(null);
    this.loginForm.reset();
    this.errorMessage.set(null);
  }
}
