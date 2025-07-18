const mysql = require('mysql2/promise');
const config = require('../config/database');

class EngagementLog {
  constructor() {
    this.pool = mysql.createPool(config);
  }

  async create(engagementData) {
    const { user_id, view_id, duration_seconds, viewed_at } = engagementData;
    const query = `
      INSERT INTO engagement_logs (user_id, view_id, duration_seconds, viewed_at)
      VALUES (?, ?, ?, ?)
    `;
    const values = [user_id, view_id, duration_seconds, viewed_at];
    try {
      const [result] = await this.pool.execute(query, values);
      return { id: result.insertId, user_id, view_id, duration_seconds, viewed_at };
    } catch (error) {
      throw new Error(`Error creating engagement log: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 100, offset = 0) {
    limit = Number(limit) || 100;
    offset = Number(offset) || 0;
    const query = `SELECT * FROM engagement_logs WHERE user_id = ? LIMIT ${limit} OFFSET ${offset}`;
    try {
      const [rows] = await this.pool.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching engagement logs by user: ${error.message}`);
    }
  }

  async findAll(limit = 100, offset = 0) {
    limit = Number(limit) || 100;
    offset = Number(offset) || 0;
    const query = `SELECT * FROM engagement_logs LIMIT ${limit} OFFSET ${offset}`;
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching all engagement logs: ${error.message}`);
    }
  }

  async getEngagementStats(userId) {
    const query = `
      SELECT COUNT(*) as total_sessions, SUM(duration_seconds) as total_duration,
             AVG(duration_seconds) as avg_duration, COUNT(DISTINCT view_id) as unique_views,
             MAX(viewed_at) as last_activity
      FROM engagement_logs WHERE user_id = ?
    `;
    try {
      const [rows] = await this.pool.execute(query, [userId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching engagement stats: ${error.message}`);
    }
  }

  async getViewEngagementStats() {
    const query = `
      SELECT v.view_name, COUNT(e.id) as total_views, AVG(e.duration_seconds) as avg_duration
      FROM engagement_logs e
      JOIN views_availabe v ON e.view_id = v.id
      GROUP BY v.view_name
    `;
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching view engagement stats: ${error.message}`);
    }
  }

  async getOrCreateViewId(viewName) {
    try {
      // Intentar obtener el view_id existente
      const getQuery = `SELECT id FROM views_availabe WHERE view_name = ?`;
      let [rows] = await this.pool.execute(getQuery, [viewName]);
      if (rows.length > 0) {
        return rows[0].id;
      }
      // Si no existe, crear uno nuevo
      const createQuery = `INSERT INTO views_availabe (view_name) VALUES (?)`;
      const [result] = await this.pool.execute(createQuery, [viewName]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error getting or creating view_id: ${error.message}`);
    }
  }

  async getAvailableViews() {
    const query = `SELECT id, view_name FROM views_availabe`;
    try {
      const [rows] = await this.pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching available views: ${error.message}`);
    }
  }

  async createView(viewName) {
    const query = `INSERT INTO views_availabe (view_name) VALUES (?)`;
    try {
      const [result] = await this.pool.execute(query, [viewName]);
      return { id: result.insertId, view_name: viewName };
    } catch (error) {
      throw new Error(`Error creating view: ${error.message}`);
    }
  }

  async viewExists(viewName) {
    const query = `SELECT COUNT(*) as count FROM views_availabe WHERE view_name = ?`;
    try {
      const [rows] = await this.pool.execute(query, [viewName]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking if view exists: ${error.message}`);
    }
  }
}

module.exports = EngagementLog; 