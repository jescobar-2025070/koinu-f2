# Finanzas Backend

API REST del sistema de gestión de finanzas personales (Etapa 1: autenticación).

## Stack

- Node.js 22 · TypeScript · Express 4
- PostgreSQL (driver `pg`) con migraciones SQL versionadas
- JWT en cookie HttpOnly · bcryptjs · helmet · cors

## Scripts

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con recarga automática (`tsx watch`) |
| `pnpm build` | Compilación TypeScript a `dist/` |
| `pnpm start` | Ejecuta el build compilado |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm migrate` | Aplica las migraciones pendientes |
| `pnpm seed` | Crea el administrador inicial (usa `ADMIN_EMAIL`/`ADMIN_PASSWORD`) |
| `pnpm test` | Ejecuta la suite de pruebas contra `finanzas_test` |

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
├── routes/         # rutas REST
├── services/       # lógica de negocio
├── validators/     # validación de entrada
├── mappers/        # entidad → DTO
├── utils/          # jwt, passwords, cookies, migraciones
├── types/          # extensiones de tipos
├── app.ts
└── server.ts
```
