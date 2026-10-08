import { reactive } from 'vue'

export const store = reactive({
  currentAccount: 'all', // 'all' | 'real' | 'simnow'
  wsConnected: false,
  snapshot: null // 最新 WS 全量快照 { accounts, positions, strategies, system }
})

export function setAccount(v) {
  store.currentAccount = v
}
