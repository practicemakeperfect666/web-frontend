<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { UP_COLOR, DOWN_COLOR, fmtDay } from '../constants'

const props = defineProps({ daily: { type: Array, required: true } })

const el = ref(null)
let chart = null

function onResize() { if (chart) chart.resize() }

onMounted(() => {
  chart = echarts.init(el.value)
  chart.setOption({
    grid: { left: 60, right: 20, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: props.daily.map((r) => r.trading_day), axisLabel: { formatter: fmtDay } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: props.daily.map((r) => r.realized_pl),
      itemStyle: { color: (p) => (p.value >= 0 ? UP_COLOR : DOWN_COLOR) }
    }]
  })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (chart) chart.dispose()
})
</script>

<template>
  <div ref="el" class="chart"></div>
</template>

<style scoped>
.chart { height: 300px; }
</style>
