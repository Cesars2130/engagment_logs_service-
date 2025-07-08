const express = require('express');
const EngagementLogController = require('../controllers/EngagementLogController');
const { validateUserId, optionalUserId } = require('../middleware/auth');

const router = express.Router();
const engagementLogController = new EngagementLogController();

// Health check
router.get('/health', engagementLogController.healthCheck.bind(engagementLogController));

// POST /api/engagement-logs - Crear un nuevo engagement log (requiere user_id en headers)
router.post('/', validateUserId, engagementLogController.createEngagementLog.bind(engagementLogController));

// GET /api/engagement-logs - Obtener todos los engagement logs (con paginación)
router.get('/', engagementLogController.getAllEngagementLogs.bind(engagementLogController));

// GET /api/engagement-logs/user/:userId - Obtener engagement logs de un usuario específico
router.get('/user/:userId', engagementLogController.getEngagementLogsByUser.bind(engagementLogController));

// GET /api/engagement-logs/stats/user/:userId - Obtener estadísticas de engagement de un usuario
router.get('/stats/user/:userId', engagementLogController.getEngagementStats.bind(engagementLogController));

// GET /api/engagement-logs/stats/views - Obtener estadísticas de engagement por vista
router.get('/stats/views', engagementLogController.getViewEngagementStats.bind(engagementLogController));

// GET /api/engagement-logs/analytics/user/:userId - Obtener análisis detallado de engagement de un usuario
router.get('/analytics/user/:userId', engagementLogController.getEngagementAnalytics.bind(engagementLogController));

// Rutas para manejo de vistas
// GET /api/engagement-logs/views - Obtener todas las vistas disponibles
router.get('/views', engagementLogController.getAvailableViews.bind(engagementLogController));

// POST /api/engagement-logs/views - Crear una nueva vista
router.post('/views', engagementLogController.createView.bind(engagementLogController));

// GET /api/engagement-logs/views/:viewName - Verificar si una vista existe
router.get('/views/:viewName', engagementLogController.checkViewExists.bind(engagementLogController));

module.exports = router; 