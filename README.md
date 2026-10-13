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

## ✨ 功能

- 策略维度首页 → 策略详情
- 双账户切换（real / simnow / 全部）
- WebSocket 快照实时更新 + REST 拉历史
- 白底现代主题，红涨绿跌（国内期货习惯）
- 内置 mock 数据，无需后端即可纯 UI 开发

## 📄 页面

| 路由 | 文件 | 说明 |
| :--- | :--- | :--- |
| `/` | `views/Strategies.vue` | 策略卡片首页 |
| `/strategy/:account/:strategy` | `views/StrategyDetail.vue` | 策略详情 |
| `/dashboard` | `views/Dashboard.vue` | 账户 + 系统仪表盘 |
| `/orders` | `views/Orders.vue` | 委托与挂撤单 |
| `/logs` | `views/Logs.vue` | 实时日志 |

### 策略首页（`/`）

网格卡片，每个策略一张卡，点击进入详情。卡片字段：品种徽章（按品种配色）、账户标签、策略名、合约代码、净持仓、盈亏、状态点、更新时间。静态字段走 REST，`pos` / `pnl` / `status` 由 WS 快照实时刷新。

### 策略详情（`/strategy/:account/:strategy`）

顶部返回键 + 策略名 / 品种·合约 / 账户标签 / 状态 / 净持仓 / 盈亏，往下分块展示：

- 合约信息：合约、品种、交易所、合约乘数、最小变动价位、保证金率
- 行情：K 线（lightweight-charts）
- 持仓：合约 / 方向 / 手数 / 成本 / 盈亏 / 时间
- 成交：合约 / 价格 / 手数 / 滑点 / 延迟 ms / 时间
- 委托：方向 / 开平 / 价格 / 量 / 状态
- 净值曲线（日频 / 日内切换）与回撤曲线
- 每日盈亏：今日已实现盈亏 + 柱状图
- 绩效统计：总平仓笔数、日均交易、胜率、盈亏比、平均持仓、累计盈亏、收益率，再分多头 / 空头两组明细

### 仪表盘（`/dashboard`）

账户维度总览（区别于策略维度）：AccountCard 账户卡、账户持仓表、账户净值曲线（日频 / 日内）、保证金占用曲线（%）、账户日内盈亏表（已实现 / 浮动 / 总盈亏 / 权益）、系统指标（CPU / 内存 / 磁盘 / 运行时间）。

### 订单（`/orders`）

顶部按账户统计卡（活跃挂单 / 今日委托 / 撤单 / 拒单 / 撤单率）；活跃挂单表（仅 SUBMITTING / NOTTRADED / PARTTRADED）；全部委托表（最多 300 条）；每日挂撤单频次表（按撤单数降序，挂单≥20、撤单≥15、撤单率≥50% 标红）。

### 日志（`/logs`）

实时日志流，每行 = 时间戳 + 账户 + 级别 + 消息，级别配色 INFO / WARNING / ERROR，加载后自动滚到最新一条。

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

## 🚀 安装与使用

安装依赖、启动开发服务器、Mock 模式、生产构建与部署等完整步骤见 vnpy-domestic 主仓库的 [vnpy-domestic-web端监控使用手册.md](https://github.com/practicemakeperfect666/vnpy-domestic/blob/main/vnpy-domestic-web%E7%AB%AF%E7%9B%91%E6%8E%A7%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C.md)。

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
