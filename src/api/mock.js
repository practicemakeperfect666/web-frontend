// Mock data for standalone frontend development.
// Fields are snake_case to match the backend OpenAPI contract exactly.

const STRATEGIES = [
  { strategy: 'MultiLayer_m', symbol: 'm2701.DCE', name: '豆粕', exchange: 'DCE', base: 3120 },
  { strategy: 'MultiLayer_SR', symbol: 'SR701.CZCE', name: '白糖', exchange: 'CZCE', base: 5850 },
  { strategy: 'MultiLayer_rb', symbol: 'rb2610.SHFE', name: '螺纹', exchange: 'SHFE', base: 3480 },
  { strategy: 'MultiLayer_TA', symbol: 'TA701.CZCE', name: 'PTA', exchange: 'CZCE', base: 5240 },
  { strategy: 'MultiLayer_v', symbol: 'v2701.DCE', name: 'PVC', exchange: 'DCE', base: 6180 }
]

const CONTRACT_INFO = {
  'm2701.DCE': { name: '豆粕', product: '豆粕', exchange: 'DCE', size: 10, pricetick: 1, margin_rate: 8 },
  'SR701.CZCE': { name: '白糖', product: '白砂糖', exchange: 'CZCE', size: 10, pricetick: 1, margin_rate: 9 },
  'rb2610.SHFE': { name: '螺纹', product: '螺纹钢', exchange: 'SHFE', size: 10, pricetick: 1, margin_rate: 10 },
  'TA701.CZCE': { name: 'PTA', product: '精对苯二甲酸', exchange: 'CZCE', size: 5, pricetick: 2, margin_rate: 8 },
  'v2701.DCE': { name: 'PVC', product: '聚氯乙烯', exchange: 'DCE', size: 5, pricetick: 1, margin_rate: 9 }
}

const ACCOUNTS = ['real', 'simnow']
const INTERVAL_MIN = { '1m': 1, '3m': 3, '5m': 5, '15m': 15, '30m': 30, '60m': 60 }

function pad(n) { return String(n).padStart(2, '0') }
function fmt(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function now() { return fmt(new Date()) }
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(21, 0, 0, 0)
  return d
}

function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}
function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000
  return h
}

function filter(rows, account, strategy) {
  if (account) rows = rows.filter((r) => r.account === account)
  if (strategy) rows = rows.filter((r) => r.strategy === strategy)
  return rows
}

// ---- strategy list (one row per account x strategy) ----
export function getStrategyList({ account } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      const long = acct === 'real' ? (Math.random() > 0.4 ? 2 : 0) : 10
      const short = acct === 'real' ? (Math.random() > 0.7 ? 1 : 0) : 0
      rows.push({
        strategy: s.strategy, symbol: s.symbol, name: s.name, account: acct,
        status: 'running', pos: long - short, long_pos: long, short_pos: short,
        pnl: Math.round(Math.random() * 8000 - 3000),
        parameters: { layers: 6, step: 5 },
        variables: { bars: 1024 },
        update_time: now()
      })
    }
  }
  return Promise.resolve(filter(rows, account))
}

// ---- account latest ----
export function getAccountLatest({ account } = {}) {
  const rows = [
    { account: 'real', balance: 1052500, available: 382400, frozen: 0, margin: 670100, pnl: 12500, snapshot_time: now() },
    { account: 'simnow', balance: 977200, available: 210800, frozen: 0, margin: 766400, pnl: -8300, snapshot_time: now() }
  ]
  return Promise.resolve(filter(rows, account))
}

// ---- positions ----
export function getPositions({ account, strategy } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      const long = acct === 'real' ? 2 : 10
      rows.push({
        strategy: s.strategy, account: acct, vt_symbol: s.symbol,
        direction: 'LONG', volume: long,
        avg_price: +(s.base + (Math.random() * 40 - 20)).toFixed(1),
        pnl: Math.round(Math.random() * 6000 - 2000),
        trading_day: '20260926', snapshot_time: now()
      })
    }
  }
  return Promise.resolve(filter(rows, account, strategy))
}

