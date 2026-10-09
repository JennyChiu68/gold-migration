# 黄金迁徙地图：功能与数据来源对照

本文件对应当前页面和数据快照，核对日期为 **2026-10-09（北京时间）**。页面读取 [`app/data/gold-flows.json`](app/data/gold-flows.json)，由 [`scripts/fetch-gold-flows.mjs`](scripts/fetch-gold-flows.mjs) 生成。下文的“数据期”是统计对象的日期；页面顶部的“页面更新”来自 `fetchedAt`，只表示快照生成时间，**不代表所有来源都更新到了当天**。

本次发现上金所于 2026-10-09 发布 9 月月报，已将上海出库、交割及环比基期更新到 2026-09/2026-08；趋势为“出库增加”。UN Comtrade 的发布/修订记录及 LBMA 9 月工作簿与 10 月 8 日一致：共同排名/方向仍为 2026-06，英国等单市场最新期不变，伦敦库存仍为 2026-09。瑞士进口 CSV 和 CME 库存表本次连接失败，不能认定它们没有更新。上金所日行情及 ECB 汇率已推进到 2026-10-08，但无法取得最新同日 LBMA 精确价格，价差继续保留 2026-09-28。详细结果见 [2026-10-09 数据核对](data-checks/2026-10-09/README.md)。

## 一、功能板块与来源一一对应

