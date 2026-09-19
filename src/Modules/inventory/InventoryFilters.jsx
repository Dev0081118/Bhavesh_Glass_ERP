import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

const InventoryFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  size,
  setSize,
  status,
  setStatus,
  location,
  setLocation,
  categories,
  sizes,
  locations,
}) => {
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSize("All");
    setStatus("All");
    setLocation("All");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />

          <h2 className="text-sm font-semibold text-slate-800">
            Inventory Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product, SKU..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>

        <select
          value={size}
          onChange={(event) =>
            setSize(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {sizes.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Sizes" : item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">
            Out of Stock
          </option>
        </select>

        <select
          value={location}
          onChange={(event) =>
            setLocation(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {locations.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Locations" : item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InventoryFilters;