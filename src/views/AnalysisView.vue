<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import { useSettingsStore } from '../stores/settings'
import ExpenseChart from '../components/ExpenseChart.vue'
import IncomeExpenseChart from '../components/IncomeExpenseChart.vue'
import TrendChart from '../components/TrendChart.vue'

const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()

// 时间范围选项
const timeRanges = [
  { label: '本月', value: 'current-month' },
  { label: '上月', value: 'last-month' },
  { label: '近3个月', value: '3-months' },
  { label: '近6个月', value: '6-months' },
  { label: '今年', value: 'current-year' }
]
const selectedTimeRange = ref('current-month')

// 获取当前日期信息
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

// 根据选择的时间范围获取交易数据
const filteredTransactions = computed(() => {
  const endDate = new Date()
  let startDate = new Date()
  
  switch (selectedTimeRange.value) {
    case 'current-month':
      startDate = new Date(currentYear, currentMonth, 1)
      break
    case 'last-month':
      startDate = new Date(currentYear, currentMonth - 1, 1)
      endDate.setDate(0) // 上个月的最后一天
      break
    case '3-months':
      startDate = new Date(currentYear, currentMonth - 2, 1)
      break
    case '6-months':
      startDate = new Date(currentYear, currentMonth - 5, 1)
      break
    case 'current-year':
      startDate = new Date(currentYear, 0, 1)
      break
  }
  
  return transactionStore.transactions.filter(t => {
    const tDate = new Date(t.date)
    return tDate >= startDate && tDate <= endDate
  })
})

// 支出分类数据
const expenseData = computed(() => {
  return filteredTransactions.value.filter(t => t.type === 'expense')
})

// 收入分类数据
const incomeData = computed(() => {
  return filteredTransactions.value.filter(t => t.type === 'income')
})

// 获取最大的支出类别
const topExpenseCategory = computed(() => {
  const categoryMap = {}
  
  expenseData.value.forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount)
  })
  
  let maxCategory = ''
  let maxAmount = 0
  
  for (const category in categoryMap) {
    if (categoryMap[category] > maxAmount) {
      maxAmount = categoryMap[category]
      maxCategory = category
    }
  }
  
  return { category: maxCategory, amount: maxAmount }
})

// 获取总收入和总支出
const totalIncome = computed(() => {
  return incomeData.value.reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const totalExpense = computed(() => {
  return expenseData.value.reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

// 计算月均收入和支出
const monthlyAverage = computed(() => {
  const months = selectedTimeRange.value === 'current-month' || selectedTimeRange.value === 'last-month' 
    ? 1 
    : selectedTimeRange.value === '3-months' 
      ? 3 
      : selectedTimeRange.value === '6-months'
        ? 6
        : 12
  
  return {
    income: totalIncome.value / months,
    expense: totalExpense.value / months
  }
})
</script>

<template>
  <div class="analysis-view">
    <h1>财务分析</h1>
    
    <div class="time-range-selector">
      <span>时间范围：</span>
      <select v-model="selectedTimeRange">
        <option v-for="option in timeRanges" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <div class="stats-summary">
      <div class="stat-card">
        <h3>总收入</h3>
        <div class="stat-value">{{ settingsStore.getCurrency }}{{ totalIncome.toFixed(2) }}</div>
      </div>
      
      <div class="stat-card">
        <h3>总支出</h3>
        <div class="stat-value">{{ settingsStore.getCurrency }}{{ totalExpense.toFixed(2) }}</div>
      </div>
      
      <div class="stat-card">
        <h3>月均收入</h3>
        <div class="stat-value">{{ settingsStore.getCurrency }}{{ monthlyAverage.income.toFixed(2) }}</div>
      </div>
      
      <div class="stat-card">
        <h3>月均支出</h3>
        <div class="stat-value">{{ settingsStore.getCurrency }}{{ monthlyAverage.expense.toFixed(2) }}</div>
      </div>
      
      <div class="stat-card">
        <h3>最大支出</h3>
        <div class="stat-category">{{ topExpenseCategory.category }}</div>
        <div class="stat-value">{{ settingsStore.getCurrency }}{{ topExpenseCategory.amount.toFixed(2) }}</div>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="chart-section">
        <h2>收支对比</h2>
        <IncomeExpenseChart :transactions="filteredTransactions" />
      </div>
      
      <div class="chart-section">
        <h2>支出分类</h2>
        <ExpenseChart :transactions="filteredTransactions" />
      </div>
    </div>
    
    <div class="chart-section">
      <h2>收支趋势</h2>
      <TrendChart :transactions="filteredTransactions" :timeRange="selectedTimeRange" />
    </div>
  </div>
</template>

<style scoped>
.analysis-view {
  max-width: 100%;
  width: 900px;
  margin: 0 auto;
  padding: 0;
}

h1 {
  margin-bottom: 25px;
  color: #333;
  font-size: 24px;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #444;
}

.time-range-selector {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.time-range-selector select {
  margin-left: 15px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 200px;
  font-size: 14px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #666;
}

.stat-value {
  font-size: 26px;
  font-weight: bold;
  color: #333;
}

.stat-category {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.chart-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

@media (max-width: 1200px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
}
</style> 