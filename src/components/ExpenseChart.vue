<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  LegendComponent 
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  }
})

const chartContainer = ref(null)
let chart = null

// 过滤出支出交易
const expenseTransactions = computed(() => {
  return props.transactions.filter(t => t.type === 'expense')
})

// 计算每个类别的总支出
const categoryExpenses = computed(() => {
  const result = {}
  
  expenseTransactions.value.forEach(transaction => {
    const { category, amount } = transaction
    if (!result[category]) {
      result[category] = 0
    }
    result[category] += parseFloat(amount)
  })
  
  return result
})

// 转换为图表所需的数据格式
const chartData = computed(() => {
  const data = []
  const colorMap = {
    '餐饮': '#ff7875',
    '交通': '#ffc53d',
    '住房': '#40a9ff',
    '购物': '#9254de',
    '娱乐': '#36cfc9',
    '医疗': '#73d13d',
    '教育': '#597ef7',
    '其他支出': '#bfbfbf'
  }
  
  Object.entries(categoryExpenses.value).forEach(([category, amount]) => {
    data.push({
      name: category,
      value: amount,
      itemStyle: {
        color: colorMap[category] || '#bfbfbf'
      }
    })
  })
  
  return data.sort((a, b) => b.value - a.value)
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
        bottom: '3%',
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
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.value
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
    chart.resize()
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
  <div class="expense-chart">
    <div v-if="expenseTransactions.length === 0" class="empty-state">
      暂无支出数据
    </div>
    
    <div 
      v-else
      ref="chartContainer" 
      class="chart-container"
    ></div>
  </div>
</template>

<style scoped>
.expense-chart {
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