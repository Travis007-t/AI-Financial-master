<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useTransactionStore } from '../stores/transactions'
import { useSettingsStore } from '../stores/settings'
import BudgetForm from '../components/BudgetForm.vue'
import BudgetProgress from '../components/BudgetProgress.vue'

const budgetStore = useBudgetStore()
const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()

const showForm = ref(false)
const editingBudget = ref(null)

// 获取所有预算及其进度信息
const budgetProgressData = computed(() => {
  return budgetStore.getAllBudgetProgress
})

// 预算状态统计
const budgetStats = computed(() => {
  const total = budgetProgressData.value.length
  const overBudget = budgetProgressData.value.filter(b => b.isOverBudget).length
  const warning = budgetProgressData.value.filter(b => !b.isOverBudget && b.percentage >= 80).length
  const healthy = total - overBudget - warning
  
  return {
    total,
    overBudget,
    warning,
    healthy,
    hasProblems: overBudget > 0 || warning > 0
  }
})

// 获取所有支出类别
const expenseCategories = computed(() => {
  return transactionStore.categories.expense
})

// 获取已设置预算的类别
const budgetedCategories = computed(() => {
  return budgetStore.budgets.map(b => b.category)
})

// 获取未设置预算的类别
const unbudgetedCategories = computed(() => {
  return expenseCategories.value.filter(
    category => !budgetedCategories.value.includes(category)
  )
})

const openNewBudgetForm = () => {
  editingBudget.value = null
  showForm.value = true
}

const openEditBudgetForm = (budget) => {
  editingBudget.value = budget
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingBudget.value = null
}

const saveBudget = (budget) => {
  budgetStore.setBudget(budget)
  closeForm()
}

const deleteBudget = (category) => {
  if (confirm(`确定要删除"${category}"的预算设置吗？`)) {
    budgetStore.deleteBudget(category)
  }
}
</script>

<template>
  <div class="budget-view">
    <h1>预算管理</h1>
    
    <div class="actions-bar">
      <div>
        <span class="info-text">
          设置预算以帮助控制支出
        </span>
      </div>
      
      <button @click="openNewBudgetForm" class="add-button">
        添加新预算
      </button>
    </div>
    
    <!-- 预算状态概览 -->
    <div v-if="budgetStats.total > 0" class="budget-status-section">
      <div class="status-cards">
        <div class="status-card">
          <div class="status-icon healthy">{{ budgetStats.healthy }}</div>
          <div class="status-label">良好</div>
        </div>
        <div class="status-card">
          <div class="status-icon warning">{{ budgetStats.warning }}</div>
          <div class="status-label">接近超支</div>
        </div>
        <div class="status-card">
          <div class="status-icon danger">{{ budgetStats.overBudget }}</div>
          <div class="status-label">已超支</div>
        </div>
      </div>
      
      <div v-if="budgetStats.hasProblems" class="budget-tips">
        <div class="tip-title">💡 理财小贴士</div>
        <div v-if="budgetStats.overBudget > 0" class="tip-content">
          您有 {{ budgetStats.overBudget }} 个预算类别已超支。建议暂停这些类别的额外开销，或考虑调整预算金额以更符合实际支出情况。
        </div>
        <div v-if="budgetStats.warning > 0" class="tip-content">
          您有 {{ budgetStats.warning }} 个预算类别接近超支（已使用超过80%）。建议控制这些类别的剩余支出。
        </div>
      </div>
    </div>
    
    <!-- 预算进度 -->
    <div class="budget-progress-section">
      <h2>本月预算使用情况</h2>
      <BudgetProgress 
        :budgets="budgetProgressData" 
        @edit="openEditBudgetForm"
        @delete="deleteBudget"
      />
      
      <div v-if="budgetProgressData.length === 0" class="empty-state">
        <p>您还没有设置任何预算。点击上方的"添加新预算"按钮开始设置。</p>
      </div>
    </div>
    
    <BudgetForm
      v-if="showForm"
      :editing="editingBudget"
      :unbudgetedCategories="unbudgetedCategories"
      @save="saveBudget"
      @cancel="closeForm"
    />
  </div>
</template>

<style scoped>
.budget-view {
  max-width: 100%;
  width: 900px;
  margin: 0 auto;
  padding: 0;
}

h1 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #444;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  align-items: center;
}

.info-text {
  color: #666;
  font-size: 15px;
}

.add-button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
}

.add-button:hover {
  background-color: #40a9ff;
}

.budget-status-section {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.status-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.status-card {
  flex: 1;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.status-icon {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  height: 60px;
  width: 60px;
  line-height: 60px;
  border-radius: 50%;
  margin: 0 auto 10px;
  color: white;
}

.status-icon.healthy {
  background-color: #52c41a;
}

.status-icon.warning {
  background-color: #faad14;
}

.status-icon.danger {
  background-color: #ff4d4f;
}

.status-label {
  color: #666;
  font-size: 14px;
}

.budget-tips {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  padding: 15px;
  border-radius: 4px;
}

.tip-title {
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 10px;
}

.tip-content {
  color: #555;
  line-height: 1.5;
  font-size: 14px;
}

.budget-progress-section {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
</style> 