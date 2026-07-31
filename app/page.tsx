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

type LatestMarketObservation = {
  code: number;
  key: string;
  label: string;
  zone: string;
  period: string | null;
  observationPeriod: string | null;
  status: "complete" | "partial" | "unavailableLatest";
  importsTonnes: number | null;
  exportsTonnes: number | null;
  netImportsTonnes: number | null;
  estimatedWeight: boolean;
};

type SwissOrigin = {
  code: number;
  label: string;
  tonnes: number;
};

type SwissCategory = "mining" | "hub";

type GoldData = {
  version: number;
  fetchedAt: string;
  fetchedAtMeaning: string;
  commodity: { hsCode: string; label: string };
  network: {
    period: string;
    latestComparablePeriod: string;
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
    exportSnapshot: {
      period: string;
      exportsTonnes: number;
      estimatedWeight: boolean;
      scope: string;
      sourceUrl: string;
      destinations: Route[];
    };
  };
  marketBalances: {
    period: string;
    latestComparablePeriod: string;
    comparisonPeriod: string;
    comparable: MarketBalance[];
    unavailable: Array<{
      code: number;
      key: string;
      label: string;
      period: string;
    }>;
    lagged: MarketBalance[];
    latestAvailable: LatestMarketObservation[];
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
      registeredTonnes: number;
      eligibleTonnes: number;
      totalTonnes: number;
      dailyNetChangeTonnes: number;
      dailyChangePct: number;
      sourceQuality: string;
      rawSourceUrl: string;
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

const swissCategories: Record<number, SwissCategory> = {
  32: "mining",
  36: "mining",
  152: "mining",
  288: "mining",
  384: "mining",
  417: "mining",
  604: "mining",
  380: "hub",
  784: "hub",
  842: "hub",
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
  maxFlow,
  index,
}: {
  market: MarketBalance;
  maxFlow: number;
  index: number;
}) {
  const net = market.netImportsTonnes ?? 0;
  const imports = market.importsTonnes ?? 0;
  const exports = market.exportsTonnes ?? 0;
  const previous = market.previousNetImportsTonnes;
  const importWidth = maxFlow > 0 ? (imports / maxFlow) * 100 : 0;
  const exportWidth = maxFlow > 0 ? (exports / maxFlow) * 100 : 0;
  let trend = "前月口径不全";

  if (previous != null) {
    const difference = Math.abs(net - previous);

    if (difference < 0.05) {
      trend = "较上月基本持平";
    } else if (net >= 0 && previous >= 0) {
      trend = `净流入${net > previous ? "扩大" : "收窄"} ${tonnes.format(
        difference,
      )}t`;
    } else if (net < 0 && previous < 0) {
      trend = `净流出${
        Math.abs(net) > Math.abs(previous) ? "扩大" : "收窄"
      } ${tonnes.format(difference)}t`;
    } else {
      trend = net >= 0 ? "由净流出转为净流入" : "由净流入转为净流出";
    }
  }

  return (
    <article
      className={`balance-row ${
        net >= 0 ? "net-importer" : "net-exporter"
      }`}
    >
      <div className="balance-head">
        <span className="balance-rank">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="balance-name">
          <strong>{market.label}</strong>
          <span>{market.estimatedWeight ? "估算重量" : "官方重量"}</span>
        </div>
        <div className="balance-result">
          <span>{net >= 0 ? "净流入" : "净流出"}</span>
          <b className={net >= 0 ? "positive" : "negative"}>
            {tonnes.format(Math.abs(net))}
            <small>t</small>
          </b>
        </div>
      </div>
      <div
        className="flow-comparison"
        aria-label={`进口${tonnes.format(imports)}吨，出口${tonnes.format(
          exports,
        )}吨`}
      >
        <div className="flow-row">
          <span>进口</span>
          <div className="flow-track" aria-hidden="true">
            <i
              className="flow-import"
              style={{ width: `${importWidth}%` }}
            />
          </div>
          <strong>{tonnes.format(imports)}t</strong>
        </div>
        <div className="flow-row">
          <span>出口</span>
          <div className="flow-track" aria-hidden="true">
            <i
              className="flow-export"
              style={{ width: `${exportWidth}%` }}
            />
          </div>
          <strong>{tonnes.format(exports)}t</strong>
        </div>
      </div>
      <div className="balance-change">
        <span>较上月</span>
        <strong>{trend}</strong>
      </div>
    </article>
  );
}

function DashboardSection({
  id,
  chapter,
  eyebrow,
  title,
  note,
  className = "",
  children,
}: {
  id: string;
  chapter: string;
  eyebrow: string;
  title: string;
  note: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`section-block dashboard-section ${className}`.trim()}
      id={id}
    >
      <header className="section-head">
        <span className="chapter-index" aria-hidden="true">
          {chapter}
        </span>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="section-note-inline">{note}</p>
        </div>
      </header>
      <div className="section-content">{children}</div>
    </section>
  );
}

