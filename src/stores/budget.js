import { defineStore } from 'pinia'
import { useTransactionStore } from './transactions'
import api from '../services/api'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: [],
    isLoading: false,
    error: null
  }),
  
  getters: {
    getBudgetByCategory: (state) => {
      return (category) => {
        return state.budgets.find(budget => budget.category === category);
      };
    },
    
    getBudgetProgress: (state) => {
      return (category) => {
        const budget = state.getBudgetByCategory(category);
        if (!budget) return null;
        
        const transactionStore = useTransactionStore();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyTransactions = transactionStore.getTransactionsByMonth(currentMonth, currentYear);
        const categoryExpenses = monthlyTransactions
          .filter(t => t.type === 'expense' && t.category === category)
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const percentage = (categoryExpenses / parseFloat(budget.amount)) * 100;
        return {
          spent: categoryExpenses,
          limit: parseFloat(budget.amount),
          percentage: percentage,
          isOverBudget: percentage > 100
        };
      };
    },
    
    getAllBudgetProgress: (state) => {
      const result = [];
      state.budgets.forEach(budget => {
        const progress = state.getBudgetProgress(budget.category);
        if (progress) {
          result.push({
            category: budget.category,
            ...progress
          });
        }
      });
      return result;
    }
  },
  
  actions: {
    // 获取所有预算
    async fetchBudgets() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.budgets.getAll();
        this.budgets = response.data;
      } catch (error) {
        this.error = error.message || '获取预算信息失败';
        console.error('获取预算信息失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 设置预算
    async setBudget(budget) {
      this.isLoading = true;
      this.error = null;
      
      const budgetData = {
        ...budget,
        amount: parseFloat(budget.amount)
      };
      
      try {
        const existingBudget = this.getBudgetByCategory(budgetData.category);
        let response;
        
        if (existingBudget) {
          // 更新现有预算
          response = await api.budgets.update(budgetData.category, budgetData);
          
          // 更新本地状态
          const index = this.budgets.findIndex(b => b.category === budgetData.category);
          if (index !== -1) {
            this.budgets[index] = response.data;
          }
        } else {
          // 创建新预算
          response = await api.budgets.create(budgetData);
          
          // 添加到本地状态
          this.budgets.push(response.data);
        }
      } catch (error) {
        this.error = error.message || '保存预算信息失败';
        console.error('保存预算信息失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 删除预算
    async deleteBudget(category) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await api.budgets.delete(category);
        
        // 从本地状态中移除
        this.budgets = this.budgets.filter(b => b.category !== category);
      } catch (error) {
        this.error = error.message || '删除预算信息失败';
        console.error('删除预算信息失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 重置状态（用于用户退出登录时）
    resetState() {
      this.budgets = [];
      this.isLoading = false;
      this.error = null;
    }
  }
}) 