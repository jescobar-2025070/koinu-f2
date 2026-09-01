# Koinu Finance

Plataforma web de **gestión de finanzas personales por periodos**.

## Información general

- **Nombre del proyecto:** Koinu Finance.
- **Descripción:** Aplicación web que permite a un usuario registrar, organizar y analizar sus ingresos, gastos, presupuestos, redistribuciones, excedentes y objetivos financieros dentro de periodos definidos por él mismo. Incluye un módulo administrativo para gestionar usuarios y configuración técnica.
- **Objetivo:** Desarrollar un MVP funcional, testeable, mantenible y auditable. La administración está estrictamente separada de la información financiera personal (el `ADMIN` no puede consultar las finanzas de los usuarios).
- **Problema que resuelve:** Permitir que una persona administre manualmente sus finanzas personales, obtenga información organizada y reciba recomendaciones básicas, sin realizar operaciones financieras externas.
- **Estado actual del desarrollo:** Etapa 3 completa.
- **Alcance actual:** Autenticación completa, módulos de negocio (períodos con estados y activación, movimientos con tratamiento fiscal, objetivos categorías separadas por usuario), dashboard con estadísticas, frontend integrado con backend en tiempo real, diseño glassmorphism con SVG decorativos.

## Tecnologías

| Área | Tecnología |
| --- | --- |
| Frontend | Angular 22, TypeScript 6, pnpm |
| Backend | Node.js 22, TypeScript 6, Express 4, pnpm |
| Base de datos | PostgreSQL 18 |
| Acceso a base de datos | `pg` (node-postgres) con patrón Repository y migraciones SQL versionadas |
| Hashing de contraseñas | `bcryptjs` |
| Autenticación | JWT (`jsonwebtoken`) transportado en cookie HttpOnly |
| Validaciones | Validadores propios en el backend (carpeta `validators/`) |
| Seguridad HTTP | `helmet`, `cors` (con credenciales) |
| Pruebas backend | `node:test`, `supertest`, `tsx` |
| Pruebas frontend | `vitest` (configurado por Angular CLI) |
| Control de versiones | Git |

## Arquitectura

### Arquitectura general (cliente-servidor)

