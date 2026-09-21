import KpiCard from "./KpiCard";

export default function KpiGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ id, ...card }) => (
        <KpiCard key={id} {...card} />
      ))}
    </div>
  );
}
