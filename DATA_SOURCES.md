# 黄金迁徙地图数据来源

核对日期：2026-10-10。以下为demo与Word共同采用的当前实施来源，每项数据只指定一个源。候选国家直接来源见 DATA_SOURCE_AUDIT.md，不是本版本必须接入的渠道。

来源和频次由 app/data/source-policy.json 维护。频次是正式开发要求；当前demo为快照，没有定时任务。

## 黄金罗盘

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 报关：瑞士、英国、美国、中国香港、新加坡、阿联酋 | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)；[查询API](https://comtradeapi.un.org/public/v1/preview/C/M/HS)；[发布记录](https://comtradeapi.un.org/public/v1/getDA/C/M/HS) | 完整出口目的地重量、世界总量及上月明细；净重，不用金额估吨。月度，各报告市场报送及修订时间不同 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 伦敦库存 | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | 全伦敦专业金库与英格兰银行月末黄金持有量；不以英格兰银行子集替代。 每月第5个工作日公布上月末库存。公开工作簿；需标明来源。 | 每日北京时间09:00查目录；公布日另按伦敦当地10:00、16:00检查。 |
| 上海黄金价格 | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | Au99.99收盘价，人民币每克，取实际交易日。 中国交易日。公开日行情；需标明来源。 | 中国交易日北京时间17:00、20:00检查。 |
| 伦敦黄金价格 | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | LBMA Gold Price PM，美元每金衡盎司；目前仅历史观察，不能出当前溢价结论。 英国交易日；公开接口实际更新延迟须抓取验证。公开JSON实测HTTP 403；尚未验证可持续获取最新同口径PM价格，保留历史观察。 | 英国交易日后按伦敦次日01:00检查公开PM入口；失败按统一重试规则处理，不推进价差日期。 |
| 人民币换算汇率 | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)；[实际取数](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml) | 同日欧元兑人民币除以欧元兑美元，三源共同自然日期齐全才更新温差。 TARGET工作日，通常欧洲中部时间16:00。公开免费XML；是参考汇率，不是实时成交价。 | 北京时间23:30检查；缺同日值时次日01:00复查。 |

