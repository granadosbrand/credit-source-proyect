# Credit Source - Multi-Country Loan Application System

MVP de un sistema de solicitudes de crédito multi-país con arquitectura modular, procesamiento asíncrono y real-time updates.

## 🚀 Status 

### Fase 1 ✅ Completada
- Docker Compose con todos los servicios
- NestJS backend scaffolded
- Next.js 14 frontend con shadcn/ui
- Makefile con comandos útiles
- Mock webhook server

### Fase 2 ✅ Completada
- **TypeORM configurado y conectado a PostgreSQL**
- **Entity CreditApplication con enums de País y Estado**
- **CRUD completo funcionando**:
  - `POST /api/credit-applications` - Crear solicitud
  - `GET /api/credit-applications` - Listar (con filtros por país y estado)
  - `GET /api/credit-applications/:id` - Obtener detalle
  - `PATCH /api/credit-applications/:id/status` - Cambiar estado
- DTOs con validación de tipos
- Base de datos con índices optimizados
- Autosincronización de esquema en desarrollo

## 📋 Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Backend | NestJS 10.x + TypeORM |
| Frontend | Next.js 14 + React 19 + Tailwind + shadcn/ui |
| Base de datos | PostgreSQL 15 |
| Cache/Queue | Redis 7 |
| Real-time | Socket.IO |
| Auth | Passport + JWT |
| Gestor de paquetes | pnpm |

## 🛠️ Configuración Inicial

### Requisitos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local opcional)
- pnpm (se instala automáticamente si es necesario)

### Variables de entorno
```bash
# El archivo .env ya está creado con valores de desarrollo
cp .env.example .env  # Si necesitas crear uno nuevo
```

## ⚡ Comandos Principales

```bash
# Levantar todos los servicios
make up

# Detener todos los servicios
make down

# Ver logs de todos los servicios
make logs

# Ver logs de un servicio específico
make logs-backend
make logs-frontend
make logs-db

# Reiniciar servicios
make restart
make restart-backend

# Acceso a shells
make shell-backend
make shell-db

# Limpiar todo (contenedores, volúmenes, imágenes)
make clean

# Ver ayuda
make help
```

## 🌐 URLs de Acceso

Una vez levantados los servicios:

- **Backend API**: http://localhost:3000
  - Endpoint de prueba: `GET http://localhost:3000/` → retorna "Hello World!"
  
- **Frontend**: http://localhost:3001
  - Interfaz Next.js en desarrollo
  
- **Mock Webhook Server**: http://localhost:4000
  - Simula sistemas externos
  - Health check: `GET http://localhost:4000/health`
  
- **PostgreSQL**: localhost:5432
  - Usuario: `postgres`
  - Contraseña: `postgres123` (configurar en .env)
  - BD: `credit_db`
  
- **Redis**: localhost:6379
  - Sin autenticación en desarrollo

## 📁 Estructura del Proyecto

```
credit-source-proyect/
├── backend/                    # NestJS application
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── mock-webhook-server/        # Mock external system
│   ├── index.ts
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
│
├── k8s/                        # Kubernetes manifests (próxima fase)
├── docker-compose.yml          # Orquestación de servicios
├── Makefile                    # Comandos útiles
├── .env                        # Variables de entorno
└── README.md                   # Este archivo
```

## 🔄 Flujo de Trabajo Actual

1. **Local development** (sin Docker):
   ```bash
   # Terminal 1: Backend
   cd backend && pnpm install && pnpm run start:dev
   
   # Terminal 2: Frontend
   cd frontend && pnpm install && pnpm run dev
   ```

2. **Con Docker**:
   ```bash
   make up
   # Los cambios en src/ se reflejan automáticamente (hot reload)
   ```

## 📝 Próximas Fases

**Fase 3: Lógica de Negocio por País** (Siguiente)
- Strategy pattern para reglas por país (MX, CO)
- Validadores de documentos (CURP, CC, DNI)
- Reglas de negocio específicas por país
- Integración automática al crear solicitud

**Fase 4: Proveedores Bancarios**
- Adapter pattern para diferentes proveedores
- Mocks para cada país con datos distintos
- Factory para seleccionar proveedor por país
- Consulta automática al crear solicitud

