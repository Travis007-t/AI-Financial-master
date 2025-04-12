<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import api from '../services/api'
import lottie from 'lottie-web'

const settingsStore = useSettingsStore()
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const isOpen = ref(false)
const lastAnalysisTime = ref(null)
const robotAnimation = ref(null)
const talkingInterval = ref(null)
const randomThoughts = [
  '要记录今天的支出哦~',
  '要合理规划预算呢...',
  '让我帮你分析一下财务状况吧！',
  '记得检查本月的预算执行情况~',
  '有任何理财问题都可以问我哦',
  '要养成记账的好习惯呢...',
  '需要我帮你分析支出吗？'
]

const currentThought = ref('')
const showBubble = ref(false)
const messagesContainer = ref(null)

// 初始化机器人动画
onMounted(() => {
  const animationPath = 'https://lottie.host/70c75fbb-42c9-41b4-82cf-08b4693b21d4/UVNsevSytm.json'
  
  // 主按钮动画
  robotAnimation.value = lottie.loadAnimation({
    container: document.getElementById('robot-animation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationPath
  })

  // 欢迎界面动画
  lottie.loadAnimation({
    container: document.getElementById('robot-animation-welcome'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationPath
  })

  // 思考状态动画
  lottie.loadAnimation({
    container: document.getElementById('robot-animation-thinking'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationPath
  })

  // 聊天窗口标题动画
  lottie.loadAnimation({
    container: document.getElementById('robot-animation-large'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationPath
  })


  startRandomThoughts()
})

// 自言自语功能
const startRandomThoughts = () => {
  if (talkingInterval.value) return
  
  // 立即显示第一条消息
  showNewThought()
  
  talkingInterval.value = setInterval(() => {
    if (!isOpen.value) { 
      showNewThought()
    }
  }, 8000)  // 每8秒说一句话
}

const showNewThought = () => {
  const thought = randomThoughts[Math.floor(Math.random() * randomThoughts.length)]
  currentThought.value = thought
  showBubble.value = true
  
  // 5秒后隐藏气泡
  setTimeout(() => {
    showBubble.value = false
  }, 5000)
}

const stopRandomThoughts = () => {
  if (talkingInterval.value) {
    clearInterval(talkingInterval.value)
    talkingInterval.value = null
  }
  showBubble.value = false
}

// 监听加载状态，改变机器人动画
watch(isLoading, (newValue) => {
  if (robotAnimation.value) {
    if (newValue) {
      // 思考动画
      robotAnimation.value.setSpeed(2) 
      robotAnimation.value.play()
    } else {
      // 待机动画
      robotAnimation.value.setSpeed(1)
      robotAnimation.value.play()
    }
  }
})

// 获取用户财务数据
const getUserFinancialData = async () => {
  try {
    const [transactions, budgets] = await Promise.all([
      api.transactions.getAll(),
      api.budgets.getAll()
    ])
    
    return {
      transactions: transactions?.data || [],
      budgets: budgets?.data || []
    }
  } catch (error) {
    console.error('获取财务数据失败:', error)
    return {
      transactions: [],
      budgets: []
    }
  }
}

// 自动分析财务数据
const analyzeFinancialData = async () => {
  if (isLoading.value) return
  
  const now = new Date()
  if (lastAnalysisTime.value && (now - lastAnalysisTime.value) < 3600000) return
  
  const data = await getUserFinancialData()
  if (!data) return
  
  isLoading.value = true
  try {
    const response = await api.ai.chat(JSON.stringify({
      type: 'analysis',
      data: data
    }))
    
    if (response.data.success && response.data.response) {
      messages.value.push({
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      })
      lastAnalysisTime.value = now
    }
  } catch (error) {
    console.error('分析财务数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 监听聊天窗口打开状态
watch(isOpen, (newValue) => {
  if (newValue) {
    analyzeFinancialData()
    stopRandomThoughts() 
  } else {
    startRandomThoughts()  
  }
})

// 切换聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// 滚动到最新消息
const scrollToBottom = () => {
  if (messagesContainer.value) {
    setTimeout(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }, 100)
  }
}

// 监听消息列表变化
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  })
  
  const userMessage = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true
  scrollToBottom() 
  
  try {
    // 获取用户财务数据
    const financialData = await getUserFinancialData()
    
    // 调用后端 AI API
    const response = await api.ai.chat(JSON.stringify({
      type: 'chat',
      message: userMessage,
      data: financialData
    }))
    
    if (response?.data) {
      if (response.data.success && response.data.response) {
        messages.value.push({
          type: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        })
        scrollToBottom()  
      } else if (response.data.error) {
        throw new Error(response.data.error)
      } else {
        throw new Error('服务器返回格式错误')
      }
    } else {
      throw new Error('服务器响应为空')
    }
  } catch (error) {
    console.error('AI 响应错误:', error)
    console.error('错误详情:', error.response?.data || error.message)
    
    messages.value.push({
      type: 'error',
      content: error.response?.data?.message || error.message || '抱歉，我现在无法回答。请稍后再试。',
      timestamp: new Date()
    })
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

// 清空聊天记录
const clearChat = () => {
  messages.value = []
}
</script>

<template>
  <div class="ai-assistant" :class="{ 'is-open': isOpen }">
    <!-- 思考气泡 -->
    <Transition name="bubble">
      <div v-if="showBubble && !isOpen" class="thought-bubble">
        {{ currentThought }}
      </div>
    </Transition>

    <!-- 聊天窗口切换按钮 -->
    <button class="toggle-button" @click="toggleChat">
      <div id="robot-animation" class="robot-icon"></div>
      <span class="label">AI 助手</span>
    </button>
    
    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <div class="header-left">
          <div id="robot-animation-large" class="robot-icon-large"></div>
          <h3>AI 财务助手</h3>
        </div>
        <button class="clear-button" @click="clearChat">清空对话</button>
      </div>
      
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="robot-welcome">
            <div id="robot-animation-welcome" class="robot-icon-welcome"></div>
            <p>你好！我是你的 AI 财务助手，有什么可以帮你的吗？</p>
          </div>
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.type"
        >
          <div class="message-content" v-html="message.content.replace(/\n/g, '<br>')"></div>
          <div class="message-time">
            {{ new Date(message.timestamp).toLocaleTimeString() }}
          </div>
        </div>
        <div v-if="isLoading" class="message assistant loading">
          <div class="message-content">
            <div class="thinking">
              <div id="robot-animation-thinking" class="robot-icon-thinking"></div>
              <span class="typing-indicator">思考中...</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入框 -->
      <div class="input-container">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入你的问题..."
          @keyup.enter="sendMessage"
        />
        <button
          class="send-button"
          @click="sendMessage"
          :disabled="isLoading || !inputMessage.trim()"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 100px;  
  height: 100px;  
}

.toggle-button {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: none;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  width: 100px; 
  height: 100px;  
}

.toggle-button:hover {
  transform: translateY(-3px) scale(1.1);
}

.toggle-button .label {
  display: none;
}

.robot-icon {
  width: 100px;  
  height: 100px;  
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}

.chat-window {
  position: absolute;
  bottom: 110px; 
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.clear-button {
  padding: 4px 8px;
  font-size: 12px;
  color: #666;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.message {
  margin-bottom: 16px;
  max-width: 80%;
  opacity: 0;
  transform: translateY(20px);
  animation: messageAppear 0.3s ease forwards;
}

@keyframes messageAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  margin-left: auto;
}

.message-content {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.user .message-content {
  background-color: #1890ff;
  color: white;
}

.assistant .message-content {
  background-color: #f5f5f5;
  color: #333;
}

.error .message-content {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.input-container {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.send-button {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px;
}

.typing-indicator {
  display: inline-block;
  animation: typing 1s infinite;
}

@keyframes typing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.robot-icon-large {
  width: 40px;
  height: 40px;
}

.robot-icon-welcome {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.robot-icon-thinking {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.robot-welcome {
  text-align: center;
  padding: 20px;
}

.robot-welcome p {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.thinking {
  display: flex;
  align-items: center;
  justify-content: center;
}

.thought-bubble {
  position: absolute;
  bottom: 60px;
  right: 120px;
  background: white;
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 15px;
  color: #333;
  max-width: 280px;    
  min-width: 180px;    
  white-space: normal;  
  word-wrap: break-word; 
  line-height: 1.5;     
  z-index: 999;
}

/* 添加新的三角形箭头 */
.thought-bubble::before {
  content: '';
  position: absolute;
  top: 60%;
  right: -12px;       
  height: 0;
  border-style: solid;
  border-width: 12px 0 12px 16px; 
  border-color: transparent transparent transparent white;
  transform: translateY(-50%);
  filter: drop-shadow(2px 1px 2px rgba(0, 0, 0, 0.1));
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.8) translate(-20px, 20px);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: scale(1) translate(0, 0);
}
</style> 