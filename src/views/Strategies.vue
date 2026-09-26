<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'
import { getStrategyList } from '../api'
import { ACCOUNT_LABEL, ACCOUNT_COLOR } from '../constants'

const router = useRouter()
const list = ref([])

const SYMBOL_COLOR = {
  '豆粕': '#2f9e44',
  '白糖': '#e8590c',
  '螺纹': '#364fc7',
  'PTA': '#862e9c',
  'PVC': '#0c8599'
}

async function load() {
  const acct = store.currentAccount === 'all' ? undefined : store.currentAccount
  list.value = await getStrategyList(acct ? { account: acct } : {})
}
onMounted(load)
watch(() => store.currentAccount, load)

function go(row) {
  router.push(`/strategy/${row.account}/${row.strategy}`)
}

function fmtSigned(v) {
  return v > 0 ? '+' + v.toLocaleString('zh-CN') : v.toLocaleString('zh-CN')
}
</script>

<template>
  <div class="page">
    <div class="grid">
      <div v-for="row in list" :key="row.account + row.strategy" class="card scard" @click="go(row)">
        <div class="sc-head">
          <span class="sc-badge" :style="{ background: SYMBOL_COLOR[row.name] || '#2563eb' }">{{ row.name }}</span>
          <span class="sc-tag" :style="{ color: ACCOUNT_COLOR[row.account] }">{{ ACCOUNT_LABEL[row.account] }}</span>
        </div>
        <div class="sc-name">{{ row.strategy }}</div>
        <div class="sc-symbol">{{ row.symbol }}</div>
        <div class="sc-pos">
          <div class="pos-block">
            <span class="lbl">净持仓</span>
            <span class="val num">{{ row.pos }}</span>
          </div>
          <div class="pos-block">
            <span class="lbl">盈亏</span>
            <span class="val num" :class="row.pnl >= 0 ? 'up' : 'down'">{{ fmtSigned(row.pnl) }}</span>
          </div>
        </div>
        <div class="sc-foot">
          <span class="sc-status"><span class="status-dot"></span>{{ row.status }}</span>
          <span class="sc-time">{{ row.update_time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.scard { cursor: pointer; transition: box-shadow 0.2s ease, transform 0.2s ease; }
.scard:hover { box-shadow: 0 8px 24px rgba(16, 24, 40, 0.1); transform: translateY(-2px); }
.sc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sc-badge { color: #fff; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 6px; }
.sc-tag { font-size: 12px; font-weight: 600; }
.sc-name { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
.sc-symbol { font-size: 12px; color: var(--text-3); margin-bottom: 14px; }
.sc-pos { display: flex; gap: 28px; margin-bottom: 14px; }
.pos-block { display: flex; flex-direction: column; gap: 2px; }
.pos-block .lbl { font-size: 11px; color: var(--text-3); }
.pos-block .val { font-size: 18px; font-weight: 700; }
.sc-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
.sc-status { font-size: 12px; color: var(--text-2); display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--down-color); }
.sc-time { font-size: 11px; color: var(--text-3); }
</style>
