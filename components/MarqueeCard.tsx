"use client";
import type { RenderPalette } from "@/lib/colors";

// کارت فشرده و زبان‌خنثیِ اسلایدر پیشنهادی (بدون متنِ SEO).
export default function MarqueeCard({ p }: { p: RenderPalette }) {
  const r = p.render;
  return (
    <div className="w-56 shrink-0 overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] ring-1 ring-black/5">
      <div className="px-3 py-2.5 text-white" style={{ background: `linear-gradient(135deg, ${r.bannerFrom}, ${r.bannerTo})` }}>
        <div className="text-[13px] font-bold">{p.name}</div>
        <div className="mt-0.5 text-[10px] opacity-80">{p.dark ? "Dark" : "Light"}</div>
      </div>

      <div className="flex h-8">
        {r.swatches.map((s, i) => (
          <div key={i} className="flex-1" style={{ background: s.hex }} />
        ))}
      </div>

      <div className="p-3" style={{ background: r.mockBg }}>
        <div className="rounded-lg border p-2" style={{ background: r.innerBg, borderColor: r.innerBorder }}>
          <div className="h-2 w-2/3 rounded" style={{ background: r.heading, opacity: 0.85 }} />
          <div className="mt-1.5 h-2 w-1/2 rounded" style={{ background: r.body, opacity: 0.5 }} />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="h-5 flex-1 rounded-md" style={{ background: r.btnPrimaryBg }} />
          <span className="h-5 w-9 rounded-md" style={{ background: r.btnAccentBg }} />
          <span className="h-5 w-5 rounded-full" style={{ background: r.chipTintBg }} />
        </div>
      </div>
    </div>
  );
}
