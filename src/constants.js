export const DIRECTION_MAP = { LONG: '多', SHORT: '空' }

export const OFFSET_MAP = { OPEN: '开', CLOSE: '平', CLOSETODAY: '平今', CLOSEYESTERDAY: '平昨' }

export const STATUS_MAP = {
  SUBMITTING: '提交中',
  NOTTRADED: '未成交',
  PARTTRADED: '部分成交',
  ALLTRADED: '全部成交',
  CANCELLED: '已撤销',
  REJECTED: '被拒'
}

export const ACCOUNT_LABEL = { real: '实盘', simnow: '模拟' }

export const ACCOUNT_COLOR = { real: '#d94848', simnow: '#3b82f6' }

export const UP_COLOR = '#e03131'
export const DOWN_COLOR = '#16a34a'

// trading_day is "2026-09-28" (isoformat) or "20260928" (legacy seed) — normalize to "MM/DD".
export const fmtDay = (v) => {
  const s = String(v)
  if (s.includes(' ')) {
    return s.slice(11, 16)
  }
  const d = s.replace(/-/g, '')
  return `${d.slice(4, 6)}/${d.slice(6, 8)}`
}
