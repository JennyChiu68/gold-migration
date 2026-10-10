# 黄金迁徙地图数据来源

来源方案日期：2026-10-10。覆盖当前demo的六个板块。

每项指标只有一个当前执行源；优先接入源通过完整重量、单位、伙伴映射、至少3个月对账及实际抓取验证后才统一切换所有依赖板块。未验证的源不是已使用源。

本阶段以无需付费、能从公开入口实际抓取作为免费可获取标准；版权和许可不作为来源筛选或接入前置条件。免费注册、密钥、限流、访问失败、覆盖范围与更新时效分别标明；付费服务不纳入当前抓取方案。

**当前执行与优先接入分别列明。** 来源方案和抓取频次在 `app/data/source-policy.json` 维护，demo标注与Word文档共同读取该文件。频次是上线要求，当前快照没有定时任务。

## 黄金罗盘

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 瑞士黄金贸易 | [瑞士SwissImpex](https://www.swissimpex.admin.ch/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开查询入口；完整出口净重与导出方式须实取验证。 完整出口明细、商品范围及重量待对账 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 英国黄金贸易 | [英国HMRC](https://www.uktradeinfo.com/api-documentation) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费公开API，无需密钥；60次请求每分钟。 三个月已实取；零净重附加数量、净重差异及伙伴编码仍需解释，未通过替换验收 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 美国黄金贸易 | [美国Census](https://www.census.gov/data/developers/data-sets/international-trade.html) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费数据；数据API需要申请并激活免费密钥，目前未配置。 待申请免费API密钥并核对完整净重及伙伴明细 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 中国香港黄金贸易 | [中国香港统计处Trade-IDDS](https://data.gov.hk/en-data/dataset/hk-censtatd-trade-idds-trade/resource/173a8d40-24ff-4e8e-b9f2-456b20208fa4) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开API；本次应用状态拒绝访问，须按平台要求解决访问后验证完整数量。 待解决API访问条件并核对细分商品数量单位 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 新加坡黄金贸易 | [新加坡SingStat](https://tablebuilder.singstat.gov.sg/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方免费接续平台；黄金重量与完整伙伴覆盖尚未验证。StatLink于2027年1月1日停用，不新增长期依赖。 待确认免费接续平台黄金重量及全部伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 阿联酋黄金贸易 | [阿联酋FCSC](https://uaestat.fcsc.gov.ae/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开官方目录；全国黄金月度重量及完整伙伴覆盖尚未确认，不用迪拜局部数据代替。 待确认全国黄金月度净重及完整伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 伦敦库存 | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | 公开工作簿；需标明来源。  | 每日北京时间09:00查目录；公布日另按伦敦当地10:00、16:00检查。 |
| 上海黄金价格 | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | 公开日行情；需标明来源。  | 中国交易日北京时间17:00、20:00检查。 |
| 伦敦黄金价格 | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | 既有历史快照来自此公开入口；2026年10月10日实测HTTP 403，当前未取到新数据。保留检查和重试，不视为已可持续抓取。 公开JSON实测HTTP 403；尚未验证可持续获取最新同口径PM价格，保留历史观察。 | 英国交易日后按伦敦次日01:00检查公开PM入口；失败按统一重试规则处理，不推进价差日期。 |
| 人民币换算汇率 | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | 公开免费XML；是参考汇率，不是实时成交价。  | 北京时间23:30检查；缺同日值时次日01:00复查。 |

## 全球吸金榜

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 中国内地黄金贸易 | [中国海关总署](https://stats.customs.gov.cn/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开统计查询；最新黄金重量导出尚未验证。 待成功取得最新黄金进出口重量 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 中国香港黄金贸易 | [中国香港统计处Trade-IDDS](https://data.gov.hk/en-data/dataset/hk-censtatd-trade-idds-trade/resource/173a8d40-24ff-4e8e-b9f2-456b20208fa4) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开API；本次应用状态拒绝访问，须按平台要求解决访问后验证完整数量。 待解决API访问条件并核对细分商品数量单位 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 印度黄金贸易 | [印度商务部TradeStat](https://tradestat.commerce.gov.in/meidb/commoditywise_import) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开查询入口；进口、出口完整数量与单位尚未验证。 待核对进出口数量、单位及编码变更 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 泰国黄金贸易 | [泰国商务部](https://tradereport.moc.go.th/en/documentpublish) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开统计；完整黄金数量取数尚未验证。 待成功取得完整黄金数量及伙伴表 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 土耳其黄金贸易 | [土耳其TÜİK](https://bi.tuik.gov.tr/extensions/tuik-mashup/index.html?lang=en) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方查询入口；完整黄金月度重量尚未验证。 待实取完整月度黄金净重 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 阿联酋黄金贸易 | [阿联酋FCSC](https://uaestat.fcsc.gov.ae/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开官方目录；全国黄金月度重量及完整伙伴覆盖尚未确认，不用迪拜局部数据代替。 待确认全国黄金月度净重及完整伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 新加坡黄金贸易 | [新加坡SingStat](https://tablebuilder.singstat.gov.sg/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方免费接续平台；黄金重量与完整伙伴覆盖尚未验证。StatLink于2027年1月1日停用，不新增长期依赖。 待确认免费接续平台黄金重量及全部伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 英国黄金贸易 | [英国HMRC](https://www.uktradeinfo.com/api-documentation) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费公开API，无需密钥；60次请求每分钟。 三个月已实取；零净重附加数量、净重差异及伙伴编码仍需解释，未通过替换验收 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 美国黄金贸易 | [美国Census](https://www.census.gov/data/developers/data-sets/international-trade.html) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费数据；数据API需要申请并激活免费密钥，目前未配置。 待申请免费API密钥并核对完整净重及伙伴明细 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 瑞士黄金贸易 | [瑞士SwissImpex](https://www.swissimpex.admin.ch/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开查询入口；完整出口净重与导出方式须实取验证。 完整出口明细、商品范围及重量待对账 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 黄金航线

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 瑞士黄金贸易 | [瑞士SwissImpex](https://www.swissimpex.admin.ch/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开查询入口；完整出口净重与导出方式须实取验证。 完整出口明细、商品范围及重量待对账 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 英国黄金贸易 | [英国HMRC](https://www.uktradeinfo.com/api-documentation) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费公开API，无需密钥；60次请求每分钟。 三个月已实取；零净重附加数量、净重差异及伙伴编码仍需解释，未通过替换验收 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 美国黄金贸易 | [美国Census](https://www.census.gov/data/developers/data-sets/international-trade.html) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费数据；数据API需要申请并激活免费密钥，目前未配置。 待申请免费API密钥并核对完整净重及伙伴明细 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 中国香港黄金贸易 | [中国香港统计处Trade-IDDS](https://data.gov.hk/en-data/dataset/hk-censtatd-trade-idds-trade/resource/173a8d40-24ff-4e8e-b9f2-456b20208fa4) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开API；本次应用状态拒绝访问，须按平台要求解决访问后验证完整数量。 待解决API访问条件并核对细分商品数量单位 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 新加坡黄金贸易 | [新加坡SingStat](https://tablebuilder.singstat.gov.sg/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方免费接续平台；黄金重量与完整伙伴覆盖尚未验证。StatLink于2027年1月1日停用，不新增长期依赖。 待确认免费接续平台黄金重量及全部伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 阿联酋黄金贸易 | [阿联酋FCSC](https://uaestat.fcsc.gov.ae/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开官方目录；全国黄金月度重量及完整伙伴覆盖尚未确认，不用迪拜局部数据代替。 待确认全国黄金月度净重及完整伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 瑞士精炼站

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 瑞士进口 | [瑞士BAZG黄金进口](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins) | [瑞士BAZG黄金进口](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins) | 公开CSV可直接下载，无需付费或账户。  | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 瑞士出口 | [瑞士SwissImpex](https://www.swissimpex.admin.ch/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开查询入口；完整出口净重与导出方式须实取验证。 SwissImpex同口径完整出口尚未验证，当前保留Comtrade HS7108。 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |

## 三地实物信号

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 瑞士黄金贸易 | [瑞士SwissImpex](https://www.swissimpex.admin.ch/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方公开查询入口；完整出口净重与导出方式须实取验证。 完整出口明细、商品范围及重量待对账 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 英国黄金贸易 | [英国HMRC](https://www.uktradeinfo.com/api-documentation) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费公开API，无需密钥；60次请求每分钟。 三个月已实取；零净重附加数量、净重差异及伙伴编码仍需解释，未通过替换验收 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 美国黄金贸易 | [美国Census](https://www.census.gov/data/developers/data-sets/international-trade.html) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 免费数据；数据API需要申请并激活免费密钥，目前未配置。 待申请免费API密钥并核对完整净重及伙伴明细 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 中国香港黄金贸易 | [中国香港统计处Trade-IDDS](https://data.gov.hk/en-data/dataset/hk-censtatd-trade-idds-trade/resource/173a8d40-24ff-4e8e-b9f2-456b20208fa4) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开API；本次应用状态拒绝访问，须按平台要求解决访问后验证完整数量。 待解决API访问条件并核对细分商品数量单位 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 新加坡黄金贸易 | [新加坡SingStat](https://tablebuilder.singstat.gov.sg/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 官方免费接续平台；黄金重量与完整伙伴覆盖尚未验证。StatLink于2027年1月1日停用，不新增长期依赖。 待确认免费接续平台黄金重量及全部伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 阿联酋黄金贸易 | [阿联酋FCSC](https://uaestat.fcsc.gov.ae/) | [UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/) | 公开官方目录；全国黄金月度重量及完整伙伴覆盖尚未确认，不用迪拜局部数据代替。 待确认全国黄金月度净重及完整伙伴覆盖 | 每日北京时间09:00检查；明确发布日当天起每6小时检查，持续48小时后恢复每日。新期才抓明细，每次回查最近3个月，每月回查18个月修订。 |
| 伦敦库存 | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | [LBMA伦敦库存](https://www.lbma.org.uk/prices-and-data/london-vault-data) | 公开工作簿；需标明来源。  | 每日北京时间09:00查目录；公布日另按伦敦当地10:00、16:00检查。 |
| COMEX库存 | [CME Gold Stocks](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html) | [CME Gold Stocks](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html) | 公开库存报告；当前下载失败，保留历史存档并继续正常重试。 当前最新表下载未成功，demo为2026年7月存档，不参与当前趋势。 | 纽约当地美国营业日18:00及次日09:00检查，按当地夏令时换算。 |
| 上海出库与交割 | [上金所月报](https://www.sge.com.cn/sjzx/hqyb) | [上金所月报](https://www.sge.com.cn/sjzx/hqyb) | 公开月报PDF；需标明来源。  | 每日北京时间10:00、17:00查月报目录，新报告出现后读取。 |

## 金价温差

| 对应数据 | 优先接入主源 | demo当前执行 | 访问与接入状态 | 抓取频次 |
|---|---|---|---|---|
| 上海黄金价格 | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | [上金所Au99.99日行情](https://www.sge.com.cn/sjzx/quotation_daily_new) | 公开日行情；需标明来源。  | 中国交易日北京时间17:00、20:00检查。 |
| 伦敦黄金价格 | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | [LBMA Gold Price PM公开JSON](https://prices.lbma.org.uk/json/gold_pm.json) | 既有历史快照来自此公开入口；2026年10月10日实测HTTP 403，当前未取到新数据。保留检查和重试，不视为已可持续抓取。 公开JSON实测HTTP 403；尚未验证可持续获取最新同口径PM价格，保留历史观察。 | 英国交易日后按伦敦次日01:00检查公开PM入口；失败按统一重试规则处理，不推进价差日期。 |
| 人民币换算汇率 | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | [ECB参考汇率](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | 公开免费XML；是参考汇率，不是实时成交价。  | 北京时间23:30检查；缺同日值时次日01:00复查。 |
## 取数口径与实际观测

非货币黄金710811、710812、710813及对应本地细分码；现有Comtrade HS7108不报告710820货币黄金，也不覆盖首饰或废料全部黄金流动。

| 数据 | 实际观测期 | 当前状态 |
|---|---|---|
| 报关方向及同期榜 | 202606 | latestComparable |
| 瑞士进口 | 202608 | manualSnapshot |
| 瑞士出口 | 202608 | latestAvailable |
| 伦敦库存 | 202609 | manualSnapshot |
| COMEX库存 | 2026-07-30 | historicalSnapshot |
| 上海出库与交割 | 202609 | manualSnapshot |
| 同日价差 | 2026-09-28 | historicalSnapshot |

原始文件和查询链接继续保存在`gold-flows.json`的`sourceUrl/sourceUrls/workbookUrl/rawSourceUrl`。既有9月28日伦敦价格保留旧JSON作为历史出处；该入口目前返回403，继续按计划检查和重试；只有实取新数据后才更新观测期。

## 更新与切换

1. 国家直接来源须取得完整进出口重量及伙伴表，核对细分商品单位、零值与保密值、伙伴编码和至少3个重叠月份。解释差异后才能切换；不能因来源更直接就宣布更准确。
2. 当前贸易程序仍取Comtrade；预览达到500条即停止生成，须拆分或取得完整交付。当前共同月份尚固定，需要上线时落实新期发现及完整性筛选。
3. 抓取失败时保留原观测期；历史COMEX和伦敦价差退出当前趋势。公开入口按计划检查和重试，版权和许可不作为本阶段接入前置条件。
4. 切换时同步所有依赖板块、比较期、历史序列、来源ID、原始链接和Word要求。一个市场同一系列不静默混合国家源与Comtrade。
5. 用`node scripts/sync-source-policy.mjs`同步来源标注，用`python scripts/build-requirements.py`生成Word。标注同步不更改观测日、抓取日或数值。
