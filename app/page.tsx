"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import rawData from "./data/gold-flows.json";

type GoldRoute = {
  partnerCode: number;
  destination: string;
  tonnes: number;
  valueUsd: number;
  estimatedWeight: boolean;
};

type Market = {
  label: string;
  period: string;
  importsTonnes: number | null;
  exportsTonnes: number | null;
  importValueUsd: number | null;
  exportValueUsd: number | null;
  estimatedWeight: boolean;
};

type GoldData = {
  fetchedAt: string;
  headline: {
    period: string;
    swissExportsTonnes: number;
    chinaHongKongTonnes: number;
    chinaHongKongSharePct: number;
  };
  swiss: {
    period: string;
    routes: GoldRoute[];
    history: Array<{
      period: string;
      tonnes: number | null;
      valueUsd: number | null;
      estimatedWeight: boolean;
    }>;
    sourceUrl: string;
  };
  markets: Record<string, Market>;
  vaults: {
    london: {
      period: string;
      tonnes: number;
      monthlyChangePct: number;
      history: Array<{ period: string; tonnes: number }>;
      sourceUrl: string;
      workbookUrl: string;
    };
    newYork: {
      period: string;
      tonnes: number;
      ouncesMillions: number;
      thirtyDayChangePct: number;
      sourceQuality: string;
      rawSourceUrl: string;
      extractionSourceUrl: string;
    };
    shanghai: {
      period: string;
      withdrawalsTonnes: number;
      previousWithdrawalsTonnes: number;
      deliveryTonnes: number;
      previousDeliveryTonnes: number;
      sourceUrl: string;
      previousSourceUrl: string;
    };
  };
  priceComparison: {
    date: string;
    shanghaiAu9999CnyPerGram: number;
    lbmaPmUsdPerOunce: number;
    ecbCnyPerEur: number;
    ecbUsdPerEur: number;
    londonEquivalentCnyPerGram: number;
    shanghaiPremiumPct: number;
  };
  sources: Array<{ name: string; detail: string; url: string }>;
};

const data = rawData as GoldData;
const tonnes = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const money = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const routeMeta: Record<
  number,
  { label: string; x: number; y: number; region: string }
> = {
  826: { label: "英国", x: 38, y: 29, region: "欧洲金库" },
  156: { label: "中国内地", x: 79, y: 48, region: "亚洲消费" },
  344: { label: "中国香港", x: 81, y: 56, region: "亚洲转口" },
  764: { label: "泰国", x: 76, y: 63, region: "亚洲消费" },
  276: { label: "德国", x: 46, y: 31, region: "欧洲精炼" },
  792: { label: "土耳其", x: 58, y: 43, region: "区域枢纽" },
  682: { label: "沙特", x: 62, y: 55, region: "中东消费" },
  842: { label: "美国", x: 18, y: 43, region: "北美金库" },
  380: { label: "意大利", x: 47, y: 39, region: "欧洲加工" },
  784: { label: "阿联酋", x: 66, y: 57, region: "中东枢纽" },
  702: { label: "新加坡", x: 78, y: 71, region: "亚洲枢纽" },
};

function formatPeriod(value: string) {
  const compactValue = value.replace("-", "");
  return `${compactValue.slice(0, 4)}.${compactValue.slice(4, 6)}`;
}

