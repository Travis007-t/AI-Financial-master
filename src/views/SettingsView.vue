<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import { useTransactionStore } from '../stores/transactions'
import { useBudgetStore } from '../stores/budget'

const router = useRouter()
const settingsStore = useSettingsStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()

const userName = ref(settingsStore.getUserName)
const currency = ref(settingsStore.getCurrency)
const theme = ref(settingsStore.getTheme)

// 货币选项
const currencyOptions = [
  { label: '人民币 (¥)', value: '¥' },
  { label: '美元 ($)', value: '$' },
  { label: '欧元 (€)', value: '€' },
  { label: '英镑 (£)', value: '£' },
  { label: '日元 (¥)', value: '¥' }
]

// 主题选项
const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
]

// 保存设置
const saveSettings = () => {
  settingsStore.updateSettings({
    userName: userName.value,
    currency: currency.value,
    theme: theme.value
  })
  
  showSavedMessage()
}

// 登录
const login = () => {
  if (userName.value.trim()) {
    settingsStore.login(userName.value)
    showSavedMessage()
  }
}

// 登出
const logout = () => {
  // 清除状态
  settingsStore.logout()
  
  // 重置各个store的状态
  transactionStore.resetState && transactionStore.resetState()
  budgetStore.resetState && budgetStore.resetState()
  
  // 重置表单
  userName.value = '用户'
  
  // 重定向到登录页面
  router.push('/login')
}

// 导出数据
const exportData = () => {
  const dataToExport = {
    transactions: transactionStore.transactions,
    settings: settingsStore.settings
  }
  
  const dataStr = JSON.stringify(dataToExport, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
  
  const exportFileName = `personal-finance-data-${new Date().toISOString().slice(0, 10)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileName)
  linkElement.click()
  
  showExportMessage()
}

// 显示保存成功消息
const savedMessageVisible = ref(false)
const showSavedMessage = () => {
  savedMessageVisible.value = true
  setTimeout(() => {
    savedMessageVisible.value = false
  }, 3000)
}

// 显示导出成功消息
const exportMessageVisible = ref(false)
const showExportMessage = () => {
  exportMessageVisible.value = true
  setTimeout(() => {
    exportMessageVisible.value = false
  }, 3000)
}
</script>

<template>
  <div class="settings-view">
    <h1>设置</h1>
    
    <div class="settings-section">
      <h2>用户设置</h2>
      
      <div class="setting-item">
        <label for="user-name">用户名</label>
        <input id="user-name" v-model="userName" type="text" placeholder="输入您的名字" />
      </div>
      
      <div class="actions">
        <button v-if="!settingsStore.isLoggedIn" @click="login" class="primary-button">
          登录
        </button>
        <button v-else @click="logout" class="secondary-button">
          退出登录
        </button>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>显示设置</h2>
      
      <div class="setting-item">
        <label for="currency">货币单位</label>
        <select id="currency" v-model="currency">
          <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="setting-item">
        <label for="theme">主题</label>
        <select id="theme" v-model="theme">
          <option v-for="option in themeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="actions">
        <button @click="saveSettings" class="primary-button">
          保存设置
        </button>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>数据管理</h2>
      
      <div class="setting-item">
        <p>导出您的所有财务数据进行备份</p>
        <button @click="exportData" class="primary-button">
          导出数据
        </button>
      </div>
    </div>
    
    <!-- 通知消息 -->
    <div v-if="savedMessageVisible" class="notification success">
      设置已保存
    </div>
    
    <div v-if="exportMessageVisible" class="notification success">
      数据已导出
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  width: 900px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #444;
}

.settings-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  max-width: 1200px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.setting-item input,
.setting-item select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
}

.primary-button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.primary-button:hover {
  background-color: #40a9ff;
}

.secondary-button {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #d9d9d9;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.secondary-button:hover {
  background-color: #e6e6e6;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.success {
  background-color: #52c41a;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 