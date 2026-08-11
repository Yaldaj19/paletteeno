"use client";
import { useState } from "react";
import { getDict, type Lang } from "@/lib/i18n";
import { type GradientDef, gradientCss, gradientCodes } from "@/lib/gradients";

// کارت گرادینت: پیش‌نمایش زنده + کپیِ کدها در ۴ فرمت (CSS / Tailwind / SCSS / استاپ‌ها).
export default function GradientCard({ g, angle, lang = "fa" }: { g: GradientDef; angle: number; lang?: Lang }) {
  const t = getDict(lang);
  const codes = gradientCodes(g, angle);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
    });
  };

  // قابِ متضاد: گرادینتِ روشن → قاب تیره، دارک → قاب روشن.
  const frameDark = !g.dark;
  const frameBg = frameDark ? "#14141F" : "#ECECF2";
  const frameText = frameDark ? "text-white" : "text-slate-800";
  const chipCls = frameDark ? "bg-white/10 text-white/80 hover:bg-white/20" : "bg-black/5 text-slate-700 hover:bg-black/10";

  const formats: [string, string][] = [
    ["CSS", codes.css],
    ["Tailwind", codes.tailwind],
    ["SCSS", codes.scss],
    [lang === "en" ? "Stops" : "کدها", codes.stops],
  ];

  return (
    <div className="rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1"
         style={{ background: frameBg }}>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${frameDark ? "bg-white/12 text-white" : "bg-black/8 text-slate-700"}`}>
          {g.dark ? t.tagDark : t.tagLight}
        </span>
        <span className={`text-sm font-black ${frameText}`}>{g.name[lang]}</span>
      </div>

      <div className="flex h-28 items-end overflow-hidden rounded-xl p-3"
           style={{ background: gradientCss(g, angle), color: g.ink }}>
        <span className="font-mono text-[11px] opacity-90" dir="ltr">{angle}° · {g.stops.join(" → ")}</span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {formats.map(([label, val]) => (
          <button key={label} type="button" onClick={() => copy(label, val)} title={val}
                  className={`truncate rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${chipCls}`}>
            {copied === label ? t.copied : label}
          </button>
        ))}
      </div>
    </div>
  );
}
