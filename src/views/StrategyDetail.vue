<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store'
import { getStrategyList, getPositions, getTrades, getOrders, getDailyPnl, getStatsSummary, getEquity, getContract } from '../api'
import { ACCOUNT_LABEL, ACCOUNT_COLOR, DIRECTION_MAP, OFFSET_MAP, STATUS_MAP } from '../constants'
import KlineChart from '../components/KlineChart.vue'
import PnlChart from '../components/PnlChart.vue'
import EquityChart from '../components/EquityChart.vue'
import DrawdownChart from '../components/DrawdownChart.vue'

const route = useRoute()
const router = useRouter()
const account = route.params.account
const strategy = route.params.strategy

const info = ref(null)
const positions = ref([])
const trades = ref([])
const orders = ref([])
const daily = ref([])
const todayPnl = computed(() => daily.value.length ? daily.value[daily.value.length - 1].realized_pl : 0)
const equity = ref([])
const equityFreq = ref('daily')
const stats = ref(null)
const contract = ref(null)

const STATUS_TYPE = {
  ALLTRADED: 'success', PARTTRADED: 'warning', NOTTRADED: 'info',
  CANCELLED: 'info', REJECTED: 'danger', SUBMITTING: 'info'
}

function fmtPct(v) { return (v * 100).toFixed(1) + '%' }
function fmtSeconds(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
}

async function load() {
  const [row] = await getStrategyList({ account, strategy })
  info.value = row
  const [ct, pos, trd, ord, dl, st] = await Promise.all([
    getContract({ symbol: row.symbol }),
    getPositions({ account, strategy }),
    getTrades({ account, strategy }),
    getOrders({ account, strategy }),
    getDailyPnl({ account, strategy }),
    getStatsSummary({ account, strategy })
  ])
  contract.value = ct
  positions.value = pos
  trades.value = trd
  orders.value = ord
  daily.value = dl
  stats.value = st[0]
  await loadEquity()
}

async function loadEquity() {
  equity.value = await getEquity({ account, strategy, freq: equityFreq.value })
}

function back() { router.push('/') }

onMounted(load)

watch(equityFreq, loadEquity)

// 实时刷新盈亏/持仓/状态（strategy_status 每 3s 写入，经 WS 推送）
watch(() => store.snapshot, (snap) => {
  if (!snap || !snap.strategies || !info.value) return
  const row = snap.strategies.find((s) => s.account === account && s.strategy === strategy)
  if (row) {
    info.value.pnl = row.pnl
    info.value.pos = row.pos
    info.value.status = row.status
  }
})
</script>

