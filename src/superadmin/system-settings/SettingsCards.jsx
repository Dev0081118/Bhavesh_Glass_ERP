import { Sun, Moon, FileText, Loader2, Save } from "lucide-react";

const AppearanceCard = ({ theme, onSelect, saving }) => {
  const options = [
    {
      value: "light",
      icon: Sun,
      title: "Light Mode",
      description: "Clean bright interface",
    },
    {
      value: "dark",
      icon: Moon,
      title: "Dark Mode",
      description: "Comfortable low-light interface",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
        <Sun size={18} className="text-slate-500" />
        Appearance
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Manage how the ERP looks. Applied across the whole system.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {options.map(({ value, icon: Icon, title, description }) => {
          const isActive = theme === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              disabled={saving}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99] disabled:cursor-not-allowed ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-950 hover:border-slate-400"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isActive ? "bg-white/15" : "bg-slate-100"
                }`}
              >
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{title}</span>
                <span
                  className={`mt-0.5 block text-xs ${
                    isActive ? "text-white/70" : "text-slate-500"
                  }`}
                >
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const TermsCard = ({ terms, onChange, onSave, saving, max }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
      <FileText size={18} className="text-slate-500" />
      Terms &amp; Conditions
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Default billing terms copied onto every new sale bill.
    </p>

    <textarea
      value={terms}
      onChange={(event) => onChange(event.target.value.slice(0, max))}
      rows={7}
      placeholder="Enter the default billing terms and conditions..."
      className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/5"
    />

    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs tabular-nums text-slate-400">
        {terms.length} / {max} characters
      </span>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Save Billing Settings
      </button>
    </div>
  </section>
);

export { AppearanceCard, TermsCard };