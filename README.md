# 全球黄金迁徙地图

展示黄金跨境报关路线、国家净流入、瑞士精炼链路、主要金库库存与区域价格信号的单页应用。页面读取 `app/data/gold-flows.json`；`scripts/fetch-gold-flows.mjs` 是该数据文件的生成脚本。

## 运行

需要 Node.js 22.13.0 或更新版本。

```bash
npm ci
npm run dev
```

## 验证

```bash
npm test
npm run lint
```

`npm test` 会构建应用，并检查地图页面的服务端渲染和数据口径。`npm run build` 单独生成部署产物。

## 数据

各功能板块的数据来源、原始链接、观测期、更新周期和计算口径见 [DATA_SOURCES.md](DATA_SOURCES.md)。

数据快照提交在 `app/data/gold-flows.json`，无需现场访问外部接口即可展示。更新前先核对 `scripts/fetch-gold-flows.mjs` 中的共同对比月份、各市场最近月份和 `manualSnapshots` 的官方来源数值；脚本只会自动抓取 UN Comtrade，其他来源不会随脚本自动更新。核对后运行 `node scripts/fetch-gold-flows.mjs`，检查快照变更并运行测试。页面的数据来源和局限性可在“数据底稿”部分查看。

`.openai/hosting.json`、`build/sites-vite-plugin.ts`、`vite.config.ts` 和 `worker/index.ts` 用于构建及部署这个地图应用。
