/**
 * Middleware para validar que el user_id esté presente en los headers
 * Este middleware asume que el API Gateway ya validó la autenticación
 */

const validateUserId = (req, res, next) => {
  // Obtener user_id desde headers (API Gateway puede usar diferentes nombres)
  const userId = req.headers['user-id'] || req.headers['x-user-id'] || req.headers['userid'];
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID is required in headers',
      error: 'MISSING_USER_ID'
    });
  }

  // Validar que sea un número válido
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum) || userIdNum <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid User ID format',
      error: 'INVALID_USER_ID'
    });
  }

  // Agregar user_id validado al request para uso posterior
  req.userId = userIdNum;
  next();
};

const optionalUserId = (req, res, next) => {
  const userId = req.headers['user-id'] || req.headers['x-user-id'] || req.headers['userid'];
  const userIdNum = parseInt(userId);
  if (userId && !isNaN(userIdNum) && userIdNum > 0) {
    req.userId = userIdNum;
  }
  next();
};

module.exports = {
  validateUserId,
  optionalUserId
}; 