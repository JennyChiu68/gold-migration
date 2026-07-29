"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import rawData from "./data/gold-flows.json";

type Route = {
  id: string;
  period: string;
  originCode: number;
  origin: string;
  originZone: "west" | "east";
  destinationCode: number;
  destination: string;
  tonnes: number;
  valueUsd: number;
  estimatedWeight: boolean;
};

type Origin = {
  code: number;
  key: string;
  label: string;
  zone: "west" | "east";
  exportsTonnes: number | null;
  estimatedWeight: boolean;
};

type MarketBalance = {
  code: number;
  key: string;
  label: string;
  zone: string;
  period: string;
  comparable: boolean;
  importsTonnes: number | null;
  exportsTonnes: number | null;
  netImportsTonnes: number | null;
  previousNetImportsTonnes: number | null;
  changeTonnes: number | null;
  estimatedWeight: boolean;
};

type SwissOrigin = {
  code: number;
  label: string;
  tonnes: number;
};

type GoldData = {
  version: number;
  fetchedAt: string;
  commodity: { hsCode: string; label: string };
  network: {
    period: string;
    comparisonPeriod: string;
    coverage: {
      originCount: number;
      candidateOriginCount: number;
      routeCount: number;
      mappedRouteCount: number;
      unavailableOrigins: string[];
      description: string;
    };
    origins: Origin[];
    routes: Route[];
    direction: {
      period: string;
      eastboundTonnes: number;
      westboundTonnes: number;
      netEastboundTonnes: number;
      previousEastboundTonnes: number;
      eastboundChangeTonnes: number;
      eastboundChangePct: number;
      history: Array<{
        period: string;
        eastboundTonnes: number;
        westboundTonnes: number;
        netEastboundTonnes: number;
      }>;
    };
  };
  swissRefinery: {
    importSnapshot: {
      period: string;
      importsTonnes: number;
      sourceUrl: string;
      definition: string;
      topOrigins: SwissOrigin[];
    };
  };
  marketBalances: {
    period: string;
    comparisonPeriod: string;
    comparable: MarketBalance[];
    unavailable: Array<{
      code: number;
      key: string;
      label: string;
      period: string;
    }>;
    lagged: MarketBalance[];
  };
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
  methodology: {
    measured: string;
    inferred: string;
    comparability: string;
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
  maximumFractionDigits: 1,
});

const locations: Record<
  number,
  { label: string; x: number; y: number; region: string }
> = {
  36: { label: "澳大利亚", x: 87, y: 79, region: "大洋洲" },
  40: { label: "奥地利", x: 50, y: 31, region: "欧洲" },
  56: { label: "比利时", x: 46, y: 28, region: "欧洲" },
  124: { label: "加拿大", x: 16, y: 27, region: "北美" },
  156: { label: "中国内地", x: 79, y: 48, region: "亚洲" },
  250: { label: "法国", x: 44, y: 33, region: "欧洲" },
  276: { label: "德国", x: 48, y: 29, region: "欧洲" },
  344: { label: "中国香港", x: 81, y: 56, region: "亚洲转口" },
  380: { label: "意大利", x: 49, y: 38, region: "欧洲" },
  392: { label: "日本", x: 89, y: 44, region: "亚洲" },
  410: { label: "韩国", x: 85, y: 45, region: "亚洲" },
  458: { label: "马来西亚", x: 79, y: 69, region: "亚洲" },
  682: { label: "沙特", x: 62, y: 54, region: "中东" },
  699: { label: "印度", x: 69, y: 58, region: "亚洲" },
  702: { label: "新加坡", x: 79, y: 72, region: "亚洲转口" },
  724: { label: "西班牙", x: 42, y: 40, region: "欧洲" },
  757: { label: "瑞士", x: 48, y: 34, region: "精炼中心" },
  764: { label: "泰国", x: 76, y: 63, region: "亚洲" },
  784: { label: "阿联酋", x: 65, y: 57, region: "中东转口" },
  792: { label: "土耳其", x: 57, y: 43, region: "区域枢纽" },
  826: { label: "英国", x: 41, y: 26, region: "伦敦金库" },
  842: { label: "美国", x: 19, y: 43, region: "纽约金库" },
};

function formatPeriod(value: string) {
  const compact = value.replace("-", "");
  return `${compact.slice(0, 4)}.${compact.slice(4, 6)}`;
}

