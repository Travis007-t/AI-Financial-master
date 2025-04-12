<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent,
  LegendComponent 
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useSettingsStore } from '../stores/settings'

// 注册 ECharts 组件
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
])

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
})

const settingsStore = useSettingsStore()
const chartContainer = ref(null)
let chart = null

// 获取收入和支出数据
const incomeData = computed(() => {
  return props.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const expenseData = computed(() => {
  return props.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
})

const balanceData = computed(() => {
  return incomeData.value - expenseData.value
})

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value, null, { renderer: 'canvas' })
    updateChart()
    
    // 设置图表自适应选项
    chart.setOption({
      grid: {
        containLabel: true,
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '3%'
      }
    })
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return
  
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const value = params[0].value
        return `${params[0].name}: ${settingsStore.getCurrency}${Math.abs(value).toFixed(2)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%', 
      top: '3%',
      containLabel: true
    },
    legend: {
      data: ['金额'],
      bottom: '5%', 
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: '#666'
      }
    },
    xAxis: {
      type: 'category',
      data: ['收入', '支出', '结余'],
      axisLabel: {
        fontSize: 12,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          return `${settingsStore.getCurrency}${Math.abs(value).toFixed(0)}`
        },
        fontSize: 12
      }
    },
    series: [
      {
        name: '金额',
        type: 'bar',
        barWidth: '40%',  
        data: [
          {
            value: incomeData.value,
            itemStyle: { color: '#52c41a' }
          },
          {
            value: expenseData.value,
            itemStyle: { color: '#ff4d4f' }
          },
          {
            value: balanceData.value,
            itemStyle: { 
              color: balanceData.value >= 0 ? '#1890ff' : '#faad14' 
            }
          }
        ],
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          formatter: (params) => {
            return `${settingsStore.getCurrency}${Math.abs(params.value).toFixed(2)}`
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听交易数据变化，更新图表
watch(() => props.transactions, () => {
  updateChart()
}, { deep: true })

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (chart) {
    chart.resize({ animation: { duration: 300 } })
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

// 组件销毁时移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div class="income-expense-chart">
    <div v-if="props.transactions.length === 0" class="empty-state">
      暂无数据
    </div>
    
    <div 
      v-else
      ref="chartContainer" 
      class="chart-container"
    ></div>
  </div>
</template>

<style scoped>
.income-expense-chart {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 380px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 380px;
  color: #999;
}
</style> 