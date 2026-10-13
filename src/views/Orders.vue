<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { store } from '../store'
import { getOrders, getOrderStats, getOrderDailyFreq } from '../api'
import { ACCOUNT_LABEL, ACCOUNT_COLOR, DIRECTION_MAP, OFFSET_MAP, STATUS_MAP } from '../constants'

const orders = ref([])
const stats = ref([])
const activeOrders = ref([])
const freq = ref([])

const STATUS_TYPE = {
  ALLTRADED: 'success', PARTTRADED: 'warning', NOTTRADED: 'info',
  CANCELLED: 'info', REJECTED: 'danger', SUBMITTING: 'info'
}

const ACTIVE_STATUS = ['SUBMITTING', 'NOTTRADED', 'PARTTRADED']

function acctParam() {
  return store.currentAccount === 'all' ? undefined : store.currentAccount
}

async function load() {
  const acct = acctParam()
  orders.value = await getOrders(acct ? { account: acct, limit: 300 } : { limit: 300 })
  stats.value = await getOrderStats(acct ? { account: acct } : {})
  activeOrders.value = orders.value.filter((o) => ACTIVE_STATUS.includes(o.status))
  const f = await getOrderDailyFreq(acct ? { account: acct, days: 30 } : { days: 30 })
  freq.value = [...f].sort((a, b) => b.cancelled - a.cancelled)
}

let timer = null
onMounted(() => {
  load()
  timer = setInterval(load, 5000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
watch(() => store.currentAccount, load)
</script>

<template>
  <div class="page">
    <div class="stat-row">
      <div v-for="s in stats" :key="s.account" class="stat-card">
        <div class="stat-head">
          <span class="stat-acct" :style="{ color: ACCOUNT_COLOR[s.account] }">{{ ACCOUNT_LABEL[s.account] }}</span>
          <span class="stat-day">{{ s.trading_day }}</span>
        </div>
        <div class="stat-grid">
          <div class="stat"><span class="lbl">活跃挂单</span><span class="val num">{{ s.active }}</span></div>
          <div class="stat"><span class="lbl">今日委托</span><span class="val num">{{ s.total }}</span></div>
          <div class="stat"><span class="lbl">撤单</span><span class="val num">{{ s.cancelled }}</span></div>
          <div class="stat"><span class="lbl">拒单</span><span class="val num" :class="s.rejected > 0 ? 'down' : ''">{{ s.rejected }}</span></div>
          <div class="stat"><span class="lbl">撤单率</span><span class="val num">{{ (s.cancel_rate * 100).toFixed(1) }}%</span></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">活跃挂单</div>
      <el-table :data="activeOrders" stripe max-height="360" empty-text="当前无挂单">
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="symbol" label="合约" width="150" sortable />
        <el-table-column prop="strategy" label="策略" width="150" sortable />
        <el-table-column prop="direction" label="方向" width="70">
          <template #default="{ row }"><span :class="row.direction === 'LONG' ? 'up' : 'down'">{{ DIRECTION_MAP[row.direction] }}</span></template>
        </el-table-column>
        <el-table-column prop="offset" label="开平" width="70">
          <template #default="{ row }">{{ OFFSET_MAP[row.offset] }}</template>
        </el-table-column>
        <el-table-column prop="price" label="挂单价" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="手数" width="70" align="right" sortable />
        <el-table-column prop="traded" label="已成交" width="80" align="right" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="STATUS_TYPE[row.status] || 'info'" size="small">{{ STATUS_MAP[row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="queue_delay_ms" label="入队延迟ms" width="110" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.queue_delay_ms > 500 ? 'up' : ''">{{ row.queue_delay_ms || '—' }}</span></template>
        </el-table-column>
        <el-table-column prop="submit_time" label="提交时间" width="180" />
      </el-table>
    </div>

    <div class="card">
      <div class="card-title">全部委托</div>
      <el-table :data="orders" stripe max-height="480">
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="symbol" label="合约" width="150" sortable />
        <el-table-column prop="strategy" label="策略" width="150" sortable />
        <el-table-column prop="direction" label="方向" width="70">
          <template #default="{ row }"><span :class="row.direction === 'LONG' ? 'up' : 'down'">{{ DIRECTION_MAP[row.direction] }}</span></template>
        </el-table-column>
        <el-table-column prop="offset" label="开平" width="70">
          <template #default="{ row }">{{ OFFSET_MAP[row.offset] }}</template>
        </el-table-column>
        <el-table-column prop="price" label="价格" align="right" sortable>
          <template #default="{ row }"><span class="num">{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column prop="volume" label="手数" width="70" align="right" sortable />
        <el-table-column prop="traded" label="已成交" width="70" align="right" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }"><el-tag :type="STATUS_TYPE[row.status] || 'info'" size="small">{{ STATUS_MAP[row.status] }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="queue_delay_ms" label="入队延迟ms" width="110" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.queue_delay_ms > 500 ? 'up' : ''">{{ row.queue_delay_ms || '—' }}</span></template>
        </el-table-column>
        <el-table-column prop="cancel_delay_ms" label="撤单延迟ms" width="110" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="row.cancel_delay_ms > 500 ? 'up' : ''">{{ row.cancel_delay_ms || '—' }}</span></template>
        </el-table-column>
        <el-table-column prop="submit_time" label="提交时间" width="180" />
      </el-table>
    </div>

    <div class="card">
      <div class="card-title">每日挂撤单频次 <span class="sub">按撤单数排序 · 高撤单率/高挂单数标红</span></div>
      <el-table :data="freq" stripe max-height="480">
        <el-table-column prop="day" label="日期" width="120" sortable />
        <el-table-column v-if="store.currentAccount === 'all'" prop="account" label="账户" width="80">
          <template #default="{ row }"><span :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span></template>
        </el-table-column>
        <el-table-column prop="strategy" label="策略" width="170" sortable />
        <el-table-column prop="total" label="挂单数" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="{ abnormal: row.total >= 20 }">{{ row.total }}</span></template>
        </el-table-column>
        <el-table-column prop="cancelled" label="撤单数" align="right" sortable>
          <template #default="{ row }"><span class="num" :class="{ abnormal: row.cancelled >= 15 }">{{ row.cancelled }}</span></template>
        </el-table-column>
        <el-table-column prop="rejected" label="拒单" align="right" width="70" sortable />
        <el-table-column prop="cancel_rate" label="撤单率" align="right" width="100" sortable>
          <template #default="{ row }"><span class="num" :class="{ abnormal: row.cancel_rate >= 0.5 }">{{ (row.cancel_rate * 100).toFixed(0) }}%</span></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.stat-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.stat-card { flex: 1; min-width: 320px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 16px; }
.stat-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.stat-acct { font-weight: 600; font-size: 14px; }
.stat-day { font-size: 12px; color: var(--text-3); }
.stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.stat { display: flex; flex-direction: column; gap: 4px; }
.lbl { font-size: 11px; color: var(--text-3); }
.val { font-size: 20px; font-weight: 700; }
.sub { font-size: 12px; color: var(--text-3); font-weight: 400; }
.abnormal { color: #e03131; font-weight: 600; }
</style>