function signed(value: number, suffix = "%") {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}${suffix}`;
}

function Sparkline({
  values,
  color = "#b88724",
}: {
  values: number[];
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || values.length < 2) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 120);
      const height = Math.max(rect.height, 48);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const min = Math.min(...values);
      const max = Math.max(...values);
      const spread = Math.max(max - min, 1);
      const points = values.map((value, index) => ({
        x: 2 + (index / (values.length - 1)) * (width - 4),
        y: 5 + ((max - value) / spread) * (height - 12),
      }));

      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();

      const last = points.at(-1)!;
      context.beginPath();
      context.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
      context.fillStyle = "#fffdf6";
      context.fill();
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [color, values]);

  return <canvas ref={canvasRef} className="sparkline" aria-hidden="true" />;
}

function MigrationMap({
  routes,
  selectedCode,
}: {
  routes: GoldRoute[];
  selectedCode: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 300);
      const height = 240;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const sx = (value: number) => (value / 100) * width;
      const sy = (value: number) => (value / 100) * height;

      context.strokeStyle = "rgba(255,255,255,.08)";
      context.lineWidth = 1;
      [25, 50, 75].forEach((x) => {
        context.beginPath();
        context.moveTo(sx(x), 0);
        context.lineTo(sx(x), height);
        context.stroke();
      });
      [33, 66].forEach((y) => {
        context.beginPath();
        context.moveTo(0, sy(y));
        context.lineTo(width, sy(y));
        context.stroke();
      });

      const land = (points: Array<[number, number]>) => {
        context.beginPath();
        points.forEach(([x, y], index) => {
          if (index === 0) context.moveTo(sx(x), sy(y));
          else context.lineTo(sx(x), sy(y));
        });
        context.closePath();
        context.fillStyle = "rgba(255,255,255,.065)";
        context.fill();
        context.strokeStyle = "rgba(255,255,255,.10)";
        context.stroke();
      };

      land([
        [3, 23],
        [16, 15],
        [29, 23],
        [25, 41],
        [17, 49],
        [8, 40],
      ]);
      land([
        [21, 53],
        [31, 57],
        [34, 75],
        [28, 92],
        [20, 72],
      ]);
      land([
        [35, 22],
        [50, 19],
        [59, 28],
        [68, 21],
        [91, 30],
        [95, 50],
        [82, 60],
        [70, 54],
        [59, 43],
        [49, 41],
        [42, 34],
      ]);
      land([
        [46, 45],
        [58, 46],
        [64, 67],
        [56, 85],
        [46, 72],
        [42, 57],
      ]);
      land([
        [83, 72],
        [94, 75],
        [96, 88],
        [86, 91],
        [80, 82],
      ]);

      const source = { x: sx(45), y: sy(34) };
      routes.slice(0, 10).forEach((route) => {
        const meta = routeMeta[route.partnerCode];
        if (!meta) return;
        const target = { x: sx(meta.x), y: sy(meta.y) };
        const selected = route.partnerCode === selectedCode;
        const controlX = (source.x + target.x) / 2;
        const controlY =
          Math.min(source.y, target.y) -
          Math.min(42, Math.abs(target.x - source.x) * 0.16 + 10);

        context.beginPath();
        context.moveTo(source.x, source.y);
        context.quadraticCurveTo(controlX, controlY, target.x, target.y);
        context.strokeStyle = selected
          ? "#f4c55f"
          : "rgba(232, 184, 82, .32)";
        context.lineWidth = selected
          ? 3
          : Math.max(0.9, Math.min(route.tonnes / 9, 2.2));
        context.stroke();

        context.beginPath();
        context.arc(target.x, target.y, selected ? 6 : 3, 0, Math.PI * 2);
        context.fillStyle = selected ? "#f4c55f" : "#c49b48";
        context.fill();

        if (selected) {
          context.beginPath();
          context.arc(target.x, target.y, 11, 0, Math.PI * 2);
          context.strokeStyle = "rgba(244,197,95,.35)";
          context.lineWidth = 5;
          context.stroke();
          context.fillStyle = "#fff8e5";
          context.font = "600 11px system-ui, sans-serif";
          context.textAlign = target.x > width * 0.77 ? "right" : "left";
          context.fillText(
            meta.label,
            target.x + (target.x > width * 0.77 ? -10 : 10),
            target.y - 10,
          );
        }
      });

      context.beginPath();
      context.arc(source.x, source.y, 5, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
      context.beginPath();
      context.arc(source.x, source.y, 10, 0, Math.PI * 2);
      context.strokeStyle = "rgba(255,255,255,.28)";
      context.lineWidth = 4;
      context.stroke();
      context.fillStyle = "rgba(255,255,255,.72)";
      context.font = "600 10px system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText("瑞士", source.x, source.y - 13);
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [routes, selectedCode]);

  return (
    <canvas
      ref={canvasRef}
      className="migration-canvas"
      role="img"
      aria-label="瑞士黄金出口目的地地图"
    />
  );
}

function MarketCard({ market }: { market: Market }) {
  const hasNet =
    market.importsTonnes != null && market.exportsTonnes != null;
  const net = hasNet
    ? market.importsTonnes! - market.exportsTonnes!
    : market.importsTonnes;

  return (
    <article className="market-card">
      <div className="market-card-head">
        <strong>{market.label}</strong>
        <span>{formatPeriod(market.period)}</span>
      </div>
      <div className="market-value">
        {tonnes.format(net ?? 0)}
        <small>吨</small>
      </div>
      <p>{hasNet ? "黄金净进口" : "黄金进口量"}</p>
      <div className="market-foot">
        <span>进口 {tonnes.format(market.importsTonnes ?? 0)}t</span>
        {market.exportsTonnes != null && (
          <span>出口 {tonnes.format(market.exportsTonnes)}t</span>
        )}
      </div>
      {market.estimatedWeight && <i>部分重量为官方估算</i>}
    </article>
  );
}

export default function Home() {
  const routes = data.swiss.routes.slice(0, 11);
  const [selectedCode, setSelectedCode] = useState(routes[0].partnerCode);
  const selectedRoute =
    routes.find((route) => route.partnerCode === selectedCode) ?? routes[0];
  const selectedMeta = routeMeta[selectedRoute.partnerCode];
  const routeShare =
    (selectedRoute.tonnes / data.headline.swissExportsTonnes) * 100;
  const marketOrder = ["hongKong", "india", "unitedKingdom", "china"];
  const londonChangeTonnes =
    data.vaults.london.history.at(-1)!.tonnes -
    data.vaults.london.history.at(-2)!.tonnes;
  const sgeWithdrawalChange =
    (data.vaults.shanghai.withdrawalsTonnes /
      data.vaults.shanghai.previousWithdrawalsTonnes -
      1) *
    100;
  const swissHistoryValues = useMemo(
    () =>
      data.swiss.history
        .map((row) => row.tonnes)
        .filter((value): value is number => value != null),
    [],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">AU</div>
        <div className="brand-copy">
          <strong>全球黄金迁徙地图</strong>
          <span>GLOBAL GOLD MIGRATION</span>
        </div>
        <a href="#method" className="source-link">
          口径
        </a>
      </header>

      <div className="status-line">
        <span className="status-dot" />
        <span>海关流向更新至 {formatPeriod(data.swiss.period)}</span>
        <span className="status-separator" />
        <span>库存更新至 {formatPeriod(data.vaults.london.period)}</span>
      </div>

      <section className="hero">
        <div className="hero-label">
          <span>真实报关重量</span>
          <time>{formatPeriod(data.headline.period)}</time>
        </div>
        <h1>
          中国内地及中国香港承接
          <em>{tonnes.format(data.headline.chinaHongKongTonnes)}吨</em>
        </h1>
        <p>
          占瑞士当月黄金出口
          {data.headline.chinaHongKongSharePct.toFixed(1)}%，实物正从精炼中心流向亚洲。
        </p>
        <div className="hero-metrics">
          <div>
            <span>瑞士出口总量</span>
            <strong>{tonnes.format(data.headline.swissExportsTonnes)}t</strong>
          </div>
          <div>
            <span>第一目的地</span>
            <strong>英国 {tonnes.format(routes[0].tonnes)}t</strong>
          </div>
        </div>
        <div className="hero-trend">
          <span>近12个月瑞士出口</span>
          <Sparkline values={swissHistoryValues} color="#f1c45d" />
        </div>
      </section>

      <section className="map-panel">
        <div className="section-head light">
          <div>
            <span className="eyebrow">实物流向</span>
            <h2>瑞士出口目的地</h2>
          </div>
          <div className="verified-badge">海关已发生</div>
        </div>

        <MigrationMap routes={routes} selectedCode={selectedCode} />

        <div className="route-detail">
          <div>
            <span>瑞士 → {selectedMeta?.label ?? selectedRoute.destination}</span>
            <strong>
              {tonnes.format(selectedRoute.tonnes)}
              <small>吨</small>
            </strong>
          </div>
          <div className="route-meta">
            <span>{selectedMeta?.region ?? "贸易目的地"}</span>
            <span>占当月出口 {routeShare.toFixed(1)}%</span>
            <span>{money.format(selectedRoute.valueUsd)}</span>
          </div>
        </div>

        <div className="route-tabs" aria-label="选择黄金出口目的地">
          {routes.map((route) => (
            <button
              key={route.partnerCode}
              type="button"
              className={selectedCode === route.partnerCode ? "active" : ""}
              onClick={() => setSelectedCode(route.partnerCode)}
              aria-pressed={selectedCode === route.partnerCode}
            >
              <span>{routeMeta[route.partnerCode]?.label ?? route.destination}</span>
              <strong>{tonnes.format(route.tonnes)}t</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">消费市场</span>
            <h2>黄金被谁吸收</h2>
          </div>
          <span className="section-note">各市场最新可得月份</span>
        </div>
        <div className="market-grid">
          {marketOrder.map((key) => (
            <MarketCard key={key} market={data.markets[key]} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">库存与出库</span>
            <h2>三大枢纽温度</h2>
          </div>
          <span className="section-note">吨</span>
        </div>

        <div className="vault-stack">
          <article className="vault-card london">
            <div className="vault-city">
              <span>LONDON</span>
              <strong>伦敦金库</strong>
              <small>{formatPeriod(data.vaults.london.period)}</small>
            </div>
            <div className="vault-number">
              <strong>{Math.round(data.vaults.london.tonnes).toLocaleString()}</strong>
              <span>库存吨</span>
            </div>
            <Sparkline
              values={data.vaults.london.history.map((row) => row.tonnes)}
            />
            <div className="vault-change positive">
              月增 {signed(data.vaults.london.monthlyChangePct)} · +
              {tonnes.format(londonChangeTonnes)}t
            </div>
          </article>

          <article className="vault-card new-york">
            <div className="vault-city">
              <span>NEW YORK</span>
              <strong>COMEX金库</strong>
              <small>{data.vaults.newYork.period.replaceAll("-", ".")}</small>
            </div>
            <div className="vault-number">
              <strong>{Math.round(data.vaults.newYork.tonnes)}</strong>
              <span>库存吨</span>
            </div>
            <div className="vault-bar" aria-hidden="true">
              <span style={{ width: "68%" }} />
            </div>
            <div className="vault-change negative">
              30日 {signed(data.vaults.newYork.thirtyDayChangePct)}
              <i>二次解析</i>
            </div>
          </article>

          <article className="vault-card shanghai">
            <div className="vault-city">
              <span>SHANGHAI</span>
              <strong>上金所出库</strong>
              <small>{formatPeriod(data.vaults.shanghai.period)}</small>
            </div>
            <div className="vault-number">
              <strong>
                {tonnes.format(data.vaults.shanghai.withdrawalsTonnes)}
              </strong>
              <span>当月吨</span>
            </div>
            <div className="withdrawal-bars" aria-hidden="true">
              <span
                style={{
                  height: `${
                    (data.vaults.shanghai.previousWithdrawalsTonnes /
                      data.vaults.shanghai.withdrawalsTonnes) *
                    100
                  }%`,
                }}
              />
              <span style={{ height: "100%" }} />
            </div>
            <div className="vault-change positive">
              月增 {signed(sgeWithdrawalChange)} · 交割
              {tonnes.format(data.vaults.shanghai.deliveryTonnes)}t
            </div>
          </article>
        </div>
      </section>

      <section className="premium-card">
        <div className="section-head light">
          <div>
            <span className="eyebrow">区域现货信号</span>
            <h2>上海 vs 伦敦</h2>
          </div>
          <time>{data.priceComparison.date.replaceAll("-", ".")}</time>
        </div>
        <div className="premium-value">
          <strong>
            {data.priceComparison.shanghaiPremiumPct >= 0 ? "+" : ""}
            {data.priceComparison.shanghaiPremiumPct.toFixed(2)}%
          </strong>
          <span>上海指示性溢价</span>
        </div>
        <div className="premium-scale" aria-hidden="true">
          <span className="scale-center" />
          <span
            className="scale-dot"
            style={{
              left: `${50 + data.priceComparison.shanghaiPremiumPct * 5}%`,
            }}
          />
        </div>
        <div className="premium-labels">
          <span>伦敦折算 ¥{data.priceComparison.londonEquivalentCnyPerGram.toFixed(2)}/g</span>
          <span>上海 ¥{data.priceComparison.shanghaiAu9999CnyPerGram.toFixed(2)}/g</span>
        </div>
        <p>
          以LBMA PM、上金所Au99.99收盘价及ECB同日汇率换算，不含税费、运输和升水报价。
        </p>
      </section>

      <section className="signal-card">
        <span className="eyebrow">迁徙判断</span>
        <h2>亚洲需求强，但不是单向“抽干西方”</h2>
        <p>
          中国内地及中国香港承接瑞士出口近四成、上金所出库环比增加
          {sgeWithdrawalChange.toFixed(1)}%；与此同时，伦敦库存当月也增加
          {tonnes.format(londonChangeTonnes)}吨。更合理的解释是全球流通加速，而非单一地区库存枯竭。
        </p>
        <div className="signal-tags">
          <span>海关实物流</span>
          <span>金库库存</span>
          <span>现货价差</span>
        </div>
      </section>

      <details className="method-card" id="method">
        <summary>
          <span>
            <strong>数据口径与来源</strong>
            <small>哪些是事实，哪些是推断</small>
          </span>
          <b>＋</b>
        </summary>
        <div className="method-body">
          <h3>直接观测</h3>
          <p>
            海关重量使用UN Comtrade HS 7108；伦敦库存来自LBMA月末金库总量；上海交割与出库来自上金所月报。
          </p>
          <h3>组合推断</h3>
          <p>
            “迁徙方向”由跨境流向、库存变化和区域价差共同判断，不能把库存增减直接等同于同一批金条跨库搬运。
          </p>
          <h3>特别说明</h3>
          <p>
            COMEX数值为CME每日原始表的第三方结构化提取，界面明确标注；生产版应直接解析CME原始文件。
          </p>
          <div className="source-list">
            {data.sources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <span>{source.name}</span>
                <small>{source.detail}</small>
              </a>
            ))}
          </div>
        </div>
      </details>

      <footer>
        <span>GLOBAL GOLD MIGRATION · DEMO</span>
        <span>真实数据快照</span>
      </footer>
    </main>
  );
}
