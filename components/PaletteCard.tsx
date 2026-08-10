"use client";
import { useState } from "react";
import type { RenderPalette } from "@/lib/colors";
import { DEFAULT_SAMPLE, DEFAULT_SAMPLE_EN, type TopicSample } from "@/lib/topics";
import { getDict, type Lang } from "@/lib/i18n";

export default function PaletteCard({ p, number, sample, lang = "fa" }: { p: RenderPalette; number: number; sample?: TopicSample; lang?: Lang }) {
  const r = p.render;
  const t = getDict(lang);
  const sm = sample ?? (lang === "en" ? DEFAULT_SAMPLE_EN : DEFAULT_SAMPLE);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
    });
  };

  const nums = lang === "en" ? ["500", "700", "900"] : ["۵۰۰", "۷۰۰", "۹۰۰"];
  const swLabels = p.dark
    ? [t.swBrand, t.swBg, t.swSurface, t.swAccent, t.swLight]
    : [nums[0], nums[1], nums[2], t.swAccent, t.swSurface];

  // قابِ متضاد: پالت روشن → قاب تیره، پالت دارک → قاب روشن
  const frameDark = !p.dark;
  const frameBg = frameDark ? "#14141F" : "#ECECF2";
  const frameText = frameDark ? "text-white" : "text-slate-800";
  const frameSub = frameDark ? "text-white/50" : "text-slate-500";
  const badgeCls = frameDark ? "bg-white/12 text-white" : "bg-black/8 text-slate-700";

  return (
    <div className="rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1"
         style={{ background: frameBg }}>
      {/* هدرِ قاب: تگ روشن/دارک + شماره */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeCls}`}>
          {p.dark ? t.tagDark : t.tagLight}
        </span>
        <span className={`text-sm font-black ${frameText}`} dir="ltr">#{number}</span>
      </div>

      {/* بلوکِ پیش‌نمایش (داخل قاب) */}
      <div className="overflow-hidden rounded-xl">
        <div className="px-4 pb-4 pt-4 text-white"
             style={{ background: `linear-gradient(135deg, ${r.bannerFrom}, ${r.bannerTo})` }}>
          <h2 className="text-[17px] font-extrabold">{p.name}</h2>
          <p className="mt-0.5 text-xs opacity-85">{p.subtitle}</p>
        </div>

        <div className="flex h-11">
          {r.swatches.map((s, i) => (
            <button key={i} type="button" onClick={() => copy(s.hex)} title={`${s.hex}`}
                    className="relative flex flex-1 items-end justify-center pb-1 text-[9px] transition hover:opacity-90"
                    style={{ background: s.hex, color: s.ink }}>
              {copied === s.hex ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-black shadow"
                        style={{ background: s.ink, color: s.hex }}>✓</span>
                </span>
              ) : (
                swLabels[i]
              )}
            </button>
          ))}
        </div>

        <div className="p-4" style={{ background: r.mockBg }}>
          <div className="mb-3 flex items-center gap-3.5 border-b pb-3 text-[13px]" style={{ borderColor: r.navBorder }}>
            <span className="font-extrabold" style={{ color: r.logo }}>{sm.brand}</span>
            <span className="font-bold" style={{ color: r.navActive }}>{t.cardNav[0]}</span>
            <span style={{ color: r.navMuted }}>{t.cardNav[1]}</span>
            <span style={{ color: r.navMuted }}>{t.cardNav[2]}</span>
          </div>

          <div className="rounded-xl border p-3.5" style={{ background: r.innerBg, borderColor: r.innerBorder }}>
            <h3 className="text-sm font-bold" style={{ color: r.heading }}>{sm.title}</h3>
            <p className="mt-1 text-xs" style={{ color: r.body }}>
              {sm.body}{" "}
              <a className="font-semibold" style={{ color: r.link }}>{t.more}</a>
            </p>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <button type="button" className="rounded-[10px] px-4 py-2 text-[13px] font-bold"
                    style={{ background: r.btnPrimaryBg, color: r.btnPrimaryText }}>{t.btnPrimary}</button>
            <button type="button" className="rounded-[10px] px-4 py-2 text-[13px] font-bold"
                    style={{ background: r.btnAccentBg, color: r.btnAccentText }}>{t.btnAccent}</button>
            <button type="button" className="rounded-[10px] border-[1.5px] bg-transparent px-4 py-2 text-[13px] font-bold"
                    style={{ color: r.btnGhostText, borderColor: r.btnGhostBorder }}>{t.btnGhost}</button>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2">
            <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: r.chipTintBg, color: r.chipTintText }}>{t.chipTag}</span>
            <span className="rounded-full px-2.5 py-1 text-[11px]" style={{ background: r.chipAccentBg, color: r.chipAccentText }}>{t.chipComp}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] text-emerald-700">{t.chipActive}</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5 px-1" dir="ltr">
        {p.hexList.map((hex) => (
          <button key={hex} type="button" onClick={() => copy(hex)} title="copy"
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10.5px] transition ${frameDark ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-black/5 text-slate-600 hover:bg-black/10"}`}>
            {copied === hex ? t.copied : hex}
          </button>
        ))}
      </div>
      <p className={`mt-1.5 px-1 text-[10px] ${frameSub}`}>{frameDark ? t.captionLightFrame : t.captionDarkFrame}</p>
    </div>
  );
}
