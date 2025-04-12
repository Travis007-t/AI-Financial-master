<script setup>
import { computed } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import { useSettingsStore } from '../stores/settings'

const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()

// 获取当前月份信息
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

// 获取本月的收支数据
const monthlyTransactions = computed(() => {
  return transactionStore.getTransactionsByMonth(currentMonth, currentYear)
})

// 计算本月总收入
const monthlyIncome = computed(() => {
  return monthlyTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

// 计算本月总支出
const monthlyExpense = computed(() => {
  return monthlyTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

// 计算本月净余额
const monthlyBalance = computed(() => {
  return monthlyIncome.value - monthlyExpense.value
})

// 货币符号
const currency = computed(() => settingsStore.getCurrency)

// 判断余额的正负
const balanceClass = computed(() => {
  if (monthlyBalance.value > 0) return 'positive'
  if (monthlyBalance.value < 0) return 'negative'
  return ''
})
</script>

<template>
  <div class="dashboard-summary">
    <div class="summary-card income">
      <div class="card-icon">💹</div>
      <div class="card-content">
        <div class="card-title">本月收入</div>
        <div class="card-value">{{ currency }}{{ monthlyIncome.toFixed(2) }}</div>
      </div>
    </div>
    
    <div class="summary-card expense">
      <div class="card-icon">💸</div>
      <div class="card-content">
        <div class="card-title">本月支出</div>
        <div class="card-value">{{ currency }}{{ monthlyExpense.toFixed(2) }}</div>
      </div>
    </div>
    
    <div class="summary-card balance">
      <div class="card-icon">💰</div>
      <div class="card-content">
        <div class="card-title">本月净余额</div>
        <div class="card-value" :class="balanceClass">
          {{ monthlyBalance >= 0 ? '+' : '' }}{{ currency }}{{ monthlyBalance.toFixed(2) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 35px;
}

.summary-card {
  padding: 24px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
}

.summary-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 36px;
  margin-right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(5px);
}

.card-content {
  flex: 1;
}

.income {
  background: linear-gradient(135deg, #42b983 0%, #33a06f 100%);
}

.expense {
  background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
}

.balance {
  background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%);
}

.card-title {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.9;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: all 0.3s;
}

.positive {
  color: #f0fff0;
}

.negative {
  color: #ffa39e;
}

@media (max-width: 768px) {
  .dashboard-summary {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .summary-card {
    padding: 20px;
  }
  
  .card-icon {
    font-size: 28px;
    width: 56px;
    height: 56px;
    margin-right: 16px;
  }
  
  .card-value {
    font-size: 24px;
  }
}
</style> 