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

function pickBases(): string[] {
  const p = [...POOL].sort(() => Math.random() - 0.5).slice(0, 12);
  return p;
}

export default function SuggestedSlider({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [bases, setBases] = useState<string[] | null>(null);

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

  const palettes = bases ? weeklySuggestions(bases, lang) : [];
  if (!palettes.length) return null;
  const loop = [...palettes, ...palettes];

  return (
    <section id="suggested" aria-label={t.suggestedTitle} className="scroll-mt-6 py-14">
      <h2 className="t-strong mb-7 px-4 text-center text-2xl font-black">{t.suggestedTitle}</h2>
      <div className="marquee" style={{ ["--marquee-dur" as string]: "75s" }}>
        <div className="marquee-track" dir="ltr">
          {loop.map((p, i) => <MarqueeCard key={i} p={p} />)}
        </div>
      </div>
    </section>
  );
}
