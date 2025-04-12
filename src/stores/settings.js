import { defineStore } from 'pinia'
import api from '../services/api'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      currency: '¥',
      theme: 'light',
      userName: '用户',
      isLoggedIn: false
    },
    isLoading: false,
    error: null
  }),
  
  getters: {
    getCurrency: (state) => state.settings.currency,
    getTheme: (state) => state.settings.theme,
    getUserName: (state) => state.settings.userName,
    isLoggedIn: (state) => state.settings.isLoggedIn
  },
  
  actions: {
    // 获取用户设置
    async fetchSettings() {
      // 如果没有token，不请求设置
      if (!localStorage.getItem('token')) return;
      
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.settings.get();
        this.settings = { ...this.settings, ...response.data };
      } catch (error) {
        this.error = error.message || '获取设置失败';
        console.error('获取设置失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 更新所有设置
    async updateSettings(newSettings) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.settings.update(newSettings);
        this.settings = { ...this.settings, ...response.data };
      } catch (error) {
        this.error = error.message || '更新设置失败';
        console.error('更新设置失败:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 设置货币单位
    async setCurrency(currency) {
      await this.updateSettings({ currency });
    },
    
    // 设置主题
    async setTheme(theme) {
      await this.updateSettings({ theme });
    },
    
    // 登录
    login(userName) {
      this.settings.userName = userName;
      this.settings.isLoggedIn = true;
    },
    
    // 登出
    logout() {
      // 调用API退出登录（仅为了一致性，JWT是无状态的）
      try {
        api.auth.logout().catch(() => {
          // 忽略错误，因为这是可选的服务器操作
        });
      } catch (error) {
        console.error('登出API调用错误:', error);
      }
      
      // 清除token
      localStorage.removeItem('token');
      
      // 重置状态
      this.settings = {
        currency: '¥',
        theme: 'light',
        userName: '用户',
        isLoggedIn: false
      };
      this.isLoading = false;
      this.error = null;
    }
  }
}) 