**Fase 5: Async, Colas y Triggers**
- BullMQ con Redis
- PostgreSQL triggers y pg_notify
- Workers para procesamiento asíncrono
- Auditoría y evaluación de riesgo

**Fase 6: Real-time + Webhooks**
- WebSocket Gateway con Socket.IO
- Endpoints para recibir/enviar webhooks
- Integración con mock webhook server
- Notificaciones en tiempo real al frontend

**Fases 7-9: Frontend, Cache, K8s, Documentación**
- Interfaz completa con React
- Estrategia de caché con Redis
- Manifiestos de Kubernetes
- Documentación técnica y de escalabilidad

## 🧪 Pruebas Rápidas de API

### Crear una solicitud de crédito
```bash
curl -X POST http://localhost:3000/api/credit-applications \
  -H "Content-Type: application/json" \
  -d '{
    "country": "MX",
    "fullName": "Juan Pérez",
    "documentType": "CURP",
    "documentNumber": "PELJ000101HDFRRS09",
    "amountRequested": 50000,
    "monthlyIncome": 5000
  }'
```

### Listar todas las solicitudes
```bash
curl http://localhost:3000/api/credit-applications
```

### Listar con filtros
```bash
# Solo aplicaciones de México en estado PENDING_VALIDATION
curl 'http://localhost:3000/api/credit-applications?country=MX&status=PENDING_VALIDATION'
```

### Obtener detalle de una solicitud
```bash
curl http://localhost:3000/api/credit-applications/{id}
```

### Cambiar estado de una solicitud
```bash
curl -X PATCH http://localhost:3000/api/credit-applications/{id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'
```

## 📊 Modelo de Datos

### Tabla: credit_applications

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Identificador único |
| country | ENUM | País (MX, CO, ES) |
| fullName | VARCHAR | Nombre completo |
| documentType | VARCHAR | Tipo de documento (CURP, CC, DNI, etc) |
| documentNumber | VARCHAR | Número de documento (no se expone en API) |
| amountRequested | DECIMAL | Monto solicitado |
| monthlyIncome | DECIMAL | Ingreso mensual |
| status | ENUM | DRAFT, PENDING_VALIDATION, VALIDATING, APPROVED, REJECTED, REVIEW_REQUIRED |
| bankProviderData | JSONB | Datos del proveedor bancario (próxima fase) |
| countryValidation | JSONB | Resultado de validaciones por país (próxima fase) |
| riskScore | DECIMAL | Puntuación de riesgo 0-100 (próxima fase) |
| rejectionReason | VARCHAR | Razón de rechazo |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Última actualización |
| createdBy | VARCHAR | Usuario que creó |

**Índices:**
- `(country, status)` - Búsquedas por país y estado
- `(status)` - Búsquedas por estado
- `(createdAt)` - Ordenamiento temporal

## 🧪 Pruebas Rápidas de Servicios

```bash
# Backend respondiendo
curl http://localhost:3000

# Frontend (abre en navegador o curl)
curl http://localhost:3001

# Mock webhook health
curl http://localhost:4000/health

# PostgreSQL
docker compose exec postgres psql -U postgres -d credit_db -c "SELECT 1;"

# Redis
docker compose exec redis redis-cli ping
```

## 📚 Notas de Desarrollo

- El backend está en watch mode: cambios en `backend/src/` se compilan automáticamente
- El frontend usa Turbopack para dev rápido
- Los volúmenes Docker montan solo directorios de código, no `node_modules`
- Las bases de datos persisten en volúmenes Docker

## 🐛 Troubleshooting

**Si los servicios no levantan:**
```bash
# Limpiar y reconstruir
make clean
make build
make up
```

**Si hay problemas de puerto ya en uso:**
```bash
# Cambiar puertos en .env y docker-compose.yml
BACKEND_PORT=3010
FRONTEND_PORT=3011
```

**Para revisar logs detallados:**
```bash
make logs  # Todos
make logs-backend
make logs-frontend
docker compose logs [service] --tail 50 -f
```

---

**Creado**: 6 de Febrero de 2026  
**Estado**: 🟢 Infraestructura base funcional
