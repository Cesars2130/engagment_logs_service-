const EngagementLogService = require('../src/services/EngagementLogService');

// Mock del modelo
jest.mock('../src/models/EngagementLog');

describe('EngagementLogService', () => {
  let service;
  let mockModel;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear mock del modelo
    mockModel = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      getEngagementStats: jest.fn(),
      getViewEngagementStats: jest.fn(),
      getOrCreateViewId: jest.fn(),
      getAvailableViews: jest.fn(),
      createView: jest.fn(),
      viewExists: jest.fn()
    };

    // Mock del constructor del modelo
    const EngagementLog = require('../src/models/EngagementLog');
    EngagementLog.mockImplementation(() => mockModel);

    service = new EngagementLogService();
  });

  describe('createEngagementLog', () => {
    it('should create engagement log with valid data', async () => {
      const validData = {
        view_name: 'dashboard',
        duration_seconds: 300
      };

      const userId = 123;

      const expectedResult = {
        id: 1,
        user_id: userId,
        ...validData,
        viewed_at: expect.any(Date)
      };

      mockModel.create.mockResolvedValue(expectedResult);

      const result = await service.createEngagementLog(validData, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
      expect(mockModel.create).toHaveBeenCalledWith(expect.objectContaining({
        ...validData,
        user_id: userId
      }));
    });

    it('should throw error for invalid user_id', async () => {
      const validData = {
        view_name: 'dashboard',
        duration_seconds: 300
      };

      const invalidUserId = -1;

      await expect(service.createEngagementLog(validData, invalidUserId))
        .rejects
        .toThrow('Invalid user ID from headers');
    });

    it('should throw error for missing required fields', async () => {
      const invalidData = {
        // missing view_name and duration_seconds
      };

      const userId = 123;

      await expect(service.createEngagementLog(invalidData, userId))
        .rejects
        .toThrow('Validation error');
    });

    it('should throw error for duration too long', async () => {
      const invalidData = {
        view_name: 'dashboard',
        duration_seconds: 100000 // More than 24 hours
      };

      const userId = 123;

      await expect(service.createEngagementLog(invalidData, userId))
        .rejects
        .toThrow('Validation error');
    });
  });

  describe('getEngagementLogsByUser', () => {
    it('should return engagement logs for valid user', async () => {
      const userId = 123;
      const mockLogs = [
        { id: 1, user_id: userId, view_name: 'dashboard', duration_seconds: 300 },
        { id: 2, user_id: userId, view_name: 'profile', duration_seconds: 150 }
      ];

      mockModel.findByUserId.mockResolvedValue(mockLogs);

      const result = await service.getEngagementLogsByUser(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogs);
      expect(mockModel.findByUserId).toHaveBeenCalledWith(userId, 100, 0);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getEngagementLogsByUser('invalid'))
        .rejects
        .toThrow('Invalid user ID');
    });

    it('should throw error for negative user ID', async () => {
      await expect(service.getEngagementLogsByUser(-1))
        .rejects
        .toThrow('Invalid user ID');
    });
  });

  describe('getAllEngagementLogs', () => {
    it('should return all engagement logs with pagination', async () => {
      const mockLogs = [
        { id: 1, user_id: 123, view_name: 'dashboard', duration_seconds: 300 },
        { id: 2, user_id: 456, view_name: 'profile', duration_seconds: 150 }
      ];

      mockModel.findAll.mockResolvedValue(mockLogs);

      const result = await service.getAllEngagementLogs(50, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLogs);
      expect(mockModel.findAll).toHaveBeenCalledWith(50, 10);
    });
  });

  describe('getEngagementStats', () => {
    it('should return engagement stats for valid user', async () => {
      const userId = 123;
      const mockStats = {
        total_sessions: 10,
        total_duration: 3000,
        avg_duration: 300,
        unique_views: 5,
        last_activity: new Date()
      };

      mockModel.getEngagementStats.mockResolvedValue(mockStats);

      const result = await service.getEngagementStats(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(mockModel.getEngagementStats).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getEngagementStats('invalid'))
        .rejects
        .toThrow('Invalid user ID');
    });
  });

  describe('getViewEngagementStats', () => {
    it('should return view engagement statistics', async () => {
      const mockStats = [
        { view_name: 'dashboard', total_views: 100, avg_duration: 300 },
        { view_name: 'profile', total_views: 50, avg_duration: 150 }
      ];

      mockModel.getViewEngagementStats.mockResolvedValue(mockStats);

      const result = await service.getViewEngagementStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(mockModel.getViewEngagementStats).toHaveBeenCalled();
    });
  });

  describe('getEngagementAnalytics', () => {
    it('should return engagement analytics for valid user', async () => {
      const userId = 123;
      const days = 30;
      
      const mockLogs = [
        { 
          id: 1, 
          user_id: userId, 
          view_name: 'dashboard', 
          duration_seconds: 300,
          viewed_at: new Date()
        }
      ];

      mockModel.findByUserId.mockResolvedValue(mockLogs);

      const result = await service.getEngagementAnalytics(userId, days);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('total_sessions');
      expect(result.data).toHaveProperty('total_duration');
      expect(result.data).toHaveProperty('avg_duration');
      expect(result.data).toHaveProperty('unique_views');
      expect(result.data).toHaveProperty('daily_engagement');
      expect(result.data).toHaveProperty('engagement_trend');
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getEngagementAnalytics('invalid', 30))
        .rejects
        .toThrow('Invalid user ID');
    });
  });

  describe('calculateDailyEngagement', () => {
    it('should calculate daily engagement correctly', () => {
      const logs = [
        {
          viewed_at: new Date('2024-01-15T10:00:00Z'),
          duration_seconds: 300,
          view_name: 'dashboard'
        },
        {
          viewed_at: new Date('2024-01-15T14:00:00Z'),
          duration_seconds: 150,
          view_name: 'profile'
        }
      ];

      const result = service.calculateDailyEngagement(logs, 7);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      
      // Verificar que el día con datos tiene los valores correctos
      const dayWithData = result.find(day => day.date === '2024-01-15');
      expect(dayWithData.sessions).toBe(2);
      expect(dayWithData.duration).toBe(450);
      expect(dayWithData.unique_views).toBe(2);
      expect(dayWithData.avg_duration).toBe(225);
    });
  });

  describe('calculateEngagementTrend', () => {
    it('should return increasing trend for growing engagement', () => {
      const logs = [
        { viewed_at: new Date('2024-01-01'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-02'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-08'), duration_seconds: 200 },
        { viewed_at: new Date('2024-01-09'), duration_seconds: 200 }
      ];

      const result = service.calculateEngagementTrend(logs);
      expect(result).toBe('increasing');
    });

    it('should return decreasing trend for declining engagement', () => {
      const logs = [
        { viewed_at: new Date('2024-01-01'), duration_seconds: 200 },
        { viewed_at: new Date('2024-01-02'), duration_seconds: 200 },
        { viewed_at: new Date('2024-01-08'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-09'), duration_seconds: 100 }
      ];

      const result = service.calculateEngagementTrend(logs);
      expect(result).toBe('decreasing');
    });

    it('should return stable trend for consistent engagement', () => {
      const logs = [
        { viewed_at: new Date('2024-01-01'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-02'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-08'), duration_seconds: 100 },
        { viewed_at: new Date('2024-01-09'), duration_seconds: 100 }
      ];

      const result = service.calculateEngagementTrend(logs);
      expect(result).toBe('stable');
    });

    it('should return insufficient_data for less than 2 weeks', () => {
      const logs = [
        { viewed_at: new Date('2024-01-01'), duration_seconds: 100 }
      ];

      const result = service.calculateEngagementTrend(logs);
      expect(result).toBe('insufficient_data');
    });
  });

  describe('getAvailableViews', () => {
    it('should return all available views', async () => {
      const mockViews = [
        { id: 1, view_name: 'dashboard' },
        { id: 2, view_name: 'profile' },
        { id: 3, view_name: 'training' }
      ];

      mockModel.getAvailableViews.mockResolvedValue(mockViews);

      const result = await service.getAvailableViews();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockViews);
      expect(mockModel.getAvailableViews).toHaveBeenCalled();
    });
  });

  describe('createView', () => {
    it('should create a new view successfully', async () => {
      const viewName = 'new_view';
      const mockView = { id: 4, view_name: viewName };

      mockModel.viewExists.mockResolvedValue(false);
      mockModel.createView.mockResolvedValue(mockView);

      const result = await service.createView(viewName);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockView);
      expect(mockModel.viewExists).toHaveBeenCalledWith(viewName);
      expect(mockModel.createView).toHaveBeenCalledWith(viewName);
    });

    it('should throw error if view already exists', async () => {
      const viewName = 'existing_view';

      mockModel.viewExists.mockResolvedValue(true);

      await expect(service.createView(viewName))
        .rejects
        .toThrow('View "existing_view" already exists');
    });

    it('should throw error for empty view name', async () => {
      await expect(service.createView(''))
        .rejects
        .toThrow('View name is required and must be a non-empty string');
    });

    it('should throw error for null view name', async () => {
      await expect(service.createView(null))
        .rejects
        .toThrow('View name is required and must be a non-empty string');
    });
  });

  describe('viewExists', () => {
    it('should return true for existing view', async () => {
      const viewName = 'dashboard';

      mockModel.viewExists.mockResolvedValue(true);

      const result = await service.viewExists(viewName);

      expect(result.success).toBe(true);
      expect(result.data.exists).toBe(true);
      expect(result.data.view_name).toBe(viewName);
      expect(mockModel.viewExists).toHaveBeenCalledWith(viewName);
    });

    it('should return false for non-existing view', async () => {
      const viewName = 'non_existing_view';

      mockModel.viewExists.mockResolvedValue(false);

      const result = await service.viewExists(viewName);

      expect(result.success).toBe(true);
      expect(result.data.exists).toBe(false);
      expect(result.data.view_name).toBe(viewName);
      expect(mockModel.viewExists).toHaveBeenCalledWith(viewName);
    });
  });
}); 