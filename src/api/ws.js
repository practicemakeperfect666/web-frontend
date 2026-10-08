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
  // dev 直连后端 8000（ws 不受同源限制，绕过 vite proxy）；生产走 nginx 反代 location.host
  const wsHost = import.meta.env.DEV ? '127.0.0.1:8000' : location.host

  const connect = () => {
    if (closed) return
    ws = new WebSocket(`${proto}://${wsHost}/ws`)
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
