import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { IncomeService, ColumnaSemanal } from '../../core/services/income.service';

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

  // Filtro de período para la gráfica de Gastos vs Ingresos
  readonly activePeriod = signal<'Semana' | 'Mes' | 'Año'>('Mes');

  // ─── Métricas reactivas sincronizadas en tiempo real ────────
  readonly totalIngresos$: Observable<number> = this.incomeSvc.totalIngresos$;
  readonly balanceTotal$: Observable<number> = this.incomeSvc.totalIngresos$;
  readonly columnasSemanales$: Observable<ColumnaSemanal[]> = this.incomeSvc.columnasSemanales$;

  setPeriod(period: 'Semana' | 'Mes' | 'Año'): void {
    this.activePeriod.set(period);
  }

  logout(): void {
    this.authSvc.logout();
    this.router.navigate(['/login']);
  }

  get userDisplayName(): string {
    const user = this.currentUser();
    return user?.name || user?.username || 'Henry Lima';
  }

  get userAvatarUrl(): string | null {
    const user = this.currentUser();
    return user?.picture || user?.avatarUrl || null;
  }

  get userInitial(): string {
    const name = this.userDisplayName;
    return name.charAt(0).toUpperCase();
  }
}
