const { validateUserId, optionalUserId } = require('../src/middleware/auth');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateUserId', () => {
    it('should call next() when valid user-id is present', () => {
      mockReq.headers['user-id'] = '123';
      
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(123);
    });

    it('should call next() when valid x-user-id is present', () => {
      mockReq.headers['x-user-id'] = '456';
      
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(456);
    });

    it('should return 401 when no user-id is present', () => {
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required in headers',
        error: 'MISSING_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when user-id is not a valid number', () => {
      mockReq.headers['user-id'] = 'invalid';
      
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid User ID format',
        error: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when user-id is zero', () => {
      mockReq.headers['user-id'] = '0';
      
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid User ID format',
        error: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when user-id is negative', () => {
      mockReq.headers['user-id'] = '-1';
      
      validateUserId(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid User ID format',
        error: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalUserId', () => {
    it('should set userId when valid user-id is present', () => {
      mockReq.headers['user-id'] = '123';
      
      optionalUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(123);
    });

    it('should not set userId when no user-id is present', () => {
      optionalUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBeUndefined();
    });

    it('should not set userId when user-id is invalid', () => {
      mockReq.headers['user-id'] = 'invalid';
      
      optionalUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBeUndefined();
    });

    it('should call next() regardless of user-id presence', () => {
      optionalUserId(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });
}); 