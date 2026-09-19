import { ArrowRight, Sparkles } from "lucide-react";

function ComingSoon({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  Icon = Sparkles,
}) {
  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
        <div className="w-full max-w-2xl text-center">

          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Icon
              size={36}
              strokeWidth={1.7}
              className="text-slate-800"
            />
          </div>

          {/* Badge */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

            <span className="text-xs font-medium text-slate-600">
              Under Development
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
            {description}
          </p>

          {/* Coming Soon Button */}
          <div className="mt-10">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
              Coming Soon
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-xs text-slate-400">
            This module will be available in a future update.
          </p>

        </div>
      </div>
    </div>
  );
}

export default ComingSoon;

