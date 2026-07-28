import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "app/data/gold-flows.json");
const API = "https://comtradeapi.un.org/public/v1/preview/C/M/HS";
const REPORTERS =
  "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json";

const wait = (milliseconds) =>
  new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, {
    headers: { "user-agent": "GoldMigrationMapDemo/2.0" },
  });
  if (!response.ok) {
    if (attempt < 3) {
      await wait(1400 * attempt);
      return fetchJson(url, attempt + 1);
    }
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return response.json();
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
  await wait(450);
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
  references.results.map((country) => [country.id, country.text]),
);

const commonPeriod = "202603";
const comparisonPeriod = "202602";
const networkPeriods = ["202601", comparisonPeriod, commonPeriod];

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

const allCurrentRoutes = makeRoutes(commonPeriod).sort(
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
  const result = exportSnapshots.get(`${commonPeriod}:${origin.code}`);
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
  const currentImport = await totalFlow(commonPeriod, market.code, "M");
  const previousImport = await totalFlow(comparisonPeriod, market.code, "M");
  const currentExport =
    exportTotalFromSnapshot(commonPeriod, market.code) ??
    (await totalFlow(commonPeriod, market.code, "X")).row;
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
    period: commonPeriod,
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

const chinaPeriod = "202412";
const chinaPreviousPeriod = "202411";
const chinaImport = await totalFlow(chinaPeriod, 156, "M");
const chinaExport = await totalFlow(chinaPeriod, 156, "X");
const chinaPreviousImport = await totalFlow(chinaPreviousPeriod, 156, "M");
const chinaPreviousExport = await totalFlow(chinaPreviousPeriod, 156, "X");
const chinaNet = safeNet(tonnes(chinaImport.row), tonnes(chinaExport.row));
const chinaPreviousNet = safeNet(
  tonnes(chinaPreviousImport.row),
  tonnes(chinaPreviousExport.row),
);

const laggedMarkets = [
  {
    code: 156,
    key: "chinaMainland",
    label: "中国内地",
    zone: "asia",
    period: chinaPeriod,
    comparable: false,
    importsTonnes: tonnes(chinaImport.row),
    exportsTonnes: tonnes(chinaExport.row),
    netImportsTonnes: chinaNet,
    previousNetImportsTonnes: chinaPreviousNet,
    changeTonnes:
      chinaNet == null || chinaPreviousNet == null
        ? null
        : chinaNet - chinaPreviousNet,
    estimatedWeight:
      Boolean(chinaImport.row?.isNetWgtEstimated) ||
      Boolean(chinaExport.row?.isNetWgtEstimated),
  },
];
const availableComparableMarkets = comparableMarkets.filter(
  (market) => market.netImportsTonnes != null,
);
const unavailableComparableMarkets = comparableMarkets.filter(
  (market) => market.netImportsTonnes == null,
);

const londonTroyOuncesThousands = [
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
];
const lbmaHistory = londonTroyOuncesThousands.map(([period, value]) => ({
  period,
  tonnes: value * 0.0311034768,
}));
const lbmaLatest = lbmaHistory.at(-1);
const lbmaPrevious = lbmaHistory.at(-2);
const londonMonthlyChangePct =
  (lbmaLatest.tonnes / lbmaPrevious.tonnes - 1) * 100;

const sge = {
  period: "2026-06",
  withdrawalsTonnes: 86.6824,
  previousWithdrawalsTonnes: 63.58446,
  deliveryTonnes: 565.6723,
  previousDeliveryTonnes: 582.66738,
  sourceUrl:
    "https://www.sge.com.cn/upload/file/202607/02/9a1fd9b9be654e46a96d6e5a9754e638.pdf",
  previousSourceUrl:
    "https://www.sge.com.cn/upload/file/202607/02/40caa5b58c7e4a9ba45682c3a2731d8f.pdf",
};

const priceComparison = {
  date: "2026-06-30",
  shanghaiAu9999CnyPerGram: 879.03,
  lbmaPmUsdPerOunce: 4026.05,
  ecbCnyPerEur: 7.7314,
  ecbUsdPerEur: 1.1394,
};
priceComparison.londonEquivalentCnyPerGram =
  (priceComparison.lbmaPmUsdPerOunce / 31.1034768) *
  (priceComparison.ecbCnyPerEur / priceComparison.ecbUsdPerEur);
priceComparison.shanghaiPremiumPct =
  (priceComparison.shanghaiAu9999CnyPerGram /
    priceComparison.londonEquivalentCnyPerGram -
    1) *
  100;

const output = {
  version: 2,
  fetchedAt: new Date().toISOString(),
  commodity: {
    hsCode: "7108",
    label: "黄金（未锻造、半制成或粉末）",
  },
  network: {
    period: commonPeriod,
    comparisonPeriod,
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
  marketBalances: {
    period: commonPeriod,
    comparisonPeriod,
    comparable: availableComparableMarkets,
    unavailable: unavailableComparableMarkets.map((market) => ({
      code: market.code,
      key: market.key,
      label: market.label,
      period: market.period,
    })),
    lagged: laggedMarkets,
  },
  vaults: {
    london: {
      period: lbmaLatest.period,
      tonnes: lbmaLatest.tonnes,
      monthlyChangePct: londonMonthlyChangePct,
      history: lbmaHistory,
      sourceUrl:
        "https://www.lbma.org.uk/prices-and-data/london-vault-data",
      workbookUrl:
        "https://cdn.lbma.org.uk/downloads/LBMA-London-Vault-Holdings-Data-June-2026.xlsx",
    },
    newYork: {
      period: "2026-07-22",
      tonnes: 27.01 * 31.1034768,
      ouncesMillions: 27.01,
      thirtyDayChangePct: -3.1,
      sourceQuality: "CME日报的第三方结构化提取",
      rawSourceUrl:
        "https://www.cmegroup.com/delivery_reports/Gold_Stocks.xls",
      extractionSourceUrl:
        "https://thevaultreport.com/briefing/2026-07-24",
    },
    shanghai: sge,
  },
  priceComparison,
  methodology: {
    measured:
      "跨境路线与市场净进出口来自UN Comtrade HS 7108月度报关重量。",
    inferred:
      "东西向指标仅汇总六个监测枢纽的跨区域报关流量；同一批黄金可能因转口而被多次记录。",
    comparability:
      "净流入榜只比较共同月份；中国内地因月度数据更新较慢，单列最新可得月份。",
  },
  sources: [
    {
      name: "UN Comtrade",
      detail: "HS 7108月度双边路线、进口、出口与净流入",
      url: "https://uncomtrade.org/docs/un-comtrade-api/",
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
      detail: "COMEX批准金库每日库存原始表",
      url: "https://www.cmegroup.com/clearing/operations-and-deliveries/registrar-reports.html",
    },
    {
      name: "ECB / LBMA / SGE",
      detail: "上海—伦敦同日指示性溢价换算",
      url: "https://data.ecb.europa.eu/data/datasets/EXR",
    },
  ],
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Saved ${mappedRoutes.length} mapped routes, ${availableComparableMarkets.length} comparable markets and ${directionHistory.length} direction periods to ${outputPath}`,
);
