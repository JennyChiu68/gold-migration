import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { applySourcePolicy, loadSourcePolicy } from "../scripts/source-policy.mjs";

const policy = await loadSourcePolicy();
const data = JSON.parse(await readFile(new URL("../app/data/gold-flows.json", import.meta.url), "utf8"));

test("preferred national sources never replace actual Comtrade provenance prematurely", () => {
  const byCode = new Map(policy.markets.map((market) => [market.code, market]));
  for (const row of [...data.marketBalances.latestAvailable, ...data.network.origins]) {
    assert.equal(row.sourceId, byCode.get(row.code).currentSourceId);
    assert.equal(row.selectedSourceId, byCode.get(row.code).selectedSourceId);
  }
  assert.equal(data.sourcePolicyRevision, policy.revision);
  const changed = structuredClone(policy);
  changed.markets.find((market) => market.code === 826).currentSourceId = "hmrc";
  assert.throws(() => applySourcePolicy(structuredClone(data), changed), /national adapter/);
});

test("failed public London price fetch remains historical with original evidence", () => {
  assert.equal(data.priceComparison.sourceIds.london, "lbma-legacy");
  assert.equal(data.priceComparison.selectedLondonSourceId, "lbma-legacy");
  assert.equal(data.priceComparison.sourceState, "fetchBlocked");
  assert.equal(data.priceComparison.currentSignalEligible, false);
  assert.equal(data.priceComparison.status, "historicalSnapshot");
  assert.equal(data.priceComparison.sourceUrls.london, "https://prices.lbma.org.uk/json/gold_pm.json");
  assert.equal(data.priceComparison.date, "2026-09-28");
  const snapshot = structuredClone(data);
  snapshot.priceComparison.currentSignalEligible = true;
  applySourcePolicy(snapshot, policy);
  assert.equal(snapshot.priceComparison.currentSignalEligible, false);
  assert.match(snapshot.priceComparison.updateBlockedReason, /403/);
});

test("source annotation sync preserves observation and fetch timestamps and values", () => {
  const original = structuredClone(data);
  applySourcePolicy(data, policy);
  for (const object of ["network", "marketBalances", "priceComparison"]) {
    assert.equal(data[object].observationPeriod, original[object].observationPeriod);
    assert.equal(data[object].sourceFetchedAt, original[object].sourceFetchedAt);
  }
  assert.equal(data.fetchedAt, original.fetchedAt);
  assert.deepEqual(data.network.direction, original.network.direction);
  assert.equal(data.priceComparison.shanghaiPremiumPct, original.priceComparison.shanghaiPremiumPct);
});
