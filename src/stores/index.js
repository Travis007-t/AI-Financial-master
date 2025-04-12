import { createPinia } from 'pinia'

// 导入所有存储
import { useTransactionStore } from './transactions'
import { useBudgetStore } from './budget'
import { useSettingsStore } from './settings'

// 创建 Pinia 实例
const pinia = createPinia()

export {
  pinia,
  useTransactionStore,
  useBudgetStore,
  useSettingsStore
} 