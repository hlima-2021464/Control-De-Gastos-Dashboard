import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { IncomeService, ColumnaSemanal } from '../../core/services/income.service';

export interface AppNotification {
  id: string;
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private readonly authSvc = inject(AuthService);
  private readonly incomeSvc = inject(IncomeService);
  private readonly router = inject(Router);

  readonly currentUser = this.authSvc.currentUser;

  // Filtro de periodo para la grafica de Gastos vs Ingresos
  readonly activePeriod = signal<'Semana' | 'Mes' | 'Año'>('Mes');

  // ─── Metricas reactivas sincronizadas en tiempo real ────────
  readonly totalIngresos$: Observable<number> = this.incomeSvc.totalIngresos$;
  readonly balanceTotal$: Observable<number> = this.incomeSvc.totalIngresos$;
  readonly columnasSemanales$: Observable<ColumnaSemanal[]> = this.incomeSvc.columnasSemanales$;

  // ─── Notificaciones Intercaladas Dinamicas ──────────────────
  readonly notificaciones = signal<AppNotification[]>([
    {
      id: 'notif-1',
      titulo: 'Modulo de Ingresos Sincronizado',
      mensaje: 'Las metricas de ingresos y el histograma se recalculan automaticamente en tiempo real.',
    },
    {
      id: 'notif-2',
      titulo: 'Autenticacion con Google Activa',
      mensaje: 'Sesion iniciada con identidad de Google OAuth 2.0 y perfil sincronizado.',
    },
    {
      id: 'notif-3',
      titulo: 'Control de Sesion por Actividad',
      mensaje: 'El token de autenticacion se mantiene activo mientras interactua con el sistema.',
    },
    {
      id: 'notif-4',
      titulo: 'Resumen Financiero Consolidado',
      mensaje: 'El balance y desglose financiero del periodo se encuentran actualizados.',
    },
  ]);

  setPeriod(period: 'Semana' | 'Mes' | 'Año'): void {
    this.activePeriod.set(period);
  }

  logout(): void {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }

  get userDisplayName(): string {
    const user = this.currentUser();
    return user?.name || user?.username || user?.email || 'Usuario';
  }

  get userAvatarUrl(): string | null {
    const user = this.currentUser();
    return user?.picture || user?.avatarUrl || null;
  }

  get userInitial(): string {
    const name = this.userDisplayName;
    return (name && name.length > 0) ? name.charAt(0).toUpperCase() : 'U';
  }
}
