"use client";
import { useEffect, useState } from "react";
import { weeklySuggestions } from "@/lib/engine";
import { getDict, type Lang } from "@/lib/i18n";
import MarqueeCard from "./MarqueeCard";

// ۱۲ رنگ پایه‌ی مدرن؛ هر هفته ۱۲ تای تصادفی انتخاب می‌شود (۲۴ کارت = روشن+دارک).
const POOL = [
  "#7C3AED", "#4F46E5", "#2563EB", "#0EA5E9", "#06B6D4", "#14B8A6",
  "#10B981", "#22C55E", "#65A30D", "#EAB308", "#F59E0B", "#F97316",
  "#EF4444", "#F43F5E", "#EC4899", "#DB2777", "#A855F7", "#8B5CF6",
  "#0F766E", "#1E3A8A", "#B45309", "#A47864", "#E11D48", "#0D9488",
];
const WEEK = 7 * 24 * 3600 * 1000;
// ست پیش‌فرضِ قطعی — همان اولِ رندر (SSR) نمایش داده می‌شود تا اسلایدر خالی نباشد.
const DEFAULT_BASES = POOL.slice(0, 12);

function pickBases(): string[] {
  return [...POOL].sort(() => Math.random() - 0.5).slice(0, 12);
}

export default function SuggestedSlider({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [bases, setBases] = useState<string[]>(DEFAULT_BASES);

  useEffect(() => {
    let stored: { ts: number; bases: string[] } | null = null;
    try { stored = JSON.parse(localStorage.getItem("suggestedWeek") || "null"); } catch {}
    if (!stored || !Array.isArray(stored.bases) || stored.bases.length !== 12 || Date.now() - stored.ts >= WEEK) {
      const b = pickBases();
      setBases(b);
      try { localStorage.setItem("suggestedWeek", JSON.stringify({ ts: Date.now(), bases: b })); } catch {}
    } else {
      setBases(stored.bases);
    }
  }, []);

  const palettes = weeklySuggestions(bases);
  if (!palettes.length) return null;

  return (
    <section id="suggested" aria-label={t.suggestedTitle} className="scroll-mt-6 py-14">
      {/* عنوانِ تزئین‌شده — ستاره‌های درخشان + خطوطِ محوشونده در دو طرف */}
      <div className="mb-8 flex items-center justify-center gap-3 px-4" dir={t.dir}>
        <span aria-hidden className="hidden h-px w-16 bg-[linear-gradient(to_right,transparent,var(--fg-faint))] sm:block md:w-28" />
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-fuchsia-400 animate-[twinkle_3s_ease-in-out_infinite]" fill="currentColor">
          <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
        </svg>
        <h2 className="text-center text-2xl font-black tracking-tight md:text-3xl">
          <span className="bg-[linear-gradient(120deg,#A78BFA,#60A5FA,#34D399,#FBBF24)] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradientShift_6s_ease_infinite]">
            {t.suggestedTitle}
          </span>
        </h2>
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-cyan-400 animate-[twinkle_3s_ease-in-out_1.5s_infinite]" fill="currentColor">
          <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
        </svg>
        <span aria-hidden className="hidden h-px w-16 bg-[linear-gradient(to_left,transparent,var(--fg-faint))] sm:block md:w-28" />
      </div>
      <div className="marquee" dir="ltr" style={{ ["--marquee-dur" as string]: "75s" }}>
        <div className="marquee-group">
          {palettes.map((p, i) => <MarqueeCard key={"a" + i} p={p} lang={lang} />)}
        </div>
        <div className="marquee-group" aria-hidden="true">
          {palettes.map((p, i) => <MarqueeCard key={"b" + i} p={p} lang={lang} />)}
        </div>
      </div>
    </section>
  );
}
