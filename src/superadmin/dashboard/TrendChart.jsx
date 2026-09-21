import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

import EmptyState from "./EmptyState";
import { formatCompactCurrency, formatCurrency } from "./formatters";

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 240;
const PADDING = { top: 18, right: 14, bottom: 30, left: 52 };

const SERIES = [
  { id: "sales", label: "Sales", color: "#0f172a", swatch: "bg-slate-900", type: "bar" },
  { id: "purchases", label: "Purchases", color: "#94a3b8", swatch: "bg-slate-400", type: "bar" },
  {
    id: "collections",
    label: "Collections",
    color: "#059669",
    swatch: "bg-emerald-600",
    type: "line",
  },
];

const niceMax = (value) => {
  if (value <= 0) return 100;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
};

export default function TrendChart({ trend }) {
  const points = useMemo(() => trend?.points || [], [trend]);
  const [hidden, setHidden] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);

  const visibleSeries = SERIES.filter((series) => !hidden[series.id]);

  const totals = useMemo(
    () =>
      points.reduce(
        (accumulator, point) => ({
          sales: accumulator.sales + point.sales,
          purchases: accumulator.purchases + point.purchases,
          collections: accumulator.collections + point.collections,
        }),
        { sales: 0, purchases: 0, collections: 0 }
      ),
    [points]
  );

  const hasData = points.some((point) => point.sales || point.purchases || point.collections);

  if (!points.length || !hasData) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No sales activity in this period"
        description="Once sale bills, purchases and payments are recorded they will appear here as a trend."
      />
    );
  }

  const plotWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
  const stepX = plotWidth / points.length;
  const groupWidth = Math.min(stepX * 0.62, 26);
  const barCount = visibleSeries.filter((series) => series.type === "bar").length;
  const barWidth = barCount > 1 ? groupWidth / 2 : groupWidth;

  const peak = Math.max(
    ...points.flatMap((point) => visibleSeries.map((series) => point[series.id] || 0)),
    0
  );

  const axisMax = niceMax(peak);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const toY = (value) => PADDING.top + plotHeight - (value / axisMax) * plotHeight;

  const linePoints = points
    .map((point, index) => {
      const x = PADDING.left + index * stepX + stepX / 2;
      return `${x.toFixed(2)},${toY(point.collections).toFixed(2)}`;
    })
    .join(" ");

  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const activePoint = activeIndex === null ? null : points[activeIndex];

  const readout = activePoint
    ? {
        label: activePoint.label,
        sales: activePoint.sales,
        purchases: activePoint.purchases,
        collections: activePoint.collections,
      }
    : {
        label: trend?.granularity === "week" ? "Period total" : "Range total",
        sales: totals.sales,
        purchases: totals.purchases,
        collections: totals.collections,
      };

  const toggleSeries = (id) => setHidden((current) => ({ ...current, [id]: !current[id] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {SERIES.map((series) => (
          <button
            key={series.id}
            type="button"
            onClick={() => toggleSeries(series.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
              hidden[series.id] ? "text-slate-300 line-through" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${series.swatch}`} />
            {series.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl bg-slate-50 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {readout.label}
        </span>

        {SERIES.map((series) => (
          <span key={series.id} className="text-xs text-slate-600">
            <span className="text-slate-400">{series.label} </span>
            <span className="font-semibold tabular-nums text-slate-900">
              {formatCurrency(readout[series.id])}
            </span>
          </span>
        ))}
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="h-[240px] w-full min-w-[560px]"
          role="img"
          aria-label="Sales, purchases and collections trend"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {gridLines.map((ratio) => {
            const y = PADDING.top + plotHeight - ratio * plotHeight;

            return (
              <g key={ratio}>
                <line
                  x1={PADDING.left}
                  x2={VIEW_WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? undefined : "3 4"}
                />
                <text x={PADDING.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {formatCompactCurrency(axisMax * ratio)}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
            const groupStart = PADDING.left + index * stepX + (stepX - groupWidth) / 2;
            let cursor = 0;

            return (
              <g key={point.key}>
                {activeIndex === index && (
                  <rect
                    x={PADDING.left + index * stepX}
                    y={PADDING.top}
                    width={stepX}
                    height={plotHeight}
                    fill="#0f172a"
                    opacity="0.04"
                  />
                )}

                {visibleSeries
                  .filter((series) => series.type === "bar")
                  .map((series) => {
                    const value = point[series.id] || 0;
                    const height = Math.max((value / axisMax) * plotHeight, value > 0 ? 2 : 0);
                    const x = groupStart + cursor * barWidth;
                    cursor += 1;

                    return (
                      <rect
                        key={series.id}
                        x={x}
                        y={PADDING.top + plotHeight - height}
                        width={Math.max(barWidth - 2, 2)}
                        height={height}
                        rx="2"
                        fill={series.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      />
                    );
                  })}

                {index % labelEvery === 0 && (
                  <text
                    x={PADDING.left + index * stepX + stepX / 2}
                    y={VIEW_HEIGHT - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94a3b8"
                  >
                    {point.label}
                  </text>
                )}

                <rect
                  x={PADDING.left + index * stepX}
                  y={PADDING.top}
                  width={stepX}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setActiveIndex(index)}
                />
              </g>
            );
          })}

          {!hidden.collections && (
            <>
              <polyline
                points={linePoints}
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {points.map((point, index) => (
                <circle
                  key={`dot-${point.key}`}
                  cx={PADDING.left + index * stepX + stepX / 2}
                  cy={toY(point.collections)}
                  r={activeIndex === index ? 4 : 2.5}
                  fill="#059669"
                />
              ))}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
