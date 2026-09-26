<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { store } from '../store'
import { getLogs } from '../api'
import { ACCOUNT_LABEL } from '../constants'

const rows = ref([])
const listRef = ref(null)

const LEVEL_COLOR = { INFO: '#666', WARNING: '#e6a23c', ERROR: '#e03131' }

async function load() {
  const acct = store.currentAccount === 'all' ? undefined : store.currentAccount
  rows.value = await getLogs(acct ? { account: acct, limit: 200 } : { limit: 200 })
  await nextTick()
  if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
}
onMounted(load)
watch(() => store.currentAccount, load)
</script>

<template>
  <div class="card">
    <div class="card-title">实时日志</div>
    <div ref="listRef" class="log-list">
      <div v-for="(r, i) in rows" :key="i" class="log-row">
        <span class="ts">{{ r.ts }}</span>
        <span class="acct">{{ ACCOUNT_LABEL[r.account] || r.account }}</span>
        <span class="level" :style="{ color: LEVEL_COLOR[r.level] || '#666' }">{{ r.level }}</span>
        <span class="msg">{{ r.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.log-list { height: calc(100vh - 160px); overflow-y: auto; font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
.log-row { display: flex; gap: 12px; padding: 4px 0; border-bottom: 1px solid #f5f6f8; }
.ts { color: var(--text-3); flex-shrink: 0; }
.acct { color: var(--text-2); flex-shrink: 0; width: 52px; }
.level { flex-shrink: 0; width: 60px; font-weight: 600; }
.msg { color: var(--text); }
</style>
