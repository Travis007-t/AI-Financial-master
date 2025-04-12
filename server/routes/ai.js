const express = require('express');
const router = express.Router();
const axios = require('../config/axios');

// DeepSeek API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 处理 AI 聊天请求
router.post('/chat', async (req, res) => {
  try {
    const { type, message, data } = req.body;
    
    if (!message && !data) {
      return res.status(400).json({
        success: false,
        message: '消息或数据不能为空'
      });
    }
    
    let prompt = '';
    
    if (type === 'analysis') {
      // 财务分析模式
      prompt = `请分析以下财务数据并提供建议：
      
交易记录：
${JSON.stringify(data?.transactions || [], null, 2)}

预算信息：
${JSON.stringify(data?.budgets || [], null, 2)}

请提供：
1. 消费趋势分析
2. 预算执行情况
3. 潜在的节省机会
4. 投资和储蓄建议
5. 风险预警
`;
    } else {
      // 普通聊天模式
      prompt = `用户问题：${message}

用户财务数据：
交易记录：
${JSON.stringify(data?.transactions || [], null, 2)}

预算信息：
${JSON.stringify(data?.budgets || [], null, 2)}

请根据以上信息回答用户的问题。`;
    }
    
    console.log('发送请求到 DeepSeek API:', {
      url: DEEPSEEK_API_URL,
      prompt: prompt
    });
    
    // 调用 DeepSeek API
    const response = await axios({
      method: 'post',
      url: DEEPSEEK_API_URL,
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一个专业的财务顾问助手，可以帮助用户解答财务相关的问题。请用中文回答，回答要专业，亦可幽默风趣，亦可严肃认真，不可回答呆板，也可用抽象的话语回复。如果涉及到具体数字，请给出计算过程。

你的主要职责包括：
1. 回答用户关于财务管理的具体问题
2. 分析用户的消费模式和预算执行情况
3. 提供个性化的财务建议和优化方案
4. 帮助用户制定合理的预算计划
5. 识别潜在的财务风险并提供预警

在分析用户数据时，请关注：
- 消费趋势和模式
- 预算执行情况
- 潜在的节省机会
- 投资和储蓄建议
- 风险预警

请确保你的回答：
- 专业且易于理解
- 包含具体的建议和行动方案
- 考虑用户的个人情况
- 提供可执行的改进建议`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      }
    });
    
    console.log('DeepSeek API 响应:', response.data);
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      const aiResponse = response.data.choices[0].message.content;
      res.json({
        success: true,
        response: aiResponse
      });
    } else {
      console.error('API 响应格式异常:', response.data);
      throw new Error('API 返回格式不正确');
    }
  } catch (error) {
    console.error('AI 聊天错误:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: DEEPSEEK_API_URL
    });
    
    res.status(500).json({
      success: false,
      message: `AI 服务暂时不可用: ${error.message}`
    });
  }
});

module.exports = router; 