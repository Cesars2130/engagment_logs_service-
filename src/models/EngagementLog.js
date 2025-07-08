const { Pool } = require('pg');
const config = require('../config/database');

class EngagementLog {
  constructor() {
    this.pool = new Pool(config);
  }

  async create(engagementData) {
    const { user_id, view_name, duration_seconds, viewed_at } = engagementData;
    
    // Primero, obtener o crear el view_id
    let viewId = await this.getOrCreateViewId(view_name);
    
    const query = `
      INSERT INTO engagement_logs (user_id, view_id, duration_seconds, viewed_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [user_id, viewId, duration_seconds, viewed_at];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating engagement log: ${error.message}`);
    }
  }

  async findByUserId(userId, limit = 100, offset = 0) {
    const query = `
      SELECT 
        el.id,
        el.user_id,
        el.duration_seconds,
        el.viewed_at,
        va.view_name
      FROM engagement_logs el
      JOIN views_availabe va ON el.view_id = va.id
      WHERE el.user_id = $1 
      ORDER BY el.viewed_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const values = [userId, limit, offset];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching engagement logs: ${error.message}`);
    }
  }

  async findAll(limit = 100, offset = 0) {
    const query = `
      SELECT 
        el.id,
        el.user_id,
        el.duration_seconds,
        el.viewed_at,
        va.view_name
      FROM engagement_logs el
      JOIN views_availabe va ON el.view_id = va.id
      ORDER BY el.viewed_at DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const values = [limit, offset];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all engagement logs: ${error.message}`);
    }
  }

  async getEngagementStats(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(el.duration_seconds) as total_duration,
        AVG(el.duration_seconds) as avg_duration,
        COUNT(DISTINCT va.view_name) as unique_views,
        MAX(el.viewed_at) as last_activity
      FROM engagement_logs el
      JOIN views_availabe va ON el.view_id = va.id
      WHERE el.user_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching engagement stats: ${error.message}`);
    }
  }

  async getViewEngagementStats() {
    const query = `
      SELECT 
        va.view_name,
        COUNT(*) as total_views,
        AVG(el.duration_seconds) as avg_duration,
        SUM(el.duration_seconds) as total_duration
      FROM engagement_logs el
      JOIN views_availabe va ON el.view_id = va.id
      GROUP BY va.view_name, va.id
      ORDER BY total_views DESC
    `;
    
    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching view engagement stats: ${error.message}`);
    }
  }

  // Obtener o crear view_id para un view_name
  async getOrCreateViewId(viewName) {
    try {
      // Primero intentar obtener el view_id existente
      const getQuery = `
        SELECT id FROM views_availabe 
        WHERE view_name = $1
      `;
      
      let result = await this.pool.query(getQuery, [viewName]);
      
      if (result.rows.length > 0) {
        return result.rows[0].id;
      }
      
      // Si no existe, crear uno nuevo
      const createQuery = `
        INSERT INTO views_availabe (view_name) 
        VALUES ($1) 
        RETURNING id
      `;
      
      result = await this.pool.query(createQuery, [viewName]);
      return result.rows[0].id;
    } catch (error) {
      throw new Error(`Error getting or creating view_id: ${error.message}`);
    }
  }

  // Obtener todas las vistas disponibles
  async getAvailableViews() {
    const query = `
      SELECT id, view_name 
      FROM views_availabe 
      ORDER BY view_name
    `;
    
    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching available views: ${error.message}`);
    }
  }

  // Crear una nueva vista
  async createView(viewName) {
    const query = `
      INSERT INTO views_availabe (view_name) 
      VALUES ($1) 
      RETURNING *
    `;
    
    try {
      const result = await this.pool.query(query, [viewName]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating view: ${error.message}`);
    }
  }

  // Verificar si una vista existe
  async viewExists(viewName) {
    const query = `
      SELECT COUNT(*) as count 
      FROM views_availabe 
      WHERE view_name = $1
    `;
    
    try {
      const result = await this.pool.query(query, [viewName]);
      return result.rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking if view exists: ${error.message}`);
    }
  }
}

module.exports = EngagementLog; 