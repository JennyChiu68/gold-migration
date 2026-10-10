import { readFile } from "node:fs/promises";

export async function loadSourcePolicy() {
  return JSON.parse(await readFile(new URL("../app/data/source-policy.json", import.meta.url), "utf8"));
}

// A preferred institution is not provenance for an observation fetched elsewhere.
export function applySourcePolicy(data, policy) {
  const byCode = new Map(policy.markets.map((market) => [market.code, market]));
  const selection = (entry) => ({
    sourceId: entry.currentSourceId,
    selectedSourceId: entry.selectedSourceId,
    sourceState: entry.state,
  });
  for (const entry of policy.markets) {
    if (entry.currentSourceId !== "comtrade") {
      throw new Error(`${entry.market}: national adapter and historical reconciliation must be implemented before activation`);
    }
  }
  for (const metric of Object.values(policy.metrics)) {
    if (metric.currentSourceId === metric.selectedSourceId && ["pendingValidation"].includes(metric.state)) {
      throw new Error(`${metric.label}: unverified source cannot be activated`);
    }
  }
  data.sourcePolicyRevision = policy.revision;
  data.network.sourceId = "comtrade";
  data.marketBalances.sourceId = "comtrade";
  for (const list of [data.network.origins, data.network.routes, data.marketBalances.comparable,
    data.marketBalances.lagged, data.marketBalances.latestAvailable]) {
    for (const observation of list) {
      Object.assign(observation, selection(byCode.get(observation.originCode ?? observation.code)));
    }
  }
  const bindings = [
    [data.swissRefinery.importSnapshot, "swiss-import"],
    [data.swissRefinery.exportSnapshot, "swiss-export"],
    [data.vaults.london, "london-vault"],
    [data.vaults.newYork, "comex-vault"],
    [data.vaults.shanghai, "shanghai-physical"],
  ];
  for (const [observation, id] of bindings) Object.assign(observation, selection(policy.metrics[id]));
  for (const route of data.swissRefinery.exportSnapshot.destinations) {
    Object.assign(route, selection(policy.metrics["swiss-export"]));
  }
  const price = data.priceComparison;
  price.sourceIds = {
    shanghai: policy.metrics["shanghai-price"].currentSourceId,
    london: policy.metrics["london-price"].currentSourceId,
    exchangeRates: policy.metrics.fx.currentSourceId,
  };
  price.selectedLondonSourceId = policy.metrics["london-price"].selectedSourceId;
  price.sourceState = policy.metrics["london-price"].state;
  if (["fetchBlocked", "pendingValidation"].includes(price.sourceState)) {
    price.status = "historicalSnapshot";
    price.currentSignalEligible = false;
    price.updateBlockedReason = policy.metrics["london-price"].gap;
  }
  data.sources = ["comtrade", "bazg-import", "lbma-vault", "cme-stocks", "sge-month", "sge-close", "lbma-legacy", "ecb-fx"].map((id) => ({
    id,
    name: policy.sources[id].name,
    url: policy.sources[id].url,
    detail: policy.sources[id].access,
  }));
  return data;
}
