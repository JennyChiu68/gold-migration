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
