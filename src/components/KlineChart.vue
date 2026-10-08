<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { createChart, CandlestickSeries, createSeriesMarkers } from 'lightweight-charts'
import { getKlines, getOrders } from '../api'
import { UP_COLOR, DOWN_COLOR } from '../constants'

const props = defineProps({
  symbol: { type: String, required: true },
  account: { type: String, default: undefined },
  strategy: { type: String, default: undefined }
})

const INTERVALS = ['1m', '3m', '5m', '15m', '30m', '60m']
const interval = ref('1m')
const chartEl = ref(null)
let chart = null
let series = null
let markersApi = null

function toTs(dt) { return Math.floor(new Date(dt.replace(' ', 'T')).getTime() / 1000) }
function fmtTime(time) {
  const d = new Date(time * 1000)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function load() {
  const klines = await getKlines({ symbol: props.symbol, account: props.account, interval: interval.value, limit: 240 })
  const data = klines.map((k) => ({ time: toTs(k.datetime), open: k.open, high: k.high, low: k.low, close: k.close }))
  series.setData(data)

  const ms = []
  if (props.account && props.strategy) {
    const orders = await getOrders({ account: props.account, strategy: props.strategy, limit: 200 })
    const t0 = data.length ? data[0].time : 0
    for (const o of orders) {
      const t = toTs(o.submit_time)
      if (t < t0) continue
      const isLong = o.direction === 'LONG'
      const up = isLong
      const color = isLong ? UP_COLOR : DOWN_COLOR
      const isOpen = o.offset === 'OPEN'
      const isClose = o.offset && o.offset.startsWith('CLOSE')
      if (o.status === 'ALLTRADED' || o.status === 'PARTTRADED') {
        // filled order -> entry/exit marker (no longer shown as working)
        if (isOpen) {
          ms.push({ time: t, position: up ? 'belowBar' : 'aboveBar', color, shape: up ? 'arrowUp' : 'arrowDown', text: up ? '开多' : '开空' })
        } else if (isClose) {
          ms.push({ time: t, position: up ? 'belowBar' : 'aboveBar', color, shape: up ? 'arrowUp' : 'arrowDown', text: '平' })
        }
      } else if (o.status === 'NOTTRADED' || o.status === 'SUBMITTING') {
        // working (unfilled) order
        ms.push({ time: t, position: up ? 'belowBar' : 'aboveBar', color, shape: up ? 'arrowUp' : 'arrowDown', text: '挂' })
      } else if (o.status === 'CANCELLED') {
        ms.push({ time: t, position: 'aboveBar', color: '#999999', shape: 'circle', text: '撤' })
      }
    }
  }
  if (markersApi) markersApi.setMarkers(ms)
  else markersApi = createSeriesMarkers(series, ms)
}

onMounted(() => {
  chart = createChart(chartEl.value, {
    layout: { background: { color: '#ffffff' }, textColor: '#666', attributionLogo: false },
    localization: { timeFormatter: fmtTime },
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
      <span class="hint">由 1min 合成 · 红涨绿跌 · 进出场/挂撤单已标注</span>
    </div>
    <div ref="chartEl" class="chart"></div>
  </div>
</template>

<style scoped>
.kline-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.hint { font-size: 12px; color: var(--text-3); }
.chart { height: 420px; }
</style>
