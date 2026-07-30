import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the global gold migration dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /全球黄金迁徙地图/);
  assert.match(html, /伦敦库存回升，东向报关仍高/);
  assert.match(html, /信号分化/);
  assert.match(html, /功能目录/);
  assert.match(html, /黄金罗盘/);
  assert.match(html, /全球吸金榜/);
  assert.match(html, /黄金航线/);
  assert.match(html, /瑞士精炼站/);
  assert.match(html, /三地金库/);
  assert.match(html, /金价温差/);
  assert.match(html, /数据底稿/);
  assert.match(html, /href="#gold-compass"/);
  assert.match(html, /href="#market-balance"/);
  assert.match(html, /href="#price-gap"/);
  assert.match(html, /进口来源/);
  assert.match(html, /出口去向/);
  assert.match(html, /最新可得出口/);
  assert.match(html, /主要矿产供应地/);
  assert.match(html, /金融及转口枢纽/);
  assert.match(html, /排行榜/);
  assert.match(html, /迁徙地图/);
  assert.match(html, /重量估算/);
  assert.match(html, /库存交叉验证/);
  assert.match(html, /中国内地/);
  assert.match(html, /中国香港/);
  assert.doesNotMatch(html, /中港承接/);
  assert.doesNotMatch(html, /同期出口/);
  assert.doesNotMatch(html, /同期全景/);
  assert.doesNotMatch(html, /section-content"[^>]*hidden/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("publishes methodology and official source context", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /HS 7108/);
  assert.match(html, /UN Comtrade/);
  assert.match(html, /瑞士联邦海关/);
  assert.match(html, /LBMA/);
  assert.match(html, /CME Group/);
  assert.match(html, /上海黄金交易所/);
  assert.match(html, /非实时行情/);
});
