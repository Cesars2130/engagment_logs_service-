# Engagement Service

Microservicio para el tracking y análisis de engagement de usuarios en la aplicación RunInsight.

## 🎯 Propósito

Este microservicio se encarga de recopilar y analizar datos de engagement de los usuarios, incluyendo:
- Tiempo de permanencia en cada vista
- Frecuencia de uso de la aplicación
- Patrones de navegación
- Métricas para entrenar modelos predictivos de churn
- Gestión centralizada de vistas disponibles
- Integración con API Gateway para autenticación centralizada

## 🏗️ Arquitectura

El microservicio sigue una arquitectura en capas:

```
src/
├── config/          # Configuraciones (DB, etc.)
├── controllers/     # Controladores HTTP
├── middleware/      # Middleware personalizado (auth, etc.)
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
└── app.js          # Punto de entrada
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd engagement-service
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar la base de datos**
```sql
-- Crear tabla de vistas disponibles
CREATE TABLE IF NOT EXISTS views_availabe (
  id SERIAL PRIMARY KEY,
  view_name VARCHAR(255) UNIQUE NOT NULL
);

-- Crear tabla de engagement logs
CREATE TABLE IF NOT EXISTS engagement_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  view_id INTEGER NOT NULL REFERENCES views_availabe(id),
  duration_seconds INTEGER NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_engagement_logs_user_id ON engagement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_viewed_at ON engagement_logs(viewed_at);
CREATE INDEX IF NOT EXISTS idx_views_availabe_name ON views_availabe(view_name);
```

5. **Ejecutar el servicio**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📊 Endpoints

### Health Check
```
GET /api/engagement-logs/health
```

### Crear Engagement Log
```
POST /api/engagement-logs
Content-Type: application/json
user-id: 123
Authorization: Bearer your-jwt-token

{
  "view_name": "dashboard",
  "duration_seconds": 300,
  "viewed_at": "2024-01-15T10:30:00Z"
}
```

**Nota:** El `user_id` se envía en el header `user-id` (validado previamente por el API Gateway)

### Obtener Engagement Logs por Usuario
```
GET /api/engagement-logs/user/:userId?limit=100&offset=0
```

### Obtener Todos los Engagement Logs
```
GET /api/engagement-logs?limit=100&offset=0
```

### Estadísticas de Engagement por Usuario
```
GET /api/engagement-logs/stats/user/:userId
```

### Estadísticas de Engagement por Vista
```
GET /api/engagement-logs/stats/views
```

### Análisis Detallado de Engagement
```
GET /api/engagement-logs/analytics/user/:userId?days=30
```

### Gestión de Vistas
```
GET /api/engagement-logs/views
POST /api/engagement-logs/views
GET /api/engagement-logs/views/:viewName
```

## 🔐 Autenticación y Autorización

### Headers Requeridos

El microservicio espera que el API Gateway valide la autenticación y envíe el `user_id` en los headers:

| Header | Descripción | Ejemplo |
|--------|-------------|---------|
| `user-id` | ID del usuario validado | `user-id: 123` |
| `x-user-id` | Alternativa para user-id | `x-user-id: 123` |
| `Authorization` | Token JWT (opcional) | `Authorization: Bearer token` |

### Flujo de Autenticación

1. **Cliente** envía petición con token JWT
2. **API Gateway** valida el token y extrae `user_id`
3. **API Gateway** reenvía la petición al microservicio con `user-id` en headers
4. **Microservicio** valida el formato del `user_id` y procesa la petición

## 🗄️ Estructura de Base de Datos

### Tabla `views_availabe`
```sql
CREATE TABLE views_availabe (
  id SERIAL PRIMARY KEY,
  view_name VARCHAR(255) UNIQUE NOT NULL
);
```

### Tabla `engagement_logs`
```sql
CREATE TABLE engagement_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  view_id INTEGER NOT NULL REFERENCES views_availabe(id),
  duration_seconds INTEGER NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices Optimizados
