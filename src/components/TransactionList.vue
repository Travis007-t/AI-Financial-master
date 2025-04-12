<script setup>
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 货币符号
const currency = settingsStore.getCurrency

// 根据交易类型返回相应的样式类
const getTypeClass = (type) => {
  return type === 'income' ? 'income' : 'expense'
}

// 编辑交易
const editTransaction = (transaction) => {
  emit('edit', transaction)
}

// 删除交易
const deleteTransaction = (id) => {
  emit('delete', id)
}
</script>

<template>
  <div class="transaction-list">
    <div v-if="transactions.length === 0" class="empty-state">
      暂无交易记录
    </div>
    
    <table v-else class="transaction-table">
      <thead>
        <tr>
          <th>日期</th>
          <th>类别</th>
          <th>类型</th>
          <th>备注</th>
          <th>金额</th>
          <th v-if="!compact">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id" class="transaction-row">
          <td class="transaction-date">{{ formatDate(transaction.date) }}</td>
          <td>
            <span class="transaction-category" :class="transaction.type">
              {{ transaction.category }}
            </span>
          </td>
          <td>{{ transaction.type === 'income' ? '收入' : '支出' }}</td>
          <td class="transaction-note">{{ transaction.note }}</td>
          <td class="transaction-amount" :class="transaction.type === 'income' ? 'positive' : 'negative'">
            {{ transaction.type === 'income' ? '+' : '-' }}{{ settingsStore.getCurrency }}{{ transaction.amount }}
          </td>
          <td v-if="!compact" class="actions">
            <button @click="$emit('edit', transaction)" class="edit-button">编辑</button>
            <button @click="$emit('delete', transaction.id)" class="delete-button">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.transaction-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th,
.transaction-table td {
  padding: 18px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.transaction-row:last-child td {
  border-bottom: none;
}

.transaction-row:hover {
  background-color: #f5f5f5;
}

.transaction-date {
  color: #666;
  font-size: 14px;
  min-width: 120px;
}

.transaction-category {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  min-width: 100px;
  text-align: center;
}

.income {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.expense {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.transaction-amount {
  font-weight: 500;
  text-align: right;
  min-width: 140px;
  font-size: 15px;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #ff4d4f;
}

.transaction-note {
  color: #666;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.transaction-note:empty::before {
  content: '(无备注)';
  color: #d9d9d9;
  font-style: italic;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #999;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  min-width: 120px;
}

.edit-button,
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  color: #666;
  font-size: 14px;
  border-radius: 4px;
}

.edit-button:hover,
.delete-button:hover {
  background-color: #f0f0f0;
}

.delete-button:hover {
  color: #ff4d4f;
}

.edit-button:hover {
  color: #1890ff;
}

@media (max-width: 768px) {
  .transaction-table th:nth-child(3),
  .transaction-table td:nth-child(3) {
    display: none;
  }
}
</style> 