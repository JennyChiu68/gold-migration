import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(
  await readFile(new URL("../app/data/gold-flows.json", import.meta.url)),
);

test("comparable market balances share one complete period", () => {
  assert.ok(data.marketBalances.comparable.length >= 4);
  for (const market of data.marketBalances.comparable) {
    assert.equal(market.period, data.marketBalances.period);
    assert.equal(typeof market.importsTonnes, "number");
    assert.equal(typeof market.exportsTonnes, "number");
    assert.equal(typeof market.netImportsTonnes, "number");
    assert.ok(
      Math.abs(
        market.netImportsTonnes -
          (market.importsTonnes - market.exportsTonnes),
      ) < 1e-8,
    );
  }
});

test("network coverage and route identifiers reconcile", () => {
  const activeOrigins = data.network.origins.filter(
    (origin) => origin.exportsTonnes != null,
  );
  assert.equal(activeOrigins.length, data.network.coverage.originCount);
  assert.equal(
    new Set(data.network.routes.map((route) => route.id)).size,
    data.network.routes.length,
  );
  assert.ok(data.network.coverage.routeCount >= data.network.routes.length);
  assert.ok(data.network.direction.eastboundTonnes > 0);
});

test("lagged markets cannot enter the comparable ranking", () => {
  const comparableKeys = new Set(
    data.marketBalances.comparable.map((market) => market.key),
  );
  for (const market of data.marketBalances.lagged) {
    assert.equal(market.comparable, false);
    assert.equal(comparableKeys.has(market.key), false);
  }
});

test("Swiss refinery snapshot is bounded and reconciles to the stated total", () => {
  const snapshot = data.swissRefinery.importSnapshot;
  assert.match(snapshot.period, /^\d{4}-\d{2}$/);
  assert.ok(snapshot.importsTonnes > 0);
  assert.ok(snapshot.topOrigins.length >= 6);

  const topOriginTonnes = snapshot.topOrigins.reduce(
    (sum, origin) => sum + origin.tonnes,
    0,
  );
  assert.ok(topOriginTonnes <= snapshot.importsTonnes);
  assert.equal(
    new Set(snapshot.topOrigins.map((origin) => origin.code)).size,
    snapshot.topOrigins.length,
  );
});

test("Swiss destination ranking comes from the common-period route ledger", () => {
  const routes = data.network.routes.filter(
    (route) => route.originCode === 757,
  );
  const origin = data.network.origins.find((row) => row.code === 757);

  assert.ok(routes.length >= 8);
  assert.ok(origin?.exportsTonnes);
  const mappedTonnes = routes.reduce((sum, route) => sum + route.tonnes, 0);
  assert.ok(mappedTonnes <= origin.exportsTonnes);
  assert.ok(mappedTonnes / origin.exportsTonnes > 0.9);
  assert.ok(routes.every((route) => route.period === data.network.period));
});
