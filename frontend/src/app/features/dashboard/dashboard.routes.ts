import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard.component').then((m) => m.DashboardComponent),
        title: 'Control de Gastos - Panel Personal',
      },
      {
        path: 'ingresos',
        loadComponent: () =>
          import('./pages/ingresos/ingresos.component').then(
            (m) => m.IngresosComponent
          ),
        title: 'Control de Gastos - Flujo de Ingresos',
      },
      {
        path: 'gastos',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Gastos — En Construcción',
      },
      {
        path: 'presupuestos',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Presupuestos — En Construcción',
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Categorías — En Construcción',
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Reportes — En Construcción',
      },
      {
        path: 'ahorro',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Ahorro — En Construcción',
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('../../shared/components/under-construction/under-construction.component').then(
            (m) => m.UnderConstructionComponent
          ),
        title: 'Configuración — En Construcción',
      },
    ],
  },
];
