const axios = require('axios');

// 创建一个自定义的 axios 实例
const instance = axios.create({
  timeout: 30000, // 30 秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = instance;