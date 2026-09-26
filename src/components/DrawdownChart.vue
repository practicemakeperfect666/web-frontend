<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'
import { ACCOUNT_LABEL, ACCOUNT_COLOR } from '../constants'

const props = defineProps({ data: { type: Array, required: true } })

const el = ref(null)
let chart = null

function calcDrawdown(series) {
  let peak = -Infinity
  return series.map((v) => {
    peak = Math.max(peak, v)
    return +(((v - peak) / peak) * 100).toFixed(2)
  })
}

function render() {
  if (!chart || !props.data.length) return
  const byAccount = {}
  for (const r of props.data) (byAccount[r.account] ??= []).push(r)
  const accounts = Object.keys(byAccount)
  const xLabels = byAccount[accounts[0]].map((r) => r.trading_day)

  chart.clear()
  chart.setOption({
    grid: { left: 60, right: 20, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis', valueFormatter: (v) => v + '%' },
    legend: { data: accounts.map((a) => ACCOUNT_LABEL[a] || a) },
    xAxis: { type: 'category', data: xLabels, axisLabel: { formatter: (v) => `${v.slice(4, 6)}/${v.slice(6, 8)}` } },
    yAxis: { type: 'value', max: 0, axisLabel: { formatter: (v) => v + '%' } },
    series: accounts.map((a) => ({
      name: ACCOUNT_LABEL[a] || a,
      type: 'line', smooth: true, showSymbol: false,
      color: ACCOUNT_COLOR[a] || '#5c7c99',
      areaStyle: { opacity: 0.15 },
      data: calcDrawdown(byAccount[a].map((r) => r.equity))
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

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (chart) chart.dispose()
})
</script>

<template>
  <div ref="el" class="chart"></div>
</template>

<style scoped>
.chart { height: 240px; }
</style>
