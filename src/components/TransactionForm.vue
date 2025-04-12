<script setup>
import { ref, computed, watch } from 'vue'
import { useTransactionStore } from '../stores/transactions'

const props = defineProps({
  editing: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const transactionStore = useTransactionStore()

// 表单数据
const formData = ref({
  type: 'expense',
  category: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: ''
})

// 表单验证错误
const errors = ref({
  category: '',
  amount: ''
})

// 获取收入和支出分类
const incomeCategories = computed(() => transactionStore.categories.income)
const expenseCategories = computed(() => transactionStore.categories.expense)

// 根据选择的类型显示相应的分类
const categories = computed(() => {
  return formData.value.type === 'income' ? incomeCategories.value : expenseCategories.value
})

// 监听编辑模式，如果有传入要编辑的交易，则填充表单
watch(() => props.editing, (newValue) => {
  if (newValue) {
    // 确保日期格式正确
    const formattedDate = newValue.date ? new Date(newValue.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // 深拷贝编辑的交易数据
    formData.value = {
      type: newValue.type || 'expense',
      category: newValue.category || '',
      amount: newValue.amount ? String(newValue.amount) : '',
      date: formattedDate,
      note: newValue.note || ''
    }
  } else {
    // 重置表单为默认值
    formData.value = {
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
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
    errors.value.amount = '请输入金额'
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
    // 构造要保存的交易数据，确保日期格式正确
    const transactionData = {
      ...formData.value,
      amount: parseFloat(formData.value.amount),
      date: new Date(formData.value.date).toISOString().split('T')[0]
    }
    
    // 如果是编辑模式，保留原有的id
    if (props.editing) {
      transactionData.id = props.editing.id
    }
    
    emit('save', transactionData)
  }
}

// 取消
const cancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="transaction-form-overlay">
    <div class="transaction-form">
      <div class="form-header">
        <h2>{{ editing ? '编辑交易' : '添加新交易' }}</h2>
        <button class="close-button" @click="cancel">×</button>
      </div>
      
      <div class="form-content">
        <div class="form-group">
          <label>交易类型</label>
          <div class="type-selector">
            <button 
              class="type-button" 
              :class="{ active: formData.type === 'income' }"
              @click="formData.type = 'income'"
            >
              收入
            </button>
            <button 
              class="type-button" 
              :class="{ active: formData.type === 'expense' }"
              @click="formData.type = 'expense'"
            >
              支出
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="category">类别</label>
          <select 
            id="category" 
            v-model="formData.category"
            :class="{ 'has-error': errors.category }"
          >
            <option value="" disabled>选择类别</option>
            <option 
              v-for="category in categories" 
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
          <label for="amount">金额</label>
          <input 
            id="amount" 
            type="number" 
            v-model="formData.amount"
            step="0.01"
            min="0"
            placeholder="输入金额"
            :class="{ 'has-error': errors.amount }"
          />
          <div class="error-message" v-if="errors.amount">
            {{ errors.amount }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="date">日期</label>
          <input 
            id="date" 
            type="date" 
            v-model="formData.date"
          />
        </div>
        
        <div class="form-group">
          <label for="note">备注</label>
          <textarea 
            id="note" 
            v-model="formData.note"
            placeholder="添加备注（可选）"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button class="cancel-button" @click="cancel">
            取消
          </button>
          <button class="save-button" @click="submitForm">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.transaction-form {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.form-header h2 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.form-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.type-selector {
  display: flex;
  gap: 10px;
}

.type-button {
  flex: 1;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.type-button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius:.4px;
  font-size: 14px;
}

.has-error {
  border-color: #ff4d4f !important;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button,
.save-button {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #d9d9d9;
}

.save-button {
  background-color: #1890ff;
  color: white;
  border: none;
}

.cancel-button:hover {
  background-color: #e6e6e6;
}

.save-button:hover {
  background-color: #40a9ff;
}
</style> 