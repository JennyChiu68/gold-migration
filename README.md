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

统一来源方案维护在 [source-policy.json](app/data/source-policy.json)，每项列出优先接入源、当前执行源、访问条件和检查频次。demo来源标注及Word需求共同使用这份清单。国家渠道待重量和伙伴明细验证，伦敦PM待许可；美国Census密钥可免费申请，不能将IBA许可称为免费公开API。

来源实际验证与限制见 [DATA_SOURCE_AUDIT.md](DATA_SOURCE_AUDIT.md)。待接入渠道不是当前数值出处，历史伦敦价格保留原始出处，当前价差标为历史观察。

```bash
node scripts/sync-source-policy.mjs
python scripts/build-requirements.py
```

第一个命令只同步来源标注，不改变数据期或数值。第二个生成工作区的Word需求文档；需要python-docx，文档生成后需渲染检查。

数据快照提交在 `app/data/gold-flows.json`，无需现场访问外部接口即可展示。更新前先核对 `scripts/fetch-gold-flows.mjs` 中的共同对比月份、各市场最近月份和 `manualSnapshots` 的官方来源数值；脚本只会自动抓取 UN Comtrade，其他来源不会随脚本自动更新。核对后运行 `node scripts/fetch-gold-flows.mjs`，检查快照变更并运行测试。数据来源和局限性在 DATA_SOURCES.md 中维护。

`.openai/hosting.json`、`build/sites-vite-plugin.ts`、`vite.config.ts` 和 `worker/index.ts` 用于构建及部署这个地图应用。
