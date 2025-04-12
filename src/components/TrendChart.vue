<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useSettingsStore } from '../stores/settings'

// 注册 ECharts 组件
echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])

const props = defineProps({
  transactions: {
    type: Array,
    required: true
  },
  timeRange: {
    type: String,
    default: 'current-month'
  }
})

const settingsStore = useSettingsStore()
const chartContainer = ref(null)
let chart = null

// 获取当前日期和月份
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

// 根据时间范围获取开始日期
const startDate = computed(() => {
  let date = new Date()
  
  switch (props.timeRange) {
    case 'current-month':
      return new Date(currentYear, currentMonth, 1)
    case 'last-month':
      return new Date(currentYear, currentMonth - 1, 1)
    case '3-months':
      return new Date(currentYear, currentMonth - 2, 1)
    case '6-months':
      return new Date(currentYear, currentMonth - 5, 1)
    case 'current-year':
      return new Date(currentYear, 0, 1)
    default:
      return new Date(currentYear, currentMonth, 1)
  }
})

// 生成日期范围数据
const dateRangeData = computed(() => {
  const result = []
  const endDate = new Date() // 今天
  const start = new Date(startDate.value)
  
  // 根据时间范围选择合适的时间格式
  const isMonthView = ['current-month', 'last-month'].includes(props.timeRange)
  const format = isMonthView ? 'day' : 'month'
  
  if (format === 'day') {
    // 按天显示
    while (start <= endDate) {
      result.push(new Date(start))
      start.setDate(start.getDate() + 1)
    }
  } else {
    // 按月显示
    while (
      start.getFullYear() < endDate.getFullYear() || 
      (start.getFullYear() === endDate.getFullYear() && start.getMonth() <= endDate.getMonth())
    ) {
      result.push(new Date(start))
      start.setMonth(start.getMonth() + 1)
    }
  }
  
  return { dates: result, format }
})

// 格式化日期
const formatDate = (date, format) => {
  if (format === 'day') {
    return `${date.getMonth() + 1}/${date.getDate()}`
  } else {
    return `${date.getFullYear()}/${date.getMonth() + 1}`
  }
}

// 处理交易数据，生成图表数据
const chartData = computed(() => {
  const { dates, format } = dateRangeData.value
  const incomeData = new Array(dates.length).fill(0)
  const expenseData = new Array(dates.length).fill(0)
  
  props.transactions.forEach(transaction => {
    const tDate = new Date(transaction.date)
    let index = -1
    
    if (format === 'day') {
      // 按天匹配
      index = dates.findIndex(d => 
        d.getFullYear() === tDate.getFullYear() && 
        d.getMonth() === tDate.getMonth() && 
        d.getDate() === tDate.getDate()
      )
    } else {
      // 按月匹配
      index = dates.findIndex(d => 
        d.getFullYear() === tDate.getFullYear() && 
        d.getMonth() === tDate.getMonth()
      )
    }
    
    if (index !== -1) {
      const amount = parseFloat(transaction.amount)
      if (transaction.type === 'income') {
        incomeData[index] += amount
      } else {
        expenseData[index] += amount
      }
    }
  })
  
  // 计算累计金额
  const cumulativeIncome = []
  const cumulativeExpense = []
  let incomeSum = 0
  let expenseSum = 0
  
  for (let i = 0; i < dates.length; i++) {
    incomeSum += incomeData[i]
    expenseSum += expenseData[i]
    cumulativeIncome.push(incomeSum)
    cumulativeExpense.push(expenseSum)
  }
  
  return {
    dates: dates.map(d => formatDate(d, format)),
    income: incomeData,
    expense: expenseData,
    cumulativeIncome,
    cumulativeExpense
  }
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
        top: '5%'
      }
    })
  }
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return
  
  const { dates, income, expense, cumulativeIncome, cumulativeExpense } = chartData.value
  const currency = settingsStore.getCurrency
  
  const option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          let value = param.value
          let color = param.color
          let seriesName = param.seriesName
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`
          result += `${seriesName}: ${currency}${value.toFixed(2)}<br/>`
        })
        return result
      },
      confine: true
    },
    legend: {
      data: ['收入', '支出', '累计收入', '累计支出'],
      bottom: 10,
      itemWidth: 15,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: dates,
      axisLabel: {
        rotate: dates.length > 10 ? 45 : 0,
        interval: dates.length > 30 ? 'auto' : 0,
        formatter: function(value) {
          return value.length > 8 ? value.substring(0, 8) + '...' : value;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: value => `${currency}${value.toFixed(0)}`
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100,
      minValueSpan: 5
    }, {
      start: 0,
      end: 100,
      height: 20
    }],
    series: [
      {
        name: '收入',
        type: 'bar',
        data: income,
        itemStyle: {
          color: '#52c41a'
        },
        barMaxWidth: '40%',
        barGap: '30%'
      },
      {
        name: '支出',
        type: 'bar',
        data: expense,
        itemStyle: {
          color: '#ff4d4f'
        },
        barMaxWidth: '40%',
        barGap: '30%'
      },
      {
        name: '累计收入',
        type: 'line',
        data: cumulativeIncome,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#1890ff'
        },
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '累计支出',
        type: 'line',
        data: cumulativeExpense,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#faad14'
        },
        itemStyle: {
          color: '#faad14'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听交易数据或时间范围变化，更新图表
watch(() => [props.transactions, props.timeRange], () => {
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
  <div class="trend-chart">
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
.trend-chart {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 450px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 450px;
  color: #999;
}
</style> 