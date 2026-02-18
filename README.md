# Credit Source

MVP de solicitudes de crédito multi-país con backend en NestJS, frontend en Next.js, PostgreSQL, Redis, procesamiento asíncrono y actualizaciones en tiempo casi real.

> Este repositorio no tiene fin de ser utilizado en producción, por esto hay decisiones de diseño y seguridad que se han simplificado o dejado como ejercicio para el futuro. El objetivo principal es demostrar la capacidad de diseñar e implementar una solución completa que cumpla con los requisitos del reto técnico, mostrando buenas prácticas y patrones de diseño.

## 1) Alcance implementado

Países implementados en la lógica principal:
- México (`MX`)
- Colombia (`CO`)
- España (`ES`)

Capacidades principales:
- Crear solicitud de crédito
- Validar reglas por país (Strategy)
- Integrar proveedor bancario por país (Factory)
- Consultar detalle por ID
- Listar solicitudes con filtros
- Actualizar estado de solicitud
- Procesamiento asíncrono con BullMQ + Redis
- Flujo evento DB (`pg_notify`) → listener → encolamiento
- WebSocket para actualizaciones en tiempo real
- Autenticación JWT y autorización básica por rol
- Capa de caché para consultas frecuentes

## 2) Stack

- Backend: NestJS + TypeORM
- Frontend: Next.js (App Router) + React Query + Socket.IO client
- Base de datos: PostgreSQL 15
- Cola y caché: Redis + BullMQ
- Realtime: Socket.IO
- Auth: JWT (Passport)
- Orquestación local: Docker Compose + Makefile

## 3) Arquitectura (resumen)

### Backend

- `credit-applications`: orquestación de casos de uso
- `country-rules`: validaciones por país usando `Map<Country, ICountryRule>`
- `bank-providers`: integración por país usando `Map<Country, IBankProvider>`
- `database/listeners`: listener de `pg_notify` para disparar jobs
- `queue`: colas y workers (riesgo, auditoría, notificación)
- `realtime`: gateway WebSocket
- `webhooks`: endpoint para recibir eventos externos
- `auth`: registro/login JWT + roles (`USER`, `ADMIN`)
- `redis`: caché e invalidación por patrón

### Frontend

- Autenticación (`/auth/login`, `/auth/register`)
- Solicitudes:
  - listado con filtros (`/applications`)
  - creación (`/applications/new`)
  - detalle y actualización de estado (`/applications/:id`)
- Suscripción WebSocket para refresco automático de UI

## 4) Modelo de datos

Entidad principal: `credit_applications`

Campos relevantes:
- `country`, `fullName`, `documentType`, `documentNumber`
- `amountRequested`, `monthlyIncome`
- `status` (`DRAFT`, `PENDING_VALIDATION`, `VALIDATING`, `APPROVED`, `REJECTED`, `REVIEW_REQUIRED`)
- `countryValidation` (JSONB)
- `bankProviderData` (JSONB)
- `riskScore`, `rejectionReason`
- `createdAt`, `updatedAt`, `createdBy`

PII:
- `documentNumber` no se expone por defecto (`select: false`)
- Se cifra mediante hooks de entidad + `EncryptionService`

Índices implementados:
- `(country, status)`
- `(status)`
- `(createdAt)`

## 5) Reglas por país implementadas

- **MX**: validación CURP + regla de ratio monto/ingreso y límites
- **CO**: validación CC + reglas de ratio monto/ingreso y señales de riesgo
- **ES**: validación DNI/NIE (incluye letra de control) + ratio monto/ingreso

## 6) Flujo de estados y negocio

1. `POST /api/credit-applications`
   - Ejecuta validación por país
   - Asigna estado inicial (`REJECTED`, `REVIEW_REQUIRED`, `PENDING_VALIDATION`)
2. `PATCH /api/credit-applications/:id/status` con `VALIDATING`
   - Consulta proveedor bancario según país
   - Calcula `riskScore`
   - Decide estado final (`APPROVED`, `REJECTED`, `REVIEW_REQUIRED`)
3. Cambios de estado
   - Emisión WebSocket para UI
   - Trigger PostgreSQL + `pg_notify`
   - Listener en backend encola trabajos asíncronos

## 7) Asíncrono, colas y concurrencia

Tecnología usada: **BullMQ + Redis**.

Colas implementadas:
- `risk-evaluation`
- `audit`
- `notification`

Producción/consumo:
- El listener de PostgreSQL (`LISTEN application_changes`) recibe eventos de trigger.
- Encola jobs de auditoría y, para estados finales, notificación.
- Workers de BullMQ procesan los jobs de forma asíncrona.

Estrategia de concurrencia/escala:
- BullMQ permite múltiples workers/instancias consumidoras.
- El diseño desacopla API de procesamiento pesado para no bloquear requests.
- En despliegue horizontal, pueden escalarse procesos backend/workers según carga.