// ---- orders ----
export function getOrders({ account, strategy, limit = 60 } = {}) {
  const rows = []
  const statuses = ['NOTTRADED', 'PARTTRADED', 'ALLTRADED']
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      for (let i = 0; i < 3; i++) {
        rows.push({
          vt_orderid: `${acct}.${s.strategy}.${i}`,
          strategy: s.strategy, account: acct, symbol: s.symbol, exchange: s.exchange,
          direction: i % 2 ? 'SHORT' : 'LONG', offset: i % 3 ? 'CLOSE' : 'OPEN',
          price: +(s.base + (Math.random() * 20 - 10)).toFixed(1),
          volume: acct === 'real' ? 1 : 5, traded: 0,
          status: statuses[i % 3], submit_time: now(), delay_ms: 0
        })
      }
    }
  }
  return Promise.resolve(filter(rows, account, strategy).slice(0, limit))
}

// ---- trades ----
export function getTrades({ account, strategy, limit = 100 } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      for (let i = 0; i < 5; i++) {
        rows.push({
          vt_tradeid: `${acct}.${s.strategy}.${i}`,
          vt_orderid: `${acct}.${s.strategy}.o${i}`,
          strategy: s.strategy, account: acct, symbol: s.symbol, exchange: s.exchange,
          price: +(s.base + (Math.random() * 30 - 15)).toFixed(1),
          volume: acct === 'real' ? 1 : 5,
          slippage: +(Math.random() * 2).toFixed(2),
          delay_ms: Math.floor(200 + Math.random() * 800),
          trade_time: now()
        })
      }
    }
  }
  return Promise.resolve(filter(rows, account, strategy).slice(0, limit))
}

// ---- daily pnl ----
export function getDailyPnl({ account, strategy, days = 30 } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      let cum = 0
      for (let i = days; i >= 1; i--) {
        const realized = Math.round(Math.random() * 4000 - 1200)
        cum += realized
        const d = daysAgo(i)
        rows.push({
          trading_day: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
          strategy: s.strategy, account: acct, realized_pl: realized, cumulative_pl: cum
        })
      }
    }
  }
  return Promise.resolve(filter(rows, account, strategy))
}

// ---- equity curve ----
export function getEquity({ account, strategy, days = 30 } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    if (strategy) {
      // strategy-level: one curve per strategy
      for (const s of STRATEGIES) {
        let v = 1000000
        for (let i = days; i >= 1; i--) {
          v += Math.round(Math.random() * 8000 - 3000)
          const d = daysAgo(i)
          rows.push({
            trading_day: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
            account: acct, strategy: s.strategy, equity: v
          })
        }
      }
    } else {
      // account-level: one aggregate curve per account
      let v = 1000000
      for (let i = days; i >= 1; i--) {
        v += Math.round(Math.random() * 8000 - 3000)
        const d = daysAgo(i)
        rows.push({
          trading_day: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
          account: acct, equity: v
        })
      }
    }
  }
  return Promise.resolve(filter(rows, account, strategy))
}

// ---- margin series ----
export function getMarginSeries({ account, days = 30 } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    let balance = 1000000
    let margin = 600000
    for (let i = days; i >= 1; i--) {
      balance += Math.round(Math.random() * 20000 - 8000)
      margin += Math.round(Math.random() * 15000 - 5000)
      const d = daysAgo(i)
      rows.push({
        trading_day: `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`,
        account: acct, balance: balance, margin: margin,
        margin_pct: +(margin / balance * 100).toFixed(2)
      })
    }
  }
  return Promise.resolve(filter(rows, account))
}

