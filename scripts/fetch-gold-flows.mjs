import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { displayMarketName } from "./market-names.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "app/data/gold-flows.json");
const API = "https://comtradeapi.un.org/public/v1/preview/C/M/HS";
const REPORTERS =
  "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";
const OUTPUT_VERSION = 4;
const buildTimestamp = new Date().toISOString();
const latestComparablePeriod = "202606";
const comparisonPeriod = "202605";
const networkPeriods = ["202604", comparisonPeriod, latestComparablePeriod];

// Review these observations against their official sources before each refresh.
// A new build timestamp must never be mistaken for a new observation timestamp.
const manualSnapshots = {
  swissImport: {
    period: "2026-08",
    observationPeriod: "202608",
    sourceFetchedAt: "2026-09-29T08:39:00.000Z",
    frequency: "monthly",
    status: "manualSnapshot",
    scope:
      "瑞士官方7108.1200黄金进口来源国月度暂定数据；来源国不等同于矿山原产地。",
    importsTonnes: 205.02,
    sourceUrl:
      "https://ocean.nivel.bazg.admin.ch/open-data-reports/TN8_controlCode_Gold_IMP_en_v1/TN8_controlCode_Gold_IMP_en_v1.csv",
    definition: "瑞士海关7108.1200四类控制代码进口重量之和；8月数据为暂定值。",
    topOrigins: [
      { code: 784, label: "阿联酋", tonnes: 74.708 },
      { code: 842, label: "美国", tonnes: 28.725 },
      { code: 32, label: "阿根廷", tonnes: 12.411 },
      { code: 380, label: "意大利", tonnes: 10.585 },
      { code: 152, label: "智利", tonnes: 9.727 },
      { code: 792, label: "土耳其", tonnes: 7.31 },
      { code: 604, label: "秘鲁", tonnes: 6.973 },
      { code: 764, label: "泰国", tonnes: 6.703 },
      { code: 288, label: "加纳", tonnes: 5.286 },
      { code: 276, label: "德国", tonnes: 4.594 },
    ],
  },
  london: {
    observationPeriod: "202609",
    sourceFetchedAt: "2026-10-08T07:48:42.393Z",
    frequency: "monthly",
    status: "manualSnapshot",
    scope: "伦敦专业金库月末黄金持有量，不等同于英国报关库存。",
    troyOuncesThousands: [
      ["2025-06", 282140.554114],
      ["2025-07", 285015],
      ["2025-08", 283934],
      ["2025-09", 284241],
      ["2025-10", 284807],
      ["2025-11", 286360],
      ["2025-12", 292777.42749],
      ["2026-01", 294440.272263],
      ["2026-02", 296095.740565],
      ["2026-03", 300260],
      ["2026-04", 301320],
      ["2026-05", 301967.702141],
      ["2026-06", 304285],
      ["2026-07", 306526.610788],
      ["2026-08", 309681],
      ["2026-09", 315756],
    ],
    sourceUrl: "https://www.lbma.org.uk/prices-and-data/london-vault-data",
    workbookUrl:
      "https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-September-2026.xlsx",
  },
  newYork: {
    period: "2026-07-30",
    observationPeriod: "2026-07-30",
    activityDate: "2026-07-29",
    sourceFetchedAt: "2026-07-31T00:00:00.000Z",
    frequency: "daily",
    status: "historicalSnapshot",
    scope:
      "截至2026年7月30日的CME官方库存表存档；最新表未能获取。registered包含pledged，计算总量时不得重复相加。",
    registeredOunces: 14747681.698,
    pledgedOunces: 1833860.235,
    eligibleOunces: 12289920.902,
    totalOunces: 27037602.6,
    previousTotalOunces: 27025730.839,
    dailyNetChangeOunces: 11871.761,
    dailyReceivedOunces: 11903.912,
    dailyWithdrawnOunces: 32.151,
    sourceQuality: "CME官方日报",
    rawSourceUrl: "https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls",
  },
  shanghai: {
    period: "2026-09",
    observationPeriod: "202609",
    sourceFetchedAt: "2026-10-09T07:53:44.050Z",
    frequency: "monthly",
    status: "manualSnapshot",
    scope:
      "上海黄金交易所月报中的黄金出库量与交割量，不等同于交易所总库存。",
    withdrawalsTonnes: 92.08324,
    previousWithdrawalsTonnes: 62.14788,
    deliveryTonnes: 613.28868,
    previousDeliveryTonnes: 539.45896,
    sourceUrl:
      "https://www.sge.com.cn/upload/file/202610/09/9e6b4a569aeb41149beed7619cad377f.pdf",
    previousSourceUrl:
      "https://www.sge.com.cn/upload/file/202609/03/31e71479a1e44d81a6f2c6167fa61a8e.pdf",
  },
  priceComparison: {
    date: "2026-09-28",
    observationPeriod: "2026-09-28",
    sourceFetchedAt: "2026-09-29T08:39:00.000Z",
    frequency: "daily-aligned",
    alignment: "same-day",
    status: "manualSnapshot",
    scope:
      "上海Au99.99收盘价、LBMA PM与ECB同日汇率的指示性换算；不含税费、运保与规格差异。",
    shanghaiAu9999CnyPerGram: 900.89,
    lbmaPmUsdPerOunce: 4144.55,
    ecbCnyPerEur: 7.6352,
    ecbUsdPerEur: 1.1378,
    sourceUrls: {
      shanghai:
        "https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-28&end_date=2026-09-28",
      london: "https://prices.lbma.org.uk/json/gold_pm.json",
      exchangeRates:
        "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
    },
  },
};

