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
  assert.match(html, /伦敦库存与跨境报关分期观察/);
  assert.match(html, /口径不同/);
  assert.match(html, /功能目录/);
  assert.match(html, /黄金罗盘/);
  assert.match(html, /全球吸金榜/);
  assert.match(html, /同期榜单 · 2026.06/);
  assert.doesNotMatch(html, /共同完整月份排名/);
  assert.doesNotMatch(html, /仅比较同一完整月份/);
  assert.match(html, /黄金航线/);
  assert.match(html, /瑞士精炼站/);
  assert.match(html, /三地实物信号/);
  assert.match(html, /金价温差/);
  assert.doesNotMatch(html, /数据底稿/);
  assert.doesNotMatch(html, /id="method"/);
  assert.match(html, /href="#gold-compass"/);
  assert.match(html, /href="#market-balance"/);
  assert.match(html, /href="#price-gap"/);
  assert.match(html, /进口来源/);
  assert.match(html, /出口去向/);
  assert.match(html, /报关出口/);
  assert.match(html, /主要矿产供应地/);
  assert.match(html, /金融及转口枢纽/);
  assert.match(html, /排行榜/);
  assert.match(html, /迁徙地图/);
  assert.match(html, /含估算/);
  assert.match(html, /库存与交割/);
  assert.match(html, /CME官方日报/);
  assert.match(html, /同日对齐/);
  assert.match(html, /当前暂不可判断/);
  assert.match(html, /历史价格观察/);
  assert.match(html, /此历史观察不用于判断当前/);
  assert.match(html, /非实时行情/);
  assert.match(html, /2019.12/);
  assert.match(html, /各市场最新完整观测/);
  assert.equal((html.match(/class="latest-market-card/g) ?? []).length, 7);
  assert.doesNotMatch(html, /净额不可算/);
  assert.doesNotMatch(html, /进口缺失/);
  assert.doesNotMatch(html, /出口缺失/);
  assert.doesNotMatch(html, /暂无可验证数据/);
  assert.match(html, /中国内地/);
  assert.match(html, /中国香港/);
  assert.doesNotMatch(html, /中港承接/);
  assert.doesNotMatch(html, /同期出口/);
  assert.doesNotMatch(html, /同期全景/);
  assert.doesNotMatch(html, /section-content"[^>]*hidden/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});
