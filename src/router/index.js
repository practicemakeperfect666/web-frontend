import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'strategies', component: () => import('../views/Strategies.vue'), meta: { title: '策略' } },
  { path: '/strategy/:account/:strategy', name: 'strategy-detail', component: () => import('../views/StrategyDetail.vue'), meta: { title: '策略详情' } },
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
  { path: '/orders', name: 'orders', component: () => import('../views/Orders.vue'), meta: { title: '订单' } },
  { path: '/logs', name: 'logs', component: () => import('../views/Logs.vue'), meta: { title: '日志' } }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
