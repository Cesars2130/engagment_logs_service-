const EngagementLog = require('../models/EngagementLog');
const Joi = require('joi');

class EngagementLogService {
  constructor() {
    this.engagementLogModel = new EngagementLog();
  }

  // Esquema de validación para crear engagement log (sin user_id, viene en headers)
  validateEngagementData(data) {
    const schema = Joi.object({
      view_id: Joi.number().integer().min(1).required(),
      duration_seconds: Joi.number().integer().min(0).max(86400).required(), // Máximo 24 horas
      viewed_at: Joi.date().iso().default(() => new Date())
    });

    return schema.validate(data);
  }

  async createEngagementLog(engagementData, userId) {
    try {
      // Validar userId desde headers
      if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        throw new Error('Invalid user ID from headers');
      }

      // Validar datos de entrada
      const { error, value } = this.validateEngagementData(engagementData);
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
      }

      // Agregar user_id a los datos
      const dataWithUserId = {
        ...value,
        user_id: parseInt(userId)
      };

      // Crear el engagement log (ahora usando view_id directamente)
      const result = await this.engagementLogModel.create(dataWithUserId);
      
      return {
        success: true,
        data: result,
        message: 'Engagement log created successfully'
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  async getEngagementLogsByUser(userId, limit = 100, offset = 0) {
    try {
      // Validar parámetros
      if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        throw new Error('Invalid user ID');
      }

      const logs = await this.engagementLogModel.findByUserId(userId, limit, offset);
      
      return {
        success: true,
        data: logs,
        message: `Retrieved ${logs.length} engagement logs for user ${userId}`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  async getAllEngagementLogs(limit = 100, offset = 0) {
    try {
      const logs = await this.engagementLogModel.findAll(limit, offset);
      
      return {
        success: true,
        data: logs,
        message: `Retrieved ${logs.length} engagement logs`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  async getEngagementStats(userId) {
    try {
      if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        throw new Error('Invalid user ID');
      }

      const stats = await this.engagementLogModel.getEngagementStats(userId);
      
      return {
        success: true,
        data: stats,
        message: `Retrieved engagement stats for user ${userId}`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  async getViewEngagementStats() {
    try {
      const stats = await this.engagementLogModel.getViewEngagementStats();
      
      return {
        success: true,
        data: stats,
        message: 'Retrieved view engagement statistics'
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Obtener todas las vistas disponibles
  async getAvailableViews() {
    try {
      const views = await this.engagementLogModel.getAvailableViews();
      
      return {
        success: true,
        data: views,
        message: 'Retrieved available views'
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Crear una nueva vista
  async createView(viewName) {
    try {
      // Validar el nombre de la vista
      if (!viewName || typeof viewName !== 'string' || viewName.trim().length === 0) {
        throw new Error('View name is required and must be a non-empty string');
      }

      const viewNameTrimmed = viewName.trim();
      
      // Verificar si ya existe
      const exists = await this.engagementLogModel.viewExists(viewNameTrimmed);
      if (exists) {
        throw new Error(`View "${viewNameTrimmed}" already exists`);
      }

      const result = await this.engagementLogModel.createView(viewNameTrimmed);
      
      return {
        success: true,
        data: result,
        message: `View "${viewNameTrimmed}" created successfully`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Verificar si una vista existe
  async viewExists(viewName) {
    try {
      const exists = await this.engagementLogModel.viewExists(viewName);
      
      return {
        success: true,
        data: { exists, view_name: viewName },
        message: `View "${viewName}" ${exists ? 'exists' : 'does not exist'}`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Método para análisis de engagement (útil para el modelo predictivo)
  async getEngagementAnalytics(userId, days = 30) {
    try {
      if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        throw new Error('Invalid user ID');
      }

      const logs = await this.engagementLogModel.findByUserId(userId, 1000, 0);
      
      // Filtrar logs de los últimos N días
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentLogs = logs.filter(log => new Date(log.viewed_at) >= cutoffDate);
      
      // Calcular métricas de engagement
      const analytics = {
        total_sessions: recentLogs.length,
        total_duration: recentLogs.reduce((sum, log) => sum + log.duration_seconds, 0),
        avg_duration: recentLogs.length > 0 ? 
          recentLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / recentLogs.length : 0,
        unique_views: [...new Set(recentLogs.map(log => log.view_name))].length,
        daily_engagement: this.calculateDailyEngagement(recentLogs, days),
        engagement_trend: this.calculateEngagementTrend(recentLogs)
      };
      
      return {
        success: true,
        data: analytics,
        message: `Retrieved engagement analytics for user ${userId} (last ${days} days)`
      };
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  calculateDailyEngagement(logs, days) {
    const dailyData = {};
    
    // Inicializar días
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = {
        sessions: 0,
        duration: 0,
        views: new Set()
      };
    }
    
    // Agrupar logs por día
    logs.forEach(log => {
      const dateStr = new Date(log.viewed_at).toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].sessions++;
        dailyData[dateStr].duration += log.duration_seconds;
        dailyData[dateStr].views.add(log.view_name);
      }
    });
    
    // Convertir a array y calcular métricas
    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      duration: data.duration,
      unique_views: data.views.size,
      avg_duration: data.sessions > 0 ? data.duration / data.sessions : 0
    }));
  }

  calculateEngagementTrend(logs) {
    if (logs.length < 2) return 'insufficient_data';
    
    // Agrupar por semana
    const weeklyData = {};
    logs.forEach(log => {
      const date = new Date(log.viewed_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { sessions: 0, duration: 0 };
      }
      weeklyData[weekKey].sessions++;
      weeklyData[weekKey].duration += log.duration_seconds;
    });
    
    const weeks = Object.values(weeklyData);
    if (weeks.length < 2) return 'insufficient_data';
    
    // Calcular tendencia
    const recentWeek = weeks[weeks.length - 1];
    const previousWeek = weeks[weeks.length - 2];
    
    const sessionChange = ((recentWeek.sessions - previousWeek.sessions) / previousWeek.sessions) * 100;
    const durationChange = ((recentWeek.duration - previousWeek.duration) / previousWeek.duration) * 100;
    
    if (sessionChange > 10 && durationChange > 10) return 'increasing';
    if (sessionChange < -10 && durationChange < -10) return 'decreasing';
    return 'stable';
  }
}

module.exports = EngagementLogService; 