```sql
CREATE INDEX idx_engagement_logs_user_id ON engagement_logs(user_id);
CREATE INDEX idx_engagement_logs_viewed_at ON engagement_logs(viewed_at);
CREATE INDEX idx_views_availabe_name ON views_availabe(view_name);
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_NAME` | Nombre de la base de datos | `runinsight_db` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS | `*` |

### Inicialización de Base de Datos

1. **Crear las tablas:**
```sql
-- Crear tabla de vistas disponibles
CREATE TABLE IF NOT EXISTS views_availabe (
  id SERIAL PRIMARY KEY,
  view_name VARCHAR(255) UNIQUE NOT NULL
);

-- Crear tabla de engagement logs
CREATE TABLE IF NOT EXISTS engagement_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  view_id INTEGER NOT NULL REFERENCES views_availabe(id),
  duration_seconds INTEGER NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_engagement_logs_user_id ON engagement_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_viewed_at ON engagement_logs(viewed_at);
CREATE INDEX IF NOT EXISTS idx_views_availabe_name ON views_availabe(view_name);
```

2. **Inicializar vistas comunes:**
```bash
# Ejecutar el script de inicialización
psql -d runinsight_db -f database/init_views.sql
```

El script `database/init_views.sql` incluye vistas comunes como:
- `dashboard`, `profile`, `training`, `stats`
- `achievements`, `rewards`, `social`, `friends`
- `settings`, `notifications`, `chatbot`
- Y muchas más...

### Configuración del API Gateway

Para integrar con el microservicio, el API Gateway debe:

1. **Validar el token JWT** y extraer el `user_id`
2. **Agregar el header** `user-id` a la petición
3. **Reenviar la petición** al microservicio

**Ejemplo de configuración (Kong):**
```yaml
routes:
  - name: engagement-service
    paths: ["/api/engagement-logs"]
    strip_path: true
    plugins:
      - name: jwt
        config:
          secret: your-jwt-secret
      - name: serverless-functions
        config:
          functions:
            - |
              return function()
                local jwt = require("kong.plugin.jwt")
                local user_id = jwt.get_claim("user_id")
                kong.service.request.set_header("user-id", user_id)
              end
```

## 📈 Uso para Modelos Predictivos

### Datos Recolectados

El servicio recolecta los siguientes datos útiles para modelos de churn:

1. **Frecuencia de uso**: Número de sesiones por día/semana
2. **Duración de sesiones**: Tiempo promedio en la aplicación
3. **Patrones de navegación**: Qué vistas visitan más
4. **Tendencias de engagement**: Si el uso aumenta o disminuye
5. **Última actividad**: Cuándo fue la última vez que usó la app
6. **Vistas específicas**: Análisis detallado por cada vista de la aplicación

### Ventajas de la Nueva Estructura

- ✅ **Normalización**: Evita duplicación de nombres de vistas
- ✅ **Rendimiento**: Consultas más rápidas con índices optimizados
- ✅ **Flexibilidad**: Creación automática de nuevas vistas
- ✅ **Consistencia**: Nombres de vistas estandarizados
- ✅ **Seguridad**: Autenticación centralizada en API Gateway
- ✅ **Escalabilidad**: Microservicios sin lógica de autenticación duplicada

### Ejemplo de Uso para ML

```javascript
// Obtener datos para entrenar modelo
const analytics = await fetch('/api/engagement-logs/analytics/user/123?days=30');
const userData = analytics.data;

// Features para el modelo:
// - userData.total_sessions (frecuencia)
// - userData.avg_duration (tiempo promedio)
// - userData.engagement_trend (tendencia)
// - userData.daily_engagement (patrón diario)
// - userData.unique_views (diversidad de uso)
```

### Gestión de Vistas para ML

```javascript
// Obtener todas las vistas disponibles
const views = await fetch('/api/engagement-logs/views');
const availableViews = views.data;

// Verificar si una vista específica existe
const viewCheck = await fetch('/api/engagement-logs/views/dashboard');
const viewExists = viewCheck.data.exists;

// Crear nueva vista si es necesario
await fetch('/api/engagement-logs/views', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ view_name: 'new_feature' })
});
```

### Ejemplo con Autenticación

