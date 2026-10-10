import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(
  await readFile(new URL("../app/data/gold-flows.json", import.meta.url)),
);
const generatorSource = await readFile(
  new URL("../scripts/fetch-gold-flows.mjs", import.meta.url),
  "utf8",
);

const tolerance = 1e-8;
const closeTo = (actual, expected, message) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${message}: expected ${expected}, received ${actual}`,
  );

function assertModuleMetadata(module, expectedFrequency) {
  assert.equal(typeof module.observationPeriod, "string");
  assert.ok(module.observationPeriod.length >= 6);
  assert.ok(Number.isFinite(Date.parse(module.sourceFetchedAt)));
  assert.equal(module.frequency, expectedFrequency);
  assert.equal(typeof module.status, "string");
  assert.ok(module.status.length > 0);
  assert.equal(typeof module.scope, "string");
  assert.ok(module.scope.length > 10);
}

test("version 4 separates build time from observation metadata", () => {
  assert.equal(data.version, 4);
  assert.ok(Number.isFinite(Date.parse(data.fetchedAt)));
  assert.match(data.fetchedAtMeaning, /构建时间/);
  assert.match(data.fetchedAtMeaning, /observationPeriod/);
  assert.match(data.fetchedAtMeaning, /sourceFetchedAt/);

  assertModuleMetadata(data.network, "monthly");
  assertModuleMetadata(data.marketBalances, "monthly");
  assertModuleMetadata(data.swissRefinery.importSnapshot, "monthly");
  assertModuleMetadata(data.swissRefinery.exportSnapshot, "monthly");
  assertModuleMetadata(data.vaults.london, "monthly");
  assertModuleMetadata(data.vaults.newYork, "daily");
  assertModuleMetadata(data.vaults.shanghai, "monthly");
  assertModuleMetadata(data.priceComparison, "daily-aligned");

  const buildTime = Date.parse(data.fetchedAt);
  for (const sourceModule of [
    data.network,
    data.marketBalances,
    data.swissRefinery.importSnapshot,
    data.swissRefinery.exportSnapshot,
    data.vaults.london,
    data.vaults.newYork,
    data.vaults.shanghai,
    data.priceComparison,
  ]) {
    assert.ok(Date.parse(sourceModule.sourceFetchedAt) <= buildTime);
  }
});

test("common-period network and ranking are explicitly isolated", () => {
  assert.equal(data.network.latestComparablePeriod, "202606");
  assert.equal(data.marketBalances.latestComparablePeriod, "202606");
  assert.equal(data.network.period, data.network.latestComparablePeriod);
  assert.equal(
    data.marketBalances.period,
    data.marketBalances.latestComparablePeriod,
  );
  assert.equal(data.network.status, "latestComparable");
  assert.equal(data.marketBalances.status, "latestComparable");
  assert.match(data.network.scope, /不代表每个市场各自最新月份/);
  assert.match(data.marketBalances.scope, /不能混排/);
});

test("comparable market balances reconcile at one complete period", () => {
  assert.deepEqual(
    data.marketBalances.comparable.map((market) => market.code).sort((a, b) => a - b),
    [344, 699, 757, 826, 842],
  );
  for (const market of data.marketBalances.comparable) {
    assert.equal(market.period, data.marketBalances.latestComparablePeriod);
    assert.equal(typeof market.importsTonnes, "number");
    assert.equal(typeof market.exportsTonnes, "number");
    assert.equal(typeof market.netImportsTonnes, "number");
    closeTo(
      market.netImportsTonnes,
      market.importsTonnes - market.exportsTonnes,
      `${market.label} net imports`,
    );
    if (market.previousNetImportsTonnes == null) {
      assert.equal(market.changeTonnes, null);
    } else {
      closeTo(
        market.changeTonnes,
        market.netImportsTonnes - market.previousNetImportsTonnes,
        `${market.label} monthly change`,
      );
    }
  }
});

test("latest-available market snapshots are not mixed into the common ranking", () => {
  const latestByKey = new Map(
    data.marketBalances.latestAvailable.map((market) => [market.key, market]),
  );
  const expectedPeriods = {
    switzerland: "202608",
    unitedKingdom: "202607",
    unitedStates: "202607",
    india: "202607",
    hongKong: "202607",
    chinaMainland: "202412",
    thailand: "202605",
    turkiye: "202512",
    unitedArabEmirates: "201912",
    singapore: "202603",
  };

  for (const [key, period] of Object.entries(expectedPeriods)) {
    const market = latestByKey.get(key);
    assert.ok(market, `missing latest snapshot for ${key}`);
    assert.equal(market.observationPeriod, period);
    assert.equal(market.frequency, "monthly");
    assert.ok(Number.isFinite(Date.parse(market.sourceFetchedAt)));
    if (market.status === "complete") {
      closeTo(
        market.netImportsTonnes,
        market.importsTonnes - market.exportsTonnes,
        `${market.label} latest net imports`,
      );
    }
  }

  const hongKong = latestByKey.get("hongKong");
  assert.equal(hongKong.status, "complete");
  const india = latestByKey.get("india");
  assert.equal(india.status, "partial");
  assert.equal(india.exportsTonnes, null);
  assert.equal(india.netImportsTonnes, null);
  const singapore = latestByKey.get("singapore");
  assert.equal(singapore.status, "complete");
  closeTo(
    singapore.netImportsTonnes,
    2.529089,
    "Singapore March net imports",
  );
  const thailand = latestByKey.get("thailand");
  assert.equal(thailand.status, "partial");
  assert.equal(thailand.importsTonnes, null);
  assert.equal(thailand.exportsTonnes, 9.65351);
  assert.equal(thailand.netImportsTonnes, null);
  assert.equal(thailand.estimatedWeight, true);
  const turkiye = latestByKey.get("turkiye");
  assert.equal(turkiye.status, "partial");
  assert.equal(turkiye.importsTonnes, 14.558);
  assert.equal(turkiye.exportsTonnes, null);
  assert.equal(turkiye.netImportsTonnes, null);
  const unitedArabEmirates = latestByKey.get("unitedArabEmirates");
  assert.equal(unitedArabEmirates.status, "complete");
  assert.equal(unitedArabEmirates.importsTonnes, 65.457);
  closeTo(
    unitedArabEmirates.exportsTonnes,
    123.02841,
    "UAE historical exports",
  );
  closeTo(
    unitedArabEmirates.netImportsTonnes,
    -57.57141,
    "UAE historical latest net imports",
  );
  const comparableKeys = new Set(
    data.marketBalances.comparable.map((market) => market.key),
  );
  for (const market of data.marketBalances.lagged) {
    assert.equal(market.comparable, false);
    assert.equal(comparableKeys.has(market.key), false);
  }
});

test("every monitored market has a verified latest-known observation period", () => {
  assert.equal(data.marketBalances.latestAvailable.length, 10);
  assert.equal(
    data.marketBalances.latestAvailable.some(
      (market) => market.status === "unavailableLatest",
    ),
    false,
  );
  for (const market of data.marketBalances.latestAvailable) {
    assert.match(market.observationPeriod, /^\d{6}$/);
    assert.ok(market.importsTonnes != null || market.exportsTonnes != null);
  }
});

test("network coverage, routes and direction arithmetic reconcile", () => {
  const activeOrigins = data.network.origins.filter(
    (origin) => origin.exportsTonnes != null,
  );
  assert.equal(activeOrigins.length, data.network.coverage.originCount);
  assert.equal(
    data.network.origins.length,
    data.network.coverage.candidateOriginCount,
  );
  assert.equal(
    activeOrigins.length + data.network.coverage.unavailableOrigins.length,
    data.network.coverage.candidateOriginCount,
  );
  assert.equal(
    data.network.routes.length,
    data.network.coverage.mappedRouteCount,
  );
  assert.equal(
    new Set(data.network.routes.map((route) => route.id)).size,
    data.network.routes.length,
  );
  assert.ok(data.network.coverage.routeCount >= data.network.routes.length);
  assert.ok(
    data.network.routes.every(
      (route) =>
        route.period === data.network.latestComparablePeriod &&
        route.tonnes > 0 &&
        route.valueUsd > 0,
    ),
  );

  for (const row of data.network.direction.history) {
    closeTo(
      row.netEastboundTonnes,
      row.eastboundTonnes - row.westboundTonnes,
      `${row.period} direction net`,
    );
  }
  const direction = data.network.direction;
  closeTo(
    direction.eastboundChangePct,
    (direction.eastboundTonnes / direction.previousEastboundTonnes - 1) * 100,
    "eastbound percentage change",
  );
  closeTo(
    direction.changeTonnes,
    direction.netEastboundTonnes - direction.previousNetEastboundTonnes,
    "net eastbound change",
  );
});

test("Swiss import and export snapshots retain separate source boundaries", () => {
  const imports = data.swissRefinery.importSnapshot;
  const exports = data.swissRefinery.exportSnapshot;
  assert.equal(imports.observationPeriod, "202608");
  assert.equal(imports.importsTonnes, 205.02);
  assert.equal(exports.observationPeriod, "202608");
  closeTo(exports.exportsTonnes, 164.639043, "Swiss August exports");
  assert.notEqual(exports.observationPeriod, data.network.latestComparablePeriod);
  assert.match(exports.scope, /不与海关进口量相减/);
  assert.equal(exports.destinationCount, exports.destinations.length);
  assert.equal(
    new Set(exports.destinations.map((route) => route.id)).size,
    exports.destinations.length,
  );
  assert.ok(
    exports.destinations.every(
      (route) =>
        route.period === exports.observationPeriod &&
        route.originCode === 757 &&
        route.tonnes > 0,
    ),
  );
  assert.ok(
    Math.abs(
      exports.destinations.reduce((sum, route) => sum + route.tonnes, 0) -
        exports.exportsTonnes,
    ) < 1e-5,
    "Swiss destination totals differ only by source rounding",
  );

  const topOriginTonnes = imports.topOrigins.reduce(
    (sum, origin) => sum + origin.tonnes,
    0,
  );
  closeTo(topOriginTonnes, imports.importsTonnes, "full Swiss origin weights reconcile");
  assert.equal(imports.originCount, imports.topOrigins.length);
  assert.equal(imports.originCount, 55);
  assert.equal(new Set(imports.topOrigins.map(origin => origin.code)).size, 55);
  assert.equal(imports.topOrigins.find(origin => origin.iso2 === "TW").label, "中国台湾");
});

test("London, Shanghai and official COMEX calculations reconcile", () => {
  const london = data.vaults.london;
  assert.equal(london.observationPeriod, "202609");
  closeTo(london.tonnes, london.history.at(-1).tonnes, "London latest tonnes");
  closeTo(
    london.monthlyChangePct,
    (london.history.at(-1).tonnes / london.history.at(-2).tonnes - 1) * 100,
    "London monthly change",
  );

  const comex = data.vaults.newYork;
  assert.equal(comex.status, "historicalSnapshot");
  assert.equal(comex.sourceQuality, "CME官方日报");
  assert.equal(comex.observationPeriod, "2026-07-30");
  closeTo(
    comex.totalOunces,
    comex.registeredOunces + comex.eligibleOunces,
    "COMEX total ounces excludes pledged double count",
  );
  assert.ok(comex.pledgedOunces < comex.registeredOunces);
  closeTo(
    comex.dailyNetChangeOunces,
    comex.dailyReceivedOunces - comex.dailyWithdrawnOunces,
    "COMEX daily net movement",
  );
  closeTo(
    comex.totalTonnes,
    (comex.totalOunces * 31.1034768) / 1_000_000,
    "COMEX ounces to tonnes",
  );
  closeTo(comex.tonnes, comex.totalTonnes, "COMEX compatibility tonnes");
  closeTo(
    comex.dailyChangePct,
    (comex.totalOunces / comex.previousTotalOunces - 1) * 100,
    "COMEX daily percentage change",
  );

  const shanghai = data.vaults.shanghai;
  assert.ok(shanghai.withdrawalsTonnes > 0);
  assert.ok(shanghai.previousWithdrawalsTonnes > 0);
  assert.ok(shanghai.deliveryTonnes > 0);
  assert.ok(shanghai.previousDeliveryTonnes > 0);
});

test("same-day Shanghai-London price conversion reconciles", () => {
  const price = data.priceComparison;
  assert.equal(price.alignment, "same-day");
  assert.equal(price.observationPeriod, "2026-09-28");
  assert.equal(price.currentSignalEligible, false);
  assert.equal(price.latestInputs.shanghai.date, "2026-10-09");
  assert.equal(price.latestInputs.shanghai.cnyPerGram, 904.48);
  assert.equal(price.latestInputs.exchangeRates.date, "2026-10-09");
  assert.equal(price.latestInputs.exchangeRates.cnyPerEur, 7.4992);
  assert.equal(price.latestInputs.exchangeRates.usdPerEur, 1.1206);
  const londonEquivalent =
    (price.lbmaPmUsdPerOunce / 31.1034768) *
    (price.ecbCnyPerEur / price.ecbUsdPerEur);
  closeTo(
    price.londonEquivalentCnyPerGram,
    londonEquivalent,
    "London CNY/gram equivalent",
  );
  closeTo(
    price.shanghaiPremiumPct,
    (price.shanghaiAu9999CnyPerGram / londonEquivalent - 1) * 100,
    "Shanghai premium",
  );
});

test("no observation or source fetch is dated after the bundle build", () => {
  const buildDate = data.fetchedAt.slice(0, 10);
  const buildMonth = buildDate.slice(0, 7).replace("-", "");
  const modules = [
    data.network,
    data.marketBalances,
    data.swissRefinery.importSnapshot,
    data.swissRefinery.exportSnapshot,
    data.vaults.london,
    data.vaults.newYork,
    data.vaults.shanghai,
    data.priceComparison,
    ...data.marketBalances.latestAvailable.filter(
      (market) => market.observationPeriod,
    ),
  ];
  for (const sourceModule of modules) {
    assert.ok(
      Date.parse(sourceModule.sourceFetchedAt) <= Date.parse(data.fetchedAt),
    );
    const observation = sourceModule.observationPeriod;
    if (/^\d{6}$/.test(observation)) {
      assert.ok(observation <= buildMonth);
    } else {
      assert.ok(observation.slice(0, 10) <= buildDate);
    }
  }
});

test("generator declares the v4 schema and preserves manual source boundaries", () => {
  assert.match(generatorSource, /const OUTPUT_VERSION = 4/);
  assert.match(generatorSource, /const manualSnapshots = \{/);
  assert.match(generatorSource, /swissRefinery:/);
  assert.match(generatorSource, /latestComparablePeriod/);
  assert.match(generatorSource, /latestAvailable:/);
  assert.match(generatorSource, /sourceQuality: "CME官方日报"/);
  assert.match(generatorSource, /AbortSignal\.timeout/);
  assert.doesNotMatch(generatorSource, /version: 2/);
  assert.doesNotMatch(generatorSource, /第三方结构化提取/);
});
