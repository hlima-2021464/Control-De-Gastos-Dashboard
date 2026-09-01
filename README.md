# Control de Gastos — Plataforma de Gestión Financiera Personal

Aplicación Fullstack de alto rendimiento diseñada para la administración, monitoreo y auditoría de finanzas personales, presupuestos e ingresos en tiempo real.

---

## Stack Tecnológico

| Capa | Tecnología | Descripción |
|---|---|---|
| **Frontend** | Angular 17+ / 22 | Arquitectura basada en *Standalone Components*, *Signals* y *RxJS*. |
| **Estilos & UI** | TailwindCSS + Vanilla CSS | Diseño *Dark Glassmorphism* con efectos neón, gradientes y micro-animaciones. |
| **Autenticación** | JWT + Google Identity Services (OAuth 2.0) | Inicio de sesión con correo/contraseña y acceso con cuentas de Google. |
| **Backend** | Node.js · TypeScript · Express | API REST modularizada con controladores, servicios y repositorios. |
| **Base de Datos** | PostgreSQL 14+ | Persistencia relacional con consultas tipadas y pools de conexión (`pg`). |
| **Testing** | Vitest · Angular TestBed | Pruebas unitarias reactivas automatizadas. |
| **Gestor de Paquetes** | pnpm / npm | Gestión eficiente de dependencias y scripts de desarrollo. |

---

## Estructura del Proyecto

```
Control-De-Gastos-Dashboard/
├── backend/                             # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/                      # Variables de entorno tipadas (.env)
│   │   ├── db/                          # Pool PostgreSQL y scripts DDL (schema.sql)
│   │   ├── middlewares/                 # Autenticación JWT, roles y manejo global de errores
│   │   ├── modules/
│   │   │   ├── auth/                    # Controlador, servicio y rutas de autenticación
│   │   │   └── users/                   # Modelos, repositorios y rutas de usuarios
│   │   ├── utils/                       # Generación y validación de tokens JWT
│   │   ├── app.ts                       # Configuración de Express, CORS y rutas
│   │   └── server.ts                    # Punto de entrada y arranque del servidor HTTP
│   └── scripts/                         # CLI Seed para inicializar usuarios administradores
│
└── frontend/                            # SPA Angular (Standalone Architecture)
    └── src/
        ├── app/
        │   ├── core/                    # Núcleo global de la aplicación
        │   │   ├── components/          # Modales globales (Sesión Expirada por inactividad)
        │   │   ├── guards/              # Guards de navegación (authGuard, roleGuard)
        │   │   ├── interceptors/        # Interceptores HTTP (inyección de JWT Bearer)
        │   │   ├── models/              # Interfaces de dominio (Auth, UserProfile, IncomeItem)
        │   │   └── services/            # Servicios reactivos (AuthService, IncomeService, IdleService)
        │   ├── features/
        │   │   ├── login/               # Pantalla de inicio de sesión y Google OAuth
        │   │   └── dashboard/           # Módulo principal del Dashboard
        │   │       ├── layout/          # Shell persistente (Sidebar, Navbar y perfil)
        │   │       ├── pages/
        │   │       │   └── ingresos/    # Vista de Flujo y Gestión de Ingresos
        │   │       ├── dashboard.component.ts # Panel personal con métricas sincronizadas
        │   │       └── dashboard.routes.ts    # Enrutador modular del dashboard
        │   └── shared/                  # Componentes reutilizables (UnderConstructionComponent)
        ├── environments/                # Configuración de URLs y Google Client ID
        ├── index.html                   # SDK de Google Identity Services y tipografías
        └── styles.css                   # Sistema de diseño global (Glassmorphism)
```

---

## Inicio Rápido

### Prerrequisitos

- **Node.js**: Versión 18.0.0 o superior.
- **Gestor de paquetes**: `pnpm` (`npm install -g pnpm`) o `npm`.
- **PostgreSQL**: Versión 14 o superior.

---

### 1. Configuración del Backend

1. Acceda al directorio del backend:
   ```bash
   cd backend
   ```
2. Instale las dependencias:
   ```bash
   npm install
   # o bien:
   pnpm install
   ```
3. Cree el archivo de variables de entorno `.env` a partir del archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
4. Configure las credenciales de su base de datos PostgreSQL en el archivo `.env`:
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:4200
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=control_gastos
   DB_USER=postgres
   DB_PASSWORD=su_contraseña_postgres
   JWT_SECRET=su_clave_secreta_jwt
   JWT_EXPIRES_IN=8h
   ```
5. Inicialice las tablas ejecutando el script DDL en PostgreSQL:
   ```bash
   psql -U postgres -d control_gastos -f src/db/schema.sql
   ```
6. (Opcional) Cree el usuario administrador inicial mediante el script seed:
   ```bash
   pnpm run seed:user
   ```
   *Credenciales predeterminadas:*
   - **Usuario / Correo:** `admin@example.com` (o `admin`)
   - **Contraseña:** `Admin1234!`
   - **Rol:** `ADMIN`
7. Inicie el servidor backend en modo desarrollo:
   ```bash
   npm run dev
   # o bien:
   pnpm run dev
   ```
   *El servidor iniciará en:* `http://localhost:3000`