export default function Home() {
  const [originFilter, setOriginFilter] = useState<number | "all">("all");
  const [selectedRouteId, setSelectedRouteId] = useState(
    data.network.routes[0].id,
  );
  const [routeView, setRouteView] = useState<"list" | "map">("list");
  const [swissView, setSwissView] = useState<"source" | "destination">(
    "source",
  );
  const [swissCategory, setSwissCategory] = useState<
    "all" | SwissCategory
  >("all");

  const handleSwissTabKey = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    let nextView: "source" | "destination" | null = null;

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp" ||
      event.key === "Home"
    ) {
      nextView = "source";
    } else if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown" ||
      event.key === "End"
    ) {
      nextView = "destination";
    }

    if (!nextView) return;

    event.preventDefault();
    setSwissView(nextView);
    requestAnimationFrame(() => {
      document.getElementById(`swiss-tab-${nextView}`)?.focus();
    });
  };

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
  const inflowMarkets = rankedMarkets.filter(
    (market) => (market.netImportsTonnes ?? 0) >= 0,
  );
  const outflowMarkets = rankedMarkets.filter(
    (market) => (market.netImportsTonnes ?? 0) < 0,
  );
  const maxMarketFlow = Math.max(
    ...rankedMarkets.flatMap((market) => [
      market.importsTonnes ?? 0,
      market.exportsTonnes ?? 0,
    ]),
  );
  const londonChangeTonnes =
    data.vaults.london.history.at(-1)!.tonnes -
    data.vaults.london.history.at(-2)!.tonnes;
  const londonSixObservationChange =
    data.vaults.london.history.at(-1)!.tonnes -
    data.vaults.london.history.at(-6)!.tonnes;
  const londonBaselinePeriod = data.vaults.london.history.at(-6)!.period;
  const shanghaiWithdrawalChange =
    (data.vaults.shanghai.withdrawalsTonnes /
      data.vaults.shanghai.previousWithdrawalsTonnes -
      1) *
    100;
  const freshnessDate = new Date(data.fetchedAt).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
  const swissExportTotal = data.swissRefinery.exportSnapshot.exportsTonnes;
  const swissDestinations = data.swissRefinery.exportSnapshot.destinations;
  const swissSourceRows = data.swissRefinery.importSnapshot.topOrigins.map(
    (origin) => ({
      id: `source-${origin.code}`,
      label: origin.label,
      tonnes: origin.tonnes,
      estimated: false,
      category: swissCategories[origin.code],
    }),
  );
  const swissMiningTonnes = swissSourceRows
    .filter((item) => item.category === "mining")
    .reduce((sum, item) => sum + item.tonnes, 0);
  const swissHubTonnes = swissSourceRows
    .filter((item) => item.category === "hub")
    .reduce((sum, item) => sum + item.tonnes, 0);
  const swissOtherTonnes = Math.max(
    0,
    data.swissRefinery.importSnapshot.importsTonnes -
      swissMiningTonnes -
      swissHubTonnes,
  );
  const swissRanking =
    swissView === "source"
      ? swissSourceRows.filter(
          (item) =>
            swissCategory === "all" || item.category === swissCategory,
        )
      : swissDestinations.map((route) => ({
          id: route.id,
          label: destinationLabel(route),
          tonnes: route.tonnes,
          estimated: route.estimatedWeight,
          category: undefined,
        }));
  const swissRankingTotal =
    swissView === "source"
      ? data.swissRefinery.importSnapshot.importsTonnes
      : swissExportTotal;
  const swissRankingMax = Math.max(
    1,
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
          <h1>全球黄金迁徙地图</h1>
          <span>PHYSICAL FLOW MONITOR</span>
        </div>
        <a className="topbar-menu" href="#feature-nav">
          目录
        </a>
      </header>

      <div className="status-line">
        <span className="status-dot" />
        <span>页面更新 {freshnessDate}</span>
        <span aria-hidden="true">·</span>
        <span>各模块观测期见卡片</span>
      </div>

      <nav className="feature-nav" id="feature-nav" aria-label="功能目录">
        <div className="feature-nav-head">
          <strong>功能目录</strong>
          <span>点击快速跳转</span>
        </div>
        <div className="feature-nav-grid">
          {[
            ["#gold-compass", "黄金罗盘", "综合信号"],
            ["#market-balance", "全球吸金榜", "净进出口"],
            ["#trade-routes", "黄金航线", "跨境路线"],
            ["#swiss-refinery", "瑞士精炼站", "精炼链路"],
            ["#vault-crosscheck", "三地实物信号", "库存与交割"],
            ["#price-gap", "金价温差", "区域溢价"],
          ].map(([href, label, detail], index) => (
            <a href={href} key={href}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
            </a>
          ))}
        </div>
      </nav>

      <section className="hero" id="gold-compass">
        <header className="section-head hero-section-head">
          <span className="chapter-index hero-chapter-index" aria-hidden="true">
            01
          </span>
          <div>
            <h2>黄金罗盘</h2>
          </div>
        </header>
        <h3 className="hero-summary">
          <span>伦敦库存回升，共同期东向报关仍高</span>
          <em>信号分化</em>
        </h3>
        <p>
          伦敦库存自年初回升；最新共同期
          {formatPeriod(data.network.period)}报关仍显示
          <b>{tonnes.format(data.network.direction.eastboundTonnes)}吨</b>
          流向亚洲。两项数据频率与口径不同，暂不据此判断单一方向。
        </p>

        <div className="hero-kpis">
          <div>
            <span>伦敦较{formatPeriod(londonBaselinePeriod)}</span>
            <strong>
              {signed(londonSixObservationChange)}
            </strong>
            <small>{formatPeriod(data.vaults.london.period)} · 库存</small>
          </div>
          <div>
            <span>东向报关流 · 含估算</span>
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
            <small>
              {data.priceComparison.date} · 月末同日对齐 · 非实时
            </small>
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
      </section>

      <DashboardSection
        id="market-balance"
        chapter="02"
        eyebrow={`同月可比净流量 · ${formatPeriod(data.marketBalances.period)}`}
        title="全球吸金榜"
        note="共同完整月份排名"
        className="market-section"
      >
        <div className="comparison-note">
          <strong>同期榜单 · {formatPeriod(data.marketBalances.period)}</strong>
          <span>仅比较同一完整月份；下方另列各市场最新观测。</span>
        </div>

        <div className="balance-group">
          <div className="balance-group-title">
            <strong>净流入市场</strong>
            <span>{inflowMarkets.length}个</span>
          </div>
          <div className="balance-list">
            {inflowMarkets.map((market, index) => (
              <MarketBalanceBar
                key={market.key}
                market={market}
                maxFlow={maxMarketFlow}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="balance-group outflow-group">
          <div className="balance-group-title">
            <strong>净流出市场</strong>
            <span>{outflowMarkets.length}个</span>
          </div>
          <div className="balance-list">
            {outflowMarkets.map((market, index) => (
              <MarketBalanceBar
                key={market.key}
                market={market}
                maxFlow={maxMarketFlow}
                index={inflowMarkets.length + index}
              />
            ))}
          </div>
        </div>

        <div className="latest-observations">
          <div className="latest-observations-head">
            <div>
              <strong>各市场最新观测</strong>
              <span>每张卡片采用该市场自身最新月份</span>
            </div>
            <b>不跨月排名</b>
          </div>
          <div className="latest-market-grid">
            {data.marketBalances.latestAvailable.map((market) => {
              const unavailable =
                market.status === "unavailableLatest";
              const complete =
                !unavailable &&
                market.importsTonnes != null &&
                market.exportsTonnes != null &&
                market.netImportsTonnes != null;
              const net = market.netImportsTonnes ?? 0;

              return (
                <article
                  className={`latest-market-card ${
                    unavailable
                      ? "unverified"
                      : complete
                      ? net >= 0
                        ? "net-importer"
                        : "net-exporter"
                      : "partial"
                  }`}
                  key={market.key}
                >
                  <div className="latest-market-head">
                    <div>
                      <strong>{market.label}</strong>
                      <time>
                        {market.period == null
                          ? "暂未核实"
                          : formatPeriod(market.period)}
                      </time>
                    </div>
                    <span>
                      {unavailable
                        ? "最新期未核实"
                        : complete
                        ? net >= 0
                          ? "净流入"
                          : "净流出"
                        : market.importsTonnes == null
                          ? "进口缺失"
                          : market.exportsTonnes == null
                            ? "出口缺失"
                            : "数据不完整"}
                    </span>
                  </div>
                  <div className="latest-market-result">
                    {unavailable ? (
                      <strong className="unavailable">
                        暂无可验证数据
                      </strong>
                    ) : complete ? (
                      <strong className={net >= 0 ? "positive" : "negative"}>
                        {signed(net)}
                      </strong>
                    ) : (
                      <strong className="unavailable">净额不可算</strong>
                    )}
                    {market.estimatedWeight && <small>含估算重量</small>}
                  </div>
                  <dl>
                    <div>
                      <dt>进口</dt>
                      <dd>
                        {unavailable
                          ? "—"
                          : market.importsTonnes == null
                          ? "暂缺"
                          : `${tonnes.format(market.importsTonnes)}t`}
                      </dd>
                    </div>
                    <div>
                      <dt>出口</dt>
                      <dd>
                        {unavailable
                          ? "—"
                          : market.exportsTonnes == null
                          ? "暂缺"
                          : `${tonnes.format(market.exportsTonnes)}t`}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        id="trade-routes"
        chapter="03"
        eyebrow={`共同期报关路线 · ${formatPeriod(data.network.period)}`}
        title="黄金航线"
        note={`${data.network.coverage.mappedRouteCount}条可视路线`}
        className="network-section"
      >
        <div className="view-toggle" role="group" aria-label="路线查看方式">
          <button
            type="button"
            aria-pressed={routeView === "list"}
            className={routeView === "list" ? "active" : ""}
            onClick={() => setRouteView("list")}
          >
            排行榜
          </button>
          <button
            type="button"
            aria-pressed={routeView === "map"}
            className={routeView === "map" ? "active" : ""}
            onClick={() => setRouteView("map")}
          >
            迁徙地图
          </button>
        </div>

        <div className="origin-filter" role="group" aria-label="按出口枢纽筛选">
          <button
            type="button"
            aria-pressed={originFilter === "all"}
            className={originFilter === "all" ? "active" : ""}
            onClick={() => chooseOrigin("all")}
          >
            全部
          </button>
          {availableOrigins.map((origin) => (
            <button
              type="button"
              key={origin.code}
              aria-pressed={originFilter === origin.code}
              className={originFilter === origin.code ? "active" : ""}
              onClick={() => chooseOrigin(origin.code)}
            >
              {origin.label}
            </button>
          ))}
        </div>

        {routeView === "map" && (
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
                <i>
                  {selectedRoute.estimatedWeight ? "重量估算" : "报关重量"}
                </i>
              </div>
            </div>
          </div>
        )}

        <div className={`route-list ${routeView === "list" ? "expanded" : ""}`}>
          {filteredRoutes
            .slice(0, routeView === "list" ? 10 : 4)
            .map((route, index) => (
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
              <span className="route-metrics">
                <strong>{tonnes.format(route.tonnes)}t</strong>
                <small>{money.format(route.valueUsd)}</small>
                <i>{route.estimatedWeight ? "估算" : "报关"}</i>
              </span>
            </button>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        id="swiss-refinery"
        chapter="04"
        eyebrow="进口来源与出口去向"
        title="瑞士精炼站"
        note="来源与去向分别标注月份"
        className="refinery-section"
      >
        <div className="refinery-card">
          <div className="chain-overview">
            <div>
              <span>官方进口</span>
              <strong>
                {tonnes.format(
                  data.swissRefinery.importSnapshot.importsTonnes,
                )}
                t
              </strong>
              <small>
                BAZG · {formatPeriod(data.swissRefinery.importSnapshot.period)}
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
              <span>报关出口</span>
              <strong>{tonnes.format(swissExportTotal)}t</strong>
              <small>
                Comtrade ·{" "}
                {formatPeriod(data.swissRefinery.exportSnapshot.period)}
              </small>
            </div>
          </div>
          <p className="chain-scope-note">
            两侧为不同月份、不同商品口径的独立观测，不相减推算瑞士库存。
          </p>

          <div className="refinery-tabs" role="tablist" aria-label="瑞士黄金链路">
            <button
              type="button"
              id="swiss-tab-source"
              role="tab"
              aria-selected={swissView === "source"}
              aria-controls="swiss-panel-source"
              tabIndex={swissView === "source" ? 0 : -1}
              className={swissView === "source" ? "active" : ""}
              onClick={() => setSwissView("source")}
              onKeyDown={handleSwissTabKey}
            >
              进口来源
            </button>
            <button
              type="button"
              id="swiss-tab-destination"
              role="tab"
              aria-selected={swissView === "destination"}
              aria-controls="swiss-panel-destination"
              tabIndex={swissView === "destination" ? 0 : -1}
              className={swissView === "destination" ? "active" : ""}
              onClick={() => setSwissView("destination")}
              onKeyDown={handleSwissTabKey}
            >
              出口去向
            </button>
          </div>

          {(["source", "destination"] as const).map((view) => (
            <div
              key={view}
              role="tabpanel"
              id={`swiss-panel-${view}`}
              aria-labelledby={`swiss-tab-${view}`}
              hidden={swissView !== view}
            >
              {swissView === view && (
                <>
                  {view === "source" && (
                    <>
                      <div className="category-summary">
                        <div>
                          <strong>
                            {(
                              (swissMiningTonnes /
                                data.swissRefinery.importSnapshot
                                  .importsTonnes) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                          <span>主要矿产供应地</span>
                        </div>
                        <div>
                          <strong>
                            {(
                              (swissHubTonnes /
                                data.swissRefinery.importSnapshot
                                  .importsTonnes) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                          <span>金融及转口枢纽</span>
                        </div>
                        <div>
                          <strong>
                            {(
                              (swissOtherTonnes /
                                data.swissRefinery.importSnapshot
                                  .importsTonnes) *
                              100
                            ).toFixed(1)}
                            %
                          </strong>
                          <span>其余来源</span>
                        </div>
                      </div>

                      <div
                        className="category-filter"
                        role="group"
                        aria-label="按来源属性筛选"
                      >
                        {[
                          ["all", "全部"],
                          ["mining", "矿产供应地"],
                          ["hub", "金融及转口"],
                        ].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            aria-pressed={swissCategory === value}
                            className={
                              swissCategory === value ? "active" : ""
                            }
                            onClick={() =>
                              setSwissCategory(
                                value as "all" | SwissCategory,
                              )
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="refinery-ranking">
                    <div className="ranking-head">
                      <span>
                        {view === "source"
                          ? `主要来源地 · ${formatPeriod(
                              data.swissRefinery.importSnapshot.period,
                            )}`
                          : `主要目的地 · ${formatPeriod(
                              data.swissRefinery.exportSnapshot.period,
                            )}`}
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
                    {view === "source"
                      ? `${data.swissRefinery.importSnapshot.definition} “矿产供应地/金融及转口”是按来源地角色进行的分析分类，不代表每批黄金的矿山原产地。`
                      : `${data.swissRefinery.exportSnapshot.scope} 进口侧采用BAZG 7108.1200口径，出口侧采用Comtrade HS 7108口径，两侧不可直接相减。`}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        id="vault-crosscheck"
        chapter="05"
        eyebrow="伦敦 · 纽约 · 上海"
        title="三地实物信号"
        note="库存与交割交叉观察"
        className="vault-section"
      >
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
              <strong>{Math.round(data.vaults.newYork.totalTonnes)}</strong>
              <span>吨总库存</span>
            </div>
            <div className="comex-breakdown">
              <div>
                <span>Registered</span>
                <strong>
                  {tonnes.format(data.vaults.newYork.registeredTonnes)}t
                </strong>
              </div>
              <div>
                <span>Eligible</span>
                <strong>
                  {tonnes.format(data.vaults.newYork.eligibleTonnes)}t
                </strong>
              </div>
            </div>
            <div
              className={`vault-change ${
                data.vaults.newYork.dailyNetChangeTonnes >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              <span>日净变化</span>
              <strong>
                {signed(data.vaults.newYork.dailyNetChangeTonnes)}
              </strong>
            </div>
            <p>CME官方日报 · 日变 {pct(data.vaults.newYork.dailyChangePct)}</p>
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
          <span className="eyebrow">多市场解读</span>
          <h3>库存与报关暂未同向确认</h3>
          <p>
            最新共同期西方枢纽向亚洲的监测流量为
            {tonnes.format(data.network.direction.eastboundTonnes)}
            吨、环比放缓且含部分估算重量；最新观测期内，伦敦库存增加、COMEX总库存日度小幅增加、上金所出库上升。它说明多个市场正在重新分配，不能只凭伦敦库存增加就判断“黄金西回”。
          </p>
          <div className="signal-tags">
            <span>海关：东向放缓</span>
            <span>伦敦：库存增加</span>
            <span>COMEX：日度微增</span>
            <span>上海：出库增加</span>
          </div>
        </article>
      </DashboardSection>

      <section className="premium-card" id="price-gap">
        <div className="section-head light">
          <span className="chapter-index dark" aria-hidden="true">
            06
          </span>
          <div>
            <span className="eyebrow">区域价格验证</span>
            <h2>金价温差</h2>
            <small className="section-subtitle">
              最新完整月末同日对齐 · {data.priceComparison.date} · 非实时
            </small>
          </div>
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
          这是月末同日的指示性对齐，不是实时价差。价格用于验证实物流方向，不把价差直接等同于运输套利空间；换算不含税费、运保与规格差异。
        </p>
      </section>

      <details className="method-card" id="method">
        <summary>
          <div>
            <h2>数据底稿</h2>
            <small>数据来源、口径与限制</small>
          </div>
          <b>＋</b>
        </summary>
        <div className="method-body">
          <h3>直接观测</h3>
          <p>{data.methodology.measured}</p>
          <h3>同期比较</h3>
          <p>{data.methodology.comparability}</p>
          <h3>数据质量标签</h3>
          <p>
            “官方总计”表示直接采用官方接口的市场合计重量；“重量估算”表示官方接口将该重量标记为估算；伙伴明细求和、镜像推算和二次解析必须单独标注，不能与直接总计混用。
          </p>
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
        <span>GLOBAL GOLD MIGRATION · V6</span>
        <span>公开数据快照 · 非实时行情</span>
      </footer>
    </main>
  );
}