```text
┌──────────────────────┐
│      Angular         │
│      Frontend        │
└──────────┬───────────┘
           │
           │ HTTP/REST + cookie
           ▼
┌──────────────────────┐
│       Node.js        │
│      TypeScript      │
│       REST API       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

### Backend

Separación por responsabilidades:

```text
Controller → Service → Repository → PostgreSQL
```

Con middleware de:
- **Authentication:** verifica el JWT de la cookie HttpOnly (o `Authorization: Bearer`), carga el usuario de base de datos y adjunta `req.user`.
- **Authorization:** restringe endpoints por rol (`requireRole`).
- **Validation:** valida el cuerpo de la petición antes de llegar al controller.
- **Error Handling:** responde en el formato de error estándar y nunca expone stack traces.

### Frontend

- **Core:** servicios de API, servicio de autenticación (estado con signals), guards, interceptors y modelos.
- **Features:** módulos funcionales (auth, dashboard, periods, movements, objectives, admin). Las rutas se cargan con *lazy loading*.
- **Diseño:** Glassmorphism con gradientes, tubos SVG decorativos, sidebar dinámica, topbar tipo pill.

### Autenticación

- El login genera un JWT firmado con `JWT_SECRET`, que incluye `sub` (id de usuario), `email` y `roles`.
- El JWT se envía en una cookie `HttpOnly` (`SameSite=Lax`). En producción la cookie es `Secure` (requiere HTTPS).
- El frontend **no** almacena el token: al iniciar restaura la sesión consultando `GET /auth/me` y las peticiones envían la cookie automáticamente (`withCredentials: true`).
- Tras login exitoso, se redirige automáticamente al dashboard.

### Autorización por roles

- Roles definidos: `ADMIN` y `USR` (tabla `roles`, sembrados por migración).
- Todo usuario registrado públicamente recibe el rol `USR`; nunca puede elegir `ADMIN`.
- La autorización se valida siempre en el backend; la protección de rutas del frontend no es una medida de seguridad.

## Estructura del proyecto

```text
finanzas/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (env, base de datos, transacciones)
│   │   ├── controllers/     # Capa HTTP (auth, roles, periodos, movimientos, objetivos)
│   │   ├── dto/
│   │   │   ├── requests/    # Contratos de entrada (auth)
│   │   │   └── responses/   # Contratos de salida (auth, roles)
│   │   ├── entities/        # Modelos de dominio (usuario, rol, periodo, movimiento, objetivo, categoría, impuesto)
│   │   ├── errors/          # AppError y catálogo de códigos de error
│   │   ├── middleware/      # authenticate, authorize, validate, error-handler
│   │   ├── repositories/    # Persistencia exclusivamente
│   │   ├── routes/          # Definición de rutas REST
│   │   ├── services/        # Lógica de negocio (auth, users, roles, periodos, movimientos, objetivos)
│   │   ├── validators/      # Validadores de entrada
│   │   ├── mappers/         # Conversión entidad → DTO de salida
│   │   ├── utils/           # JWT, hashing de contraseñas, cookies, migraciones
│   │   ├── types/           # Extensiones de tipos (Express Request.user)
│   │   ├── app.ts           # Construcción de la aplicación Express
│   │   └── server.ts        # Punto de entrada del servidor
│   ├── migrations/          # Migraciones SQL versionadas
│   ├── scripts/             # migrate.ts, seed.ts, seed-full.ts
│   ├── tests/               # Pruebas de la Etapa 1 (23 casos)
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css       # Design system global
│       └── app/
│           ├── core/
│           │   ├── auth/          # AuthService, modelos, estado con signals
│           │   ├── config/        # environment.ts (apiUrl)
│           │   ├── guards/        # authGuard, adminGuard
│           │   ├── interceptors/  # credentials, auth-error
│           │   ├── models/        # api.models.ts (interfaces TypeScript)
│           │   └── services/      # ApiService, PeriodoService, MovimientoService,
│           │                      # ObjetivoService, CategoriaService, SidebarService
│           ├── features/
│           │   ├── auth/          # páginas login y register
│           │   ├── dashboard/     # dashboard + sub-páginas (movimientos, ingresos, gastos, informes)
│           │   ├── periods/       # overview, new, edit, finalize, history
│           │   ├── movements/     # income, expenses, history-income, history-expenses
│           │   ├── objectives/    # página principal (placeholder)
│           │   └── admin/         # panel admin (solo ADMIN)
│           ├── app.routes.ts      # Todas las rutas con lazy loading
│           ├── app.config.ts      # Bootstrap con providers
│           ├── app.ts             # Componente raíz
│           ├── app.html           # Shell: topbar, sidebar, main, footer, SVGs
│           └── app.css            # Layout: grid, sidebar, main panel
├── README.md
├── ERRORES_Y_SOLUCIONES.md
├── Desarrollo.md
├── ANÁLISIS_DEL_SISTEMA.txt
├── DISEÑO_DEL_SISTEMA.txt
└── .gitignore
```

## Instalación

### Requisitos previos

- Node.js ≥ 22
- pnpm ≥ 11 (gestor de paquetes)
- PostgreSQL ≥ 14 (probado con 18)
- Git

### 1. Obtención del proyecto

```bash
git clone <url-del-repositorio>
cd finanzas
```

### 2. Backend

```bash
cd backend
pnpm install
```

Configuración de variables de entorno:

```bash
cp .env.example .env
# Edita .env con los valores reales (base de datos, secreto JWT, etc.)
```

Configuración de la base de datos (desde PostgreSQL):

```sql
CREATE DATABASE finanzas_dev;
CREATE DATABASE finanzas_test;   -- solo necesaria para pruebas
```

Ejecución de migraciones:

```bash
pnpm migrate
```

Creación de datos de prueba (usuarios, categorías, períodos, movimientos, objetivos):

```bash
pnpm seed:full
```

Inicio del backend:

```bash
pnpm dev        # modo desarrollo con recarga automática
pnpm build      # compilación a dist/
pnpm start      # ejecuta el build compilado
```

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm start      # servidor de desarrollo en http://localhost:4200
```

> El frontend apunta al backend en `http://localhost:3000/api/v1` (configurable en `src/app/core/config/environment.ts`).

### 4. Pruebas

```bash
# Backend (requiere la base finanzas_test creada y .env.test configurado)
cd backend
cp .env.test.example .env.test   # ajusta la cadena de conexión
pnpm test
```

### 5. Credenciales de prueba

Tras ejecutar `pnpm seed:full`:

