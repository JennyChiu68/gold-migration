# 黄金迁徙地图数据核对

核对日期：2026-10-08（北京时间），对照 2026-10-04 已发布快照。结果针对本项目所用官方来源；“最新已发布期”不代表当日观测。

| 对应板块 | 官方来源与最新已发布期 | 本次处理与限制 |
| --- | --- | --- |
| 黄金罗盘：库存；三地实物信号：伦敦 | [LBMA 金库数据](https://www.lbma.org.uk/prices-and-data/london-vault-data)，2026-09 | 工作簿新增 9 月；旧历史序列与项目一致。新增月份，重新计算月变化和展示趋势。结论为“库存增加”。 |
| 黄金罗盘：报关；全球吸金榜；黄金航线 | [UN Comtrade 发布记录](https://comtradeapi.un.org/public/v1/getDA/C/M/HS?reporterCode=757,826,842,699,344,156,764,792,784,702&period=202604,202605,202606,202607,202608,202609) | 英国 7 月于 10 月 6 日发布，进口和出口重量均有效。英国单市场观察更新至 7 月。瑞士 7 月出口总净重缺失、印度 7 月出口净重缺失，共同排名和方向趋势仍为 6 月，环比基期为 5 月。只按相同月份和完整重量比较；缺失重量不补零。 |
| 全球吸金榜：共同完整月份 | 2026-06 的瑞士、英国、美国、中国香港、印度；各市场进出口查询见来源对照文档 | 保留五个完整市场的 6 月共同排名。7 月不完整记录不参与排名；不能通过删掉缺失市场，把不一致覆盖范围下的流量变化解释为迁移加速或放缓。 |
| 全球吸金榜：各市场最新观察 | 瑞士 2026-08；英国、美国、香港、印度 2026-07；泰国 2026-05；新加坡 2026-03；土耳其 2025-12；内地 2024-12；阿联酋 2019-12 | 英国推进至 7 月；其他市场未发现新月份或本次核对区间的新修订。印度、泰国、土耳其保留重量缺失状态；不同月份不混排。较早市场是该来源滞后，不表示当地目前没有贸易。 |
| 瑞士精炼站：进口来源 | [BAZG 官方 CSV](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv)，2026-08 | 数据更新字段仍为 2026-09-10；总量、前十来源与暂定状态一致，保留 8 月。 |
| 瑞士精炼站：出口去向 | UN Comtrade 瑞士月度伙伴出口，2026-08 | 发布记录无 9 月；重新核对 8 月出口。不能用不同口径的瑞士进口减出口推算库存。 |
| 三地实物信号：上海出库与交割 | [上金所月报目录](https://www.sge.com.cn/sjzx/hqyb)，2026-08 | 最新目录仍为 8 月，无 9 月月报。保留 8 月观测。 |
| 三地实物信号：COMEX | [CME 官方 Gold Stocks](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls) | 官方入口确认仍指向该表；下载出现 HTTP/2 错误及重试超时，未能读取最新表内日期与数值。继续标明 2026-07-30 存档，不能认定当前库存未变。 |
| 黄金罗盘：现货；金价温差 | [上金所每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-30&end_date=2026-09-30)、[LBMA 价格页](https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices)、[ECB 历史汇率](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml) | 核对时，上金所目录仍指向 9 月 30 日；ECB 最新为 10 月 7 日。LBMA 精确历史价格接口返回 403，历史表格需授权访问，无法验证更新后的同日价格组合。保留 9 月 28 日价差，不混用异日价格、不从图形估值。 |
| 多市场解读、数据底稿 | 继承以上模块 | 随已验证数据更新；各观测期分别展示，不汇总为“截至今天的全球黄金总量”。 |

## 完整性复核

瑞士 7 月有 44 条出口记录，含世界总计；世界总计 `netWgt=null`，部分伙伴仍有正重量。伙伴重量合计不是已核实的出口总量。若直接推进月份，生成结果会将瑞士从完整市场排除，同时部分伙伴仍进入方向计算，造成覆盖不一致。因此本次保留经核实的 6 月共同快照，仅更新英国单市场记录。

## 可复核的原始依据

- [availability-current.json](availability-current.json)：十个市场 2026-04～09 的官方发布及修订记录。英国 2026-07 为本次新增；其他现有记录的发布/修订日期早于上次核对。
- [availability-lagged.json](availability-lagged.json)：内地、泰国、土耳其、阿联酋、新加坡的较早观测与补报检查。当前月份查询成功但无记录，表示该来源未发布，不能视为零流量。
- [availability-historic.json](availability-historic.json)：内地及阿联酋 2020～2024 年的补报核对。
- [uk-july.json](uk-july.json)：英国 7 月 HS 7108、伙伴总计、双向重量；[官方直达查询](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=826&flowCode=M,X&partnerCode=0&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)。
- [swiss-july-totals.json](swiss-july-totals.json)、[swiss-july-routes.json](swiss-july-routes.json)：瑞士 7 月双向总计及出口伙伴明细，记录出口总净重缺失；[官方总计查询](https://comtradeapi.un.org/public/v1/preview/C/M/HS?period=202607&reporterCode=757&flowCode=M,X&partnerCode=0&partner2Code=0&cmdCode=7108&customsCode=C00&motCode=0&maxRecords=500)。
- [lbma-vault-sep.xlsx](lbma-vault-sep.xlsx)：本次官方工作簿，9 月黄金为 315,756 千金衡盎司；乘 0.0311034768 得吨。环比与历史数据均从同一库存序列计算。
- [ecb-90d.xml](ecb-90d.xml)：本次取得的官方参考汇率及日期。汇率单独变新不构成金价温差更新。

## 结论

英国单市场 7 月及伦敦库存 9 月已核实，可同步到页面；共同排名/方向趋势继续采用最近完整的 6 月。COMEX 和金价温差仍无法核实最新观测。因此不能将全站标为“全部数据均为截至目前最新”。页面更新日期仅表示数据包构建时间。
