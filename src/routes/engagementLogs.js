const express = require('express');
const EngagementLogController = require('../controllers/EngagementLogController');
const { validateUserId, optionalUserId } = require('../middleware/auth');

const router = express.Router();
const engagementLogController = new EngagementLogController();

/**
 * @swagger
 * /api/engagement-logs/health:
 *   get:
 *     summary: Health check del servicio
 *     responses:
 *       200:
 *         description: Servicio saludable
 */
// Health check
router.get('/health', engagementLogController.healthCheck.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs:
 *   post:
 *     summary: Crear un nuevo engagement log
 *     tags: [EngagementLogs]
 *     parameters:
 *       - in: header
 *         name: user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - view_id
 *               - duration_seconds
 *             properties:
 *               view_id:
 *                 type: integer
 *                 description: ID de la vista
 *               duration_seconds:
 *                 type: integer
 *                 description: Duración en segundos
 *               viewed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la vista
 *     responses:
 *       201:
 *         description: Engagement log creado
 *       400:
 *         description: Error de validación
 */
// POST /api/engagement-logs - Crear un nuevo engagement log (requiere user_id en headers)
router.post('/', validateUserId, engagementLogController.createEngagementLog.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs:
 *   get:
 *     summary: Obtener todos los engagement logs
 *     tags: [EngagementLogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset de resultados
 *     responses:
 *       200:
 *         description: Lista de engagement logs
 */
// GET /api/engagement-logs - Obtener todos los engagement logs (con paginación)
router.get('/', engagementLogController.getAllEngagementLogs.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/user/{userId}:
 *   get:
 *     summary: Obtener engagement logs de un usuario específico
 *     tags: [EngagementLogs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset de resultados
 *     responses:
 *       200:
 *         description: Lista de engagement logs del usuario
 */
// GET /api/engagement-logs/user/:userId - Obtener engagement logs de un usuario específico
router.get('/user/:userId', engagementLogController.getEngagementLogsByUser.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/stats/user/{userId}:
 *   get:
 *     summary: Obtener estadísticas de engagement de un usuario
 *     tags: [EngagementLogs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estadísticas de engagement del usuario
 */
// GET /api/engagement-logs/stats/user/:userId - Obtener estadísticas de engagement de un usuario
router.get('/stats/user/:userId', engagementLogController.getEngagementStats.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/stats/views:
 *   get:
 *     summary: Obtener estadísticas de engagement por vista
 *     tags: [EngagementLogs]
 *     responses:
 *       200:
 *         description: Estadísticas de engagement por vista
 */
// GET /api/engagement-logs/stats/views - Obtener estadísticas de engagement por vista
router.get('/stats/views', engagementLogController.getViewEngagementStats.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/analytics/user/{userId}:
 *   get:
 *     summary: Obtener análisis detallado de engagement de un usuario
 *     tags: [EngagementLogs]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Días a analizar (por defecto 30)
 *     responses:
 *       200:
 *         description: Análisis de engagement del usuario
 */
// GET /api/engagement-logs/analytics/user/:userId - Obtener análisis detallado de engagement de un usuario
router.get('/analytics/user/:userId', engagementLogController.getEngagementAnalytics.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/views:
 *   get:
 *     summary: Obtener todas las vistas disponibles
 *     tags: [Views]
 *     responses:
 *       200:
 *         description: Lista de vistas disponibles
 *   post:
 *     summary: Crear una nueva vista
 *     tags: [Views]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - view_name
 *             properties:
 *               view_name:
 *                 type: string
 *                 description: Nombre de la vista
 *     responses:
 *       201:
 *         description: Vista creada
 *       400:
 *         description: Error de validación
 */
// GET /api/engagement-logs/views - Obtener todas las vistas disponibles
router.get('/views', engagementLogController.getAvailableViews.bind(engagementLogController));
// POST /api/engagement-logs/views - Crear una nueva vista
router.post('/views', engagementLogController.createView.bind(engagementLogController));

/**
 * @swagger
 * /api/engagement-logs/views/{viewName}:
 *   get:
 *     summary: Verificar si una vista existe
 *     tags: [Views]
 *     parameters:
 *       - in: path
 *         name: viewName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la vista
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 */
// GET /api/engagement-logs/views/:viewName - Verificar si una vista existe
router.get('/views/:viewName', engagementLogController.checkViewExists.bind(engagementLogController));

module.exports = router; 