| Usuario | Email | Contraseña | Rol |
| --- | --- | --- | --- |
| Usuario de prueba | `test@koinu.local` | `Test1234` | USR |
| Administrador | `admin@finanzas.local` | `AdminLocal123` | ADMIN |

## Variables de entorno

### Backend (`.env`)

| Variable | Propósito | Ejemplo | Obligatoria |
| --- | --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución (`development`, `test`, `production`) | `development` | Sí |
| `PORT` | Puerto HTTP del backend | `3000` | No (default `3000`) |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://usuario:pass@localhost:5432/finanzas_dev` | Sí |
| `JWT_SECRET` | Secreto para firmar los JWT | `valor-largo-y-aleatorio` | Sí |
| `JWT_EXPIRES_IN` | Duración del token (formato `jsonwebtoken`) | `1h` | No |
| `COOKIE_NAME` | Nombre de la cookie HttpOnly | `finanzas_auth` | No |
| `COOKIE_SECURE` | Cookie `Secure` (true solo en HTTPS) | `false` | No |
| `CORS_ORIGIN` | Orígenes permitidos (separados por coma) | `http://localhost:4200` | No |
| `BCRYPT_ROUNDS` | Coste del hash de contraseñas | `12` | No |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del admin para el seed | `admin@finanzas.local` / `AdminLocal123` | Solo para seed |

**Nunca coloques secretos reales en `.env.example` ni en el repositorio.** El archivo `.env` está en `.gitignore`.

### Frontend

- `src/app/core/config/environment.ts` → `apiUrl` (URL base de la API). Por defecto `http://localhost:3000/api/v1`.

## Funcionalidades

### Etapa 1 (completada)

- [x] Estructura del sistema (`/backend` + `/frontend`).
- [x] Registro de usuarios (público, rol `USR`).
- [x] Inicio de sesión (JWT en cookie HttpOnly).
- [x] Cierre de sesión.
- [x] Autenticación JWT (generación, firma, expiración y validación).
- [x] Autorización por roles (`USR`/`ADMIN`).
- [x] Protección de endpoints (backend).
- [x] Protección de rutas frontend (guards).
- [x] Validaciones en backend y frontend.
- [x] Manejo de errores centralizado.
- [x] Pruebas backend (23 casos).
- [x] Documentación (README.md, ERRORES_Y_SOLUCIONES.md).

### Etapa 2 (completada)

- [x] Módulo de períodos: CRUD, listar, finalizar.
- [x] Módulo de movimientos: crear ingresos/gastos, eliminar, estadísticas.
- [x] Módulo de objetivos: CRUD, depósitos, retiros.
- [x] Categorías de movimientos (ingreso/gasto).
- [x] Dashboard con estadísticas (ingresos totales, gastos totales, disponible, progreso de objetivo).
- [x] Frontend completamente reescrito al diseño de referencia (glassmorphism, gradientes, SVGs decorativos).
- [x] Sidebar dinámica (cambia contenido según la página).
- [x] Topbar tipo pill con navegación.
- [x] Integración frontend-backend en tiempo real (todas las páginas consumen API real).
- [x] Seed completo de datos de prueba (períodos, movimientos, objetivos, categorías).

### Etapa 3 (completada)

- [x] Períodos con ciclo de vida: `DRAFT` → `ACTIVE` → `FINISHED` (o `CANCELLED`), activación/finalización/cancelación y máximo un `ACTIVE` por usuario.
- [x] Ingresos con tratamiento fiscal: bruto/retención/neto calculado en el backend (`detalles_ingreso`).
- [x] Categorías de ingreso y gasto separadas por usuario (predeterminadas globales + personalizadas).
- [x] Dashboard por período que suma ingreso neto y calcula disponible.
- [x] Backend realineado al diseño de la Etapa 3 (reset de base de datos, nuevas migraciones 005-011).
- [x] Pruebas backend de Etapa 3 (períodos/estados, categorías por usuario, tratamiento fiscal, dashboard).

### Pendiente

- [ ] Administración de usuarios desde el panel ADMIN (CRUD).
- [ ] Endpoints de forgot/reset password.
- [ ] Autenticación de refresh tokens.
- [ ] Página de objetivos funcional (actualmente es placeholder).
- [ ] Página de informes del dashboard.
- [ ] Pruebas frontend.

## API