const wait = (milliseconds) =>
  new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function fetchJson(url, attempt = 1) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "user-agent": "GoldMigrationMapDemo/4.0" },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (attempt < 5) {
      await wait(1600 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`Source connection failed after ${attempt} attempts: ${url}`, {
      cause: error,
    });
  }
  if (!response.ok) {
    if (attempt < 5) {
      await wait(1400 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  const payload = await response.json();
  if (payload?.statusCode === 429) {
    if (attempt < 5) {
      await wait(1600 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`Rate limit exceeded after ${attempt} attempts: ${url}`);
  }
  return payload;
}

async function queryComtrade({
  period,
  reporterCode,
  flowCode,
  allPartners = false,
}) {
  const parameters = new URLSearchParams({
    period,
    reporterCode: String(reporterCode),
    flowCode,
    partner2Code: "0",
    cmdCode: "7108",
    customsCode: "C00",
    motCode: "0",
    maxRecords: "500",
  });
  if (!allPartners) parameters.set("partnerCode", "0");

  const url = `${API}?${parameters}`;
  const payload = await fetchJson(url);
  if (payload.error) throw new Error(payload.error);
  await wait(900);
  return { url, rows: payload.data ?? [] };
}

function tonnes(row) {
  return row?.netWgt == null ? null : row.netWgt / 1000;
}

function safeNet(importsTonnes, exportsTonnes) {
  if (importsTonnes == null || exportsTonnes == null) return null;
  return importsTonnes - exportsTonnes;
}

const references = await fetchJson(REPORTERS);
const countryNames = new Map(
  references.results.map((country) => [country.id, displayMarketName(country.text)]),
);

const originDefinitions = [
  { code: 757, key: "switzerland", label: "瑞士", zone: "west" },
  { code: 826, key: "unitedKingdom", label: "英国", zone: "west" },
  { code: 842, key: "unitedStates", label: "美国", zone: "west" },
  { code: 344, key: "hongKong", label: "中国香港", zone: "east" },
  { code: 702, key: "singapore", label: "新加坡", zone: "east" },
  { code: 784, key: "unitedArabEmirates", label: "阿联酋", zone: "east" },
];

const marketDefinitions = [
  { code: 344, key: "hongKong", label: "中国香港", zone: "asia" },
  { code: 699, key: "india", label: "印度", zone: "asia" },
  { code: 764, key: "thailand", label: "泰国", zone: "asia" },
  { code: 792, key: "turkiye", label: "土耳其", zone: "other" },
  { code: 784, key: "unitedArabEmirates", label: "阿联酋", zone: "other" },
  { code: 702, key: "singapore", label: "新加坡", zone: "asia" },
  { code: 826, key: "unitedKingdom", label: "英国", zone: "west" },
  { code: 842, key: "unitedStates", label: "美国", zone: "west" },
  { code: 757, key: "switzerland", label: "瑞士", zone: "west" },
];

const latestMarketDefinitions = [
  {
    code: 757,
    key: "switzerland",
    label: "瑞士",
    zone: "west",
    period: "202608",
  },
  {
    code: 826,
    key: "unitedKingdom",
    label: "英国",
    zone: "west",
    period: "202607",
  },
  {
    code: 842,
    key: "unitedStates",
    label: "美国",
    zone: "west",
    period: "202607",
  },
  {
    code: 699,
    key: "india",
    label: "印度",
    zone: "asia",
    period: "202607",
    scope:
      "2026年7月进口重量可得、出口净重缺失；2026年6月具备双向重量，不混入7月观察。",
  },
  {
    code: 344,
    key: "hongKong",
    label: "中国香港",
    zone: "asia",
    period: "202607",
  },
  {
    code: 156,
    key: "chinaMainland",
    label: "中国内地",
    zone: "asia",
    period: "202412",
  },
  {
    code: 764,
    key: "thailand",
    label: "泰国",
    zone: "asia",
    period: "202605",
  },
  {
    code: 792,
    key: "turkiye",
    label: "土耳其",
    zone: "other",
    period: "202512",
    scope:
      "2025年12月进口重量有效，但出口净重为空；不能计算净流量或参与排名。",
  },
  {
    code: 784,
    key: "unitedArabEmirates",
    label: "阿联酋",
    zone: "other",
    period: "201912",
    scope:
      "UN Comtrade对阿联酋的最新月度数据停留在2019年12月；仅作历史最新观察，不参与共同期排名。",
  },
  {
    code: 702,
    key: "singapore",
    label: "新加坡",
    zone: "asia",
    period: "202603",
  },
];

const asianPartnerCodes = new Set([
  50, 156, 344, 360, 392, 410, 458, 490, 586, 699, 702, 704, 764,
]);
const westernPartnerCodes = new Set([
  36, 40, 56, 124, 250, 276, 380, 528, 616, 724, 752, 757, 826, 842,
]);

const exportSnapshots = new Map();
for (const period of networkPeriods) {
  for (const origin of originDefinitions) {
    const result = await queryComtrade({
      period,
      reporterCode: origin.code,
      flowCode: "X",
      allPartners: true,
    });
    exportSnapshots.set(`${period}:${origin.code}`, result);
  }
}

function makeRoutes(period) {
  return originDefinitions.flatMap((origin) => {
    const result = exportSnapshots.get(`${period}:${origin.code}`);
    return result.rows
      .filter((row) => row.partnerCode !== 0 && row.netWgt > 0)
      .map((row) => ({
        id: `${origin.code}-${row.partnerCode}`,
        period,
        originCode: origin.code,
        origin: origin.label,
        originZone: origin.zone,
        destinationCode: row.partnerCode,
        destination:
          countryNames.get(row.partnerCode) ?? `Code ${row.partnerCode}`,
        tonnes: tonnes(row),
        valueUsd: row.primaryValue,
        estimatedWeight: Boolean(row.isNetWgtEstimated),
      }));
  });
}

function directionFor(route) {
  if (
    route.originZone === "west" &&
    asianPartnerCodes.has(route.destinationCode)
  ) {
    return "eastbound";
  }
  if (
    route.originZone === "east" &&
    westernPartnerCodes.has(route.destinationCode)
  ) {
    return "westbound";
  }
  return "other";
}

function directionalSnapshot(period) {
  const routes = makeRoutes(period);
  const eastboundTonnes = routes
    .filter((route) => directionFor(route) === "eastbound")
    .reduce((sum, route) => sum + route.tonnes, 0);
  const westboundTonnes = routes
    .filter((route) => directionFor(route) === "westbound")
    .reduce((sum, route) => sum + route.tonnes, 0);
  return {
    period,
    eastboundTonnes,
    westboundTonnes,
    netEastboundTonnes: eastboundTonnes - westboundTonnes,
  };
}

const allCurrentRoutes = makeRoutes(latestComparablePeriod).sort(
  (left, right) => right.tonnes - left.tonnes,
);
const routeMapCodes = new Set([
  36, 40, 56, 124, 156, 250, 276, 344, 380, 392, 410, 458, 682, 699, 702,
  724, 757, 764, 784, 792, 826, 842,
]);
const mappedRoutes = allCurrentRoutes
  .filter((route) => routeMapCodes.has(route.destinationCode))
  .slice(0, 40);
const directionHistory = networkPeriods.map(directionalSnapshot);
const currentDirection = directionHistory.at(-1);
const previousDirection = directionHistory.at(-2);

const originSummaries = originDefinitions.map((origin) => {
  const result = exportSnapshots.get(
    `${latestComparablePeriod}:${origin.code}`,
  );
  const total = result.rows.find((row) => row.partnerCode === 0);
  return {
    code: origin.code,
    key: origin.key,
    label: origin.label,
    zone: origin.zone,
    exportsTonnes: tonnes(total),
    estimatedWeight: Boolean(total?.isNetWgtEstimated),
  };
});
const availableOrigins = originSummaries.filter(
  (origin) => origin.exportsTonnes != null,
);
const unavailableOrigins = originSummaries.filter(
  (origin) => origin.exportsTonnes == null,
);

async function totalFlow(period, reporterCode, flowCode) {
  const result = await queryComtrade({
    period,
    reporterCode,
    flowCode,
  });
  return {
    row: result.rows.find((row) => row.partnerCode === 0) ?? result.rows[0],
    url: result.url,
  };
}

function exportTotalFromSnapshot(period, reporterCode) {
  const snapshot = exportSnapshots.get(`${period}:${reporterCode}`);
  const row = snapshot?.rows.find((candidate) => candidate.partnerCode === 0);
  return row ?? null;
}

const comparableMarkets = [];
for (const market of marketDefinitions) {
  const currentImport = await totalFlow(
    latestComparablePeriod,
    market.code,
    "M",
  );
  const previousImport = await totalFlow(comparisonPeriod, market.code, "M");
  const currentExport =
    exportTotalFromSnapshot(latestComparablePeriod, market.code) ??
    (await totalFlow(latestComparablePeriod, market.code, "X")).row;
  const previousExport =
    exportTotalFromSnapshot(comparisonPeriod, market.code) ??
    (await totalFlow(comparisonPeriod, market.code, "X")).row;

  const importsTonnes = tonnes(currentImport.row);
  const exportsTonnes = tonnes(currentExport);
  const previousImportsTonnes = tonnes(previousImport.row);
  const previousExportsTonnes = tonnes(previousExport);
  const netImportsTonnes = safeNet(importsTonnes, exportsTonnes);
  const previousNetImportsTonnes = safeNet(
    previousImportsTonnes,
    previousExportsTonnes,
  );

  comparableMarkets.push({
    ...market,
    period: latestComparablePeriod,
    comparable: true,
    importsTonnes,
    exportsTonnes,
    netImportsTonnes,
    previousNetImportsTonnes,
    changeTonnes:
      netImportsTonnes == null || previousNetImportsTonnes == null
        ? null
        : netImportsTonnes - previousNetImportsTonnes,
    estimatedWeight:
      Boolean(currentImport.row?.isNetWgtEstimated) ||
      Boolean(currentExport?.isNetWgtEstimated),
  });
}

const availableComparableMarkets = comparableMarkets.filter(
  (market) => market.netImportsTonnes != null,
);
const unavailableComparableMarkets = comparableMarkets.filter(
  (market) => market.netImportsTonnes == null,
);

const swissExportPeriod = "202608";
const swissExportResult = await queryComtrade({
  period: swissExportPeriod,
  reporterCode: 757,
  flowCode: "X",
  allPartners: true,
});
const swissExportTotalRow =
  swissExportResult.rows.find((row) => row.partnerCode === 0) ?? null;
const swissExportDestinations = swissExportResult.rows
  .filter((row) => row.partnerCode !== 0 && row.netWgt > 0)
  .map((row) => ({
    id: `757-${row.partnerCode}`,
    period: swissExportPeriod,
    originCode: 757,
    origin: "瑞士",
    originZone: "west",
    destinationCode: row.partnerCode,
    destination:
      countryNames.get(row.partnerCode) ?? `Code ${row.partnerCode}`,
    tonnes: tonnes(row),
    valueUsd: row.primaryValue,
    estimatedWeight: Boolean(row.isNetWgtEstimated),
  }))
  .sort((left, right) => right.tonnes - left.tonnes);

const latestAvailableMarkets = [];
for (const market of latestMarketDefinitions) {
  const currentImport = await totalFlow(market.period, market.code, "M");
  const currentExport =
    market.code === 757 && market.period === swissExportPeriod
      ? { row: swissExportTotalRow, url: swissExportResult.url }
      : await totalFlow(market.period, market.code, "X");
  const importsTonnes = tonnes(currentImport.row);
  const exportsTonnes = tonnes(currentExport.row);
  const netImportsTonnes = safeNet(importsTonnes, exportsTonnes);
  const isComplete = netImportsTonnes != null;

  latestAvailableMarkets.push({
    ...market,
    observationPeriod: market.period,
    sourceFetchedAt: buildTimestamp,
    frequency: "monthly",
    status: isComplete ? "complete" : "partial",
    scope:
      market.scope ??
      (isComplete
        ? "该市场自身最新可得的HS 7108月度总进口与总出口；不同市场月份不可直接横向排名。"
        : "该市场自身最新可得月份至少一侧重量缺失，不能计算净流量或参与排名。"),
    importsTonnes,
    exportsTonnes,
    netImportsTonnes,
    estimatedWeight:
      Boolean(currentImport.row?.isNetWgtEstimated) ||
      Boolean(currentExport.row?.isNetWgtEstimated),
    sourceUrls: {
      imports: currentImport.url,
      exports: currentExport.url,
    },
  });
}

const chinaLatest = latestAvailableMarkets.find(
  (market) => market.key === "chinaMainland",
);
const chinaPreviousPeriod = "202411";
const chinaPreviousImport = await totalFlow(chinaPreviousPeriod, 156, "M");
const chinaPreviousExport = await totalFlow(chinaPreviousPeriod, 156, "X");
const chinaPreviousNet = safeNet(
  tonnes(chinaPreviousImport.row),
  tonnes(chinaPreviousExport.row),
);

const laggedMarkets = [
  {
    code: chinaLatest.code,
    key: chinaLatest.key,
    label: chinaLatest.label,
    zone: chinaLatest.zone,
    period: chinaLatest.period,
    comparable: false,
    importsTonnes: chinaLatest.importsTonnes,
    exportsTonnes: chinaLatest.exportsTonnes,
    netImportsTonnes: chinaLatest.netImportsTonnes,
    previousNetImportsTonnes: chinaPreviousNet,
    changeTonnes:
      chinaLatest.netImportsTonnes == null || chinaPreviousNet == null
        ? null
        : chinaLatest.netImportsTonnes - chinaPreviousNet,
    estimatedWeight: chinaLatest.estimatedWeight,
  },
];

const lbmaHistory = manualSnapshots.london.troyOuncesThousands.map(
  ([period, value]) => ({
    period,
    tonnes: value * 0.0311034768,
  }),
);
const lbmaLatest = lbmaHistory.at(-1);
const lbmaPrevious = lbmaHistory.at(-2);
const londonMonthlyChangePct =
  (lbmaLatest.tonnes / lbmaPrevious.tonnes - 1) * 100;

const priceComparison = { ...manualSnapshots.priceComparison };
priceComparison.londonEquivalentCnyPerGram =
  (priceComparison.lbmaPmUsdPerOunce / 31.1034768) *
  (priceComparison.ecbCnyPerEur / priceComparison.ecbUsdPerEur);
priceComparison.shanghaiPremiumPct =
  (priceComparison.shanghaiAu9999CnyPerGram /
    priceComparison.londonEquivalentCnyPerGram -
    1) *
  100;

const newYork = {
  ...manualSnapshots.newYork,
  registeredTonnes:
    (manualSnapshots.newYork.registeredOunces * 31.1034768) / 1_000_000,
  pledgedTonnes:
    (manualSnapshots.newYork.pledgedOunces * 31.1034768) / 1_000_000,
  eligibleTonnes:
    (manualSnapshots.newYork.eligibleOunces * 31.1034768) / 1_000_000,
  totalTonnes:
    (manualSnapshots.newYork.totalOunces * 31.1034768) / 1_000_000,
  tonnes: (manualSnapshots.newYork.totalOunces * 31.1034768) / 1_000_000,
  ouncesMillions: manualSnapshots.newYork.totalOunces / 1_000_000,
  dailyNetChangeTonnes:
    (manualSnapshots.newYork.dailyNetChangeOunces * 31.1034768) / 1_000_000,
  dailyChangePct:
    (manualSnapshots.newYork.totalOunces /
      manualSnapshots.newYork.previousTotalOunces -
      1) *
    100,
};

const output = {
  version: OUTPUT_VERSION,
  fetchedAt: new Date().toISOString(),
  fetchedAtMeaning:
    "页面数据包构建时间；各模块真实观测期与来源抓取时间见observationPeriod和sourceFetchedAt。",
  commodity: {
    hsCode: "7108",
    label: "黄金（未锻造、半制成或粉末）",
  },
  network: {
    period: latestComparablePeriod,
    observationPeriod: latestComparablePeriod,
    latestComparablePeriod,
    comparisonPeriod,
    sourceFetchedAt: buildTimestamp,
    frequency: "monthly",
    status: "latestComparable",
    scope:
      "六个监测枢纽中数据完整市场的共同完整月份，用于跨市场路线与东西向比较；不代表每个市场各自最新月份。",
    sourceUrl: API,
    coverage: {
      originCount: availableOrigins.length,
      candidateOriginCount: originDefinitions.length,
      routeCount: allCurrentRoutes.length,
      mappedRouteCount: mappedRoutes.length,
      unavailableOrigins: unavailableOrigins.map((origin) => origin.label),
      description:
        "已报送枢纽的月度报关出口网络，不代表全球全量；未报送枢纽不参与方向计算。",
    },
    origins: originSummaries,
    routes: mappedRoutes,
    direction: {
      ...currentDirection,
      previousEastboundTonnes: previousDirection.eastboundTonnes,
      eastboundChangeTonnes:
        currentDirection.eastboundTonnes - previousDirection.eastboundTonnes,
      eastboundChangePct:
        (currentDirection.eastboundTonnes / previousDirection.eastboundTonnes -
          1) *
        100,
      previousNetEastboundTonnes: previousDirection.netEastboundTonnes,
      changeTonnes:
        currentDirection.netEastboundTonnes -
        previousDirection.netEastboundTonnes,
      history: directionHistory,
    },
  },
  swissRefinery: {
    importSnapshot: manualSnapshots.swissImport,
    exportSnapshot: {
      period: swissExportPeriod,
      observationPeriod: swissExportPeriod,
      sourceFetchedAt: buildTimestamp,
      frequency: "monthly",
      status: "latestAvailable",
      scope:
        "瑞士自身最新可得的HS 7108月度出口总量与完整目的地排名；不与海关进口量相减推算库存。",
      exportsTonnes: tonnes(swissExportTotalRow),
      estimatedWeight: Boolean(swissExportTotalRow?.isNetWgtEstimated),
      destinationCount: swissExportDestinations.length,
      sourceUrl: swissExportResult.url,
      destinations: swissExportDestinations,
    },
  },
  marketBalances: {
    period: latestComparablePeriod,
    observationPeriod: latestComparablePeriod,
    latestComparablePeriod,
    comparisonPeriod,
    sourceFetchedAt: buildTimestamp,
    frequency: "monthly",
    status: "latestComparable",
    scope:
      "净流入榜仅使用各市场均具备有效进口和出口重量的共同完整月份；latestAvailable仅供单市场观察，不能混排。",
    sourceUrl: API,
    comparable: availableComparableMarkets,
    unavailable: unavailableComparableMarkets.map((market) => ({
      code: market.code,
      key: market.key,
      label: market.label,
      period: market.period,
    })),
    lagged: laggedMarkets,
    latestAvailable: latestAvailableMarkets,
  },
  vaults: {
    london: {
      period: lbmaLatest.period,
      observationPeriod: manualSnapshots.london.observationPeriod,
      sourceFetchedAt: manualSnapshots.london.sourceFetchedAt,
      frequency: manualSnapshots.london.frequency,
      status: manualSnapshots.london.status,
      scope: manualSnapshots.london.scope,
      tonnes: lbmaLatest.tonnes,
      monthlyChangePct: londonMonthlyChangePct,
      history: lbmaHistory,
      sourceUrl: manualSnapshots.london.sourceUrl,
      workbookUrl: manualSnapshots.london.workbookUrl,
    },
    newYork,
    shanghai: manualSnapshots.shanghai,
  },
  priceComparison,
  methodology: {
    measured:
      "跨境路线与市场净进出口来自UN Comtrade HS 7108月度数据；标记“重量估算”的记录为官方估算重量，不等同于直接申报重量。",
    inferred:
      "东西向指标仅汇总六个监测枢纽的跨区域报关流量；同一批黄金可能因转口而被多次记录。",
    comparability:
      "净流入榜和方向指标使用2026年6月共同完整期；各市场latestAvailable按自身最新月份单列，不参与跨市场排名。",
  },
  sources: [
    {
      name: "UN Comtrade",
      detail: "HS 7108月度双边路线、进口、出口与净流入",
      url: "https://uncomtrade.org/docs/un-comtrade-api/",
    },
    {
      name: "瑞士联邦海关（BAZG）",
      detail: "瑞士黄金月度进口来源国；商业使用需按数据条款确认许可",
      url: manualSnapshots.swissImport.sourceUrl,
    },
    {
      name: "LBMA",
      detail: "伦敦金库月末黄金持有量",
      url: "https://www.lbma.org.uk/prices-and-data/london-vault-data",
    },
    {
      name: "上海黄金交易所",
      detail: "月度黄金交割与出库量",
      url: "https://www.sge.com.cn/sjzx/hqyb",
    },
    {
      name: "CME Group",
      detail: "COMEX批准金库每日库存官方原始表；当前展示2026年7月30日存档",
      url: "https://www.cmegroup.com/clearing/operations-and-deliveries/registrar-reports.html",
    },
    {
      name: "ECB / LBMA / SGE",
      detail: "上海—伦敦同日指示性溢价；汇率取ECB参考汇率",
      url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html",
    },
    {
      name: "LBMA Gold Price PM",
      detail: "2026年9月28日伦敦下午定盘价",
      url: "https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices",
    },
    {
      name: "上金所每日行情",
      detail: "2026年9月28日Au99.99收盘价",
      url: "https://www.sge.com.cn/sjzx/quotation_daily_new?start_date=2026-09-28&end_date=2026-09-28",
    },
  ],
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Saved ${mappedRoutes.length} mapped routes, ${availableComparableMarkets.length} comparable markets and ${directionHistory.length} direction periods to ${outputPath}`,
);
