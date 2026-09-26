import { reactive } from 'vue'

export const store = reactive({
  currentAccount: 'all', // 'all' | 'real' | 'simnow'
  wsConnected: false
})

export function setAccount(v) {
  store.currentAccount = v
}
