import http from './http'
import * as mock from './mock'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const getStrategyList = (p) => (useMock ? mock.getStrategyList(p) : http.get('/api/strategies', { params: p }))
export const getAccountLatest = (p) => (useMock ? mock.getAccountLatest(p) : http.get('/api/account/latest', { params: p }))
export const getPositions = (p) => (useMock ? mock.getPositions(p) : http.get('/api/positions', { params: p }))
export const getAccountPositions = (p) => (useMock ? mock.getPositions(p) : http.get('/api/account-positions', { params: p }))
export const getAccountIntradayPnl = (p) => (useMock ? mock.getAccountLatest(p) : http.get('/api/account-intraday-pnl', { params: p }))
export const getOrders = (p) => (useMock ? mock.getOrders(p) : http.get('/api/orders', { params: p }))
export const getOrderStats = (p) => (useMock ? mock.getOrderStats(p) : http.get('/api/orders/stats', { params: p }))
export const getOrderDailyFreq = (p) => (useMock ? mock.getOrderDailyFreq(p) : http.get('/api/orders/daily_freq', { params: p }))
export const getTrades = (p) => (useMock ? mock.getTrades(p) : http.get('/api/trades', { params: p }))
export const getDailyPnl = (p) => (useMock ? mock.getDailyPnl(p) : http.get('/api/daily_pnl', { params: p }))
export const getEquity = (p) => (useMock ? mock.getEquity(p) : http.get('/api/equity', { params: p }))
export const getMarginSeries = (p) => (useMock ? mock.getMarginSeries(p) : http.get('/api/account/margin_series', { params: p }))
export const getStatsSummary = (p) => (useMock ? mock.getStatsSummary(p) : http.get('/api/stats/summary', { params: p }))
export const getLogs = (p) => (useMock ? mock.getLogs(p) : http.get('/api/logs', { params: p }))
export const getSystemLatest = (p) => (useMock ? mock.getSystemLatest(p) : http.get('/api/system/latest', { params: p }))
export const getKlines = (p) => (useMock ? mock.getKlines(p) : http.get('/api/klines', { params: p }))
export const getContract = (p) => (useMock ? mock.getContract(p) : http.get('/api/contract', { params: p }))
export const getServerTime = () => (useMock ? mock.getServerTime() : http.get('/api/time'))