function signed(value: number, suffix = "t") {
  return `${value > 0 ? "+" : ""}${tonnes.format(value)}${suffix}`;
}

function pct(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function destinationLabel(route: Route) {
  return locations[route.destinationCode]?.label ?? route.destination;
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
      const height = Math.max(rect.height, 44);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const min = Math.min(...values);
      const max = Math.max(...values);
      const spread = Math.max(max - min, 1);
      const points = values.map((value, index) => ({
        x: 3 + (index / (values.length - 1)) * (width - 6),
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
      context.fillStyle = color;
      context.fill();
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [color, values]);

  return <canvas className="sparkline" ref={canvasRef} aria-hidden="true" />;
}

function NetworkMap({
  routes,
  selectedId,
}: {
  routes: Route[];
  selectedId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      const height = Math.max(rect.height, 214);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const sx = (value: number) => (value / 100) * width;
      const sy = (value: number) => (value / 100) * height;
      const land = (points: Array<[number, number]>) => {
        context.beginPath();
        points.forEach(([x, y], index) => {
          if (index === 0) context.moveTo(sx(x), sy(y));
          else context.lineTo(sx(x), sy(y));
        });
        context.closePath();
        context.fillStyle = "rgba(255,255,255,.055)";
        context.fill();
        context.strokeStyle = "rgba(255,255,255,.08)";
        context.lineWidth = 0.7;
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

      const visible = [...routes]
        .sort((left, right) => {
          if (left.id === selectedId) return 1;
          if (right.id === selectedId) return -1;
          return left.tonnes - right.tonnes;
        })
        .slice(-16);

      visible.forEach((route) => {
        const origin = locations[route.originCode];
        const destination = locations[route.destinationCode];
        if (!origin || !destination) return;
        const selected = route.id === selectedId;
        const start = { x: sx(origin.x), y: sy(origin.y) };
        const end = { x: sx(destination.x), y: sy(destination.y) };
        const controlX = (start.x + end.x) / 2;
        const controlY =
          Math.min(start.y, end.y) -
          Math.min(46, Math.abs(end.x - start.x) * 0.13 + 8);

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(controlX, controlY, end.x, end.y);
        context.strokeStyle = selected
          ? "#f4c55f"
          : route.originZone === "west"
            ? "rgba(238,186,75,.28)"
            : "rgba(198,214,197,.22)";
        context.lineWidth = selected
          ? 3
          : Math.max(0.8, Math.min(route.tonnes / 24, 2));
        context.stroke();

        context.beginPath();
        context.arc(end.x, end.y, selected ? 5.5 : 2.5, 0, Math.PI * 2);
        context.fillStyle = selected ? "#f4c55f" : "#a69b76";
        context.fill();

        context.beginPath();
        context.arc(start.x, start.y, selected ? 5 : 3, 0, Math.PI * 2);
        context.fillStyle = selected ? "#fff8df" : "#ffffff";
        context.fill();

        if (selected) {
          context.fillStyle = "#fff8df";
          context.font = "600 10px system-ui, sans-serif";
          context.textAlign = "center";
          context.fillText(origin.label, start.x, start.y - 11);
          context.fillText(destination.label, end.x, end.y - 11);
        }
      });
    };

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [routes, selectedId]);

  return (
    <canvas
      ref={canvasRef}
      className="network-map"
      role="img"
      aria-label="多个黄金枢纽之间的月度报关流向图"
    />
  );
}

function MarketBalanceBar({
  market,
  maxAbsolute,
}: {
  market: MarketBalance;
  maxAbsolute: number;
}) {
  const net = market.netImportsTonnes ?? 0;
  const width = Math.max(2.5, (Math.abs(net) / maxAbsolute) * 48);
  const style =
    net >= 0
      ? { left: "50%", width: `${width}%` }
      : { left: `${50 - width}%`, width: `${width}%` };

  return (
    <article className="balance-row">
      <div className="balance-head">
        <div>
          <strong>{market.label}</strong>
          {market.estimatedWeight && <span>含估算</span>}
        </div>
        <b className={net >= 0 ? "positive" : "negative"}>
          {signed(net)}
        </b>
      </div>
      <div className="balance-track" aria-hidden="true">
        <i className="balance-zero" />
        <span
          className={net >= 0 ? "importer" : "exporter"}
          style={style}
        />
      </div>
      <div className="balance-foot">
        <span>进口 {tonnes.format(market.importsTonnes ?? 0)}t</span>
        <span>出口 {tonnes.format(market.exportsTonnes ?? 0)}t</span>
        <span>
          较上月{" "}
          {market.changeTonnes == null ? "待补" : signed(market.changeTonnes)}
        </span>
      </div>
    </article>
  );
}

export default function Home() {
  const [originFilter, setOriginFilter] = useState<number | "all">("all");
  const [selectedRouteId, setSelectedRouteId] = useState(
    data.network.routes[0].id,
  );
  const [swissView, setSwissView] = useState<"source" | "destination">(
    "source",
  );

  const availableOrigins = data.network.origins.filter(
    (origin) => origin.exportsTonnes != null,
  );
  const filteredRoutes = useMemo(
    () =>
      originFilter === "all"
        ? data.network.routes
        : data.network.routes.filter(
            (route) => route.originCode === originFilter,
          ),
    [originFilter],
  );
  const selectedRoute =
    filteredRoutes.find((route) => route.id === selectedRouteId) ??
    filteredRoutes[0] ??
    data.network.routes[0];
  const routeOriginTotal =
    data.network.origins.find(
      (origin) => origin.code === selectedRoute.originCode,
    )?.exportsTonnes ?? selectedRoute.tonnes;
  const routeShare = (selectedRoute.tonnes / routeOriginTotal) * 100;

  const rankedMarkets = [...data.marketBalances.comparable].sort(
    (left, right) =>
      (right.netImportsTonnes ?? 0) - (left.netImportsTonnes ?? 0),
  );
  const maxBalance = Math.max(
    ...rankedMarkets.map((market) =>
      Math.abs(market.netImportsTonnes ?? 0),
    ),
  );
  const laggedChina = data.marketBalances.lagged[0];
  const londonChangeTonnes =
    data.vaults.london.history.at(-1)!.tonnes -
    data.vaults.london.history.at(-2)!.tonnes;
  const londonSixObservationChange =
    data.vaults.london.history.at(-1)!.tonnes -
    data.vaults.london.history.at(-6)!.tonnes;
  const shanghaiWithdrawalChange =
    (data.vaults.shanghai.withdrawalsTonnes /
      data.vaults.shanghai.previousWithdrawalsTonnes -
      1) *
    100;
  const freshnessDate = new Date(data.fetchedAt).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
  const swissExportTotal =
    data.network.origins.find((origin) => origin.code === 757)?.exportsTonnes ??
    0;
  const swissDestinations = data.network.routes
    .filter((route) => route.originCode === 757)
    .sort((left, right) => right.tonnes - left.tonnes);
  const swissRanking =
    swissView === "source"
      ? data.swissRefinery.importSnapshot.topOrigins.map((origin) => ({
          id: `source-${origin.code}`,
          label: origin.label,
          tonnes: origin.tonnes,
          estimated: false,
        }))
      : swissDestinations.map((route) => ({
          id: route.id,
          label: destinationLabel(route),
          tonnes: route.tonnes,
          estimated: route.estimatedWeight,
        }));
  const swissRankingTotal =
    swissView === "source"
      ? data.swissRefinery.importSnapshot.importsTonnes
      : swissExportTotal;
  const swissRankingMax = Math.max(
    ...swissRanking.map((item) => item.tonnes),
  );

  const chooseOrigin = (code: number | "all") => {
    setOriginFilter(code);
    const next =
      code === "all"
        ? data.network.routes[0]
        : data.network.routes.find((route) => route.originCode === code);
    if (next) setSelectedRouteId(next.id);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">AU</div>
        <div className="brand-copy">
          <strong>全球黄金迁徙地图</strong>
          <span>PHYSICAL FLOW MONITOR</span>
        </div>
        <a href="#method" className="source-link">
          口径
        </a>
      </header>

      <div className="status-line">
        <span className="status-dot" />
        <span>数据快照 {freshnessDate}</span>
        <span className="status-separator" />
        <span>最新信号 {formatPeriod(data.vaults.london.period)}</span>
        <span className="status-separator" />
        <span>同期全景 {formatPeriod(data.network.period)}</span>
      </div>

      <section className="hero">
        <div className="hero-label">
          <span>多源交叉验证</span>
          <b>置信度 · 中等</b>
        </div>
        <h1>
          伦敦库存回升，东向报关仍高
          <em>信号分化</em>
        </h1>
        <p>
          库存偏向西方留存，但同期报关仍显示
          <b>{tonnes.format(data.network.direction.eastboundTonnes)}吨</b>
          流向亚洲。两类信号暂未形成同向确认。
        </p>

        <div className="hero-kpis">
          <div>
            <span>伦敦近6个观测月</span>
            <strong>
              {signed(londonSixObservationChange)}
            </strong>
            <small>{formatPeriod(data.vaults.london.period)} · 库存</small>
          </div>
          <div>
            <span>东向报关流</span>
            <strong>
              {tonnes.format(data.network.direction.eastboundTonnes)}
              <small>t</small>
            </strong>
            <small>
              {formatPeriod(data.network.period)} ·{" "}
              {pct(data.network.direction.eastboundChangePct)}
            </small>
          </div>
          <div>
            <span>上海相对伦敦</span>
            <strong>
              {data.priceComparison.shanghaiPremiumPct >= 0 ? "+" : ""}
              {data.priceComparison.shanghaiPremiumPct.toFixed(2)}%
            </strong>
            <small>{data.priceComparison.date.slice(0, 7)} · 指示价</small>
          </div>
        </div>

        <div className="signal-strip" aria-label="本期信号状态">
          <div>
            <span>库存</span>
            <strong>留存增强</strong>
          </div>
          <div>
            <span>报关</span>
            <strong>东向降温</strong>
          </div>
          <div>
            <span>现货</span>
            <strong>接近平价</strong>
          </div>
        </div>
        <p className="hero-caveat">
          不同来源频率不同；库存变化不直接等同于跨境搬运，方向结论需由报关、库存和区域价格共同确认。
        </p>
      </section>

      <section className="section-block refinery-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">精炼链路</span>
            <h2>谁把黄金送进瑞士，又流向哪里</h2>
          </div>
          <span className="section-note">来源与去向分别标注月份</span>
        </div>

        <div className="refinery-card">
          <div className="chain-overview">
            <div>
              <span>最新进口</span>
              <strong>
                {tonnes.format(
                  data.swissRefinery.importSnapshot.importsTonnes,
                )}
                t
              </strong>
              <small>
                {formatPeriod(data.swissRefinery.importSnapshot.period)}
              </small>
            </div>
            <i aria-hidden="true">→</i>
            <div className="refinery-hub">
              <b>CH</b>
              <strong>瑞士</strong>
              <small>精炼与转口</small>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>同期出口</span>
              <strong>{tonnes.format(swissExportTotal)}t</strong>
              <small>{formatPeriod(data.network.period)}</small>
            </div>
          </div>

          <div className="refinery-tabs" role="tablist" aria-label="瑞士黄金链路">
            <button
              type="button"
              role="tab"
              aria-selected={swissView === "source"}
              className={swissView === "source" ? "active" : ""}
              onClick={() => setSwissView("source")}
            >
              进口来源
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={swissView === "destination"}
              className={swissView === "destination" ? "active" : ""}
              onClick={() => setSwissView("destination")}
            >
              出口去向
            </button>
          </div>

          <div className="refinery-ranking">
            <div className="ranking-head">
              <span>
                {swissView === "source"
                  ? `主要来源国 · ${formatPeriod(
                      data.swissRefinery.importSnapshot.period,
                    )}`
                  : `主要目的地 · ${formatPeriod(data.network.period)}`}
              </span>
              <small>吨 / 占该侧总量</small>
            </div>
            {swissRanking.slice(0, 8).map((item, index) => (
              <div className="ranking-row" key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
                <div aria-hidden="true">
                  <i
                    style={{
                      width: `${Math.max(
                        4,
                        (item.tonnes / swissRankingMax) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <b>{tonnes.format(item.tonnes)}t</b>
                <small>
                  {((item.tonnes / swissRankingTotal) * 100).toFixed(1)}%
                  {item.estimated ? " · 估算" : ""}
                </small>
              </div>
            ))}
          </div>

          <p className="refinery-caveat">
            {swissView === "source"
              ? data.swissRefinery.importSnapshot.definition
              : "出口去向来自同期HS 7108报关路线；进口与出口月份不同，不据此计算瑞士库存增减。"}
          </p>
        </div>
      </section>

      <section className="section-block network-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              同期全景 · {formatPeriod(data.network.period)}
            </span>
            <h2>黄金从哪里流向哪里</h2>
          </div>
          <span className="section-note">
            {data.network.coverage.mappedRouteCount}条可视路线
          </span>
        </div>

        <div className="origin-filter" aria-label="按出口枢纽筛选">
          <button
            type="button"
            className={originFilter === "all" ? "active" : ""}
            onClick={() => chooseOrigin("all")}
          >
            全部
          </button>
          {availableOrigins.map((origin) => (
            <button
              type="button"
              key={origin.code}
              className={originFilter === origin.code ? "active" : ""}
              onClick={() => chooseOrigin(origin.code)}
            >
              {origin.label}
            </button>
          ))}
        </div>

        <div className="map-card">
          <NetworkMap
            routes={filteredRoutes}
            selectedId={selectedRoute.id}
          />
          <div className="route-focus">
            <div>
              <span>
                {selectedRoute.origin} → {destinationLabel(selectedRoute)}
              </span>
              <strong>
                {tonnes.format(selectedRoute.tonnes)}
                <small>吨</small>
              </strong>
            </div>
            <div>
              <span>占该出口地当月 {routeShare.toFixed(1)}%</span>
              <span>{money.format(selectedRoute.valueUsd)}</span>
              {selectedRoute.estimatedWeight && <i>重量估算</i>}
            </div>
          </div>
        </div>

        <div className="route-list">
          {filteredRoutes.slice(0, 7).map((route, index) => (
            <button
              type="button"
              key={route.id}
              className={route.id === selectedRoute.id ? "active" : ""}
              onClick={() => setSelectedRouteId(route.id)}
              aria-pressed={route.id === selectedRoute.id}
            >
              <span className="route-rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="route-name">
                <b>{route.origin}</b>
                <i>→</i>
                <b>{destinationLabel(route)}</b>
              </span>
              <strong>{tonnes.format(route.tonnes)}t</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">同期市场净流入</span>
            <h2>谁在净进口，谁在净出口</h2>
          </div>
          <span className="section-note">
            进口 − 出口 · {formatPeriod(data.marketBalances.period)}
          </span>
        </div>

        <div className="balance-legend">
          <span>← 净出口</span>
          <span>0</span>
          <span>净进口 →</span>
        </div>
        <div className="balance-list">
          {rankedMarkets.map((market) => (
            <MarketBalanceBar
              key={market.key}
              market={market}
              maxAbsolute={maxBalance}
            />
          ))}
        </div>

        <article className="lagged-card">
          <div>
            <span>非同期观察项</span>
            <strong>{laggedChina.label}</strong>
            <small>{formatPeriod(laggedChina.period)} · 不参与同期排名</small>
          </div>
          <b>{signed(laggedChina.netImportsTonnes ?? 0)}</b>
          <p>
            进口 {tonnes.format(laggedChina.importsTonnes ?? 0)}t · 出口{" "}
            {tonnes.format(laggedChina.exportsTonnes ?? 0)}t
          </p>
        </article>

        <div className="coverage-note">
          <strong>本期未进入排名</strong>
          <p>
            {data.marketBalances.unavailable
              .map((market) => market.label)
              .join("、")}
            ：共同月份未同时提供有效进出口重量。
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">库存交叉验证</span>
            <h2>实物流与金库是否同向</h2>
          </div>
          <span className="section-note">不同频率 · 分别标注</span>
        </div>

        <div className="vault-grid">
          <article className="vault-card">
            <div className="vault-head">
              <div>
                <span>LONDON</span>
                <strong>伦敦金库</strong>
              </div>
              <time>{formatPeriod(data.vaults.london.period)}</time>
            </div>
            <div className="vault-number">
              <strong>{Math.round(data.vaults.london.tonnes).toLocaleString()}</strong>
              <span>吨库存</span>
            </div>
            <Sparkline
              values={data.vaults.london.history.map((row) => row.tonnes)}
            />
            <p>
              月增 {pct(data.vaults.london.monthlyChangePct)} ·{" "}
              {signed(londonChangeTonnes)}
            </p>
          </article>

          <article className="vault-card">
            <div className="vault-head">
              <div>
                <span>NEW YORK</span>
                <strong>COMEX金库</strong>
              </div>
              <time>{data.vaults.newYork.period.replaceAll("-", ".")}</time>
            </div>
            <div className="vault-number">
              <strong>{Math.round(data.vaults.newYork.tonnes)}</strong>
              <span>吨库存</span>
            </div>
            <div className="vault-meter">
              <span style={{ width: "68%" }} />
            </div>
            <p>
              30日 {pct(data.vaults.newYork.thirtyDayChangePct)}
              <i>二次解析</i>
            </p>
          </article>

          <article className="vault-card wide">
            <div className="vault-head">
              <div>
                <span>SHANGHAI</span>
                <strong>上金所出库</strong>
              </div>
              <time>{formatPeriod(data.vaults.shanghai.period)}</time>
            </div>
            <div className="shanghai-row">
              <div className="vault-number">
                <strong>
                  {tonnes.format(data.vaults.shanghai.withdrawalsTonnes)}
                </strong>
                <span>当月吨</span>
              </div>
              <div className="withdrawal-pair" aria-hidden="true">
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
            </div>
            <p>
              月增 {pct(shanghaiWithdrawalChange)} · 交割{" "}
              {tonnes.format(data.vaults.shanghai.deliveryTonnes)}t
            </p>
          </article>
        </div>

        <article className="signal-card">
          <span className="eyebrow">本期读法</span>
          <h2>库存与报关暂未同向确认</h2>
          <p>
            西方枢纽向亚洲的监测流量为
            {tonnes.format(data.network.direction.eastboundTonnes)}
            吨、环比放缓；同时伦敦库存增加、COMEX库存下降、上金所出库上升。它说明多个市场正在重新分配，不能只凭伦敦库存增加就判断“黄金西回”。
          </p>
          <div className="signal-tags">
            <span>海关：东向放缓</span>
            <span>伦敦：库存增加</span>
            <span>上海：出库增加</span>
          </div>
        </article>
      </section>

      <section className="premium-card">
        <div className="section-head light">
          <div>
            <span className="eyebrow">区域价格验证</span>
            <h2>上海相对伦敦</h2>
          </div>
          <time>{data.priceComparison.date.replaceAll("-", ".")}</time>
        </div>
        <div className="premium-value">
          <strong>
            {data.priceComparison.shanghaiPremiumPct >= 0 ? "+" : ""}
            {data.priceComparison.shanghaiPremiumPct.toFixed(2)}%
          </strong>
          <span>指示性溢价</span>
        </div>
        <div className="premium-scale" aria-hidden="true">
          <span className="scale-zero" />
          <span
            className="scale-dot"
            style={{
              left: `${Math.min(
                96,
                Math.max(
                  4,
                  50 + data.priceComparison.shanghaiPremiumPct * 5,
                ),
              )}%`,
            }}
          />
        </div>
        <div className="premium-labels">
          <span>
            伦敦折算 ¥
            {data.priceComparison.londonEquivalentCnyPerGram.toFixed(2)}/g
          </span>
          <span>
            上海 ¥{data.priceComparison.shanghaiAu9999CnyPerGram.toFixed(2)}/g
          </span>
        </div>
        <p>
          价格用于验证实物流方向，不把价差直接等同于运输套利空间；换算不含税费、运保与规格差异。
        </p>
      </section>

      <details className="method-card" id="method">
        <summary>
          <span>
            <strong>数据口径、覆盖与限制</strong>
            <small>哪些是直接观测，哪些是组合推断</small>
          </span>
          <b>＋</b>
        </summary>
        <div className="method-body">
          <h3>直接观测</h3>
          <p>{data.methodology.measured}</p>
          <h3>同期比较</h3>
          <p>{data.methodology.comparability}</p>
          <h3>方向指标</h3>
          <p>{data.methodology.inferred}</p>
          <h3>商品边界</h3>
          <p>
            HS {data.commodity.hsCode}：{data.commodity.label}
            。不包含首饰与私人非申报库存；同一批黄金经转口时可能重复出现在不同国家报关记录中。
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
        <span>GLOBAL GOLD MIGRATION · V3</span>
        <span>公开数据快照 · 非实时行情</span>
      </footer>
    </main>
  );
}
