// import { Scan } from "lucide-react";

// const SystemSettingsHeader = () => (
//   <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
//     <div>
//       <div className="mb-2 flex items-center gap-2">
//         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
//           <Scan size={17} className="text-white" />
//         </div>
//         <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
//           Super Admin
//         </span>
//       </div>

//       <h1  className="text-2xl font-semibold  tracking-tight text-slate-950 sm:text-3xl">
//         System Settings
//       </h1>

//       <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
//         Manage the ERP appearance, the company stamp / signature used on
//         bills and the default billing terms &amp; conditions.
//       </p>
//     </div>
//   </div>
// );

// export default SystemSettingsHeader;
import { Scan } from "lucide-react";

const SystemSettingsHeader = () => (
  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-[#e2e8f0]">
          <Scan
            size={17}
            className="text-white dark:text-[#0f172a]"
          />
        </div>

        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-[#94a3b8]">
          Super Admin
        </span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-[#f8fafc] sm:text-3xl">
        System Settings
      </h1>

      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#94a3b8]">
        Manage the ERP appearance, the company stamp / signature used on
        bills and the default billing terms &amp; conditions.
      </p>
    </div>
  </div>
);

export default SystemSettingsHeader;