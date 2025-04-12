<script setup>
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'

const props = defineProps({
  editing: {
    type: Object,
    default: null
  },
  unbudgetedCategories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const settingsStore = useSettingsStore()

// 表单数据
const formData = ref({
  category: '',
  amount: '',
  note: ''
})

// 表单验证错误
const errors = ref({
  category: '',
  amount: ''
})

// 货币符号
const currency = computed(() => settingsStore.getCurrency)

// 是否为编辑模式
const isEditMode = computed(() => !!props.editing)

// 可选的类别列表
const availableCategories = computed(() => {
  if (isEditMode.value) {
    return [props.editing.category, ...props.unbudgetedCategories]
  }
  return props.unbudgetedCategories
})

// 监听编辑模式，如果有传入要编辑的预算，则填充表单
watch(() => props.editing, (newValue) => {
  if (newValue) {
    formData.value = { ...newValue }
  } else {
    // 如果没有传入编辑的预算，且可选类别不为空，则自动选择第一个类别
    formData.value = {
      category: props.unbudgetedCategories.length > 0 ? props.unbudgetedCategories[0] : '',
      amount: '',
      note: ''
    }
  }
}, { immediate: true })

// 验证表单
const validateForm = () => {
  let isValid = true
  errors.value = { category: '', amount: '' }
  
  if (!formData.value.category) {
    errors.value.category = '请选择类别'
    isValid = false
  }
  
  if (!formData.value.amount) {
    errors.value.amount = '请输入预算金额'
    isValid = false
  } else if (isNaN(formData.value.amount) || parseFloat(formData.value.amount) <= 0) {
    errors.value.amount = '请输入有效的金额'
    isValid = false
  }
  
  return isValid
}

// 提交表单
const submitForm = () => {
  if (validateForm()) {
    emit('save', { ...formData.value })
  }
}

// 取消
const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="budget-form-overlay" @click.self="cancel">
    <div class="budget-form">
      <div class="form-header">
        <h2>{{ isEditMode ? '编辑预算' : '添加新预算' }}</h2>
        <button class="close-button" @click="cancel">×</button>
      </div>
      
      <div class="form-content">
        <div v-if="availableCategories.length === 0 && !isEditMode" class="no-categories">
          <p>所有支出类别已设置预算。请先删除某个类别的预算，然后再添加新预算。</p>
          <button class="cancel-button" @click="cancel">关闭</button>
        </div>
        
        <template v-else>
          <div class="form-guidance">
            <div class="guidance-icon">💰</div>
            <div class="guidance-text">
              {{ isEditMode ? '调整预算金额以更好地管理您的财务。考虑过去的支出模式来设定更切合实际的预算。' : '设置合理的预算是财务管理的第一步。根据您的收入和基本支出需求来计划每个类别的预算金额。' }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="category">支出类别</label>
            <select 
              id="category" 
              v-model="formData.category"
              :class="{ 'has-error': errors.category }"
              :disabled="isEditMode"
            >
              <option value="" disabled>选择类别</option>
              <option 
                v-for="category in availableCategories" 
                :key="category" 
                :value="category"
              >
                {{ category }}
              </option>
            </select>
            <div class="error-message" v-if="errors.category">
              {{ errors.category }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="amount">预算金额 ({{ currency }})</label>
            <input 
              id="amount" 
              type="number" 
              v-model="formData.amount"
              :class="{ 'has-error': errors.amount }"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <div class="error-message" v-if="errors.amount">
              {{ errors.amount }}
            </div>
            <div class="helper-text" v-else>
              设置一个合理且可实现的金额，避免过高或过低。
            </div>
          </div>
          
          <div class="form-group">
            <label for="note">备注 (可选)</label>
            <input 
              id="note" 
              type="text" 
              v-model="formData.note"
              placeholder="添加关于这个预算的备注..."
            />
            <div class="helper-text">
              例如：包括每周外卖和工作日午餐
            </div>
          </div>
          
          <div class="form-actions">
            <button class="cancel-button" @click="cancel">
              取消
            </button>
            <button class="save-button" @click="submitForm">
              {{ isEditMode ? '保存修改' : '添加预算' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.budget-form {
  width: 500px;
  max-width: 90%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.form-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.close-button:hover {
  color: #666;
}

.form-content {
  padding: 20px;
}

.form-guidance {
  background-color: #f6ffed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  border-left: 4px solid #52c41a;
}

.guidance-icon {
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
}

.guidance-text {
  color: #555;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.has-error {
  border-color: #ff4d4f !important;
}

.helper-text {
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}

.error-message {
  margin-top: 6px;
  color: #ff4d4f;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.cancel-button {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.save-button {
  padding: 8px 16px;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.save-button:hover {
  background-color: #40a9ff;
}

.cancel-button:hover {
  background-color: #f5f5f5;
}

.no-categories {
  text-align: center;
  padding: 20px 0;
}

.no-categories p {
  margin-bottom: 20px;
  color: #666;
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