## 全球吸金榜

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 报关：中国内地、中国香港、印度、泰国、土耳其、阿联酋、新加坡、英国、美国、瑞士 | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)；[查询API](https://comtradeapi.un.org/public/v1/preview/C/M/HS)；[发布记录](https://comtradeapi.un.org/public/v1/getDA/C/M/HS) | 同月进出口世界总量及上月值；净重，不用金额估吨。月度，各报告市场报送及修订时间不同 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 黄金航线

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 报关：瑞士、英国、美国、中国香港、新加坡、阿联酋 | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)；[查询API](https://comtradeapi.un.org/public/v1/preview/C/M/HS)；[发布记录](https://comtradeapi.un.org/public/v1/getDA/C/M/HS) | 完整出口目的地重量、世界总量及上月明细；净重，不用金额估吨。月度，各报告市场报送及修订时间不同 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 瑞士精炼站

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 瑞士进口 | [瑞士BAZG黄金进口](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins)；[实际取数](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv) | 7108.1200与控制代码911至914，重量千克；按来源国，不等于矿山原产地。 月度，可修订。公开CSV可直接下载，无需付费或账户。 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 瑞士出口 | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)；[实际取数](https://comtradeapi.un.org/public/v1/preview/C/M/HS) | 非货币黄金710811、710812、710813及对应本地细分码，完整出口目的地与净重。 月度，各报告市场报送及修订时间不同。免费公开查询；预览最多500条且有限流，必须核验完整性。 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 三地实物信号

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 报关：瑞士、英国、美国、中国香港、新加坡、阿联酋 | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)；[查询API](https://comtradeapi.un.org/public/v1/preview/C/M/HS)；[发布记录](https://comtradeapi.un.org/public/v1/getDA/C/M/HS) | 完整出口目的地重量、世界总量及上月明细；净重，不用金额估吨。月度，各报告市场报送及修订时间不同 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 伦敦库存 | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | 全伦敦专业金库与英格兰银行月末黄金持有量；不以英格兰银行子集替代。 每月第5个工作日公布上月末库存。公开工作簿；需标明来源。 | 每日北京时间09:00查目录；公布日另按伦敦当地10:00、16:00检查。 |
| COMEX库存 | [CME Gold Stocks](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html)；[实际取数](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls) | Registered、Eligible、总量与活动日；Pledged已含在Registered中。 通常按美国营业日更新，以表内活动日为准。当前最新表下载未成功，demo为2026年7月存档，不参与当前趋势。 | 纽约当地美国营业日18:00及次日09:00检查，按当地夏令时换算。 |
| 上海出库与交割 | [上金所月报](https://www.sge.com.cn/sjzx/hqyb) | 月报黄金出库量、交割量及上月值；不是总库存或终端消费。 月度，具体发布日期以目录为准。公开月报PDF；需标明来源。 | 每日北京时间10:00、17:00查月报目录，新报告出现后读取。 |

## 金价温差

| 数据 | 指定来源与取数地址 | 抓取内容 / 来源周期 | 项目抓取频次 |
|---|---|---|---|
| 上海黄金价格 | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | Au99.99收盘价，人民币每克，取实际交易日。 中国交易日。公开日行情；需标明来源。 | 中国交易日北京时间17:00、20:00检查。 |
| 伦敦黄金价格 | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | LBMA Gold Price PM，美元每金衡盎司；目前仅历史观察，不能出当前溢价结论。 英国交易日；公开接口实际更新延迟须抓取验证。公开JSON实测HTTP 403；尚未验证可持续获取最新同口径PM价格，保留历史观察。 | 英国交易日后按伦敦次日01:00检查公开PM入口；失败按统一重试规则处理，不推进价差日期。 |
| 人民币换算汇率 | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)；[实际取数](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml) | 同日欧元兑人民币除以欧元兑美元，三源共同自然日期齐全才更新温差。 TARGET工作日，通常欧洲中部时间16:00。公开免费XML；是参考汇率，不是实时成交价。 | 北京时间23:30检查；缺同日值时次日01:00复查。 |

## 本次核实与实际观测

| 数据 | 当前观测 / 核实结果 |
|---|---|
| 报关方向及同期榜 | 2026年6月；可用性记录无新增或修订；总量与路线抽查见核对记录 |
| 瑞士进口 | 2026年8月；已补齐55个来源地，与全月总量相符；暂定数据 |
| 瑞士出口 | 2026年8月；本次取回世界总量与demo相符 |
| 伦敦库存 | 2026年9月；工作簿与前次相同 |
| 上海出库与交割 | 2026年9月；月报与前次相同 |
| 上海Au99.99及ECB汇率 | 2026年10月9日；独立保存新输入，不与旧伦敦PM混算 |
| COMEX库存 | 2026年7月30日历史报表；官方最新表下载超时，未能核实当前期 |
| 同日价差 | 2026年9月28日历史观察；伦敦官方公开入口均403，当前结论关闭 |

[完整核对记录](data-checks/2026-10-10/README.md)。检查日期不是数据日期，不能标全站全部最新。

## 取数及更新规则

非货币黄金范围为710811、710812、710813；现有Comtrade HS7108不报告710820货币黄金。总量选择世界伙伴，航线选择全部目的地，重量统一为吨。预览达到500条必须停止并解决完整性，不能静默截断。

瑞士进口以BAZG 7108.1200控制代码911至914全部来源地汇总，分类占比不能只用排名前10项。中国台湾按真实来源地区标注；Comtrade代码490合并范围不当作中国台湾单独值。

失败后15分钟和60分钟重试，遵守Retry-After；连续两轮失败通知维护人。通过校验的新数据4小时内发布并同步GitHub。国家源至少三个重叠月对账后才能统一切换全部依赖板块和历史比较期。

本阶段以无需付费、能公开实际抓取为免费可获取标准。版权与许可不作为接入前置条件，访问失败、免费注册/密钥、限流与覆盖仍须记录。

`node scripts/sync-source-policy.mjs`仅同步来源标注，不改变数值或观测期；`python scripts/build-requirements.py`生成Word。正式开发需实现动态新期发现，不能复用demo脚本的固定月份。
