<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import { getKlines } from '../api'
import { UP_COLOR, DOWN_COLOR } from '../constants'

const props = defineProps({ symbol: { type: String, required: true } })

const INTERVALS = ['1m', '3m', '5m', '15m', '30m', '60m']
const interval = ref('1m')
const chartEl = ref(null)
let chart = null
let series = null
let markersApi = null

function toTs(dt) { return Math.floor(new Date(dt.replace(' ', 'T')).getTime() / 1000) }

async function load() {
  const klines = await getKlines({ symbol: props.symbol, interval: interval.value, limit: 240 })
  const data = klines.map((k) => ({ time: toTs(k.datetime), open: k.open, high: k.high, low: k.low, close: k.close }))
  series.setData(data)

  const ms = []
  if (data.length > 30) ms.push({ time: data[30].time, position: 'belowBar', color: UP_COLOR, shape: 'arrowUp', text: '开多' })
  if (data.length > 60) ms.push({ time: data[60].time, position: 'aboveBar', color: DOWN_COLOR, shape: 'arrowDown', text: '平多' })
  if (markersApi) markersApi.setMarkers(ms)
  else markersApi = createSeriesMarkers(series, ms)
}

onMounted(() => {
  chart = createChart(chartEl.value, {
    layout: { background: { color: '#ffffff' }, textColor: '#666' },
    grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
    timeScale: { timeVisible: true, secondsVisible: false }
  })
  series = chart.addSeries(CandlestickSeries, {
    upColor: UP_COLOR, downColor: DOWN_COLOR, wickUpColor: UP_COLOR, wickDownColor: DOWN_COLOR, borderVisible: false
  })
  load()
})

watch(interval, load)
onBeforeUnmount(() => { if (chart) chart.remove() })
</script>

<template>
  <div>
    <div class="kline-head">
      <el-radio-group v-model="interval" size="small">
        <el-radio-button v-for="i in INTERVALS" :key="i" :value="i">{{ i }}</el-radio-button>
      </el-radio-group>
      <span class="hint">由 1min 合成 · 红涨绿跌</span>
    </div>
    <div ref="chartEl" class="chart"></div>
  </div>
</template>

<style scoped>
.kline-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.hint { font-size: 12px; color: var(--text-3); }
.chart { height: 420px; }
</style>
