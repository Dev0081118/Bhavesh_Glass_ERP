const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

export const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  const absolute = Math.abs(amount);

  if (absolute >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (absolute >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (absolute >= 10000) return `₹${Math.round(amount / 1000)}K`;

  return currencyFormatter.format(amount);
};

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

export const formatRelativeTime = (value) => {
  if (!value) return "—";

  const time = new Date(value).getTime();

  if (Number.isNaN(time)) return "—";

  const minutes = Math.round((Date.now() - time) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);

  if (days < 30) return `${days}d ago`;

  return formatDate(value);
};

export const formatDelta = (changePct) => {
  if (changePct === null || changePct === undefined) {
    return { label: "—", tone: "neutral" };
  }

  if (changePct === 0) {
    return { label: "No change", tone: "neutral" };
  }

  return {
    label: `${changePct > 0 ? "+" : ""}${changePct}%`,
    tone: changePct > 0 ? "up" : "down",
  };
};

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const formatLongDate = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const getInitials = (name) =>
  String(name || "?")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`;
