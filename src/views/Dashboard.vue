<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { store } from '../store'
import { getAccountLatest, getSystemLatest, getEquity, getMarginSeries, getPositions } from '../api'
import { connectWS } from '../api/ws'
import { DIRECTION_MAP, ACCOUNT_LABEL, ACCOUNT_COLOR } from '../constants'
import AccountCard from '../components/AccountCard.vue'
import EquityChart from '../components/EquityChart.vue'
import DrawdownChart from '../components/DrawdownChart.vue'

const accounts = ref([])
const sys = ref(null)
const equity = ref([])
const margin = ref([])
const positions = ref([])
let wsCleanup = null

function acctParam() {
  return store.currentAccount === 'all' ? undefined : store.currentAccount
}

async function load() {
  const acct = acctParam()
  accounts.value = await getAccountLatest(acct ? { account: acct } : {})
  sys.value = await getSystemLatest()
  equity.value = await getEquity(acct ? { account: acct } : {})
  margin.value = await getMarginSeries(acct ? { account: acct } : {})
  positions.value = await getPositions(acct ? { account: acct } : {})
}

onMounted(() => {
  load()
  wsCleanup = connectWS((msg) => {
    if (msg.type === 'snapshot' && msg.data.accounts) {
      const acct = store.currentAccount
      accounts.value = acct === 'all' ? msg.data.accounts : msg.data.accounts.filter((a) => a.account === acct)
    }
  })
})

onBeforeUnmount(() => wsCleanup && wsCleanup())

watch(() => store.currentAccount, load)
</script>

<template>
  <div class="page">
    <div class="row">
      <AccountCard v-for="a in accounts" :key="a.account" :account="a" />
    </div>

    <div class="card">
      <div class="card-title">账户持仓</div>
      <el-table :data="positions" stripe>
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="vt_symbol" label="合约" width="150" sortable />
        <el-table-column prop="strategy" label="策略" width="150" sortable />
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
        <el-table-column prop="snapshot_time" label="时间" width="180" sortable />
      </el-table>
    </div>

    <div v-if="equity.length" class="card">
      <div class="card-title">账户净值曲线</div>
      <EquityChart :data="equity" />
    </div>

    <div v-if="equity.length" class="card">
      <div class="card-title">回撤</div>
      <DrawdownChart :data="equity" />
    </div>

    <div v-if="margin.length" class="card">
      <div class="card-title">保证金占用</div>
      <EquityChart :data="margin" value-key="margin_pct" unit="%" />
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