```javascript
// El API Gateway maneja la autenticación automáticamente
const response = await fetch('/api/engagement-logs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
    // user-id se agrega automáticamente por el API Gateway
  },
  body: JSON.stringify({
    view_name: 'dashboard',
    duration_seconds: 300
  })
});
```

## 🎯 Recomendaciones para Frontend

### Autenticación y Headers

El microservicio espera que el `user_id` sea enviado en los headers, validado previamente por el API Gateway:

```javascript
// Headers requeridos (el API Gateway los agrega automáticamente)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer your-jwt-token'
  // user-id se agrega automáticamente por el API Gateway
};
```

### Integración con API Gateway

El frontend solo necesita enviar el token JWT. El API Gateway se encarga de:

1. **Validar el token** JWT
2. **Extraer el user_id** del token
3. **Agregar el header** `user-id` a la petición
4. **Reenviar** al microservicio

### Tracking de Tiempo en Pantalla

```javascript
class EngagementTracker {
  constructor() {
    this.startTime = Date.now();
    this.currentView = null;
    this.isActive = true;
  }

  // Iniciar tracking de una vista
  startTracking(viewName) {
    this.currentView = viewName;
    this.startTime = Date.now();
    this.isActive = true;
  }

  // Detener tracking y enviar datos
  async stopTracking() {
    if (!this.currentView || !this.isActive) return;

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    
    await this.sendEngagementLog({
      user_id: getCurrentUserId(),
      view_name: this.currentView,
      duration_seconds: duration,
      viewed_at: new Date().toISOString()
    });

    this.currentView = null;
    this.isActive = false;
  }

  // Enviar datos al microservicio
  async sendEngagementLog(data) {
    try {
      await fetch('/api/engagement-logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}` // Token JWT
          // user-id se agrega automáticamente por el API Gateway
        },
        body: JSON.stringify({
          view_name: data.view_name,
          duration_seconds: data.duration_seconds,
          viewed_at: data.viewed_at
          // user_id NO va en el body
        })
      });
    } catch (error) {
      console.error('Error sending engagement log:', error);
    }
  }

  // Obtener vistas disponibles
  async getAvailableViews() {
    try {
      const response = await fetch(`${this.apiUrl}/views`);
      return await response.json();
    } catch (error) {
      console.error('EngagementTracker: Error fetching views:', error);
      return null;
    }
  }

  // Verificar si una vista existe
  async checkViewExists(viewName) {
    try {
      const response = await fetch(`${this.apiUrl}/views/${encodeURIComponent(viewName)}`);
      return await response.json();
    } catch (error) {
      console.error('EngagementTracker: Error checking view:', error);
      return null;
    }
  }
}

// Uso en React/Vue/Angular
const tracker = new EngagementTracker();

// Al entrar a una vista
onViewEnter('dashboard') {
  tracker.startTracking('dashboard');
}

// Al salir de una vista
onViewLeave() {
  tracker.stopTracking();
}

// Al cambiar de pestaña o cerrar la app
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    tracker.stopTracking();
  }
});
```

### Eventos Recomendados para Trackear

1. **Cambio de vista/página**
2. **Interacciones importantes** (botones, formularios)
3. **Tiempo de inactividad**
4. **Cierre de pestaña/aplicación**
5. **Scroll y navegación**

### Gestión Automática de Vistas

El microservicio maneja automáticamente la creación de nuevas vistas:

```javascript
// El frontend solo necesita enviar el view_name
// El backend se encarga de crear la vista si no existe
await tracker.sendEngagementLog({
  view_name: 'new_feature',  // Se crea automáticamente si no existe
  duration_seconds: 300,
  viewed_at: new Date().toISOString()
  // user_id se maneja automáticamente por el API Gateway
});
```

### Middleware de Autenticación

El microservicio incluye middleware para validar el `user_id`:

```javascript
// src/middleware/auth.js
const validateUserId = (req, res, next) => {
  const userId = req.headers['user-id'] || req.headers['x-user-id'];
  
  if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid User ID'
    });
  }
  
  req.userId = parseInt(userId);
  next();
};
```

### Vistas Predefinidas

El sistema incluye vistas comunes para aplicaciones de fitness:
- **Dashboard**: Página principal
- **Training**: Gestión de entrenamientos
- **Stats**: Estadísticas del usuario
- **Profile**: Perfil del usuario
- **Social**: Funciones sociales
- **Settings**: Configuraciones
- Y muchas más...

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests específicos de autenticación
npm test -- tests/auth.test.js

# Tests del servicio
npm test -- tests/EngagementLogService.test.js
```