## 8) Webhooks

Implementado:
- Endpoint receptor en backend: `POST /api/webhooks/bank-decision`
- Servidor externo simulado en `mock-webhook-server` para pruebas de integración

Nota:
- Actualmente está implementado el flujo de recepción y logging del webhook.

## 9) Realtime en frontend

Eventos WebSocket emitidos por backend:
- `credit-application.created`
- `credit-application.status-changed`

El frontend escucha estos eventos, muestra feedback y refresca queries para mantener lista/detalle sincronizados en casi tiempo real.

## 10) Seguridad

- JWT para autenticación (`/api/auth/register`, `/api/auth/login`)
- Guard global por endpoint en solicitudes de crédito (requiere token)
- Autorización por rol:
  - `ADMIN` puede cambiar estado
  - `USER` solo opera sobre sus propias solicitudes (detalle/eliminación)
- Manejo de PII con cifrado y campos excluidos por defecto

## 11) Caché

Qué se cachea:
- Listado de solicitudes (`findAll`)
- Detalle de solicitud (`findOne`)

Estrategia:
- TTL simple de 300 segundos
- Invalidación por clave y por patrón al crear/actualizar/eliminar

## 12) Ejecución rápida (Docker)

Prerequisitos:
- Docker + Docker Compose
- Make

Pasos:

```bash
cp .env.example .env
make up
```

Servicios:
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- Mock webhook: http://localhost:4000(No implementado)
- Redis Commander (opcional): `make redis-commander` → http://localhost:8081

Comandos útiles:

```bash
make logs-backend
make restart-backend
make shell-backend
make shell-db
make down
```

Ver archivo `Makefile` para más detalles.

## 13) Uso básico de API

Se adjunta un archivo para importar en POSTMAN con ejemplos de requests para autenticación, creación de solicitudes, actualización de estado y consultas con filtros.

```
Credit Source Project.postman_collection
```

### 13.1 Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin-demo",
    "password":"admin12345",
    "role":"ADMIN"
  }'
```

### 13.2 Login y token


```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin-demo","password":"admin12345"}' | jq -r '.access_token')
```

### 13.3 Crear solicitud

```bash
curl -X POST http://localhost:3000/api/credit-applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "country":"MX",
    "fullName":"Juan Pérez",
    "documentType":"CURP",
    "documentNumber":"PELJ000101HDFRRS09",
    "amountRequested":40000,
    "monthlyIncome":5000
  }'
```

### 13.4 Listar solicitudes (filtros)

```bash
curl "http://localhost:3000/api/credit-applications?country=MX&status=PENDING_VALIDATION" \
  -H "Authorization: Bearer $TOKEN"
```

### 13.5 Actualizar estado

```bash
curl -X PATCH http://localhost:3000/api/credit-applications/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"VALIDATING"}'
```

## 14) Variables de entorno relevantes

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`
- `REDIS_PORT`
- `BACKEND_PORT`, `NODE_ENV`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`
- `ENCRYPTION_KEY`

Ver ejemplo completo en `.env.example`.

## 15) Cobertura frente al reto técnico

Estado general:

- ✅ CRUD de solicitudes + filtros por país/estado
- ✅ Reglas por país (3 países implementados)
- ✅ Proveedor bancario por país (factory)
- ✅ Estados y transición con lógica de negocio
- ✅ Procesamiento asíncrono con colas
- ✅ Trigger PostgreSQL + `pg_notify` + listener
- ✅ Realtime frontend-backend con WebSocket
- ✅ JWT + autorización básica
- ✅ Caché con invalidación
- ✅ Makefile operativo para tareas frecuentes
- ⚠️ Kubernetes: carpeta `k8s/` existe pero aún sin manifiestos

## 16) Escalabilidad (análisis resumido)

Para escalar a millones de solicitudes:

- Mantener/optimizar índices existentes y agregar según queries reales.
- Evaluar particionamiento por rango temporal (`createdAt`) para tablas de alto volumen.
- Mantener payloads voluminosos en JSONB solo cuando aporten trazabilidad; considerar extraer agregados críticos a columnas indexables.
- Evitar cuellos en listados con paginación por cursor en escenarios de gran volumen.
- Separar workers en despliegue dedicado para escalar procesamiento asíncrono independientemente del API.
- Definir política de archivado histórico por antigüedad/estado hacia almacenamiento frío.

## 18) Recomendaciones de ejecución

Hay dos usuarios configurados por defecto desde el seed:
- admin / admin (rol ADMIN)
- user / user (rol USER)

Una prueba posible es abrir dos navegadores/incógnito, loguearse con ambos usuarios y crear solicitudes para observar el flujo de estados y actualizaciones en tiempo real.