---

### 2. Configuración del Frontend

1. Abra una nueva terminal y acceda a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias:
   ```bash
   pnpm install
   ```
3. Inicie el servidor de desarrollo de Angular:
   ```bash
   pnpm start
   # o bien:
   pnpm run dev
   ```
4. Abra su navegador en [http://localhost:4200](http://localhost:4200).

---

## Opciones de Autenticación

Usted puede acceder a la plataforma a través de dos mecanismos:

1. **Google Identity Services (OAuth 2.0 / Sign in with Google)**:
   - Haga clic en el botón **"Iniciar sesión con Google"**.
   - Accederá instantáneamente con su perfil, extrayendo su nombre, correo y fotografía de perfil en el encabezado y barra lateral.
2. **Credenciales Locales (Formulario)**:
   - Ingrese su usuario/correo y contraseña registrados en el backend.

---

## Módulos y Funcionalidades

### 1. Panel de Control (Dashboard)
- **Línea Base en Cero ($Q 0.00$)**: La aplicación inicia con todas sus métricas y tablas vacías.
- **Sincronización en Tiempo Real**: Cada abono registrado, modificado o eliminado en el módulo de Ingresos actualiza inmediatamente las tarjetas de *Balance Total*, *Ingresos del Mes* y el *Histograma de Gastos vs Ingresos*.
- **Indicadores de Control**: Tarjetas informativas de liquidez y accesos directos.

### 2. Gestión de Ingresos (`/dashboard/ingresos`)
- **Histograma de Captación Semanal**: Gráfica de 5 períodos mensuales con cálculo dinámico porcentual de altura y montos en GTQ.
- **Tarjetas por Fuente**: Métricas desglosadas para *Nómina Fija*, *Desarrollo Web & Cloud* y *Consultorías de Sistemas*.
- **Tabla Dinámica con Filtros Reactivos**: Búsqueda en vivo por concepto/emisor y filtro por fuente de ingreso.
- **Modal de Registro y Edición**: Formulario reactivo validado para añadir y modificar abonos.

### 3. Módulos en Construcción
- Vistas de *Gastos, Presupuestos, Categorías, Reportes, Ahorro y Configuración* vinculadas al componente informativo `UnderConstructionComponent`.

### 4. Seguridad e Inactividad
- **Vigilancia Proactiva de Inactividad (`IdleService`)**: Detección reactiva de inactividad del usuario fuera de la zona de Angular para optimizar rendimiento.
- **Modal de Sesión Expirada**: Aviso automático formal ante vencimiento del token o inactividad prolongada.

---

## Pruebas Unitarias Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias implementadas con Vitest y Angular Testing Library:

```bash
cd frontend
pnpm test
# o para una sola ejecución:
npx ng test --no-watch
```

**Cobertura de pruebas:**
- `IncomeService`: Estado reactivo inicial en cero, adición de abonos, desglose por fuente y eliminación.
- `IngresosComponent`: Creación, filtros dinámicos en tiempo real, apertura de modal y validaciones.
- `DashboardComponent`: Renderizado, cambio de períodos y sincronización reactiva en tiempo real con los ingresos.
- `App`: Montaje e inicialización de la raíz.

---

## Historial de Incrementos

- **Incremento 1 — Autenticación e Identidad**:
  - API REST de login con JWT, hashing Bcrypt, validación de esquemas y PostgreSQL.
  - Interceptor HTTP funcional para adjuntar token Bearer.
  - Modal de sesión expirada y servicio de tracking de inactividad (`IdleService`).
- **Incremento 2 — Google OAuth 2.0 & Identidad GIS**:
  - Integración del SDK oficial de Google Identity Services.
  - Extracción de nombre, correo y URL de avatar para visualización en encabezados y sidebar.
- **Incremento 3 — Módulo de Ingresos Reactivo & Sincronización**:
  - Servicio centralizado `IncomeService` con línea base en cero ($Q 0.00$).
  - Histograma dinámico de captación semanal y tarjetas por fuente.
  - CRUD reactivo de ingresos con filtros en tiempo real y modal.
  - Sincronización bidireccional inmediata con el Dashboard.
- **Incremento 4 — Estandarización de Redacción Formal ("Usted")**:
  - Homologación de todos los mensajes, textos, alertas y modales al tratamiento formal de "usted".

---

## Estrategia de Ramas en Git

El desarrollo del proyecto se rige por el flujo en cascada:

$$\text{hlima-2021464 (Desarrollo activo)} \longrightarrow \text{develop (Integración)} \longrightarrow \text{main (Producción)}$$

---

## Licencia

Este proyecto es privado y para fines académicos y de administración financiera personal. Todos los derechos reservados.
