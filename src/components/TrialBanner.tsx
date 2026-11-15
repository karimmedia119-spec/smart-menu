"use client";

import React, { useState, useEffect } from "react";
import { TenantSettings } from "../types";
import { Sparkles, Clock, ArrowRight, ShieldCheck, X } from "lucide-react";

interface TrialBannerProps {
  tenant: TenantSettings;
  onUpgradeClick?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ tenant, onUpgradeClick }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const expiry = new Date(tenant.subscriptionExpiry).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [tenant.subscriptionExpiry]);

  if (tenant.subscriptionStatus !== "trial" || isDismissed || !timeLeft) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-warm-accent text-white px-4 py-2 text-xs shadow-sm relative z-40 animate-fadeIn">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </span>
          <div className="font-bold flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
            <span>فترة التجربة المجانية (7 أيام):</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-mono text-[11px] font-black flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-200 inline" />
              <span>
                متبقي {timeLeft.days} يوم و {timeLeft.hours} ساعة
              </span>
            </span>
            <span className="text-amber-100 font-normal hidden md:inline">
              • استمتع بكافة ميزات الصالة والكاشير ومحطة التجهيز السحابية بدون قيود.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onUpgradeClick}
            className="px-3 py-1 rounded-xl bg-white text-warm-accent hover:bg-amber-50 font-extrabold text-[11px] transition-all shadow-xs flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>تثبيت وترقية الاشتراك</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
            title="إخفاء مؤقت"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
