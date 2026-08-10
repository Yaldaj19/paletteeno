"use client";
import { useState } from "react";
import type { RenderPalette } from "@/lib/colors";

// کارت فشرده‌ی اسلایدر با کدهای رنگیِ قابل‌کپی. margin راست برای حلقه‌ی بی‌پرش.
export default function MarqueeCard({ p }: { p: RenderPalette }) {
  const r = p.render;
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
    });
  };

  return (
    <div className="w-56 shrink-0 overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-1 ring-black/5" dir="ltr">
      <div className="px-3 py-2.5 text-white" style={{ background: `linear-gradient(135deg, ${r.bannerFrom}, ${r.bannerTo})` }}>
        <div className="text-[13px] font-bold" dir="auto">{p.name}</div>
        <div className="mt-0.5 text-[10px] opacity-80">{p.dark ? "Dark" : "Light"}</div>
      </div>

      <div className="flex h-8">
        {r.swatches.map((s, i) => (
          <button key={i} type="button" onClick={() => copy(s.hex)} title={s.hex}
                  className="relative flex-1 transition hover:brightness-110" style={{ background: s.hex }}>
            {copied === s.hex && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: s.ink }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* کدهای رنگی — قابل کلیک/کپی */}
      <div className="flex flex-wrap gap-1 p-2.5" style={{ background: r.mockBg }}>
        {p.hexList.map((hex) => (
          <button key={hex} type="button" onClick={() => copy(hex)} title="copy"
                  className="rounded-md px-1.5 py-0.5 font-mono text-[10px] transition"
                  style={{ background: r.chipTintBg, color: r.chipTintText }}>
            {copied === hex ? "✓" : hex}
          </button>
        ))}
      </div>
    </div>
  );
}
