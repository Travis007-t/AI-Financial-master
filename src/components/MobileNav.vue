<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.name)

const navItems = [
  { name: 'home', path: '/', icon: '📊', label: '仪表盘' },
  { name: 'transactions', path: '/transactions', icon: '💰', label: '收支' },
  { name: 'budget', path: '/budget', icon: '📝', label: '预算' },
  { name: 'analysis', path: '/analysis', icon: '📈', label: '分析' },
  { name: 'settings', path: '/settings', icon: '⚙️', label: '设置' }
]
</script>

<template>
  <nav class="mobile-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: currentRoute === item.name }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-decoration: none;
  color: #666;
  padding: 6px 0;
  transition: all 0.3s;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
}

.nav-item.active {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    justify-content: space-around;
  }
}
</style> 