### Cobertura de Tests

- ✅ **Tests unitarios** para todos los servicios
- ✅ **Tests de middleware** de autenticación
- ✅ **Tests de validación** de headers
- ✅ **Tests de casos de error** y edge cases
- ✅ **Mocks** para dependencias externas

## 📝 Logs

El servicio utiliza Morgan para logging HTTP y Winston para logs de aplicación.

### Niveles de Log
- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Información de debugging

## 🔒 Seguridad

- **Helmet**: Headers de seguridad
- **Rate Limiting**: Protección contra spam
- **CORS**: Control de orígenes permitidos
- **Input Validation**: Validación con Joi
- **SQL Injection Protection**: Uso de parámetros preparados
- **Normalización de Datos**: Evita inyección de datos maliciosos en nombres de vistas
- **Autenticación Centralizada**: Validación de tokens en API Gateway
- **Validación de Headers**: Middleware para verificar `user_id`
- **Separación de Responsabilidades**: Microservicios sin lógica de auth duplicada

## 🚀 Despliegue

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Variables de Producción

```bash
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_PASSWORD=your-secure-password
ALLOWED_ORIGINS=https://yourdomain.com
```

### Configuración del API Gateway

Para producción, asegúrate de que el API Gateway esté configurado correctamente:

```yaml
# Ejemplo para Kong Gateway
services:
  - name: engagement-service
    url: http://engagement-service:3001
    routes:
      - name: engagement-routes
        paths: ["/api/engagement-logs"]
        strip_path: true
        plugins:
          - name: jwt
            config:
              secret: your-production-jwt-secret
              key_claim_name: user_id
          - name: cors
            config:
              origins: ["https://yourdomain.com"]
```

### Migración de Datos

Si tienes datos existentes con la estructura anterior:

```sql
-- 1. Crear tabla temporal
CREATE TABLE engagement_logs_temp AS SELECT * FROM engagement_logs;

-- 2. Crear tabla views_availabe
CREATE TABLE views_availabe (
  id SERIAL PRIMARY KEY,
  view_name VARCHAR(255) UNIQUE NOT NULL
);

-- 3. Insertar vistas únicas
INSERT INTO views_availabe (view_name)
SELECT DISTINCT view_name FROM engagement_logs_temp;

-- 4. Actualizar engagement_logs con view_id
UPDATE engagement_logs 
SET view_id = va.id
FROM views_availabe va
WHERE engagement_logs.view_name = va.view_name;

-- 5. Eliminar columna view_name y agregar constraint
ALTER TABLE engagement_logs DROP COLUMN view_name;
ALTER TABLE engagement_logs ADD CONSTRAINT fk_view_id FOREIGN KEY (view_id) REFERENCES views_availabe(id);
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📊 Características Implementadas

- ✅ **Arquitectura en capas** (Model-Service-Controller)
- ✅ **Base de datos normalizada** con tabla de vistas
- ✅ **Validación de datos** con Joi
- ✅ **Manejo de errores** robusto
- ✅ **Rate limiting** y seguridad
- ✅ **Logging** y monitoreo
- ✅ **Tests unitarios** completos
- ✅ **Documentación** completa
- ✅ **Ejemplos de implementación** frontend
- ✅ **Análisis de engagement** para ML
- ✅ **Gestión automática** de vistas
- ✅ **Índices optimizados** para rendimiento
- ✅ **Health checks** para monitoreo
- ✅ **Autenticación centralizada** con API Gateway
- ✅ **Middleware de validación** de headers
- ✅ **Integración segura** con JWT tokens
- ✅ **Tests de autenticación** completos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 