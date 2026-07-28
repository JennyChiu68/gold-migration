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
    headers: { "user-agent": "GoldMigrationMapDemo/1.0" },
  });
  if (!response.ok) {
    if (attempt < 3) {
      await wait(1500 * attempt);
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
  await wait(1050);
  return { url, rows: payload.data ?? [] };
}

function months(startYear, startMonth, count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(startYear, startMonth - 1 + index, 1));
    return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });
}

function tonnes(row) {
  return row?.netWgt == null ? null : row.netWgt / 1000;
}

const references = await fetchJson(REPORTERS);
const countryNames = new Map(
  references.results.map((country) => [country.id, country.text]),
);

const swissPeriod = "202605";
const swissRouteResult = await queryComtrade({
  period: swissPeriod,
  reporterCode: 757,
  flowCode: "X",
  allPartners: true,
});

const swissRoutes = swissRouteResult.rows
  .filter((row) => row.partnerCode !== 0 && row.netWgt > 0)
  .map((row) => ({
    partnerCode: row.partnerCode,
    destination: countryNames.get(row.partnerCode) ?? `Code ${row.partnerCode}`,
    tonnes: tonnes(row),
    valueUsd: row.primaryValue,
    estimatedWeight: Boolean(row.isNetWgtEstimated),
  }))
  .sort((left, right) => right.tonnes - left.tonnes);

const historyPeriods = months(2025, 6, 12);
const swissHistory = [];
for (const period of historyPeriods) {
  const result = await queryComtrade({
    period,
    reporterCode: 757,
    flowCode: "X",
  });
  const row = result.rows[0];
  swissHistory.push({
    period,
    tonnes: tonnes(row),
    valueUsd: row?.primaryValue ?? null,
    estimatedWeight: Boolean(row?.isNetWgtEstimated),
  });
}

const marketDefinitions = [
  { key: "hongKong", label: "中国香港", reporterCode: 344, period: "202605" },
  { key: "india", label: "印度", reporterCode: 699, period: "202603" },
  { key: "unitedKingdom", label: "英国", reporterCode: 826, period: "202605" },
  { key: "china", label: "中国内地", reporterCode: 156, period: "202412" },
];

const markets = {};
for (const market of marketDefinitions) {
  const imports = await queryComtrade({
    period: market.period,
    reporterCode: market.reporterCode,
    flowCode: "M",
  });
  const exports = await queryComtrade({
    period: market.period,
    reporterCode: market.reporterCode,
    flowCode: "X",
  });
  const importRow = imports.rows[0];
  const exportRow = exports.rows[0];
  markets[market.key] = {
    label: market.label,
    period: market.period,
    importsTonnes: tonnes(importRow),
    exportsTonnes: tonnes(exportRow),
    importValueUsd: importRow?.primaryValue ?? null,
    exportValueUsd: exportRow?.primaryValue ?? null,
    estimatedWeight:
      Boolean(importRow?.isNetWgtEstimated) ||
      Boolean(exportRow?.isNetWgtEstimated),
  };
}

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
  ((lbmaLatest.tonnes / lbmaPrevious.tonnes) - 1) * 100;

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

const swissTotal = swissRouteResult.rows.find((row) => row.partnerCode === 0);
const chinaHongKongTonnes = swissRoutes
  .filter((route) => route.partnerCode === 156 || route.partnerCode === 344)
  .reduce((sum, route) => sum + route.tonnes, 0);

const output = {
  fetchedAt: new Date().toISOString(),
  commodity: {
    hsCode: "7108",
    label: "黄金（未锻造、半制成或粉末）",
  },
  headline: {
    period: swissPeriod,
    swissExportsTonnes: tonnes(swissTotal),
    chinaHongKongTonnes,
    chinaHongKongSharePct:
      (chinaHongKongTonnes / tonnes(swissTotal)) * 100,
  },
  swiss: {
    period: swissPeriod,
    routes: swissRoutes,
    history: swissHistory,
    sourceUrl: swissRouteResult.url,
  },
  markets,
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
  sources: [
    {
      name: "UN Comtrade",
      detail: "HS 7108 月度进出口与瑞士出口目的地",
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
  `Saved ${swissRoutes.length} routes and ${swissHistory.length} months to ${outputPath}`,
);