| 页面板块 | 展示内容与快照字段 | 原始来源 | 当前数据期 | 来源更新周期 |
| --- | --- | --- | --- | --- |
| 01 黄金罗盘 | 伦敦库存与环比：`vaults.london`；东向报关量与环比：`network.direction`；上海相对伦敦价差：`priceComparison` | [LBMA 伦敦金库数据](https://www.lbma.org.uk/prices-and-data/london-vault-data)；[UN Comtrade 月度贸易 API](https://uncomtrade.org/docs/un-comtrade-api/)；[上金所每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new)、[LBMA 黄金价格](https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices)、[ECB 参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | 库存 2026-09；报关共同期 2026-06、比较期 2026-05；价格 2026-09-28 | 分别为月度、各国不定期报送的月度、交易日/工作日；详见第三节 |
| 02 全球吸金榜 | 同期净流入/净流出排名：`marketBalances.comparable`；各市场最新完整观测：`marketBalances.latestAvailable` | [UN Comtrade HS 7108 月度进口与出口](https://uncomtrade.org/docs/un-comtrade-api/)；具体市场的进口和出口直达链接见第二节 | 同期排名 2026-06、环比基期 2026-05；单市场观察期见第二节 | 统计频率为月度，实际到库时间因报告国而异 |
| 03 黄金航线 | 出口枢纽筛选、路线榜、地图、重量和美元申报额：`network.origins`、`network.routes`；东向/西向汇总：`network.direction` | [UN Comtrade HS 7108 月度双边出口](https://uncomtrade.org/docs/un-comtrade-api/)；[报告国代码表](https://comtradeapi.un.org/files/v1/app/reference/Reporters.json) | 路线 2026-06；方向趋势 2026-04～2026-06 | 统计频率为月度，实际到库时间因报告国而异 |
| 04 瑞士精炼站—进口来源 | 瑞士进口总量、来源地前十、来源角色分组：`swissRefinery.importSnapshot` | [瑞士联邦海关 BAZG 黄金统计说明](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins)和[官方月度 CSV](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv)；角色分组是本项目的人工分类 | 2026-08，当前 CSV 中为暂定数据 | 月度；后续可能修订 |
| 04 瑞士精炼站—出口去向 | 瑞士报关出口总量、全部目的地和排序：`swissRefinery.exportSnapshot` | [UN Comtrade 瑞士 2026-08 出口伙伴明细](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202608&reporterCode=757&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500) | 2026-08 | 月度，实际到库时间依瑞士报送 |
| 05 三地实物信号—伦敦金库 | 金库黄金总持有量、月变化、历史趋势：`vaults.london` | [LBMA 数据页](https://www.lbma.org.uk/prices-and-data/london-vault-data)；[当前使用的 2026-09 工作簿](https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-September-2026.xlsx) | 2026-09 月末 | 每月第 5 个工作日发布上月月末数据，约滞后一个月 |
| 05 三地实物信号—COMEX 金库 | Registered、Eligible、总量、日净变化：`vaults.newYork` | [CME 金属库存报告入口](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html)；[Gold Stocks 原始表](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls) | **2026-07-30 存档**；表内活动日 2026-07-29 | 官方报告通常按交易日更新；本项目当前值未随之更新，页面已标“存档” |
| 05 三地实物信号—上金所 | 黄金出库量、交割量及出库环比：`vaults.shanghai` | [上金所月报目录](https://www.sge.com.cn/sjzx/hqyb)；[2026-09 月报 PDF](https://www.sge.com.cn/upload/file/202610/09/9e6b4a569aeb41149beed7619cad377f.pdf)；[2026-08 月报 PDF](https://www.sge.com.cn/upload/file/202609/03/31e71479a1e44d81a6f2c6167fa61a8e.pdf) | 2026-09，环比基期 2026-08 | 月度月报，具体发布日期以月报目录为准 |
| 05 多市场解读 | 将 `network.direction`、`vaults.london`、`vaults.shanghai` 并列展示；COMEX 仅提示历史存档 | 继承本表相应来源；没有独立原始数据 | 各来源数据期不同 | 随各来源快照更新 |
| 06 金价温差 | 上海 Au99.99 对伦敦 PM 的指示性溢价：`priceComparison` | [上金所 2026-09-28 每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-28&end_date=2026-09-28)；[LBMA 价格页面](https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices)；[ECB 欧元参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | 三项均取 2026-09-28 | 上金所按交易日、LBMA 在英国营业日定盘、ECB 在 TARGET 工作日发布 |
| 07 数据底稿 | 商品范围、来源清单、计算口径与限制：`commodity`、`methodology`、`sources` | 本文件所列官方来源及本项目计算规则 | 随当前快照 | 随文档和快照人工维护 |

## 二、UN Comtrade 具体查询与市场期次

项目使用 [UN Comtrade 公开预览 API](https://uncomtrade.org/docs/un-comtrade-api/) 的 `C/M/HS`（货物、月度、HS）数据，商品代码 `7108`；`M` 是报告国进口，`X` 是报告国出口。重量字段 `netWgt` 为 **千克**，页面换算为吨；`primaryValue` 是美元申报额。`isNetWgtEstimated` 为真时，页面标记“重量估算”。伙伴代码 `0` 取报告国总计；不限定 `partnerCode` 时取各伙伴明细。生成脚本另外固定 `partner2Code=0`、`customsCode=C00`、`motCode=0`。官方[数据可用性说明](https://uncomtrade.org/docs/data-availability/)指出，各国报送没有统一发布日期，已发布数据也可能修订。

| 市场（报告国代码） | 当前快照的单市场观测期 | 完整性 | 进口总计 | 出口总计 |
| --- | --- | --- | --- | --- |
| 瑞士（757） | 2026-08 | 完整 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202608&reporterCode=757&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202608&reporterCode=757&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 英国（826） | 2026-07 | 完整 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=826&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=826&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 美国（842） | 2026-07 | 完整 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=842&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=842&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 印度（699） | 2026-07 | 缺出口净重，不展示该月净额 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=699&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=699&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 中国香港（344） | 2026-07 | 完整 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=344&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=344&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 中国内地（156） | 2024-12 | 完整，但不参与 2026-06 同期榜 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202412&reporterCode=156&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202412&reporterCode=156&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 泰国（764） | 2026-05 | 缺进口净重 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202605&reporterCode=764&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202605&reporterCode=764&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 土耳其（792） | 2025-12 | 缺出口净重 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202512&reporterCode=792&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202512&reporterCode=792&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 阿联酋（784） | 2019-12 | 完整，但仅作历史观察 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=201912&reporterCode=784&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=201912&reporterCode=784&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |
| 新加坡（702） | 2026-03 | 完整；重量估算 | [M](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202603&reporterCode=702&flowCode=M&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) | [X](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202603&reporterCode=702&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500&partnerCode=0) |

“全球吸金榜”只使用 2026-06 **进口和出口重量都有效**的中国香港、印度、英国、美国、瑞士，净进口＝进口－出口，比较期为 2026-05。瑞士和印度 7 月出口总净重缺失，尚不能使用 7 月共同完整期；泰国、土耳其、阿联酋、新加坡在该共同期缺少所需数据；中国内地的较早观测单列，不混入同期排名。上表的不同月份记录只是各市场独立观察，不能互相排名。每条记录的查询链接也保存在 `marketBalances.latestAvailable[].sourceUrls`。

“黄金航线”从瑞士（757）、英国（826）、美国（842）、中国香港（344）、新加坡（702）、阿联酋（784）六个候选出口枢纽的伙伴明细建立。当前 2026-06 只有前四个枢纽有有效出口总量；页面从预设地图目的地中按重量取前 40 条显示。方向汇总使用**全部符合区域规则的已取回路线**，并非只加地图上的 40 条。可用以下直达查询核对伙伴明细：[瑞士](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202606&reporterCode=757&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)、[英国](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202606&reporterCode=826&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)、[美国](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202606&reporterCode=842&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)、[中国香港](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202606&reporterCode=344&flowCode=X&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)。东西向是项目设定的区域分组和报关流量之和，并非全球黄金实物流量；转口可造成重复计数。

## 三、其余来源的取值与更新周期

### 瑞士 BAZG 进口

- [官方说明](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins)与[原始 CSV](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv)。采用瑞士税则 `7108.1200` 的进口，合并控制代码 `911`（矿产金）、`912/913`（纯度至少 99.5% 的精炼金）、`914`（纯度低于 99.5% 的精炼金）；按申报来源国汇总重量。当前 2026-08 合计 **205.020 吨**，原表标记为暂定。
- 页面仅列前十来源国，其余归入“其余来源”。“矿产供应地／金融及转口枢纽”是页面 [`swissCategories`](app/page.tsx) 的**分析分类**，不是 BAZG 对每批黄金的矿山原产地认证。瑞士进口和 Comtrade 瑞士出口分别来自不同商品口径，不能相减推算库存。
- 来源为月度数据；网站不会自动抓取这个 CSV，更新时需人工核对最新月份、暂定状态、控制代码和来源国排名。

### 伦敦 LBMA 金库库存

- [数据页](https://www.lbma.org.uk/prices-and-data/london-vault-data)及[当前工作簿](https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-September-2026.xlsx)。取“伦敦金库持有黄金”的月末数量，工作簿中的千金衡盎司 × `0.0311034768` = 吨；月变化＝本月/上月－1。当前 2026-09 为约 **9,821.11 吨**。
- LBMA 说明其在**每月第 5 个工作日**发布上月月末数据；范围包括伦敦商业金库及英格兰银行持有量，不等于英国海关库存。网站的历史数组和最新值均需人工按新工作簿更新。

### COMEX / CME 金库库存

- [CME 报告入口](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html)与[Gold Stocks 表](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls)。原始表以金衡盎司记录 Registered、Eligible、Pledged、总量和每日变动；盎司 × `31.1034768 / 1,000,000` = 吨。**Registered 已包含 Pledged**，总量不能把 Pledged 再加一次。
- 官方库存报告通常按交易日更新；当前页面保留的数值是 **2026-07-30 存档**（表内活动日 2026-07-29）。本次未能取得可核实的更新表，故这项**不能解释为目前库存或目前日变动**。更新此板块必须先核对新官方表，再改 `manualSnapshots.newYork`。

### 上海黄金交易所月报

- [月报目录](https://www.sge.com.cn/sjzx/hqyb)、[2026-09 报告](https://www.sge.com.cn/upload/file/202610/09/9e6b4a569aeb41149beed7619cad377f.pdf)、[2026-08 报告](https://www.sge.com.cn/upload/file/202609/03/31e71479a1e44d81a6f2c6167fa61a8e.pdf)。取报告中的**黄金出库量**和**交割量**，千克 ÷ 1,000 = 吨；出库环比＝本月出库/上月出库－1。当前 2026-09 出库 **92.08324 吨**、交割 **613.28868 吨**；环比基期为 2026-08，出库增加约 **48.17%**。
- 来源是月报，具体发布时间以目录为准。出库量、交割量都**不是交易所金库总库存**；每期需人工读取报告并更新脚本中的月度快照。

### 上海—伦敦金价温差

2026-10-09 核对：上金所每日行情与 ECB 汇率均已有 2026-10-08 记录，但精确伦敦 PM 价格接口连接失败。LBMA 公开页面已迁移，历史表格需经授权门户访问；新公开图表 JSON 在本次环境返回 403，旧接口上次核对同样受限。本项目没有核实 9 月 30 日伦敦 PM 精确值，因此不能把 9 月 30 日上海价与 9 月 28 日伦敦价拼成新价差。保留原同日快照及其观测日期，不能视作目前价差。

- [上金所 Au99.99 每日收盘价](https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-28&end_date=2026-09-28)：2026-09-28 **900.89 元/克**；[LBMA Gold Price PM 历史快照来源（当前返回 403）](https://prices.lbma.org.uk/json/gold_pm.json)：同日 **4,144.55 美元/金衡盎司**；[ECB 汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)：同日 `EUR/CNY=7.6352`、`EUR/USD=1.1378`。
- 伦敦折算元/克＝`LBMA PM 美元/盎司 ÷ 31.1034768 × (EUR/CNY ÷ EUR/USD)`；指示性溢价＝`上海元/克 ÷ 伦敦折算元/克 − 1`。当前约 **+0.75%**。三项按**同一自然日期**配对，但定盘、收盘和汇率的时点不同；不含税费、运保和规格差异，不是实时套利报价。
- 上金所按交易日提供每日行情；[LBMA 黄金基准价](https://www.lbma.org.uk/prices-and-data/about-lbma-daily-auction-prices)在英国营业日有上午和下午两次定盘，公开页面有发布时间延迟；[ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)通常在 TARGET 工作日约欧洲中部时间 16:00 更新。使用或再分发 LBMA 基准价可能涉及 [IBA 授权](https://www.lbma.org.uk/prices-and-data/lbma-gold-price/lbma-gold-price)，对外商用前需核对条款。网站目前是人工核对后的固定值。

## 四、网站实际刷新方式与维护步骤

1. **网站不是实时数据服务，也没有定时刷新任务。** 浏览页面只读取仓库里的 `app/data/gold-flows.json`。
2. 更新前查看 [UN Comtrade 数据可用性](https://uncomtrade.org/docs/data-availability/)，核实共同完整月份、每个市场的单独观测月份及历史修订；修改脚本中的 `latestComparablePeriod`、`comparisonPeriod`、`networkPeriods` 和 `latestMarketDefinitions`。
3. 分别核对 BAZG、LBMA、CME、上金所月报和价格三源，修改脚本中的 `manualSnapshots`。**运行脚本不会自动更新这些手工快照。** CME 若仍无法核实，继续标明存档。
4. 在项目目录运行 `node scripts/fetch-gold-flows.mjs`，脚本会从 UN Comtrade 重新抓取月度数据并生成 JSON；核对各板块 `observationPeriod`、`sourceFetchedAt`、`status`、`sourceUrl/sourceUrls` 和数值后，再运行 `npm test`、`npm run lint`。
5. `fetchedAt` 是 JSON 生成时刻，`sourceFetchedAt` 是该模块来源核对/抓取时刻；判断新旧必须看 `observationPeriod` 与 `status`。若来源发布修订，同一观测月份的数值也可能变化。

**统一口径提醒：** UN Comtrade 是 HS `7108`（未锻造、半制成或粉末黄金）的海关报关统计；BAZG 进口侧为瑞士 `7108.1200`；LBMA/CME 是金库持有量；上金所是出库与交割；价格是不同市场和时点的报价。不同口径不可直接相加、相减或等同于全球黄金迁移总量。
