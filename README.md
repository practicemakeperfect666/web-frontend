<div align="center">

# web-frontend

**vnpy-domestic 的 Web 监控面板**

![Vue](https://img.shields.io/badge/vue-3.x-42b883?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/vite-5.x-646cff?style=flat-square&logo=vite)
![Element Plus](https://img.shields.io/badge/element--plus-2.x-409eff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

</div>

---

## 📖 简介

`web-frontend` 是 [vnpy-domestic](https://github.com/practicemakeperfect666/vnpy-domestic) 的浏览器监控面板。在单一视图里同时展示实盘 + simnow 双账户的实时与历史交易状态：策略卡片 → 策略详情（净值 / 回撤 / K 线 / 合约信息 / 账户持仓），另有 Dashboard / Orders / Logs 页面。

## 🛠️ 技术栈

- Vue 3（`<script setup>` SFC）
- Vite
- Element Plus（UI 组件）
- ECharts（净值 / 回撤 / 盈亏图表）
- lightweight-charts（K 线）

## ✨ 特性

- 策略维度首页 → 策略详情
- 双账户切换（real / simnow / 全部）
- WebSocket 快照实时更新 + REST 拉历史
- 白底现代主题，红涨绿跌（国内期货习惯）

## 📦 环境要求

- Node.js ≥ 18

## 🚀 安装

```bash
npm install
```

## ▶️ 运行（开发）

```bash
npm run dev    # http://localhost:5173
```

`/api` 和 `/ws` 已代理到后端 `127.0.0.1:8000`（见 `vite.config.js`）。

### Mock 模式（无需后端）

```bash
# .env
VITE_USE_MOCK=true
npm run dev
```

使用内存 demo 数据渲染，适合纯 UI 开发。

## 🔨 构建（生产）

```bash
npm run build   # 输出 dist/
```

用 nginx 托管 `dist/`，把 `/api` 和 `/ws` 反代到后端。

## 🌍 环境变量

| 变量 | 默认值 | 说明 |
| :--- | :----- | :--------------------------------- |
| `VITE_USE_MOCK` | `false` | 用 mock 数据替代后端 |

复制 `.env.example` 为 `.env`（或 `.env.development` / `.env.production`）覆盖默认值。

## 📁 项目结构

```
web-frontend/
├── index.html
├── vite.config.js          # dev server + /api /ws 代理
├── package.json
└── src/
    ├── api/                # axios 封装、接口映射、mock 数据、WS 客户端
    ├── components/         # AccountCard、图表、K 线等
    ├── views/              # Dashboard / Strategies / StrategyDetail / Orders / Logs
    ├── router/             # vue-router 路由
    ├── styles/theme.css    # 白底主题，红涨绿跌
    ├── constants.js        # 方向/开平/状态映射、颜色
    ├── store.js            # 响应式全局状态（账户切换、快照）
    ├── App.vue
    └── main.js
```

## 🔗 相关项目

- [web-backend](https://github.com/practicemakeperfect666/web-backend) —— 本面板对接的 FastAPI 后端（REST + WebSocket）
- [vnpy-domestic](https://github.com/practicemakeperfect666/vnpy-domestic) —— 写 `monitor.db` 的交易核心

## 📄 License

本项目采用 [MIT License](./LICENSE)。

```
MIT License

Copyright (c) 2026 web-frontend contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