<template>
  <div class="page">
    <div class="card detail-head">
      <el-button size="small" @click="back">← 返回</el-button>
      <template v-if="info">
        <span class="d-name">{{ info.strategy }}</span>
        <span class="d-symbol">{{ info.name }} · {{ info.symbol }}</span>
        <span class="d-tag" :style="{ color: ACCOUNT_COLOR[info.account] }">{{ ACCOUNT_LABEL[info.account] }}</span>
        <span class="d-status">{{ info.status }}</span>
      </template>
      <div v-if="info" class="head-right">
        <span class="num">净持仓 {{ info.pos }}</span>
        <span class="num" :class="info.pnl >= 0 ? 'up' : 'down'">盈亏 {{ info.pnl }}</span>
      </div>
    </div>

    <div v-if="contract" class="card">
      <div class="card-title">合约信息</div>
      <el-descriptions :column="4" border>
        <el-descriptions-item label="合约">{{ contract.symbol }}</el-descriptions-item>
        <el-descriptions-item label="品种">{{ contract.product }}</el-descriptions-item>
        <el-descriptions-item label="交易所">{{ contract.exchange }}</el-descriptions-item>
        <el-descriptions-item label="合约乘数">{{ contract.size }} 吨/手</el-descriptions-item>
        <el-descriptions-item label="最小变动价位">{{ contract.pricetick }} 元/吨</el-descriptions-item>
        <el-descriptions-item label="保证金率">{{ contract.margin_rate ? contract.margin_rate + '%' : '动态' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="info" class="card">
      <div class="card-title">行情</div>
      <KlineChart :symbol="info.symbol" :account="account" :strategy="strategy" />
    </div>

    <div class="card">
      <div class="card-title">持仓</div>
      <el-table :data="positions" stripe max-height="360">
        <el-table-column prop="vt_symbol" label="合约" width="150" sortable />
        <el-table-column prop="direction" label="方向" width="80">
          <template #default="{ row }"><span :class="row.direction === 'LONG' ? 'up' : 'down'">{{ DIRECTION_MAP[row.direction] }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="手数" width="80" align="right" sortable />
        <el-table-column prop="avg_price" label="成本" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.avg_price }}</span></template>
        </el-table-column>
        <el-table-column prop="pnl" label="盈亏" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.pnl >= 0 ? 'up' : 'down'">{{ row.pnl }}</span></template>
        </el-table-column>
        <el-table-column prop="snapshot_time" label="时间" width="180" />
      </el-table>
    </div>

    <div class="card">
      <div class="card-title">成交</div>
      <el-table :data="trades" stripe max-height="360">
        <el-table-column prop="symbol" label="合约" width="150" sortable />
        <el-table-column prop="price" label="价格" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="手数" width="80" align="right" sortable />
        <el-table-column prop="slippage" label="滑点" width="90" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.slippage > 1 ? 'up' : ''">{{ row.slippage }}</span></template>
        </el-table-column>
        <el-table-column prop="delay_ms" label="延迟ms" width="100" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.delay_ms > 500 ? 'up' : ''">{{ row.delay_ms }}</span></template>
        </el-table-column>
        <el-table-column prop="trade_time" label="成交时间" width="180" />
      </el-table>
    </div>

    <div class="card">
      <div class="card-title">委托</div>
      <el-table :data="orders" stripe max-height="360">
        <el-table-column prop="direction" label="方向" width="70">
          <template #default="{ row }"><span :class="row.direction === 'LONG' ? 'up' : 'down'">{{ DIRECTION_MAP[row.direction] }}</span></template>
        </el-table-column>
        <el-table-column prop="offset" label="开平" width="70">
          <template #default="{ row }">{{ OFFSET_MAP[row.offset] }}</template>
        </el-table-column>
        <el-table-column prop="price" label="价格" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="量" width="60" align="right" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="STATUS_TYPE[row.status] || 'info'" size="small">{{ STATUS_MAP[row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="submit_time" label="提交时间" width="180" />
      </el-table>
    </div>

    <div v-if="equity.length" class="card">
      <div class="card-title">净值曲线</div>
      <el-radio-group v-model="equityFreq" size="small" style="margin-bottom: 8px">
        <el-radio-button value="daily">日频</el-radio-button>
        <el-radio-button value="intraday">日内</el-radio-button>
      </el-radio-group>
      <EquityChart :data="equity" />
    </div>

    <div v-if="equity.length" class="card">
      <div class="card-title">回撤</div>
      <DrawdownChart :data="equity" />
    </div>

    <div v-if="daily.length" class="card">
      <div class="card-title">每日盈亏</div>
      <div class="pnl-today">
        <span class="lbl">今日已实现盈亏总额</span>
        <span class="val num" :class="todayPnl >= 0 ? 'up' : 'down'">{{ todayPnl >= 0 ? '+' : '' }}{{ todayPnl }}</span>
      </div>
      <PnlChart :daily="daily" />
    </div>

    <div v-if="stats" class="card">
      <div class="card-title">绩效统计</div>
      <div class="stat-grid">
        <div class="stat"><span class="lbl">总平仓笔数</span><span class="val num">{{ stats.total_rounds }}</span></div>
        <div class="stat"><span class="lbl">日均交易次数</span><span class="val num">{{ stats.avg_trades_per_day }}</span></div>
        <div class="stat"><span class="lbl">胜率</span><span class="val num">{{ fmtPct(stats.win_rate) }}</span></div>
        <div class="stat"><span class="lbl">盈亏比</span><span class="val num">{{ stats.profit_factor }}</span></div>
        <div class="stat"><span class="lbl">平均持仓</span><span class="val num">{{ fmtSeconds(stats.avg_holding_seconds) }}</span></div>
        <div class="stat"><span class="lbl">累计盈亏</span><span class="val num" :class="stats.pnl >= 0 ? 'up' : 'down'">{{ stats.pnl }}</span></div>
        <div class="stat"><span class="lbl">收益率</span><span class="val num" :class="stats.return_rate >= 0 ? 'up' : 'down'">{{ fmtPct(stats.return_rate) }}</span></div>
      </div>
      <div class="lr-grid">
        <div class="lr-card">
          <div class="lr-title up">多头</div>
          <div class="lr-row"><span>笔数</span><span class="num">{{ stats.long.rounds }}</span></div>
          <div class="lr-row"><span>胜率</span><span class="num">{{ fmtPct(stats.long.win_rate) }}</span></div>
          <div class="lr-row"><span>盈亏比</span><span class="num">{{ stats.long.profit_factor }}</span></div>
          <div class="lr-row"><span>平均持仓</span><span class="num">{{ fmtSeconds(stats.long.avg_holding_seconds) }}</span></div>
          <div class="lr-row"><span>收益率</span><span class="num up">{{ fmtPct(stats.long.return_rate) }}</span></div>
          <div class="lr-row"><span>盈亏</span><span class="num up">{{ stats.long.pnl }}</span></div>
        </div>
        <div class="lr-card">
          <div class="lr-title down">空头</div>
          <div class="lr-row"><span>笔数</span><span class="num">{{ stats.short.rounds }}</span></div>
          <div class="lr-row"><span>胜率</span><span class="num">{{ fmtPct(stats.short.win_rate) }}</span></div>
          <div class="lr-row"><span>盈亏比</span><span class="num">{{ stats.short.profit_factor }}</span></div>
          <div class="lr-row"><span>平均持仓</span><span class="num">{{ fmtSeconds(stats.short.avg_holding_seconds) }}</span></div>
          <div class="lr-row"><span>收益率</span><span class="num down">{{ fmtPct(stats.short.return_rate) }}</span></div>
          <div class="lr-row"><span>盈亏</span><span class="num down">{{ stats.short.pnl }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-head { display: flex; align-items: center; gap: 16px; }
.d-name { font-size: 18px; font-weight: 700; }
.d-symbol { font-size: 13px; color: var(--text-3); }
.d-tag { font-size: 13px; font-weight: 600; }
.d-status { font-size: 12px; color: var(--text-2); }
.head-right { margin-left: auto; display: flex; gap: 20px; font-size: 14px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.pnl-today { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.pnl-today .lbl { font-size: 12px; color: var(--text-3); }
.pnl-today .val { font-size: 24px; font-weight: 700; }
.stat { display: flex; flex-direction: column; gap: 4px; }
.lbl { font-size: 11px; color: var(--text-3); }
.val { font-size: 22px; font-weight: 700; }
.lr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.lr-card { border: 1px solid var(--border); border-radius: 6px; padding: 14px; }
.lr-title { font-weight: 600; margin-bottom: 10px; }
.lr-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: var(--text-2); }
</style>
