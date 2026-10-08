<script setup>
import { computed } from 'vue'
import { ACCOUNT_LABEL, ACCOUNT_COLOR } from '../constants'

const props = defineProps({ account: { type: Object, required: true } })

const label = computed(() => ACCOUNT_LABEL[props.account.account] || props.account.account)
const color = computed(() => ACCOUNT_COLOR[props.account.account] || '#666')

function fmtMoney(v) {
  return (v ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtSigned(v) {
  v = v ?? 0
  const s = Math.abs(v).toLocaleString('zh-CN')
  return v > 0 ? '+' + s : v < 0 ? '-' + s : s
}
</script>

<template>
  <div class="card account-card" :style="{ borderTop: `3px solid ${color}` }">
    <div class="head">
      <div class="tag-wrap">
        <span class="dot" :style="{ background: color }"></span>
        <span class="tag">{{ label }}</span>
        <span v-if="account.accountid" class="acct-id">{{ account.accountid }}</span>
      </div>
      <span class="time">{{ account.snapshot_time }}</span>
    </div>
    <div class="balance num">{{ fmtMoney(account.balance) }}</div>
    <div class="balance-label">动态权益 (元)</div>
    <div class="grid">
      <div class="cell">
        <span class="lbl">可用</span>
        <span class="val num">{{ fmtMoney(account.available) }}</span>
      </div>
      <div class="cell">
        <span class="lbl">保证金</span>
        <span class="val num">{{ fmtMoney(account.margin) }}</span>
      </div>
      <div class="cell">
        <span class="lbl">冻结</span>
        <span class="val num">{{ fmtMoney(account.frozen) }}</span>
      </div>
      <div class="cell">
        <span class="lbl">日内已实现</span>
        <span class="val num" :class="(account.realized_pl || 0) >= 0 ? 'up' : 'down'">{{ fmtSigned(account.realized_pl) }}</span>
      </div>
      <div class="cell">
        <span class="lbl">浮动盈亏</span>
        <span class="val num" :class="account.pnl >= 0 ? 'up' : 'down'">{{ fmtSigned(account.pnl) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-card { flex: 1; min-width: 280px; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tag-wrap { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.tag { font-size: 13px; font-weight: 600; }
.acct-id { font-size: 11px; color: var(--text-3); font-variant-numeric: tabular-nums; }
.time { font-size: 11px; color: var(--text-3); }
.balance { font-size: 30px; font-weight: 700; line-height: 1.2; }
.balance-label { font-size: 11px; color: var(--text-3); margin: 4px 0 14px; }
.grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.cell { display: flex; flex-direction: column; gap: 4px; }
.lbl { font-size: 11px; color: var(--text-3); }
.val { font-size: 13px; font-weight: 500; }
</style>
