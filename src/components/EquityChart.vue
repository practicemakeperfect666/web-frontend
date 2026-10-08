<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { ACCOUNT_LABEL, ACCOUNT_COLOR, fmtDay } from '../constants'

const props = defineProps({
  data: { type: Array, required: true },
  valueKey: { type: String, default: 'equity' },
  unit: { type: String, default: '' }
})

const el = ref(null)
let chart = null

function render() {
  if (!chart || !props.data.length) return
  const byAccount = {}
  for (const r of props.data) (byAccount[r.account] ??= []).push(r)
  const accounts = Object.keys(byAccount)
  const xLabels = byAccount[accounts[0]].map((r) => r.trading_day)

  chart.clear()
  chart.setOption({
    grid: { left: 70, right: 20, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend: { data: accounts.map((a) => ACCOUNT_LABEL[a] || a) },
    xAxis: { type: 'category', data: xLabels, axisLabel: { formatter: fmtDay } },
    yAxis: { type: 'value', scale: true, axisLabel: { formatter: (v) => v + props.unit } },
    series: accounts.map((a) => ({
      name: ACCOUNT_LABEL[a] || a,
      type: 'line', smooth: true, showSymbol: false,
      color: ACCOUNT_COLOR[a] || '#5c7c99',
      data: byAccount[a].map((r) => r[props.valueKey])
    }))
  })
}

function onResize() { if (chart) chart.resize() }

onMounted(() => {
  chart = echarts.init(el.value)
  render()
  window.addEventListener('resize', onResize)
})

watch(() => props.data, render, { deep: true })
watch(() => props.valueKey, render)

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
