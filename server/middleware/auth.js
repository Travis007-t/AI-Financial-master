const jwt = require('jsonwebtoken');

// 验证JWT令牌的中间件
const authenticateToken = (req, res, next) => {
  // 从请求头获取Authorization字段
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN格式
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }
  
  try {
    // 验证令牌
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '无效或过期的令牌'
    });
  }
};

module.exports = authenticateToken; 