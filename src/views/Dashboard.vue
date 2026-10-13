<script setup>
import { ref, watch, onMounted } from 'vue'
import { store } from '../store'
import { getAccountLatest, getSystemLatest, getEquity, getMarginSeries, getAccountPositions, getAccountIntradayPnl } from '../api'
import { DIRECTION_MAP, ACCOUNT_LABEL, ACCOUNT_COLOR } from '../constants'
import AccountCard from '../components/AccountCard.vue'
import EquityChart from '../components/EquityChart.vue'
import DrawdownChart from '../components/DrawdownChart.vue'

const accounts = ref([])
const sys = ref(null)
const equity = ref([])
const margin = ref([])
const positions = ref([])
const dailyPnl = ref([])
const accountEquityDaily = ref([])
const freq = ref('daily')
const marginFreq = ref('daily')

function acctParam() {
  return store.currentAccount === 'all' ? undefined : store.currentAccount
}

async function load() {
  const acct = acctParam()
  accounts.value = await getAccountLatest(acct ? { account: acct } : {})
  sys.value = await getSystemLatest()
  equity.value = await getEquity(acct ? { account: acct, freq: freq.value } : { freq: freq.value })
  margin.value = await getMarginSeries(acct ? { account: acct, freq: marginFreq.value } : { freq: marginFreq.value })
  positions.value = await getAccountPositions(acct ? { account: acct } : {})
  dailyPnl.value = await getAccountIntradayPnl(acct ? { account: acct } : {})
  accountEquityDaily.value = await getEquity(acct ? { account: acct, freq: 'daily' } : { freq: 'daily' })
}

onMounted(load)

watch(() => store.snapshot, (snap) => {
  if (!snap) return
  const acct = store.currentAccount
  if (snap.accounts) {
    accounts.value = acct === 'all' ? snap.accounts : snap.accounts.filter((a) => a.account === acct)
  }
  if (snap.positions) {
    positions.value = acct === 'all' ? snap.positions : snap.positions.filter((p) => p.account === acct)
  }
  if (snap.intraday_pnl) {
    dailyPnl.value = acct === 'all' ? snap.intraday_pnl : snap.intraday_pnl.filter((p) => p.account === acct)
  }
  if (snap.system) {
    sys.value = snap.system
  }
})

watch(() => store.currentAccount, load)
watch(freq, load)
watch(marginFreq, load)
</script>

<template>
  <div class="page">
    <div class="row">
      <AccountCard v-for="a in accounts" :key="a.account" :account="a" />
    </div>

    <div class="card">
      <div class="card-title">账户持仓</div>
      <el-table :data="positions" stripe max-height="420">
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="vt_symbol" label="合约" width="150" sortable />
        <el-table-column prop="direction" label="方向" width="80">
          <template #default="{ row }"><span :class="row.direction === 'LONG' ? 'up' : 'down'">{{ DIRECTION_MAP[row.direction] }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="手数" width="80" align="right" sortable />
        <el-table-column prop="price" label="成本" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="pnl" label="盈亏" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.pnl >= 0 ? 'up' : 'down'">{{ row.pnl }}</span></template>
        </el-table-column>
        <el-table-column prop="snapshot_time" label="时间" width="180" sortable />
      </el-table>
    </div>

    <div v-if="equity.length" class="card">
      <div class="card-title">账户净值曲线</div>
      <el-radio-group v-model="freq" size="small" style="margin-bottom: 8px">
        <el-radio-button value="daily">日频</el-radio-button>
        <el-radio-button value="intraday">日内</el-radio-button>
      </el-radio-group>
      <EquityChart :data="equity" />
    </div>

    <div v-if="accountEquityDaily.length" class="card">
      <div class="card-title">账户回撤</div>
      <DrawdownChart :data="accountEquityDaily" />
    </div>

    <div v-if="margin.length" class="card">
      <div class="card-title">保证金占用</div>
      <el-radio-group v-model="marginFreq" size="small" style="margin-bottom: 8px">
        <el-radio-button value="daily">日频</el-radio-button>
        <el-radio-button value="intraday">日内</el-radio-button>
      </el-radio-group>
      <EquityChart :data="margin" value-key="margin_pct" unit="%" />
    </div>

    <div v-if="dailyPnl.length" class="card">
      <div class="card-title">账户日内盈亏</div>
      <el-table :data="dailyPnl" stripe>
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="trading_day" label="交易日" width="120" />
        <el-table-column prop="realized_pl" label="已实现盈亏" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.realized_pl >= 0 ? 'up' : 'down'">{{ row.realized_pl }}</span></template>
        </el-table-column>
        <el-table-column prop="floating_pl" label="持仓浮动盈亏" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.floating_pl >= 0 ? 'up' : 'down'">{{ row.floating_pl }}</span></template>
        </el-table-column>
        <el-table-column label="总盈亏" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.realized_pl + row.floating_pl >= 0 ? 'up' : 'down'">{{ (row.realized_pl + row.floating_pl).toFixed(2) }}</span></template>
        </el-table-column>
        <el-table-column prop="balance" label="权益" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.balance }}</span></template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="sys" class="card">
      <div class="card-title">系统指标</div>
      <div class="sys-grid">
        <div class="sys-cell"><span class="lbl">CPU</span><span class="val num">{{ sys.cpu }}%</span></div>
        <div class="sys-cell"><span class="lbl">内存</span><span class="val num">{{ sys.mem }}%</span></div>
        <div class="sys-cell"><span class="lbl">磁盘</span><span class="val num">{{ sys.disk }}%</span></div>
        <div class="sys-cell"><span class="lbl">运行时间</span><span class="val num">{{ sys.uptime }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row { display: flex; gap: 16px; flex-wrap: wrap; }
.sys-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.sys-cell { display: flex; flex-direction: column; gap: 4px; }
.lbl { font-size: 11px; color: var(--text-3); }
.val { font-size: 18px; font-weight: 600; }
</style>
