<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import api from '../services/api'

const router = useRouter()
const settingsStore = useSettingsStore()

const formMode = ref('login') 
const isLoading = ref(false)
const errorMessage = ref('')

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 表单验证错误
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 切换表单模式
const toggleFormMode = () => {
  formMode.value = formMode.value === 'login' ? 'register' : 'login'
  errorMessage.value = ''
}

// 验证登录表单
const validateLoginForm = () => {
  let isValid = true
  errors.username = ''
  errors.password = ''
  
  if (!loginForm.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  }
  
  if (!loginForm.password) {
    errors.password = '请输入密码'
    isValid = false
  }
  
  return isValid
}

// 验证注册表单
const validateRegisterForm = () => {
  let isValid = true
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.email = ''
  
  if (!registerForm.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  }
  
  if (!registerForm.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (registerForm.password.length < 6) {
    errors.password = '密码长度至少为6位'
    isValid = false
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email.trim()) {
    errors.email = '请输入邮箱'
    isValid = false
  } else if (!emailRegex.test(registerForm.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }
  
  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateLoginForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await api.auth.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 存储token
    localStorage.setItem('token', response.data.token)
    
    // 更新用户信息
    settingsStore.login(response.data.user.username)
    
    // 重定向到首页
    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!validateRegisterForm()) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    await api.auth.register({
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email
    })
    
    // 注册成功后切换到登录表单
    formMode.value = 'login'
    loginForm.username = registerForm.username
    loginForm.password = ''
    
    // 提示用户注册成功
    errorMessage.value = '注册成功，请登录'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '注册失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧品牌介绍面板 -->
    <div class="side-panel left-panel">
      <div class="brand-content">
        <h2 class="brand-title">使用 -PayNex- 开启您的钱包之旅</h2>
        <p class="brand-subtitle">智能掌控财富，AI钱包与您同行</p>
      </div>
    </div>

    <!-- 中间登录框 -->
    <div class="login-box">
      <div class="login-header">
        <h1>{{ formMode === 'login' ? '欢迎回来' : '创建新账户' }}</h1>
        <p>个人财务管理系统</p>
      </div>
      
      <div v-if="errorMessage" class="error-message global">
        {{ errorMessage }}
      </div>
      
      <!-- 登录表单 -->
      <form v-if="formMode === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="login-username">用户名</label>
          <input 
            id="login-username"
            v-model="loginForm.username"
            type="text"
            :class="{ 'has-error': errors.username }"
            placeholder="请输入用户名"
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="login-password">密码</label>
          <input 
            id="login-password"
            v-model="loginForm.password"
            type="password"
            :class="{ 'has-error': errors.password }"
            placeholder="请输入密码"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="register-username">用户名</label>
          <input 
            id="register-username"
            v-model="registerForm.username"
            type="text"
            :class="{ 'has-error': errors.username }"
            placeholder="请输入用户名"
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>
        
        <div class="form-group">
          <label for="register-email">邮箱</label>
          <input 
            id="register-email"
            v-model="registerForm.email"
            type="email"
            :class="{ 'has-error': errors.email }"
            placeholder="请输入邮箱"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>
        
        <div class="form-group">
          <label for="register-password">密码</label>
          <input 
            id="register-password"
            v-model="registerForm.password"
            type="password"
            :class="{ 'has-error': errors.password }"
            placeholder="请输入密码"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>
        
        <div class="form-group">
          <label for="register-confirm-password">确认密码</label>
          <input 
            id="register-confirm-password"
            v-model="registerForm.confirmPassword"
            type="password"
            :class="{ 'has-error': errors.confirmPassword }"
            placeholder="请再次输入密码"
          />
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="form-footer">
        <p v-if="formMode === 'login'">
          还没有账户？<a href="#" @click.prevent="toggleFormMode">立即注册</a>
        </p>
        <p v-else>
          已有账户？<a href="#" @click.prevent="toggleFormMode">立即登录</a>
        </p>
      </div>
    </div>

    <!-- 右侧Logo面板 -->
    <div class="side-panel right-panel">
      <div class="logo-placeholder">
        <div class="temp-logo">PayNex</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加一个全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f1b3a 0%, #1a237e 50%, #283593 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 数字流动效果背景 */
.login-container::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background-image: 
    linear-gradient(rgba(24, 144, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(24, 144, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: flow 20s linear infinite;
  z-index: 1;
}

/* 星星效果 */
.login-container::after {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background-image: 
    radial-gradient(2px 2px at 40px 60px, #fff 50%, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 20px 50px, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 30px 100px, rgba(255,255,255,0.6) 50%, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 60px, rgba(255,255,255,0.5) 50%, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: stars 30s linear infinite;
  opacity: 0.4;
  z-index: 1;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 40px;
  position: relative;
  z-index: 2;
  margin: 0 20px;
  backdrop-filter: blur(20px);
  animation: boxAppear 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  font-weight: 600;
}

.login-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 500;
  transform: translateY(0);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 14px 20px;
  font-size: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
  border-color: #60a5fa;
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.2);
}

.form-group::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  z-index: 0;
}

.form-group:focus-within::after {
  transform: scaleX(1);
}

.form-group:focus-within label {
  color: #60a5fa;
  transform: translateY(-2px);
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.3),
    0 2px 6px rgba(59, 130, 246, 0.2);
}

.submit-button:hover::before {
  width: 300px;
  height: 300px;
}

.submit-button:active {
  transform: translateY(1px);
}

.submit-button:disabled {
  background: rgba(59, 130, 246, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #f87171;
  font-size: 13px;
  margin-top: 6px;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message.global {
  text-align: center;
  padding: 12px 16px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.form-footer a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.form-footer a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: #60a5fa;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.form-footer a:hover {
  color: #93c5fd;
}

.form-footer a:hover::after {
  transform: scaleX(1);
}

@keyframes flow {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-50%) rotate(5deg);
  }
}

@keyframes stars {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes boxAppear {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  10%, 90% {
    transform: translateX(-1px);
  }
  20%, 80% {
    transform: translateX(2px);
  }
  30%, 50%, 70% {
    transform: translateX(-4px);
  }
  40%, 60% {
    transform: translateX(4px);
  }
}

/* 添加加载动画 */
.loading {
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin-left: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 侧边面板基础样式 */
.side-panel {
  position: fixed;
  height: 100vh;
  width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 40px;
  background: transparent;
}

/* 左侧面板 */
.left-panel {
  left: 15%;
  opacity: 0;
  transform: translateX(-50px);
  animation: slideInLeft 1s ease-out forwards;
  animation-delay: 0.5s;
}

/* 右侧面板 */
.right-panel {
  right: 15%;
  opacity: 0;
  transform: translateX(50px);
  animation: slideInRight 1s ease-out forwards;
  animation-delay: 0.5s;
}

/* 品牌内容样式 */
.brand-content {
  text-align: left;
}

.brand-title {
  font-size: 2.5em;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.3;
  color: #fff;
  white-space: pre-line;
}

.brand-subtitle {
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Logo占位样式 */
.logo-placeholder {
  text-align: center;
}

.temp-logo {
  font-size: 3em;
  font-weight: bold;
  color: white;
}

/* 动画关键帧 */
@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式布局调整 */
@media (max-width: 1600px) {
  .left-panel {
    left: 10%;
  }
  .right-panel {
    right: 10%;
  }
}

@media (max-width: 1400px) {
  .left-panel {
    left: 5%;
  }
  .right-panel {
    right: 5%;
  }
}

@media (max-width: 1200px) {
  .side-panel {
    display: none;
  }
}
</style> 