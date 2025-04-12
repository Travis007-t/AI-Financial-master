const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// 获取当前用户的所有交易记录
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    
    res.json(transactions);
  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取交易记录失败',
      error: error.message
    });
  }
});

// 获取特定交易记录
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在'
      });
    }
    
    res.json(transactions[0]);
  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取交易记录失败',
      error: error.message
    });
  }
});

// 添加新交易记录
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, category, amount, date, note } = req.body;
    
    // 验证必填字段
    if (!type || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: '类型、类别和金额都是必填项'
      });
    }
    
    // 插入交易记录
    const [result] = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, category, amount, date, note) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, category, amount, date || new Date().toISOString().slice(0, 10), note || null]
    );
    
    // 获取新创建的交易记录
    const [newTransaction] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newTransaction[0]);
  } catch (error) {
    console.error('添加交易记录错误:', error);
    res.status(500).json({
      success: false,
      message: '添加交易记录失败',
      error: error.message
    });
  }
});

// 更新交易记录
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { type, category, amount, date, note } = req.body;
    
    // 验证必填字段
    if (!type || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: '类型、类别和金额都是必填项'
      });
    }
    
    // 检查交易记录是否存在且属于当前用户
    const [existingTransactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    
    if (existingTransactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在或无权访问'
      });
    }
    
    // 更新交易记录
    await pool.query(
      `UPDATE transactions 
       SET type = ?, category = ?, amount = ?, date = ?, note = ? 
       WHERE id = ? AND user_id = ?`,
      [type, category, amount, date, note, transactionId, userId]
    );
    
    // 获取更新后的交易记录
    const [updatedTransaction] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    res.json(updatedTransaction[0]);
  } catch (error) {
    console.error('更新交易记录错误:', error);
    res.status(500).json({
      success: false,
      message: '更新交易记录失败',
      error: error.message
    });
  }
});

// 删除交易记录
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    
    // 检查交易记录是否存在且属于当前用户
    const [existingTransactions] = await pool.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    
    if (existingTransactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: '交易记录不存在或无权访问'
      });
    }
    
    // 删除交易记录
    await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    );
    
    res.json({
      success: true,
      message: '交易记录已删除'
    });
  } catch (error) {
    console.error('删除交易记录错误:', error);
    res.status(500).json({
      success: false,
      message: '删除交易记录失败',
      error: error.message
    });
  }
});

module.exports = router; 