# Finanzas Backend

API REST del sistema de gestión de finanzas personales (Etapa 1 a Fase 3).

## Stack

- Node.js 22 · TypeScript · Express 4
- PostgreSQL (driver `pg`) con migraciones SQL versionadas
- JWT en cookie HttpOnly + refresh tokens rotativos · bcryptjs · helmet · cors

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga automática (`tsx watch`) |
| `pnpm build` | Compilación TypeScript a `dist/` |
| `pnpm start` | Ejecuta el build compilado |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm migrate` | Aplica las migraciones pendientes (001-017) |
| `pnpm seed` | Crea el administrador inicial (usa `ADMIN_EMAIL`/`ADMIN_PASSWORD`) |
| `pnpm seed:full` | Crea datos de prueba completos |
| `pnpm test` | Ejecuta la suite de pruebas (36 casos) contra `finanzas_test` |

## Configuración

Copia `.env.example` a `.env` y ajusta los valores (ver `README.md` raíz para el detalle de cada variable).

## Estructura

```text
src/
├── config/         # env, base de datos, transacciones
├── controllers/    # capa HTTP
├── dto/            # contratos request/response
├── entities/       # modelos de dominio
├── errors/         # AppError + catálogo de códigos
├── middleware/     # authenticate, authorize, validate, error-handler
├── repositories/   # persistencia
├── routes/         # rutas REST (incluye budget, report, user, system)
├── services/       # lógica de negocio (incluye budgets, reports)
├── validators/     # validación de entrada
├── mappers/        # entidad → DTO
├── utils/          # jwt, passwords, cookies, tokens, migraciones
├── types/          # extensiones de tipos
├── app.ts
└── server.ts
```

> **Presupuesto:** el total del presupuesto de un período **se calcula automáticamente** con los ingresos
> netos del período (`GET /periods/:periodId/budget` lo auto-crea y devuelve `totalAmount` = `totalIngresos`
> en vivo). No existen endpoints para editar el total; solo se asignan porciones del presupuesto a categorías
> de gasto (los excedentes se registran cuando los gastos superan los ingresos netos).
