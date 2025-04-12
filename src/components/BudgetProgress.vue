<script setup>
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const props = defineProps({
  budgets: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete'])

// 获取进度条样式类
const getProgressClass = (percentage) => {
  if (percentage >= 100) {
    return 'danger'
  } else if (percentage >= 80) {
    return 'warning'
  } else {
    return 'normal'
  }
}
</script>

<template>
  <div class="budget-progress">
    <div v-if="budgets.length === 0" class="empty-state">
      暂无预算设置
    </div>
    
    <div v-else class="progress-grid">
      <div 
        v-for="budget in budgets" 
        :key="budget.category" 
        class="budget-item"
        :class="{ 'over-budget': budget.isOverBudget }"
      >
        <div class="budget-header">
          <div class="category-name">{{ budget.category }}</div>
          
          <div class="budget-actions">
            <button 
              @click="$emit('edit', budget)" 
              class="edit-button"
            >
              编辑
            </button>
            
            <button 
              @click="$emit('delete', budget.category)" 
              class="delete-button"
            >
              删除
            </button>
          </div>
        </div>
        
        <div class="budget-amounts">
          <div class="spent" :class="{ 'over-limit': budget.isOverBudget }">
            {{ settingsStore.getCurrency }}{{ budget.spent?.toFixed(2) || '0.00' }}
          </div>
          <div class="total">预算: {{ settingsStore.getCurrency }}{{ budget.limit || '0.00' }}</div>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :class="getProgressClass(budget.percentage || 0)"
            :style="{ width: `${Math.min(budget.percentage || 0, 100)}%` }"
          ></div>
        </div>
        
        <div class="percentage" :class="{ 'over-limit': budget.isOverBudget }">
          {{ (budget.percentage || 0).toFixed(0) }}%
        </div>
        
        <div v-if="budget.isOverBudget" class="warning-message">
          <i class="warning-icon">⚠️</i> 预算已超支 {{ (budget.percentage - 100).toFixed(0) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-progress {
  width: 100%;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;
}

.budget-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  position: relative;
  transition: all 0.3s ease;
}

.budget-item.over-budget {
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
  border-left: 3px solid #ff4d4f;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.category-name {
  font-weight: 500;
  color: #333;
  font-size: 17px;
}

.budget-actions {
  display: flex;
  gap: 15px;
}

.edit-button,
.delete-button {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
}

.edit-button:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}

.delete-button:hover {
  color: #ff4d4f;
  background-color: #f0f0f0;
}

.budget-amounts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  align-items: flex-end;
}

.spent {
  color: #333;
  font-size: 22px;
  font-weight: 500;
  transition: color 0.3s;
}

.spent.over-limit {
  color: #ff4d4f;
  font-weight: 600;
}

.total {
  color: #999;
  font-size: 15px;
}

.progress-bar {
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s, background-color 0.3s;
}

.normal {
  background-color: #1890ff;
}

.warning {
  background-color: #faad14;
}

.danger {
  background-color: #ff4d4f;
}

.percentage {
  text-align: right;
  font-size: 15px;
  color: #666;
  transition: color 0.3s;
}

.percentage.over-limit {
  color: #ff4d4f;
  font-weight: 600;
}

.warning-message {
  margin-top: 12px;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  animation: pulse 2s infinite;
}

.warning-icon {
  margin-right: 6px;
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #999;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}
</style> 