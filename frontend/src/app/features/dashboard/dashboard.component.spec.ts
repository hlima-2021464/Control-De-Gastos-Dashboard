import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { IncomeService } from '../../core/services/income.service';

describe('DashboardComponent', () => {
  let incomeService: IncomeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideHttpClient(), provideRouter([]), IncomeService],
    }).compileComponents();

    incomeService = TestBed.inject(IncomeService);
  });

  it('should create the dashboard component', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should update active period on setPeriod', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    component.setPeriod('Semana');
    expect(component.activePeriod()).toBe('Semana');
  });

  it('should start with zero baseline and sync incomes reactively', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    incomeService.limpiarIngresos();
    const initialTotal = await firstValueFrom(component.totalIngresos$);
    expect(initialTotal).toBe(0);

    incomeService.agregarIngreso({
      concepto: 'Abono Quincenal',
      monto: 3500,
      fecha: '2026-08-15',
      fuente: 'Nómina Fija',
      cuentaDestino: 'Cuenta Monetaria BAC',
    });

    const updatedTotal = await firstValueFrom(component.totalIngresos$);
    expect(updatedTotal).toBe(3500);
  });
});
