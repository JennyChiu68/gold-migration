import { readFile, writeFile } from "node:fs/promises";
import { applySourcePolicy, loadSourcePolicy } from "./source-policy.mjs";

const path = new URL("../app/data/gold-flows.json", import.meta.url);
const data = JSON.parse(await readFile(path, "utf8"));
// Updating source annotations never advances observation or fetch dates.
applySourcePolicy(data, await loadSourcePolicy());
await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
console.log("Synchronized source annotations; observation dates and values preserved.");
