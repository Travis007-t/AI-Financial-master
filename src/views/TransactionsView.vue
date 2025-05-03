<script setup>
import { ref, computed } from 'vue'
import { useTransactionStore } from '../stores/transactions'
import { useSettingsStore } from '../stores/settings'
import TransactionList from '../components/TransactionList.vue'
import TransactionForm from '../components/TransactionForm.vue'

const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()

const showForm = ref(false)
const editingTransaction = ref(null)
const searchQuery = ref('')
const filterType = ref('all')

// 排序和筛选后的交易列表
const filteredTransactions = computed(() => {
  let result = [...transactionStore.transactions]
  
  // 根据类型筛选
  if (filterType.value !== 'all') {
    result = result.filter(t => t.type === filterType.value)
  }
  
  // 根据搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.category.toLowerCase().includes(query) || 
      (t.note && t.note.toLowerCase().includes(query))
    )
  }
  
  // 按日期排序（最新的在前面）
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const openNewTransactionForm = () => {
  editingTransaction.value = null
  showForm.value = true
}

const openEditTransactionForm = (transaction) => {
  editingTransaction.value = transaction
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingTransaction.value = null
}

const saveTransaction = async (transaction) => {
  try {
    if (editingTransaction.value) {
      await transactionStore.updateTransaction(editingTransaction.value.id, {
        ...transaction,
        id: editingTransaction.value.id
      })
    } else {
      await transactionStore.addTransaction(transaction)
    }
    await transactionStore.fetchTransactions()
    closeForm()
  } catch (error) {
    console.error('保存交易失败:', error)
    alert('保存交易失败，请重试')
  }
}

const deleteTransaction = (id) => {
  if (confirm('确定要删除这条记录吗？')) {
    transactionStore.deleteTransaction(id)
  }
}
</script>

<template>
  <div class="transactions-view">
    <h1>收支记录</h1>
    
    <div class="actions-bar">
      <div class="search-filter">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索类别或备注..."
          class="search-input"
        />
        
        <select v-model="filterType" class="filter-select">
          <option value="all">所有交易</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
      </div>
      
      <button @click="openNewTransactionForm" class="add-button">
        添加新交易
      </button>
    </div>
    
    <TransactionList 
      :transactions="filteredTransactions"
      @edit="openEditTransactionForm"
      @delete="deleteTransaction"
    />
    
    <TransactionForm
      v-if="showForm"
      :editing="editingTransaction"
      @save="saveTransaction"
      @cancel="closeForm"
    />
  </div>
</template>

<style scoped>
.transactions-view {
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

.actions-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  align-items: center;
}

.search-filter {
  display: flex;
  gap: 15px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 14px;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
  font-size: 14px;
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

.transactions-section {
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 10px;
}

.page-button {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.page-button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-button:hover:not(.active) {
  border-color: #1890ff;
  color: #1890ff;
}

@media (max-width: 768px) {
  .transactions-view {
    padding: 0 12px;
  }
  
  .actions-bar {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .search-filter {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input {
    width: 100%;
    padding: 10px;
    font-size: 15px;
    border-radius: 8px;
  }
  
  .filter-select {
    width: 100%;
    padding: 10px;
    font-size: 15px;
    border-radius: 8px;
  }
  
  .add-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
  }
}
</style> 