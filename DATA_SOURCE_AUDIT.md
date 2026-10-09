# 黄金迁徙地图：数据源全面核查与接入建议

核查日期：**2026 年 10 月 9 日（北京时间）**。对应黄金罗盘、全球吸金榜、黄金航线、瑞士精炼站、三地实物信号、金价温差、数据底稿全部七个板块。

## 1. 核查结论

**现有来源有权威依据，但还不是最合适的完整上线方案。** 最需要优化的是各国黄金贸易的取数渠道、伦敦价格的授权获取，以及 CME 库存的持续更新。

- 保留 LBMA 伦敦库存、CME 黄金库存、上金所月报和日行情、ECB 参考汇率。它们与现有指标相符；本次没有找到已经验证、更及时且同口径的官方公开替代品。
- 各国贸易建议逐步采用“本国官方详细数据优先、UN Comtrade 统一核验与备用”。UN Comtrade 是权威汇总源，但需要等待各国报送，部分市场存在发布滞后或重量缺失。
- 伦敦价格应使用 IBA 或授权分发商交付的 LBMA Gold Price PM。旧公开 JSON 地址不能作为可保证的免费生产接口。
- 新加坡 StatLink 将于 **2027 年 1 月 1 日停用**。新接入方案优先调查其官方指向的免费 SingStat，不宜长期依赖即将停用的服务。

本国一手来源通常更接近原始发布时间，但不自动代表每个数字更准确。Comtrade 与国家源可能因标准化、估算、保密处理和修订版本而不同；要用同月明细对账后确定采用哪个版本。

**完成范围：** 已核对各来源的发布机构、官方入口、主要字段、更新周期、访问条件和口径差异，并更新本项目来源说明。新国家渠道本次未成功取得可直接替换的完整黄金重量表，尚未接入程序；不能据此宣称页面已使用新源或已全部更新到当天。最新数据快照核对另见 [10 月 9 日记录](data-checks/2026-10-09/README.md)。

## 2. 每个功能板块如何选源

