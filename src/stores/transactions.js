import { defineStore } from 'pinia'
import api from '../services/api'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    isLoading: false,
    error: null,
    categories: {
      income: ['工资', '奖金', '投资', '其他收入'],
      expense: ['餐饮', '交通', '住房', '购物', '娱乐', '医疗', '教育', '其他支出']
    }
  }),
  
  getters: {
    getTotalIncome: (state) => {
      return state.transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    },
    
    getTotalExpense: (state) => {
      return state.transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    },
    
    getNetBalance: (state) => {
      const totalIncome = state.transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
      
      const totalExpense = state.transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
      
      return totalIncome - totalExpense;
    },
    
    getTransactionsByMonth: (state) => {
      return (month, year) => {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // 当月最后一天
        
        return state.transactions.filter(transaction => {
          if (!transaction.date) return false;
          const date = new Date(transaction.date);
          return date >= startDate && date <= endDate;
        });
      };
    },
    
    getTransactionsByCategory: (state) => {
      return (category) => {
        return state.transactions.filter(transaction => transaction.category === category);
      };
    }
  },
  
  actions: {
    // 获取所有交易记录
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.transactions.getAll();
        this.transactions = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message || '获取交易记录失败';
        console.error('获取交易记录失败:', error);
        // 重新抛出错误以便上层组件处理
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 添加新交易记录
    async addTransaction(transaction) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 格式化日期为 YYYY-MM-DD 格式
        const formattedDate = transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const response = await api.transactions.create({
          ...transaction,
          date: formattedDate
        });
        
        // 将新交易添加到本地状态
        this.transactions.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || '添加交易记录失败';
        console.error('添加交易记录失败:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 更新交易记录
    async updateTransaction(id, updatedTransaction) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 格式化日期为 YYYY-MM-DD 格式
        const formattedDate = updatedTransaction.date ? new Date(updatedTransaction.date).toISOString().split('T')[0] : null;
        
        const response = await api.transactions.update(id, {
          type: updatedTransaction.type,
          category: updatedTransaction.category,
          amount: updatedTransaction.amount,
          date: formattedDate,
          note: updatedTransaction.note
        });
        
        // 更新本地状态
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transactions[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message || '更新交易记录失败';
        console.error('更新交易记录失败:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 删除交易记录
    async deleteTransaction(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await api.transactions.delete(id);
        
        // 从本地状态中移除
        this.transactions = this.transactions.filter(t => t.id !== id);
        return true;
      } catch (error) {
        this.error = error.message || '删除交易记录失败';
        console.error('删除交易记录失败:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 重置状态（用于用户退出登录时）
    resetState() {
      this.transactions = [];
      this.isLoading = false;
      this.error = null;
    }
  }
}) 