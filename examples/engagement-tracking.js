/**
 * Ejemplo de implementación de tracking de engagement para el frontend
 * Este código muestra cómo integrar el tracking de engagement en una aplicación web
 */

class EngagementTracker {
  constructor(apiUrl = 'http://localhost:3001/api/engagement-logs') {
    this.apiUrl = apiUrl;
    this.startTime = null;
    this.currentView = null;
    this.isActive = false;
    this.userId = null;
    this.sessionId = this.generateSessionId();
    
    // Configurar event listeners
    this.setupEventListeners();
  }

  // Generar ID único para la sesión
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Configurar el ID del usuario
  setUserId(userId) {
    this.userId = userId;
  }

  // Configurar event listeners para detectar cambios de visibilidad
  setupEventListeners() {
    // Detectar cuando la pestaña se oculta/muestra
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopTracking();
      } else {
        // Opcional: reiniciar tracking si el usuario vuelve
        if (this.currentView) {
          this.startTracking(this.currentView);
        }
      }
    });

    // Detectar cuando la ventana pierde el foco
    window.addEventListener('blur', () => {
      this.stopTracking();
    });

    // Detectar cuando la ventana recupera el foco
    window.addEventListener('focus', () => {
      if (this.currentView) {
        this.startTracking(this.currentView);
      }
    });

    // Detectar antes de que el usuario abandone la página
    window.addEventListener('beforeunload', () => {
      this.stopTracking();
    });
  }

  // Iniciar tracking de una vista
  startTracking(viewName) {
    if (!this.userId) {
      console.warn('EngagementTracker: User ID not set');
      return;
    }

    // Si ya estamos trackeando, detener primero
    if (this.isActive) {
      this.stopTracking();
    }

    this.currentView = viewName;
    this.startTime = Date.now();
    this.isActive = true;

    console.log(`EngagementTracker: Started tracking view "${viewName}"`);
  }

  // Detener tracking y enviar datos
  async stopTracking() {
    if (!this.isActive || !this.currentView || !this.startTime) {
      return;
    }

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    
    // Solo enviar si la duración es mayor a 1 segundo
    if (duration > 1) {
      await this.sendEngagementLog({
        view_name: this.currentView,
        duration_seconds: duration,
        viewed_at: new Date().toISOString()
        // user_id NO se envía en el body, va en headers
      });
    }

    this.currentView = null;
    this.startTime = null;
    this.isActive = false;

    console.log(`EngagementTracker: Stopped tracking, duration: ${duration}s`);
  }

  // Enviar datos al microservicio
  async sendEngagementLog(data) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`, // Token de autenticación
          'user-id': this.userId // User ID validado por API Gateway
        },
        body: JSON.stringify({
          view_name: data.view_name,
          duration_seconds: data.duration_seconds,
          viewed_at: data.viewed_at
          // user_id NO se envía en el body, va en headers
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('EngagementTracker: Data sent successfully', result);
      
      return result;
    } catch (error) {
      console.error('EngagementTracker: Error sending engagement log:', error);
      
      // Opcional: Guardar en localStorage para reenvío posterior
      this.saveForRetry(data);
    }
  }

  // Obtener token de autenticación (implementar según tu sistema de auth)
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  // Guardar datos para reenvío posterior en caso de error
  saveForRetry(data) {
    const pendingLogs = JSON.parse(localStorage.getItem('pendingEngagementLogs') || '[]');
    pendingLogs.push({
      ...data,
      timestamp: Date.now()
    });
    localStorage.setItem('pendingEngagementLogs', JSON.stringify(pendingLogs));
  }

  // Reenviar logs pendientes
  async retryPendingLogs() {
    const pendingLogs = JSON.parse(localStorage.getItem('pendingEngagementLogs') || '[]');
    
    if (pendingLogs.length === 0) return;

    const successfulLogs = [];
    
    for (const log of pendingLogs) {
      try {
        await this.sendEngagementLog(log);
        successfulLogs.push(log);
      } catch (error) {
        console.error('EngagementTracker: Failed to retry log:', error);
      }
    }

    // Remover logs exitosos
    const remainingLogs = pendingLogs.filter(log => 
      !successfulLogs.some(successful => successful.timestamp === log.timestamp)
    );
    
    localStorage.setItem('pendingEngagementLogs', JSON.stringify(remainingLogs));
  }

  // Obtener estadísticas de engagement del usuario
  async getUserEngagementStats() {
    try {
      const response = await fetch(`${this.apiUrl}/stats/user/${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EngagementTracker: Error fetching user stats:', error);
      return null;
    }
  }

  // Obtener vistas disponibles
  async getAvailableViews() {
    try {
      const response = await fetch(`${this.apiUrl}/views`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EngagementTracker: Error fetching available views:', error);
      return null;
    }
  }

  // Verificar si una vista existe
  async checkViewExists(viewName) {
    try {
      const response = await fetch(`${this.apiUrl}/views/${encodeURIComponent(viewName)}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EngagementTracker: Error checking view existence:', error);
      return null;
    }
  }
}

// Ejemplo de uso en React
class ReactEngagementHook {
  constructor() {
    this.tracker = new EngagementTracker();
  }

  // Hook para React
  useEngagementTracking(viewName, userId) {
    React.useEffect(() => {
      if (userId) {
        this.tracker.setUserId(userId);
      }
      
      this.tracker.startTracking(viewName);

      return () => {
        this.tracker.stopTracking();
      };
    }, [viewName, userId]);
  }
}

// Ejemplo de uso en Vue
class VueEngagementMixin {
  constructor() {
    this.tracker = new EngagementTracker();
  }

  // Mixin para Vue
  beforeMount() {
    if (this.$route && this.$route.name) {
      this.tracker.startTracking(this.$route.name);
    }
  }

  beforeDestroy() {
    this.tracker.stopTracking();
  }

  watch: {
    '$route'(to, from) {
      if (from && from.name) {
        this.tracker.stopTracking();
      }
      if (to && to.name) {
        this.tracker.startTracking(to.name);
      }
    }
  }
}

// Ejemplo de uso básico
document.addEventListener('DOMContentLoaded', () => {
  const tracker = new EngagementTracker();
  
  // Configurar usuario (esto vendría de tu sistema de autenticación)
  tracker.setUserId(123);

  // Ejemplo: Trackear diferentes secciones de la página
  const sections = document.querySelectorAll('[data-track-section]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionName = entry.target.getAttribute('data-track-section');
        tracker.startTracking(sectionName);
      } else {
        tracker.stopTracking();
      }
    });
  });

  sections.forEach(section => {
    observer.observe(section);
  });

  // Reenviar logs pendientes al cargar la página
  tracker.retryPendingLogs();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EngagementTracker, ReactEngagementHook, VueEngagementMixin };
} 