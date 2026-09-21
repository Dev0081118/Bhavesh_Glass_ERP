export default function Sparkline({ values = [], tone = "neutral", className = "" }) {
  const points = values.filter((value) => Number.isFinite(value));

  if (points.length < 2) {
    return <div className="h-8" aria-hidden="true" />;
  }

  const width = 100;
  const height = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const stepX = width / (points.length - 1);

  const coordinates = points.map((value, index) => [
    index * stepX,
    height - ((value - min) / span) * (height - 6) - 3,
  ]);

  const line = coordinates.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  const strokes = {
    neutral: "#334155",
    emerald: "#059669",
    red: "#dc2626",
    amber: "#d97706",
  };

  const fills = {
    neutral: "rgba(51,65,85,0.07)",
    emerald: "rgba(5,150,105,0.12)",
    red: "rgba(220,38,38,0.10)",
    amber: "rgba(217,119,6,0.10)",
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`h-8 w-full ${className}`}
      aria-hidden="true"
    >
      <polygon points={area} fill={fills[tone] || fills.neutral} />
      <polyline
        points={line}
        fill="none"
        stroke={strokes[tone] || strokes.neutral}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
