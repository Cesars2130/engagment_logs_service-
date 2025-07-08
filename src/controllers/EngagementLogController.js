const EngagementLogService = require('../services/EngagementLogService');

class EngagementLogController {
  constructor() {
    this.engagementLogService = new EngagementLogService();
  }

  // POST /api/engagement-logs
  async createEngagementLog(req, res) {
    try {
      const engagementData = req.body;
      
      // user_id ya validado por el middleware
      const userId = req.userId;
      
      const result = await this.engagementLogService.createEngagementLog(engagementData, userId);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error creating engagement log:', error);
      
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/user/:userId
  async getEngagementLogsByUser(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      const result = await this.engagementLogService.getEngagementLogsByUser(
        parseInt(userId), 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: result.data.length
        }
      });
    } catch (error) {
      console.error('Error fetching user engagement logs:', error);
      
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs
  async getAllEngagementLogs(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const result = await this.engagementLogService.getAllEngagementLogs(
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: result.data.length
        }
      });
    } catch (error) {
      console.error('Error fetching all engagement logs:', error);
      
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/stats/user/:userId
  async getEngagementStats(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await this.engagementLogService.getEngagementStats(parseInt(userId));
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error fetching engagement stats:', error);
      
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/stats/views
  async getViewEngagementStats(req, res) {
    try {
      const result = await this.engagementLogService.getViewEngagementStats();
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error fetching view engagement stats:', error);
      
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/analytics/user/:userId
  async getEngagementAnalytics(req, res) {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;
      
      const result = await this.engagementLogService.getEngagementAnalytics(
        parseInt(userId), 
        parseInt(days)
      );
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/views - Obtener todas las vistas disponibles
  async getAvailableViews(req, res) {
    try {
      const result = await this.engagementLogService.getAvailableViews();
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error fetching available views:', error);
      
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // POST /api/engagement-logs/views - Crear una nueva vista
  async createView(req, res) {
    try {
      const { view_name } = req.body;
      
      const result = await this.engagementLogService.createView(view_name);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error creating view:', error);
      
      res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/views/:viewName - Verificar si una vista existe
  async checkViewExists(req, res) {
    try {
      const { viewName } = req.params;
      
      const result = await this.engagementLogService.viewExists(viewName);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error checking view existence:', error);
      
      res.status(500).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /api/engagement-logs/health
  async healthCheck(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Engagement Log Service is healthy',
        timestamp: new Date().toISOString(),
        service: 'engagement-logs'
      });
    } catch (error) {
      console.error('Health check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Service is unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = EngagementLogController; 