Base: `http://localhost:3000/api/v1`

### Autenticación

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Registrar usuario (rol `USR`) |
| `POST` | `/auth/login` | No | Iniciar sesión (cookie HttpOnly) |
| `POST` | `/auth/logout` | Sí | Cerrar sesión |
| `GET` | `/auth/me` | Sí | Obtener sesión actual |

### Roles

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/roles` | ADMIN | Listar roles |

### Períodos

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/periods` | Sí | Listar períodos del usuario |
| `GET` | `/periods/:id` | Sí | Obtener un período por id |
| `POST` | `/periods` | Sí | Crear período (`name`, `startDate`, `endDate`) |
| `PUT` | `/periods/:id` | Sí | Modificar período |
| `POST` | `/periods/:id/activate` | Sí | Activar período (DRAFT → ACTIVE) |
| `POST` | `/periods/:id/finalize` | Sí | Finalizar período (ACTIVE → FINISHED) |
| `POST` | `/periods/:id/cancel` | Sí | Cancelar período (→ CANCELLED) |
| `GET` | `/periods/:id/dashboard` | Sí | Dashboard del período |

> Estados de período: `DRAFT` → `ACTIVE` → `FINISHED` (o `CANCELLED`). Solo se puede registrar movimientos en un período `ACTIVE`, y existe máximo un `ACTIVE` por usuario.

### Movimientos

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/movements` | Sí | Listar movimientos (`?periodId=`) |
| `POST` | `/movements` | Sí | Crear movimiento (ingreso con bruto/retención o gasto) |
| `DELETE` | `/movements/:id` | Sí | Eliminar movimiento |
| `GET` | `/movements/stats` | Sí | Estadísticas (`?periodId=`) |

### Objetivos

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/objectives` | Sí | Listar objetivos |
| `POST` | `/objectives` | Sí | Crear objetivo |
| `PUT` | `/objectives/:id` | Sí | Modificar objetivo |
| `DELETE` | `/objectives/:id` | Sí | Eliminar objetivo |
| `POST` | `/objectives/:id/deposit` | Sí | Depositar en objetivo |
| `POST` | `/objectives/:id/withdraw` | Sí | Retirar de objetivo |

### Categorías

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/categories/income` | Sí | Listar categorías de ingreso del usuario |
| `POST` | `/categories/income` | Sí | Crear categoría de ingreso |
| `GET` | `/categories/expense` | Sí | Listar categorías de gasto del usuario |
| `POST` | `/categories/expense` | Sí | Crear categoría de gasto |

### Health Check

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Estado del servidor |

### Formato estándar de error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos.",
    "details": { "errors": { "email": "..." } }
  }
}
```

### Ejemplo de request de registro

```json
POST /api/v1/auth/register
{ "email": "usuario@correo.com", "password": "Contrasena123" }
```

### Ejemplo de request de login

```json
POST /api/v1/auth/login
{ "email": "usuario@correo.com", "password": "Contrasena123" }
```

Respuesta 200 incluye `Set-Cookie: finanzas_auth=...; HttpOnly; SameSite=Lax`.

### Ejemplo de request de crear movimiento (ingreso)

```json
POST /api/v1/movements
{
  "periodId": "uuid-del-periodo",
  "type": "INCOME",
  "incomeCategoryId": "uuid-de-categoria",
  "grossAmount": 2500.00,
  "retentionAmount": 125.00,
  "description": "Pago por desarrollo de software",
  "date": "2026-08-25"
}
```

El backend calcula el monto neto (`net = gross - retention`) y lo guarda en `movimientos.amount`. Para un gasto se usa `type: "EXPENSE"`, `expenseCategoryId` y `amount`.

## Pruebas

### Backend

- **Framework:** `node:test` + `supertest` + `tsx`, contra una base de datos `finanzas_test`.
- **Ejecución:**
  ```bash
  cd backend
  cp .env.test.example .env.test
  pnpm test
  ```
- **Cobertura (36 casos):**