// ---- stats summary ----
export function getStatsSummary({ account, strategy } = {}) {
  const rows = []
  for (const acct of ACCOUNTS) {
    for (const s of STRATEGIES) {
      const winRate = +(0.4 + Math.random() * 0.3).toFixed(2)
      rows.push({
        account: acct, strategy: s.strategy,
        total_rounds: 38, win_rate: winRate, profit_factor: 1.8, avg_holding_seconds: 5400,
        long: { rounds: 20, win_rate: winRate, pnl: 8200 },
        short: { rounds: 18, win_rate: +(winRate - 0.05).toFixed(2), pnl: 4300 }
      })
    }
  }
  return Promise.resolve(filter(rows, account, strategy))
}

// ---- logs (global, not per strategy in mock) ----
export function getLogs({ account, limit = 200 } = {}) {
  const levels = ['INFO', 'INFO', 'INFO', 'WARNING', 'ERROR']
  const msgs = ['收到K线', '委托已提交', '持仓已平', '换月检查通过', 'CTP重连', '保证金不足', '每日盈亏归零', '策略已启动']
  const rows = []
  for (const acct of ACCOUNTS) {
    for (let i = 0; i < limit / 2; i++) {
      rows.push({
        ts: now(), level: levels[i % levels.length],
        strategy: STRATEGIES[i % STRATEGIES.length].strategy, account: acct, message: msgs[i % msgs.length]
      })
    }
  }
  return Promise.resolve(filter(rows, account))
}

// ---- system metrics ----
export function getSystemLatest() {
  return Promise.resolve({
    ts: now(), cpu: Math.round(Math.random() * 40 + 10), mem: Math.round(Math.random() * 30 + 40),
    disk: Math.round(Math.random() * 10 + 50), uptime: '3d 14h'
  })
}

// ---- contract info ----
export function getContract({ symbol } = {}) {
  const info = CONTRACT_INFO[symbol]
  return Promise.resolve(info ? { symbol, ...info } : null)
}

// ---- klines (1m base, aggregate to higher interval) ----
function generate1m(symbol, count) {
  const s = STRATEGIES.find((x) => x.symbol === symbol) || STRATEGIES[0]
  const rnd = seededRandom(hashSeed(s.symbol))
  const rows = []
  let price = s.base
  const start = new Date()
  start.setHours(9, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const open = price
    const close = open + (rnd() - 0.5) * 8
    const high = Math.max(open, close) + rnd() * 4
    const low = Math.min(open, close) - rnd() * 4
    const d = new Date(start.getTime() + i * 60000)
    rows.push({
      symbol, exchange: s.exchange, account: 'real', interval: '1m',
      datetime: fmt(d), open: +open.toFixed(1), high: +high.toFixed(1), low: +low.toFixed(1), close: +close.toFixed(1), volume: Math.floor(rnd() * 500 + 100)
    })
    price = close
  }
  return rows
}

function aggregate(raw, n) {
  const out = []
  for (let i = 0; i < raw.length; i += n) {
    const chunk = raw.slice(i, i + n)
    if (chunk.length === 0) continue
    out.push({
      ...chunk[0],
      open: chunk[0].open,
      close: chunk[chunk.length - 1].close,
      high: Math.max(...chunk.map((c) => c.high)),
      low: Math.min(...chunk.map((c) => c.low)),
      volume: chunk.reduce((s, c) => s + c.volume, 0)
    })
  }
  return out
}

export function getKlines({ symbol, interval = '1m', limit = 240 } = {}) {
  const n = INTERVAL_MIN[interval] || 1
  const raw = generate1m(symbol, limit * n)
  const rows = n === 1 ? raw : aggregate(raw, n)
  rows.forEach((r) => { r.interval = interval })
  return Promise.resolve(rows)
}

// ---- snapshot for WS mock ----
export function mockSnapshot() {
  return {
    accounts: [
      { account: 'real', balance: 1052500 + Math.round(Math.random() * 1000), available: 382400, frozen: 0, margin: 670100, pnl: 12500, snapshot_time: now() },
      { account: 'simnow', balance: 977200 + Math.round(Math.random() * 1000), available: 210800, frozen: 0, margin: 766400, pnl: -8300, snapshot_time: now() }
    ],
    positions: [],
    strategies: []
  }
}
