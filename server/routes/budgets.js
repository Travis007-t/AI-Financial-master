const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取当前用户的所有预算
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [budgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ?',
      [userId]
    );
    
    res.json(budgets);
  } catch (error) {
    console.error('获取预算信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预算信息失败',
      error: error.message
    });
  }
});

// 获取指定类别的预算
router.get('/category/:category', async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.params.category;
    
    const [budgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    if (budgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该类别的预算'
      });
    }
    
    res.json(budgets[0]);
  } catch (error) {
    console.error('获取预算信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取预算信息失败',
      error: error.message
    });
  }
});

// 创建新预算
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount } = req.body;
    
    // 验证必填字段
    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        message: '类别和金额都是必填项'
      });
    }
    
    // 检查预算是否已存在
    const [existingBudgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    if (existingBudgets.length > 0) {
      return res.status(409).json({
        success: false,
        message: '该类别的预算已存在'
      });
    }
    
    // 插入预算
    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)',
      [userId, category, amount]
    );
    
    // 获取新创建的预算
    const [newBudget] = await pool.query(
      'SELECT * FROM budgets WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newBudget[0]);
  } catch (error) {
    console.error('创建预算错误:', error);
    res.status(500).json({
      success: false,
      message: '创建预算失败',
      error: error.message
    });
  }
});

// 更新预算
router.put('/category/:category', async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.params.category;
    const { amount } = req.body;
    
    // 验证必填字段
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: '金额是必填项'
      });
    }
    
    // 检查预算是否存在
    const [existingBudgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    if (existingBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该类别的预算'
      });
    }
    
    // 更新预算
    await pool.query(
      'UPDATE budgets SET amount = ? WHERE user_id = ? AND category = ?',
      [amount, userId, category]
    );
    
    // 获取更新后的预算
    const [updatedBudget] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    res.json(updatedBudget[0]);
  } catch (error) {
    console.error('更新预算错误:', error);
    res.status(500).json({
      success: false,
      message: '更新预算失败',
      error: error.message
    });
  }
});

// 删除预算
router.delete('/category/:category', async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.params.category;
    
    // 检查预算是否存在
    const [existingBudgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    if (existingBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该类别的预算'
      });
    }
    
    // 删除预算
    await pool.query(
      'DELETE FROM budgets WHERE user_id = ? AND category = ?',
      [userId, category]
    );
    
    res.json({
      success: true,
      message: '预算已删除'
    });
  } catch (error) {
    console.error('删除预算错误:', error);
    res.status(500).json({
      success: false,
      message: '删除预算失败',
      error: error.message
    });
  }
});

module.exports = router; 