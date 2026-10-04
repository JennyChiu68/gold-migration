# 黄金迁徙地图数据核对

核对日期：2026-10-04（北京时间）。对照项目上次快照 2026-09-29；原始数据期与本次检查日期分别记录。

## 核对结果

| 来源及对应板块 | 本次结果 | 项目处理 |
| --- | --- | --- |
| UN Comtrade：全球吸金榜、黄金航线、瑞士出口 | 核对十个市场的数据发布记录及修订日期。瑞士最新 2026-08；美国、香港、印度最新 2026-07；英国最新 2026-06。共同期仍为 2026-06，4～6 月已发布记录的修订日期均早于上次快照。 | 同期排名、方向趋势和瑞士出口保持原观测期。 |
| UN Comtrade：新加坡单市场观察 | 2026-03 数据于 2026-09-24 发布，项目原来仍取 2 月。核实 HS 7108、伙伴总计、进口和出口均有有效净重，均为官方估算。 | 更新单市场观察至 3 月；不参加 6 月同期排名。 |
| UN Comtrade：较早观测市场 | 泰国最新发布月份仍为 2026-05；土耳其仍为 2025-12；内地仍为 2024-12；阿联酋在已核对的 2020～2026 年月份没有新记录。新加坡 4～9 月无发布记录。 | 保留原期次及重量缺失标记。 |
| BAZG：瑞士进口来源 | 官方 CSV 最新月份仍为 2026-08，更新字段为 2026-09-10；总量、前十来源及暂定状态与项目一致。 | 无数值更新。 |
| LBMA：伦敦库存、黄金罗盘 | 官方页面最新工作簿仍为 2026-08；工作簿最新值及页面采用的历史序列与项目一致。 | 无数值更新。 |
| 上金所：出库与交割 | 月报目录最新仍为 2026-08，发布于 2026-09-03。 | 无新月份。 |
| 上金所、LBMA、ECB：金价温差 | 上金所最新每日行情为 2026-09-30，Au99.99 收盘 907.32 元/克。ECB 最新为 2026-10-02；9 月 30 日同日 EUR/CNY=7.613、EUR/USD=1.1355。LBMA 公开图表最新显示 10 月 2 日，但旧 JSON 和新图表 JSON 均被访问限制，不能核实 9 月 30 日 PM 精确值；历史表格已移至授权门户。 | 保留 2026-09-28 的三源同日价差，不混用异日价格、不从图形估算数字。 |
| CME：COMEX 库存 | 最新 Gold Stocks 官方表本次返回 403，无法核实表内报告日期和数值。 | 保留并标明 2026-07-30 历史存档；不能认定当前库存未变。 |

新加坡 3 月进口为 24.532041 吨、出口为 22.002952 吨，净进口为 2.529089 吨。仅支持该月“净流入”的判断；单月净额不能单独证明趋势加速或放缓。

## 原始依据与直达链接

- 联合国发布记录：[最近三个月](https://comtradeapi.un.org/public/v1/getDA/C/M/HS?reporterCode=757,826,842,699,344,156,764,792,784,702&period=202607,202608,202609)、[共同期及比较期](https://comtradeapi.un.org/public/v1/getDA/C/M/HS?reporterCode=757,826,842,699,344,156,764,792,784,702&period=202604,202605,202606)。对应原始返回保存在本目录 `availability-*.json`；空结果表示请求成功但所查条件下无已发布记录，不代表流量为零。
- 新加坡黄金进口与出口：[2026-03 官方查询](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202603&reporterCode=702&flowCode=M,X&partnerCode=0&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)。完整返回见 [singapore-march.json](singapore-march.json)。`netWgt` 为千克，除以 1,000 得吨；两侧 `isNetWgtEstimated=true`。
- 瑞士进口：[官方 CSV](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv)。汇总 7108.1200、控制代码 911～914 的进口重量；不是矿山产地认定。
- 伦敦库存：[官方数据页](https://www.lbma.org.uk/prices-and-data/london-vault-data)、[2026-08 工作簿](https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-August-2026.xlsx)。
- 上金所：[月报目录](https://www.sge.com.cn/sjzx/hqyb)、[2026-09-30 每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-30&end_date=2026-09-30)。
- 价格与汇率：[LBMA 新公开价格页面](https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices)、[ECB 历史汇率 XML](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml)。
- COMEX：[CME 官方 Gold Stocks 表](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls)。本次受限，未替换为非官方估计。

## 本次同步范围

更新数据 JSON 中的新加坡单市场记录、该记录的来源抓取时间和 JSON 生成时间；同步生成脚本的期次设置、来源说明及相关既有测试。其他板块的原观测日期和来源抓取时间保留。页面更新日期变化不代表全部数据更新到当天。
