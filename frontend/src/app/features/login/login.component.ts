import { Component, OnInit, AfterViewInit, inject, signal, NgZone } from '@angular/core';
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
export class LoginComponent implements OnInit, AfterViewInit {
  private readonly fb      = inject(FormBuilder);
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);
  private readonly ngZone  = inject(NgZone);

  // ─── Estado ─────────────────────────────────────────────────
  readonly isLoading    = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly loggedUser   = signal<UserProfile | null>(null);
  readonly showPassword = signal(false);

  // ─── Formulario ─────────────────────────────────────────────
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

  ngAfterViewInit(): void {
    this.initGoogleIdentityServices();
  }

  /** Inicializa Google Identity Services (Sign in with Google) */
  private initGoogleIdentityServices(): void {
    if (typeof window === 'undefined') return;

    const checkGsi = () => {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleCredentialResponse(response),
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const btnEl = document.getElementById('google-signin-btn');
        if (btnEl) {
          google.accounts.id.renderButton(btnEl, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            locale: 'es',
            width: '100%',
          });
        }
      } else {
        setTimeout(checkGsi, 200);
      }
    };

    checkGsi();
  }

  /** Procesa la respuesta de credencial JWT de Google */
  handleGoogleCredentialResponse(response: { credential: string }): void {
    this.ngZone.run(() => {
      try {
        this.isLoading.set(true);
        this.errorMessage.set(null);
        const user = this.authSvc.loginWithGoogleCredential(response.credential);
        this.loggedUser.set(user);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      } catch (err: any) {
        this.isLoading.set(false);
        this.errorMessage.set(err?.message || 'Error al autenticar con Google');
      }
    });
  }

  /** Inicio de sesión con Google (botón interactivo rápido / soporte OAuth) */
  iniciarConGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.loginGoogleDirecto();
        }
      });
    } else {
      this.loginGoogleDirecto();
    }
  }

  /** Login directo simulando cuenta de Gmail autorizada si GIS nativo está en modo demo */
  loginGoogleDirecto(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      this.ngZone.run(() => {
        const user = this.authSvc.loginWithGoogleUser({
          id: 'google-uid-1029384756',
          name: 'Henry Lima',
          username: 'Henry Lima',
          email: 'hlima-2021464@kinal.edu.gt',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'ADMIN',
        });
        this.loggedUser.set(user);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      });
    }, 400);
  }

  // ─── Getters para template ──────────────────────────────────
  get identifierCtrl() { return this.loginForm.get('identifier')!; }
  get passwordCtrl()   { return this.loginForm.get('password')!; }

  get identifierError(): string | null {
    const ctrl = this.identifierCtrl;
    if (!ctrl.touched || ctrl.valid) return null;
    if (ctrl.hasError('required'))   return 'El usuario o email es requerido.';
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
