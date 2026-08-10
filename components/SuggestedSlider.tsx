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

  const palettes = weeklySuggestions(bases, lang);
  if (!palettes.length) return null;

  return (
    <section id="suggested" aria-label={t.suggestedTitle} className="scroll-mt-6 py-14">
      <h2 className="t-strong mb-7 px-4 text-center text-2xl font-black">{t.suggestedTitle}</h2>
      <div className="marquee" dir="ltr" style={{ ["--marquee-dur" as string]: "75s" }}>
        <div className="marquee-group">
          {palettes.map((p, i) => <MarqueeCard key={"a" + i} p={p} />)}
        </div>
        <div className="marquee-group" aria-hidden="true">
          {palettes.map((p, i) => <MarqueeCard key={"b" + i} p={p} />)}
        </div>
      </div>
    </section>
  );
}