| 功能板块 | 对应数据与首选来源 | 优化建议与理由 | 接入状态 |
| --- | --- | --- | --- |
| 黄金罗盘 | 库存用 [LBMA](https://www.lbma.org.uk/prices-and-data/london-vault-data)；东向报关流用各出口枢纽官方月度伙伴明细；上海溢价用上金所、授权 LBMA PM、ECB | 库存来源保留；东向趋势升级贸易渠道；价格解决授权和获取。三条趋势各有自己的数据期，不能合并推断单一全球方向 | 库存现源合适；贸易直连及价格授权交付待落实 |
| 全球吸金榜 | 各市场官方黄金进口、总出口重量；[UN Comtrade](https://uncomtrade.org/docs/un-comtrade-api/)作核验与备源 | 单市场使用最新完整月份；同期榜只取相同月份、商品范围一致、进口出口重量都完整的市场。不能把最新总贸易新闻当成黄金重量表 | 现程序仍用 Comtrade；国家来源见第三节 |
| 黄金航线 | 瑞士、英国、美国、香港、新加坡、阿联酋官方双边出口明细；Comtrade 备用 | 必须取得完整伙伴表。使用报告国出口目的地建立路线，记录转口；伙伴进口数据只能交叉核验，不能混成同一条出口序列。不能用前十路线算总量 | 直连尚未完成，现路线仍来自 Comtrade |
| 瑞士精炼站 | 进口保留 [BAZG 黄金分类数据](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins)；出口优先验证 [SwissImpex](https://www.swissimpex.admin.ch/) | 矿产金／精炼金建议用官方控制代码区分；来源国角色可作分析说明，不能认定每批金的矿山产地。出口若换源，要先对齐品类 | 进口现源合适；出口直连待验证；当前两侧口径不同，不能相减推库存 |
| 三地实物信号 | [LBMA 月库存](https://www.lbma.org.uk/prices-and-data/london-vault-data)、[CME Gold Stocks](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls)、[上金所月报](https://www.sge.com.cn/sjzx/hqyb) | 三个来源保留。伦敦和 COMEX 是库存，上金所是出库／交割。CME 抓取失败是获取问题，不能用期货成交量等代替 | CME 最新表本次未取到，现值仍为 7 月存档；其他两项仍用官方月报 |
| 金价温差 | [上金所 Au99.99 收盘](https://www.sge.com.cn/sjzx/quotation_daily_new)、[IBA/LBMA PM](https://www.ice.com/iba/lbma-precious-metals)、[ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) | 保留指标定义；落实伦敦价格授权交付。ECB 的日度参考汇率适合指示性比较，换成国内中间价会改变定价时点，不能静默替换 | 上海价及汇率可继续核对；完整同日价差仍停留在已验证日期 |
| 数据底稿 | 展示以上各项真正使用的机构、具体文件／查询、数据期、取数时间、商品范围、单位、修订／缺失标识 | 区分“已接入”“候选”“历史存档”。推荐源链接不能冒充当前数值的原始证据 | 本说明与 [DATA_SOURCES.md](DATA_SOURCES.md) 已补全；页面实际使用记录仍以快照为准 |

## 3. 十个市场的贸易来源与可行性

所有“最新发布”均须进一步核对**黄金明细**。本节不会把已发布一般贸易统计等同于已经拿到完整黄金吨数。

| 市场 | 官方数据入口／说明 | 需要取得的明细 | 发布周期、访问条件与本次结论 |
| --- | --- | --- | --- |
| 中国内地 | [海关总署统计查询](http://stats.customs.gov.cn/)；[海关统计分析司操作说明](https://chinacustoms.gmcmonline.com/202405/c/19717.shtml) | 月份、HS8、进口原产国／出口目的国、第一／第二数量及各自单位、美元或人民币金额 | 月度；操作说明称无需注册、免费导出。实际入口本次访问失败，未确认最新黄金重量。**优先验证**，不能满足于现有 2024-12 独立观测 |
| 中国香港 | [统计处 Trade-IDDS API 说明](https://data.gov.hk/en-data/dataset/hk-censtatd-trade-idds-trade/resource/173a8d40-24ff-4e8e-b9f2-456b20208fa4) | 月数量 `QCm`、月金额 `VCm`、伙伴及数量单位；数量用 HKHS6／8。贸易类型 1 是进口，4 是总出口 | 免费公开 JSON，月度。实测 2026-08 查询超时／连接失败，未验证黄金数量单位。**优先适配**。HKHS4 的 7108 不能直接取数量；总出口已含再出口，不得再加类型 3 |
| 印度 | [商务部月度统计说明](https://www.commerce.gov.in/ministryofcommerce/node/893)；[TradeStat MEIDB](https://tradestat.commerce.gov.in/meidb/) | DGCI&S 月度国家、商品、量值；数量需要 ITC-HS8，并核对单位 | 每月更新；本次未取得详细黄金表。快速估算／黄金金额新闻不能补出口重量。候选源有望补齐现有缺失，但须先实取同月数量 |
| 泰国 | 商务部[进口 API 说明](https://tradereport.moc.go.th/opendata/importharmonizecountries)、[出口 API 说明](https://tradereport.moc.go.th/opendata/exportharmonizecountries)、[发布日表](https://tradereport.moc.go.th/en/documentpublish) | 海关来源的 HS 明细、国家、月数量及单位、USD／THB；需完整世界总量与伙伴表 | 月度，API 说明为每月 20 日后；日表列 2026-08 于 9 月 25 日发布。本次未读取黄金实际返回。API 单次最多 10 条；混单位时数量可能为 0，不能认定零贸易，也不能把前十伙伴加总当世界总量 |
| 土耳其 | [TurkStat 贸易查询](https://bi.tuik.gov.tr/extensions/tuik-mashup/index.html?lang=en)；[官方方法说明](https://veriportali.tuik.gov.tr/Bulten/Index?dil=2&p=Foreign-Trade-Statistics-March-2025-53901) | 黄金商品／月份／伙伴、kg 净重、USD 量值；固定一般贸易或特殊贸易系统 | 月度；方法确认一般商品有 kg 净重，包含非货币金，排除货币黄金 710820。动态查询本次未抽取黄金行、访问要求仍待实测。候选源可用于调查现有重量缺失 |
| 新加坡 | [StatLink 停用公告及 FAQ](https://statlink.enterprisesg.gov.sg/pages/Misc/FAQ.aspx)；官方指向 [SingStat Table Builder](https://tablebuilder.singstat.gov.sg/) | HS8 数量、单位、伙伴、月量值；国内出口和再出口应合成总出口而不重复 | 现 StatLink 每月 17 日或最近工作日更新，数量仅 HS8／SITC7，报告收费并涉及登录；**2027-01-01 停用**。优先验证免费 SingStat 是否提供所需 HS、伙伴及重量维度；尚不能承诺其覆盖黄金月重量 |
| 阿联酋 | [FCSC UAE.Stat](https://uaestat.fcsc.gov.ae/)；[经济与旅游部贸易地图](https://www.moet.gov.ae/en/international-trade-map) | 全国、月度、黄金 HS 明细、重量、完整进出口／转口及伙伴 | 本次只确认公开年度／章节和金额等目录，**未验证全国月度黄金 kg 明细或明确发布日**。暂作年度核验；不能用杜拜单地或非油贸易金额替代全国黄金吨数 |
| 英国 | [HMRC UK Trade Info API](https://www.uktradeinfo.com/api-documentation)；[字段与方法](https://www.uktradeinfo.com/trade-data/help-with-using-our-data)；[发布日历](https://www.uktradeinfo.com/trade-data/release-calendar) | OTS 月度 HS 明细、伙伴、净重 kg、金额、保密和估算标识。不得选不含非货币金的区域贸易 RTS | 公共 API 无需授权请求头，月度。官方 7 月贸易 9 月 11 日发布，而本项目 Comtrade 元数据列 10 月 6 日入库；反映转发滞后，尚不证明当天所有黄金字段完整。8 月计划 10 月 15 日发布。实际黄金 API 返回本次连接失败。**优先适配** |
| 美国 | [Census 月度贸易 API](https://www.census.gov/data/developers/data-sets/international-trade.html)；[进口字段](https://api.census.gov/data/timeseries/intltrade/imports/hs/variables.html)、[出口字段](https://api.census.gov/data/timeseries/intltrade/exports/hs/variables.html)；[官方批量文件](https://www.census.gov/foreign-trade/data/dataproducts.html) | 细到 HS10 的数量与单位、伙伴、进口口径、国内／外国货物出口。逐子目确认 g／kg 后汇总 | 月度，API 随新闻发布更新；现官方说明要求 API key。[8 月总贸易](https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_2608.pdf)已于 10 月 6 日发布，黄金重量明细尚未实取。航空／海运货运重量不能充当黄金净重。候选应解决密钥或批量文件交付后再接入 |
| 瑞士 | [BAZG 黄金统计说明](https://www.bazg.admin.ch/en/swiss-foreign-trade-statistics-gold-silver-and-coins)、[黄金进口 CSV](https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv)；[SwissImpex](https://www.swissimpex.admin.ch/) | 进口已采用 7108.1200 和 911～914 控制代码；出口取同口径商品、月份、净重和目的地 | 月度；进口 CSV 为官方一手数据，保留。出口直连本次未取得详细表。CSV 总文件较大，宜按月筛选、保存小型证据；商业使用条件按 BAZG 说明落实 |

**实施顺序：** 先验证英国、香港与瑞士出口这三个现有路线枢纽的直接数据，同时处理内地和泰国的明显滞后；美国取得访问条件后接入。印度、土耳其重点补重量。新加坡先检查免费接续平台；阿联酋继续保留缺失／历史提示，不能为补齐地图而估造吨数。

## 4. 库存、实物与价格来源的选择

### 伦敦库存

[LBMA 伦敦金库数据](https://www.lbma.org.uk/prices-and-data/london-vault-data)每月第 5 个工作日发布上月末持有量，含伦敦商业金库与英格兰银行。应从数据页寻找最新工作簿，不应一直抓写死月份的文件名。英格兰银行库存只是其一部分，不能作为全伦敦库存的“更及时替代”。

### COMEX 库存

[CME Delivery Notices & Stocks](https://www.cmegroup.com/solutions/clearing/operations-and-deliveries/nymex-delivery-notices.html)与[Registrar Reports](https://www.cmegroup.com/clearing/operations-and-deliveries/registrar-reports.html)都是有效官方入口，最终指向同一个 [Gold Stocks XLS](https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls)。换入口有助寻找文件，不能算独立备源。

官方报告通常按营业日更新。本次直接下载超时，未核实最新库存。获取后同时检查报告日期、活动日期、盎司单位、Registered／Eligible 和总计；Pledged 是 Registered 子集，不能再加。分类间调拨不等于黄金实际进出库。不能用交易量、期货持仓或期货价格替换库存。

### 上海实物信号及价格

[上金所月报](https://www.sge.com.cn/sjzx/hqyb)是现有出库、交割指标的合理来源，按月发布，具体日以目录为准。日成交量不能替代月出库量；出库和交割也不能叫金库总库存。[Au99.99 每日行情](https://www.sge.com.cn/sjzx/quotation_daily_new)仍适合当前价格定义；[上海金基准价](https://www.sge.com.cn/sjzx/jzj)是另一条官方价格序列，换用需重定义指标和历史。

### 伦敦价格与汇率

[LBMA 官方说明](https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices)已将历史价格表移入 MyLBMA Portal，并明确查看及获取、使用、再分发基准价涉及 IBA 许可。长期主源应为 [IBA](https://www.ice.com/iba/lbma-precious-metals)或[其授权分发商](https://www.ice.com/iba/licensing/data-vendors-redistribution)。选择保持相同 PM 基准的交付渠道，不能拿期货价补伦敦现货基准。延迟至少 4 小时免特定终端用户费，不等于免使用或再分发许可。

[ECB](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)的 EUR/CNY 与 EUR/USD 可交叉得到每美元人民币汇率，通常工作日约欧洲中部时间 16:00 更新，TARGET 关闭日除外。当前“日度指示性温差”保留该源合理。[中国外汇交易中心中间价](https://www.chinamoney.com.cn/chinese/bkccpr/)与[外汇局公布渠道](https://www.safe.gov.cn/safe/rmbhlzjj/)为不同早间定价，不能当同指标静默备源。

上海收盘、伦敦 PM 和 ECB 同日也不同时。当前指标只能描述指示性溢价／折价；真正同时点比较需要带时点的价格和汇率数据，属于另一项指标需求。

### 世界黄金协会能否作替代

[WGC Goldhub 本地溢价](https://www.gold.org/goldhub/data/gold-premium)当前页面显示 10 月 5 日更新、数据至 10 月 2 日，日观测、周更新，图表作 5 日滚动平滑。[中国方法](https://www.gold.org/sites/default/files/downloads/2019-01/Chinese-premium-discount-methodology.pdf)使用上海金 PM 对 LBMA AM，并可能在假期沿用旧值，与本项目 Au99.99 收盘对 LBMA PM 不同。因此只能作为另行标注的行业交叉核验。

[WGC 条款](https://www.gold.org/terms-and-conditions)对商业使用、抓取、发布等要求事先书面授权，其 IBA 许可不自动转授本项目。不能把 Goldhub 当成免费线上备用接口。本次未验证其下载表中的实际数值行。

## 5. 抓取频次建议

以下是**建议上线执行的检查频次**，并非目前已存在的定时任务。现网站仍读固定快照，只有 Comtrade 可由生成脚本重新抓取，其余为人工核对后的快照。

| 来源 | 官方数据更新 | 建议多长时间检查一次 | 更新、修订及失败处理 |
| --- | --- | --- | --- |
| 各国贸易与 Comtrade | 月度；各国详细表与联合国入库时间不同 | 每天北京时间 09:00 检查发布目录／可用性；明确发布日当天每 6 小时检查，连续 48 小时后恢复每日 | 发现新期才取详细表；每次回查最近 3 个月；每月回查最近 18 个月修订。英国有最长 18 个月暂定期。未取得完整重量不推进同期榜 |
| BAZG 进口、瑞士出口 | 月度，可能修订 | 每日 09:00 检查目录或文件变化；有新版才拉取所需月份 | 原始大 CSV 用条件请求／流式筛选，保留月份子集和校验摘要，避免每天保存完整历史文件 |
| LBMA 库存 | 每月第 5 个工作日发布上月末 | 每日 09:00 检查目录；公布日按伦敦当地时间 10:00、16:00 各查一次 | 校验表内月份而非只看文件名。重算环比并记录历史修订 |
| CME 库存 | 通常营业日 | 美国营业日当地 18:00、次日 09:00 各查一次，按当地夏令时换算 | 这是检查时间，不是官方保证发布时间；以表内活动日为准。每次归档小型新日报，周末不要求新活动日 |
| 上金所月报 | 月度，无统一固定发布日期承诺 | 每日北京时间 10:00、17:00 检查目录 | 找到新报告后提取黄金出库／交割，保留原 PDF 与月份；异常解析需人工复核 |
| 上金所日行情 | 中国交易日收盘后 | 交易日北京时间 17:00、20:00 各查一次 | 只接收对应交易日的 Au99.99 收盘，不用前日冒充当日 |
| IBA／授权伦敦 PM | 英国营业日 PM 拍卖开始于伦敦 15:00；交付时间取决于拍卖完成与授权产品 | 日度用途建议伦敦次日 01:00 检查一次已获准的延迟数据 | 根据实际授权交付时刻安排；未取得三源共同日期，不生成新价差 |
| ECB 汇率 | TARGET 工作日约欧洲中部时间 16:00 | 北京时间 23:30 检查一次，次日 01:00 复查缺失 | 同一日期必须同时有 USD 和 CNY；节假日留空，不能跨日拼接 |
| WGC 参考溢价 | 当前页面为周更新 | 获得所需使用授权后，每周检查一次 | 单列其指标定义，不与当前价格温差拼接；未授权只作人工阅读核验 |

所有请求建议失败后在 15 分钟、60 分钟各重试一次；仍失败保留上一期，标明“数据期＋获取失败”，下一正常检查周期继续。检查日期、来源发布时间、统计日期分开记录；重复请求不能制造“新数据”。上线后按实际发布情况调整检查时间。

## 6. 换源后仍能得到趋势结论的规则

1. **先统一黄金范围。** 当前贸易是 HS7108，含货币黄金子目 710820。若改为非货币黄金，应统一使用 710811／710812／710813 并回算所有市场历史；不能有的源只取 710812，有的仍取整个 7108，却在同一榜比较。各国实际排除货币金的规则也要记录。
2. **确认重量而非猜重量。** 每个细分商品核对 g／kg／吨；商品净重不等于纯金含量。缺失、保密、估算和实际零值分别保存。不能以金额除金价推吨数，也不能用货运重量代替黄金净重。
3. **换源先对账。** 建议用至少 3 个重叠月份核对总量、伙伴、单位、再出口、修订、贸易系统。差异需查明；无法解释就并列展示并保留旧源，不自动覆盖。
4. **保持比较对象一致。** 东向／西向汇总前后月份必须使用相同枢纽集合、商品范围与完整伙伴记录。“东向放缓”表示同一范围内东向报关量下降；不能因为新月份少了一个枢纽而得出放缓。目的地分组仍是产品分析规则，不是官方全球迁移结论。
5. **方向与速度分开。** “由西向东”需要同月、同一范围内东向量大于西向量；“东向放缓”需要该方向与此前同口径比较。两条可以同时成立。比较缺失时显示“方向／趋势待确认”，不要求 AI 生成结论。
6. **库存与价差各自判断。** 库存增加／减少看同源相邻期；上海溢价／折价看三源完整同日计算。不能由上海出库增加直接写全球黄金东迁，也不能用伦敦总库存变化推某条路线。
7. **AI 只组织文字。** 先按以上规则得出方向与变化标记，再让 AI 用短句表达。不得由 AI 估缺失数据、选新日期或推断未验证因果。提示词可用：“仅根据已确认的方向、变化标记和数据期，写一句简短趋势判断，例如‘东向仍占优，但流量放缓’。比较缺失就说明待确认。不要以具体数字作主句，不推断资金动机或全球流向。”

## 7. 技术实施优先级与验收

**先做：** 获取符合使用条件的伦敦 PM 数据交付；恢复 CME 日库存；验证英国、香港、瑞士出口和内地／泰国直接黄金重量。通过对账后接入，不先改页面数据。

**随后做：** 验证美国访问及子目单位，补印度／土耳其重量；检查新加坡免费接续平台。阿联酋没有验证成功前继续显示历史或缺失。

**上线验收：** 每个数值能追溯到具体文件／查询和日期；新期及修订可检测；未完成的获取不覆盖已验证数据；趋势比较不因市场缺失改变；伦敦价格使用方式符合交付许可；不存在以另一种指标填补空缺的情况。来源备份只保存需要的月份、原始小文件和核验摘要，不积累重复大文件。

## 8. 本次检查范围与限制

本次逐项检查七个板块的来源绑定与需求，覆盖十个贸易市场候选，以及现用八类来源：Comtrade、BAZG、LBMA 库存、CME 库存、上金所月报、上金所日行情、LBMA／IBA 价格、ECB 汇率。已查看官方说明或既有原始证据；动态查询、下载失败及需授权的来源，未完成新黄金数值验证。

可复查的入口、访问结果和口径摘要见 [本次来源核查证据](data-checks/2026-10-09/source-audit-evidence.json)。

**来源方案需要继续实施；新接口实取验证为部分完成。** 本次修改的是来源文档，未换统计口径、未改应用数值、未部署网站。适用总数是本次范围内的板块／来源数量；0 项问题表示未观察到问题，不代表全部数据已验证。界面外观、交互和全量数值复算不属于这次来源审查。

### 来源方案的完整性与表达

| Category | Observed defects | Assessment |
| --- | --- | --- |
| 功能所需来源的持续可用性 | 2 / 7 | 三地实物信号的 CME 仍是存档；金价温差缺可持续获取的伦敦 PM。贸易直连是提高及时性的建议，尚未证明新源完整可替换 |
| 来源说明是否清楚 | 0 / 7 | 已明确实际源、候选源、口径和检查频次；接口实取未完成处单列 |
| 界面与交互 | N/A | 来源审查，未修改界面；不作视觉或交互通过声明 |

### 来源依据与数据可靠性

| Category | Observed defects | Assessment |
| --- | --- | --- |
| 来源权威性与交付依据 | 1 / 8 | 机构均有权威依据；旧伦敦价格 JSON 不能作为已保证的生产交付渠道，授权接入待落实 |
| 全量数值／计算精度 | N/A | 本次未改数值、未重算全部指标；数据刷新记录另附 |
| 图表内部一致性 | N/A | 未重验图表显示，不能将来源检查当成图表验收 |
| 各板块来源说明完整性 | 0 / 7 | 文档已对应七板块；新候选字段的实际返回和上线来源展示仍待接入后验证 |
| 文档与现用来源一致性 | 0 / 7 | 明确现程序仍用 Comtrade 和人工快照，候选没有冒充现用数值证据 |
| 新源质量控制 | N/A | 尚未接入新源；单位、完整性、固定比较集合等为实施验收条件，未声称已自动执行 |
| 优化结论的依据 | 0 / 4 | 贸易直连、保留库存／上金所、伦敦价格授权、新加坡接续平台四项判断均有官方依据；更及时的完整黄金数值仍须实证 |
