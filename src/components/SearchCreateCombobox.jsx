import {
  Check,
  ChevronDown,
  Plus,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

export default function SearchCreateCombobox({
  value,
  items = [],

  placeholder =
    "Search...",

  emptyText =
    "No matches found.",

  createLabel =
    "Create",

  getId = (
    item
  ) =>
    item.id ||
    item._id,

  getLabel = (
    item
  ) =>
    item.name ||
    "",

  renderSecondary,

  onChange,

  onCreate,
}) {
  const selected =
    items.find(
      (item) =>
        String(
          getId(item)
        ) ===
        String(value)
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

  const filtered =
    useMemo(
      () => {
        const search =
          query
            .trim()
            .toLowerCase();

        if (!search) {
          return items;
        }

        return items.filter(
          (item) =>
            String(
              getLabel(
                item
              )
            )
              .toLowerCase()
              .includes(
                search
              )
        );
      },
      [
        items,
        query,
        getLabel,
      ]
    );

  const canCreate =
    Boolean(
      onCreate &&
        query.trim()
    ) &&
    !items.some(
      (item) =>
        String(
          getLabel(
            item
          )
        )
          .trim()
          .toLowerCase() ===
        query
          .trim()
          .toLowerCase()
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(
            (current) =>
              !current
          );

          if (!open) {
            setQuery("");
          }
        }}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm outline-none transition hover:border-slate-300 focus:border-slate-400"
      >
        <span
          className={
            selected
              ? "truncate text-slate-800"
              : "truncate text-slate-400"
          }
        >
          {selected
            ? getLabel(
                selected
              )
            : placeholder}
        </span>

        <ChevronDown
          size={16}
          className="shrink-0 text-slate-400"
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setOpen(
                false
              )
            }
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  autoFocus
                  value={
                    query
                  }
                  onChange={(
                    event
                  ) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder={
                    placeholder
                  }
                  className="h-9 w-full rounded-xl bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-1.5">
              {filtered.map(
                (item) => {
                  const id =
                    getId(
                      item
                    );

                  const active =
                    String(
                      id
                    ) ===
                    String(
                      value
                    );

                  return (
                    <button
                      key={
                        id
                      }
                      type="button"
                      onClick={() => {
                        onChange(
                          id
                        );

                        setOpen(
                          false
                        );

                        setQuery(
                          ""
                        );
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {getLabel(
                            item
                          )}
                        </p>

                        {renderSecondary && (
                          <div className="mt-0.5 truncate text-xs text-slate-400">
                            {renderSecondary(
                              item
                            )}
                          </div>
                        )}
                      </div>

                      {active && (
                        <Check
                          size={16}
                          className="shrink-0 text-slate-700"
                        />
                      )}
                    </button>
                  );
                }
              )}

              {filtered.length ===
                0 &&
                !canCreate && (
                  <div className="px-3 py-5 text-center text-sm text-slate-400">
                    {emptyText}
                  </div>
                )}

              {canCreate && (
                <button
                  type="button"
                  onClick={() => {
                    const name =
                      query.trim();

                    setOpen(
                      false
                    );

                    onCreate(
                      name
                    );
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Plus
                      size={14}
                    />
                  </div>

                  {createLabel} "
                  {query.trim()}"
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}