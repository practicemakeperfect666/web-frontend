<script setup>
import { useRoute } from 'vue-router'
import { store } from './store'
import AccountSwitch from './components/AccountSwitch.vue'

const route = useRoute()

const menus = [
  { path: '/', label: '策略' },
  { path: '/dashboard', label: '仪表盘' },
  { path: '/logs', label: '日志' }
]
</script>

<template>
  <el-container class="app">
    <el-aside width="220px" class="aside">
      <div class="logo">
        vnpy-domestic
        <span class="logo-sub">Web 监控</span>
      </div>
      <el-menu :default-active="route.path" router class="menu">
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">{{ m.label }}</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header" height="56px">
        <div class="header-title">{{ route.meta.title }}</div>
        <div class="header-right">
          <AccountSwitch v-if="route.name !== 'strategy-detail'" />
          <span class="conn" :class="{ on: store.wsConnected }">
            {{ store.wsConnected ? '● 已连接' : '○ 未连接' }}
          </span>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app { height: 100%; }

.aside {
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.logo {
  height: 56px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid var(--border);
}

.logo-sub { font-size: 11px; color: var(--text-3); font-weight: 400; }

.menu { border-right: none; flex: 1; }

.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title { font-size: 16px; font-weight: 600; }

.header-right { display: flex; align-items: center; gap: 16px; }

.conn { color: var(--text-3); font-size: 12px; }
.conn.on { color: var(--down-color); }

.main { padding: 20px; overflow: auto; }
</style>