| Área | Escenarios |
| --- | --- |
| Registro | registro exitoso (rol USR), correo inválido, contraseña corta, contraseña sin letra/número, campos faltantes, correo duplicado, normalización de espacios |
| Login | login exitoso con cookie HttpOnly, credenciales incorrectas, correo inexistente, datos inválidos, cuenta desactivada, generación del JWT verificada vía `/auth/me`, logout |
| Autenticación | `/auth/me` con token válido, sin token, token inválido, token expirado, token con otro secreto |
| Roles | ADMIN puede listar roles, USR recibe 403, sin token 401, registro no permite asignar ADMIN |
| Períodos y estados | creación en DRAFT, fecha de inicio > fin rechazada, activación y límite de un ACTIVE, finalización a FINISHED, acceso denegado a período ajeno |
| Categorías por usuario | siembra de predeterminadas al registrar, listado por usuario autenticado |
| Tratamiento fiscal | ingreso con cálculo de neto, retención > bruto rechazada, fecha fuera de período, movimiento en período no activo |
| Dashboard | totales basados en ingreso neto y disponible, requiere autenticación |

### Frontend

- `vitest` configurado por Angular CLI. `pnpm test` en `frontend/`.
- Estado actual: sin casos adicionales (los flujos críticos se prueban en el backend).

## Seguridad

- Contraseñas con hash seguro (`bcrypt`, coste configurable).
- JWT firmado con secreto mediante variables de entorno; expiración configurable.
- Cookie `HttpOnly` (el JavaScript del cliente no puede leer el token); `Secure` en producción.
- El frontend nunca confía en el cliente para autorización: el backend valida el rol y la propiedad de los recursos.
- Validación de entradas en el backend (el frontend vuelve a validar, pero el backend es la autoridad).
- CORS configurado con orígenes explícitos y `credentials: true`.
- Manejo seguro de errores: sin stack traces ni información interna hacia el cliente.
- Los datos financieros del `ADMIN` están aislados: el ADMIN no tiene endpoints para consultar finanzas de usuarios.
- El registro público asigna siempre `USR`; nunca permite `ADMIN`.

## Sistema de diseño visual

### Paleta de colores

| Variable CSS | Valor | Uso |
| --- | --- | --- |
| `--bg-top` | `#6fa3d3` | Inicio del gradiente de fondo |
| `--bg-mid` | `#17324f` | Mitad del gradiente |
| `--bg-bottom` | `#050a0f` | Final del gradiente |
| `--cyan` | `#00e5ff` | Texto de enlaces, valores destacados |
| `--green` | `#00ff88` | Valores positivos (ingresos, disponible) |
| `--purple` | `#b28cff` | Barras de ingresos en gráficos |
| `--blue-bar` | `#4c86f0` | Barras de gastos en gráficos |
| `--amber` | `#ffab5c` | Valores de objetivo |
| `--text-dim` | `rgba(255,255,255,0.55)` | Texto secundario |

### Estilo Glassmorphism

- **Gradiente de fondo:** `#6fa3d3` → `#17324f` → `#050a0f` en el body.
- **Paneles glass:** fondo semi-transparente, borde sutil, backdrop-blur.
- **Inputs tipo pill:** border-radius 9999px, sombras internas, gradientes sutiles.
- **Sidebar:** panel glass fijo a la izquierda (250px).
- **Topbar:** barra pill con glass, logo KOINU, nav links, botón cerrar sesión.
- **Footer:** copyright a la izquierda, pill legal a la derecha.
- **SVGs decorativos:** tubos y círculos flotantes con gradientes lineales.

### Layout de la aplicación

```text
┌─────────────────────────────────────────────────┐
│  [KOINU]  INICIO  PERÍODOS  MOVIMIENTOS  [SALIR] │  ← Topbar pill
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │         Main Panel                   │
│ (250px)  │         (glass)                      │
│          │                                      │
│ Título   │   <router-outlet />                  │
│ Nav items│                                      │
│ Perfil   │                                      │
│          │                                      │
├──────────┴──────────────────────────────────────┤
│  © 2026 Koinu Finance    [Privacidad Términos]  │  ← Footer
└─────────────────────────────────────────────────┘
```

### Páginas principales

