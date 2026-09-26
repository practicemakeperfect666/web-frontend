import { store } from '../store'
import * as mock from './mock'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// connectWS(onMessage) -> cleanup function
export function connectWS(onMessage) {
  if (useMock) {
    const timer = setInterval(() => {
      onMessage({ type: 'snapshot', data: mock.mockSnapshot() })
    }, 2000)
    store.wsConnected = true
    return () => clearInterval(timer)
  }

  let ws = null
  let delay = 1000
  let closed = false
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'

  const connect = () => {
    if (closed) return
    ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onopen = () => { delay = 1000; store.wsConnected = true }
    ws.onmessage = (e) => onMessage(JSON.parse(e.data))
    ws.onclose = () => {
      store.wsConnected = false
      if (closed) return
      setTimeout(connect, delay)
      delay *= 2
    }
    ws.onerror = () => ws.close()
  }

  connect()
  return () => { closed = true; if (ws) ws.close() }
}
