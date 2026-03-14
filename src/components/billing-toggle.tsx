"use client";

import type { BillingInterval } from "@/lib/stripe";

interface BillingToggleProps {
  interval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}

export function BillingToggle({
  interval,
  onIntervalChange,
}: BillingToggleProps) {
  const isYearly = interval === "year";

  return (
    <div className="flex items-center justify-center gap-5">
      {/* Monthly */}
      <div className="text-center min-w-[80px]">
        <p
          className={`text-lg font-bold transition-colors ${
            !isYearly ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monthly
        </p>
        <p className="text-sm font-semibold text-amber-500">$99/mo</p>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        aria-label="Toggle billing interval"
        onClick={() => onIntervalChange(isYearly ? "month" : "year")}
        className="relative inline-flex h-9 w-16 shrink-0 items-center rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <span
          className={`inline-block h-7 w-7 rounded-full bg-emerald-500 shadow-md transition-transform duration-200 ${
            isYearly ? "translate-x-8" : "translate-x-1"
          }`}
        />
      </button>

      {/* Yearly */}
      <div className="text-center min-w-[80px] relative">
        <p
          className={`text-lg font-bold transition-colors ${
            isYearly ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Yearly
        </p>
        <p className="text-sm font-semibold text-amber-500 italic">
          Save $189
        </p>
        {/* Arrow pointing to Yearly */}
        <svg
          className="absolute -top-7 -right-8 w-8 h-8 text-amber-500"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 4C26 6 16 12 18 26"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M13 21L18 28L23 21"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
