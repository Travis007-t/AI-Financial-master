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
  background: linear-gradient(135deg, #1a1f35 0%, #2a3149 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.login-container::before {
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
    radial-gradient(2px 2px at 40px 60px, rgba(255,255,255,0.5) 50%, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 110px 90px, rgba(255,255,255,0.4) 50%, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 190px 150px, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: stars 20s linear infinite;
  opacity: 0.6;
  z-index: 1;
}

.login-container::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle at 50% 50%, 
    rgba(26, 31, 53, 0) 0%, 
    rgba(26, 31, 53, 0.4) 50%, 
    rgba(26, 31, 53, 0.8) 100%);
  z-index: 1;
}

@keyframes stars {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: rgba(42, 49, 73, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 40px;
  position: relative;
  z-index: 2;
  margin: 0 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  color: #fff;
  margin-bottom: 12px;
  font-weight: 600;
}

.login-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 500;
}

input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
  border-color: rgba(24, 144, 255, 0.5);
  outline: none;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
}

.has-error {
  border-color: #ff4d4f !important;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 5px;
}

.error-message.global {
  text-align: center;
  padding: 12px;
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: 8px;
  margin-bottom: 24px;
  color: #ff4d4f;
  font-size: 14px;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-button:hover {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.submit-button:disabled {
  background: rgba(24, 144, 255, 0.5);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.form-footer a {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.form-footer a:hover {
  text-decoration: underline;
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