| Ruta | Página | Descripción |
| --- | --- | --- |
| `/login` | Login | Formulario glass con SVG decorativo |
| `/register` | Registro | Formulario glass con SVG decorativo |
| `/dashboard` | Dashboard | 2x2 grid: presupuesto total, disponible, progreso objetivo, fin período |
| `/dashboard/movements` | Últimos movimientos | Tabla con ingresos y gastos recientes |
| `/dashboard/income` | Últimos ingresos | Tabla filtrada de ingresos |
| `/dashboard/expenses` | Últimos gastos | Tabla filtrada de gastos |
| `/periods` | Períodos | Stats + gráfico de barras |
| `/periods/new` | Nuevo período | Formulario (año, mes) |
| `/periods/edit` | Modificar período | Formulario editable del período abierto |
| `/periods/finalize` | Finalizar período | Resumen readonly + botón finalizar |
| `/periods/history` | Historial | Tabla de todos los períodos |
| `/movements` | Nuevo ingreso | Formulario con cálculo de retención |
| `/movements/expenses` | Nuevo gasto | Formulario con selección de categoría |
| `/movements/history/income` | Historial ingresos | Tabla con botón editar |
| `/movements/history/expenses` | Historial gastos | Tabla con botón eliminar |
| `/objectives` | Objetivos | Placeholder (en desarrollo) |

## Modelos de datos

### Periodo

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `userId` | UUID | Dueño del período |
| `name` | string | Nombre del período |
| `startDate` | Date | Fecha de inicio |
| `endDate` | Date | Fecha de fin |
| `status` | `'DRAFT'` \| `'ACTIVE'` \| `'CANCELLED'` \| `'FINISHED'` | Estado del período |
| `createdAt` | Date | Fecha de creación |
| `updatedAt` | Date | Última modificación |

### Movimiento

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `userId` | UUID | Dueño del movimiento |
| `periodoId` | UUID | Período asociado |
| `type` | `'INCOME'` \| `'EXPENSE'` | Tipo de movimiento |
| `incomeCategoryId` | UUID \| null | Categoría de ingreso (si `type=INCOME`) |
| `expenseCategoryId` | UUID \| null | Categoría de gasto (si `type=EXPENSE`) |
| `amount` | number | Monto neto en Quetzales (ingresos) o total (gastos) |
| `description` | string \| null | Descripción opcional |
| `date` | Date | Fecha del movimiento |

> Para ingresos, el monto bruto, retención y neto se guardan en la tabla `detalles_ingreso`.

### Categoría

Las categorías de ingreso y gasto son separadas por usuario (con predeterminadas globales).

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `userId` | UUID \| null | Dueño; `null` = predeterminada global |
| `name` | string | Nombre de la categoría |
| `isDefault` | boolean | `true` si es una predeterminada del sistema |
| `isActive` | boolean | `true` si está activa |

### Objetivo

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | Identificador único |
| `userId` | UUID | Dueño del objetivo |
| `name` | string | Nombre del objetivo |
| `targetAmount` | number | Monto objetivo |
| `currentAmount` | number | Monto actual ahorrado |
| `deadline` | Date \| null | Fecha límite opcional |

## Estado del proyecto

```text
Etapa 1: COMPLETADA
- Estructura del sistema (backend + frontend).
- Registro, login y logout.
- Autenticación JWT en cookie HttpOnly.
- Roles USR/ADMIN y autorización por rol.
- Protección de endpoints y rutas.
- Validaciones y manejo de errores.
- Migraciones, seed de roles y administrador.
- Pruebas backend (23 casos).
- Documentación.

Etapa 2: COMPLETADA
- Módulo de períodos: CRUD + finalizar.
- Módulo de movimientos: crear + eliminar + estadísticas.
- Módulo de objetivos: CRUD + depósitos + retiros.
- Categorías de movimientos.
- Dashboard con estadísticas en tiempo real.
- Frontend reescrito: glassmorphism, gradientes, SVGs decorativos.
- Sidebar dinámica, topbar pill, footer.
- Integración frontend-backend completa.
- Seed completo de datos de prueba.

Etapa 3: COMPLETADA
- Períodos con ciclo de vida (DRAFT → ACTIVE → FINISHED/CANCELLED) y máximo un ACTIVE por usuario.
- Ingresos con tratamiento fiscal (bruto/retención/neto calculado en backend).
- Categorías de ingreso y gasto separadas por usuario.
- Dashboard por período (ingreso neto + disponible).
- Backend realineado al diseño (reset de BD, migraciones 005-011).
- Pruebas de Etapa 3 (períodos/estados, categorías, tratamiento fiscal, dashboard).

Pendiente:
- Página funcional de objetivos (actualmente placeholder).
- Página de informes del dashboard.
- Administración de usuarios desde panel ADMIN.
- Endpoints de forgot/reset password.
- Autenticación de refresh tokens.
- Pruebas frontend.
```
