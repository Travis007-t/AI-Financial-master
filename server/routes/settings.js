const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取当前用户的设置
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [settings] = await pool.query(
      'SELECT * FROM settings WHERE user_id = ?',
      [userId]
    );
    
    if (settings.length === 0) {
      // 如果没有设置，创建默认设置
      await pool.query(
        'INSERT INTO settings (user_id, currency, theme) VALUES (?, ?, ?)',
        [userId, '¥', 'light']
      );
      
      return res.json({
        id: null,
        user_id: userId,
        currency: '¥',
        theme: 'light'
      });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('获取设置错误:', error);
    res.status(500).json({
      success: false,
      message: '获取设置失败',
      error: error.message
    });
  }
});

// 更新用户设置
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency, theme } = req.body;
    
    // 检查设置是否存在
    const [settings] = await pool.query(
      'SELECT * FROM settings WHERE user_id = ?',
      [userId]
    );
    
    if (settings.length === 0) {
      // 如果没有设置，创建新设置
      const [result] = await pool.query(
        'INSERT INTO settings (user_id, currency, theme) VALUES (?, ?, ?)',
        [userId, currency || '¥', theme || 'light']
      );
      
      const [newSettings] = await pool.query(
        'SELECT * FROM settings WHERE id = ?',
        [result.insertId]
      );
      
      return res.json(newSettings[0]);
    }
    
    // 构建更新对象
    const updates = {};
    if (currency !== undefined) updates.currency = currency;
    if (theme !== undefined) updates.theme = theme;
    
    // 如果没有更新内容
    if (Object.keys(updates).length === 0) {
      return res.json(settings[0]);
    }
    
    // 构建SQL更新语句
    const updateFields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const updateValues = Object.values(updates);
    updateValues.push(userId);
    
    // 更新设置
    await pool.query(
      `UPDATE settings SET ${updateFields} WHERE user_id = ?`,
      updateValues
    );
    
    // 获取更新后的设置
    const [updatedSettings] = await pool.query(
      'SELECT * FROM settings WHERE user_id = ?',
      [userId]
    );
    
    res.json(updatedSettings[0]);
  } catch (error) {
    console.error('更新设置错误:', error);
    res.status(500).json({
      success: false,
      message: '更新设置失败',
      error: error.message
    });
  }
});

module.exports = router; 