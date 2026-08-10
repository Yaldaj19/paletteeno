"use client";
import { useEffect, useMemo, useState } from "react";
import type { RenderPalette } from "@/lib/colors";
import PaletteCard from "@/components/PaletteCard";
import { TOPICS, sampleFor, labelFor, type TopicSample } from "@/lib/topics";
import { getDict, type Lang } from "@/lib/i18n";

const MODERN_BASES = ["#7C3AED", "#0EA5E9", "#F43F5E", "#10B981", "#F59E0B", "#6366F1", "#EC4899", "#14B8A6", "#A47864", "#8B5CF6", "#0D9488", "#E11D48", "#DB2777", "#22C55E", "#F97316"];

interface Batch {
  id: number;
  title: string;
  engine: string;
  note?: string;
  site?: { ok: boolean; title: string; colors: string[]; error?: string } | null;
  palettes: RenderPalette[];
  startNumber: number;
  samples: TopicSample[];
  lang: Lang;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("fa");
  const t = getDict(lang);

  // فرم اصلی
  const [colorInput, setColorInput] = useState("");
  const [hex, setHex] = useState("#7C3AED");
  const [useHex, setUseHex] = useState(false);
  const [description, setDescription] = useState("");
  const [topicKeys, setTopicKeys] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // نتایج (تاریخچه)
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchSeq, setBatchSeq] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  // بازآفرینی / ترکیب
  const [refineMode, setRefineMode] = useState<"new" | "variations" | "combine">("new");
  const [lastBase, setLastBase] = useState("");
  const [refineNum, setRefineNum] = useState("");
  const [combineNums, setCombineNums] = useState<number[]>([]);
  const [combineInput, setCombineInput] = useState("");
  const [refineDesc, setRefineDesc] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState("");

  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "en" || saved === "fa") setLang(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    try { localStorage.setItem("lang", lang); } catch {}
  }, [lang, t.dir]);

  const flat = useMemo(() => batches.flatMap((b) => b.palettes), [batches]);
  const total = flat.length;
  const currentSamples = useMemo(() => {
    const s = topicKeys.map((k) => sampleFor(TOPICS.find((tt) => tt.key === k), lang));
    return s.length ? s : [sampleFor(undefined, lang)];
  }, [topicKeys, lang]);
  const topicLabels = useMemo(
    () => topicKeys.map((k) => { const tt = TOPICS.find((x) => x.key === k); return tt ? labelFor(tt, lang) : ""; }).filter(Boolean).join("، "),
    [topicKeys, lang]
  );

  const toggleTopic = (key: string) =>
    setTopicKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : prev.length < 2 ? [...prev, key] : prev));

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setNavOpen(false);
  };

  const seedOf = (n: number) => {
    const p = flat[n - 1];
    if (!p) return null;
    return { primary: p.scale["500"], accent: p.accent };
  };

  async function runGenerate(payload: Record<string, unknown>, title: string, onErr: (m: string) => void, setBusy: (b: boolean) => void) {
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, startIndex: total, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const id = batchSeq + 1;
      setBatchSeq(id);
      setBatches((prev) => [
        ...prev,
        { id, title, engine: data.engine, note: data.note, site: data.site, palettes: data.palettes || [], startNumber: prev.reduce((s, b) => s + b.palettes.length, 0), samples: currentSamples, lang },
      ]);
    } catch (e) {
      onErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function effectiveDesc(extra = "") {
    return [description.trim(), topicLabels ? `${t.topicPrefix}: ${topicLabels}` : "", extra.trim()].filter(Boolean).join(" — ");
  }

  function generate() {
    setError("");
    const colorValue = useHex ? hex : colorInput.trim();
    const cleanUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (!colorValue && !description.trim() && !topicLabels && !cleanUrls.length) { setError(t.errNeed); return; }
    const title = colorValue ? t.titleColor(colorValue) : topicLabels ? t.titleTopic(topicLabels) : description.trim() ? t.titleByDesc : t.titleBySite;
    runGenerate({ colorInput: colorValue, description: effectiveDesc(), urls: cleanUrls, mode: "fresh" }, title, setError, setLoading);
  }

  function doNewPalettes() {
    setRefineError("");
    const pool = MODERN_BASES.filter((c) => c !== lastBase);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setLastBase(pick);
    runGenerate({ colorInput: pick, description: effectiveDesc(refineDesc), mode: "fresh" }, t.titleNew, setRefineError, setRefineLoading);
  }

  function doTopicSuggest() {
    setError("");
    // اگر کاربر رنگ ست کرده، همان رنگ اولویت دارد (نه پیشنهاد خودکار)
    if (useHex || colorInput.trim()) { generate(); return; }
    const colors = [...new Set(topicKeys.flatMap((k) => TOPICS.find((tt) => tt.key === k)?.colors ?? []))];
    if (!colors.length) { setError(t.errTopic); return; }
    runGenerate({ mode: "topic", topicColors: colors, description: effectiveDesc() }, t.titleTopic(topicLabels), setError, setLoading);
  }

  function doVariations() {
    setRefineError("");
    const n = parseInt(refineNum, 10);
    if (!n || n < 1 || n > total) { setRefineError(t.errRange(total)); return; }
    const seed = seedOf(n);
    if (!seed) { setRefineError(t.errRange(total)); return; }
    runGenerate({ mode: "variations", seeds: [seed], description: effectiveDesc(refineDesc) }, t.titleVariations(n), setRefineError, setRefineLoading);
  }

  function doCombine() {
    setRefineError("");
    if (combineNums.length < 2) { setRefineError(t.errCombine); return; }
    const seeds = combineNums.map(seedOf).filter(Boolean) as { primary: string; accent: string }[];
    if (seeds.length < 2) { setRefineError(t.errCombine); return; }
    runGenerate({ mode: "combine", seeds, description: effectiveDesc(refineDesc) }, t.titleCombine(combineNums.map((n) => "#" + n).join("، ")), setRefineError, setRefineLoading);
  }

  function addCombineNum(raw: string) {
    const n = parseInt(raw, 10);
    if (n && n >= 1 && n <= total && !combineNums.includes(n)) setCombineNums((p) => [...p, n]);
    setCombineInput("");
  }

  const setUrl = (i: number, v: string) => setUrls((p) => p.map((u, idx) => (idx === i ? v : u)));
  const addUrl = () => setUrls((p) => [...p, ""]);
  const removeUrl = (i: number) => setUrls((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));

  const hasColor = useHex || colorInput.trim().length > 0;
  const floatSide = lang === "en" ? "left-6 items-start" : "right-6 items-end";

  return (
    <div dir={t.dir}>
      {/* ===================== هیرو ===================== */}
      <section id="top" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 pt-8 pb-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] blur-[80px] animate-[aurora1_12s_ease-in-out_infinite_alternate]"
               style={{ background: "radial-gradient(ellipse at center, #7C3AED88 0%, transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] blur-[70px] animate-[aurora2_15s_ease-in-out_infinite_alternate]"
               style={{ background: "radial-gradient(ellipse at center, #06B6D466 0%, transparent 70%)" }} />
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[460px] blur-[100px] animate-[aurora3_18s_ease-in-out_infinite_alternate]"
               style={{ background: "radial-gradient(ellipse at center, #F43F5E55 0%, transparent 70%)" }} />
          <div className="absolute left-1/3 top-16 h-[320px] w-[320px] blur-[70px] animate-[aurora1_20s_ease-in-out_3s_infinite_alternate]"
               style={{ background: "radial-gradient(ellipse at center, #F59E0B44 0%, transparent 70%)" }} />
          <div className="noise-layer absolute inset-0 opacity-[0.04]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-sm text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {t.heroBadge}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-paletteeno.webp" alt={t.brandDot} className="mx-auto h-20 w-auto drop-shadow-[0_4px_24px_rgba(124,58,237,0.4)] md:h-28" />
          <h1 className="sr-only">{t.brandDot}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
            {t.heroTagline}
          </p>

          {/* فرم شیشه‌ای */}
          <div className={`mt-9 rounded-3xl border border-white/12 bg-white/8 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-[20px] md:p-6 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
            <div className="mb-4 flex items-center gap-2 text-sm">
              <button type="button" onClick={() => setUseHex(false)}
                      className={`rounded-lg px-3 py-1.5 font-bold transition ${!useHex ? "bg-violet-600 text-white" : "bg-white/8 text-white/60 hover:text-white"}`}>
                {t.tabName}
              </button>
              <button type="button" onClick={() => setUseHex(true)}
                      className={`rounded-lg px-3 py-1.5 font-bold transition ${useHex ? "bg-violet-600 text-white" : "bg-white/8 text-white/60 hover:text-white"}`}>
                {t.tabPick}
              </button>
            </div>

            {!useHex ? (
              <div>
                <input value={colorInput} onChange={(e) => setColorInput(e.target.value)}
                       onKeyDown={(e) => e.key === "Enter" && generate()} placeholder={t.namePlaceholder}
                       className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/50" />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {t.suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => setColorInput(s)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-violet-400/40 hover:text-white">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input type="color" value={hex} onChange={(e) => setHex(e.target.value.toUpperCase())}
                       className="h-12 w-14 cursor-pointer rounded-xl border-2 border-white/20 bg-transparent p-1" />
                <input value={hex} onChange={(e) => setHex(e.target.value.toUpperCase())} dir="ltr"
                       className="w-32 rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-violet-500/40" />
                <span className="text-sm text-white/40">{t.pickBaseHint}</span>
              </div>
            )}

            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs leading-relaxed text-white/55">
              {t.guide}
            </p>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder={t.descPlaceholder}
                      className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/40" />

            {/* دکمه‌های موضوع */}
            <div className={`mt-3 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
              <p className="mb-2 text-xs text-white/45">{t.topicIntro}</p>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((tt) => {
                  const on = topicKeys.includes(tt.key);
                  const disabled = !on && topicKeys.length >= 2;
                  return (
                    <button key={tt.key} type="button" onClick={() => toggleTopic(tt.key)} disabled={disabled}
                            className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-fuchsia-400/60 bg-fuchsia-500/25 text-white" : disabled ? "cursor-not-allowed border-white/5 bg-white/5 text-white/25" : "border-white/10 bg-white/5 text-white/60 hover:border-fuchsia-400/40 hover:text-white"}`}>
                      {on ? "✓ " : ""}{labelFor(tt, lang)}
                    </button>
                  );
                })}
              </div>
              {topicKeys.length > 0 && !hasColor && (
                <button type="button" onClick={doTopicSuggest} disabled={loading}
                        className="mt-2.5 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-xs font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/25 disabled:opacity-60">
                  {t.topicAuto}
                </button>
              )}
            </div>

            {/* آدرس سایت‌ها */}
            <div className={`mt-4 ${t.dir === "rtl" ? "text-right" : "text-left"}`}>
              <p className="mb-2 text-xs text-white/45">{t.urlLabel}</p>
              <div className="space-y-2">
                {urls.map((u, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={u} onChange={(e) => setUrl(i, e.target.value)} dir="ltr" placeholder="https://example.com"
                           className="flex-1 rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/40" />
                    {urls.length > 1 && (
                      <button type="button" onClick={() => removeUrl(i)} className="rounded-lg bg-white/8 px-3 text-white/60 transition hover:text-white">×</button>
                    )}
                  </div>
                ))}
              </div>
              {urls.length < 3 && (
                <button type="button" onClick={addUrl} className="mt-2 text-xs font-semibold text-cyan-300 hover:underline">{t.addUrl}</button>
              )}
            </div>

            {error && <p className="mt-3 rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{error}</p>}

            <button type="button" onClick={generate} disabled={loading}
                    className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,#7C3AED,#4F46E5)] py-3.5 text-sm font-black text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition active:scale-[0.98] hover:opacity-95 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
              {loading ? t.building : t.build}
            </button>
          </div>
        </div>
      </section>

      {/* ===================== نتایج (تاریخچه) ===================== */}
      {batches.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-10">
          {batches.map((b) => (
            <div key={b.id} id={`batch-${b.id}`} className="mb-12 scroll-mt-6">
              <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-white/10 pb-3">
                <h2 className="text-lg font-black text-white">{b.title}</h2>
                <span className="text-[11px] text-white/40" dir="ltr">#{b.startNumber + 1}–#{b.startNumber + b.palettes.length}</span>
                {b.site?.ok && b.site.colors.length > 0 && (
                  <span className="text-[11px] text-white/40" dir="ltr">{t.siteLabel}: {b.site.colors.slice(0, 4).join(" · ")}</span>
                )}
                {b.note && <span className="text-[11px] text-amber-300/80">{b.note}</span>}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {b.palettes.map((p, i) => (
                  <PaletteCard key={b.id + "-" + i} p={p} number={b.startNumber + i + 1} sample={b.samples[i % b.samples.length]} lang={b.lang} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===================== بازآفرینی / ترکیب ===================== */}
      {total > 0 && (
        <section id="refine" className="scroll-mt-6 px-4 pb-16">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(6,182,212,0.12))] p-6 md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-white">{t.refineTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{t.refineDesc}</p>
            </div>

            <div className="mx-auto mb-6 flex max-w-lg gap-2 rounded-xl bg-white/6 p-1">
              <button type="button" onClick={() => setRefineMode("new")}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition sm:text-sm ${refineMode === "new" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"}`}>
                {t.tabNew}
              </button>
              <button type="button" onClick={() => setRefineMode("variations")}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition sm:text-sm ${refineMode === "variations" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"}`}>
                {t.tabVariations}
              </button>
              <button type="button" onClick={() => setRefineMode("combine")}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition sm:text-sm ${refineMode === "combine" ? "bg-violet-600 text-white" : "text-white/50 hover:text-white/80"}`}>
                {t.tabCombine}
              </button>
            </div>

            {refineMode === "new" ? (
              <div className="text-center">
                <p className="mx-auto mb-4 max-w-md text-sm text-white/55">{t.newDesc}</p>
                <button type="button" onClick={doNewPalettes} disabled={refineLoading}
                        className="w-full rounded-xl bg-[linear-gradient(135deg,#10B981,#4F46E5)] py-3 font-bold text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition active:scale-95 hover:opacity-90 disabled:opacity-60">
                  {refineLoading ? "…" : t.newBtn}
                </button>
              </div>
            ) : refineMode === "variations" ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input type="number" min={1} max={total} value={refineNum} onChange={(e) => setRefineNum(e.target.value)} placeholder={t.varPlaceholder(total)}
                       className="flex-1 rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center text-lg font-bold text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-violet-500/60" />
                <button type="button" onClick={doVariations} disabled={refineLoading}
                        className="rounded-xl bg-[linear-gradient(135deg,#06B6D4,#4F46E5)] px-6 py-3 font-bold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition active:scale-95 hover:opacity-90 disabled:opacity-60">
                  {refineLoading ? "…" : t.make}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/6 p-3">
                  {combineNums.map((n) => (
                    <span key={n} className="flex items-center gap-1 rounded-lg bg-violet-600/40 px-2 py-1 text-sm text-white">
                      #{n}
                      <button type="button" onClick={() => setCombineNums((p) => p.filter((x) => x !== n))} className="text-white/60 hover:text-white">×</button>
                    </span>
                  ))}
                  <input type="number" min={1} max={total} value={combineInput}
                         onChange={(e) => setCombineInput(e.target.value)}
                         onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCombineNum(combineInput); } }}
                         onBlur={() => combineInput && addCombineNum(combineInput)} placeholder={t.addNumber}
                         className="w-20 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
                </div>
                <button type="button" onClick={doCombine} disabled={refineLoading}
                        className="mt-3 w-full rounded-xl bg-[linear-gradient(135deg,#F43F5E,#7C3AED)] py-3 font-bold text-white transition active:scale-95 hover:opacity-90 disabled:opacity-60">
                  {refineLoading ? "…" : t.combineBtn}
                </button>
              </div>
            )}

            <input value={refineDesc} onChange={(e) => setRefineDesc(e.target.value)} placeholder={t.refineDescPlaceholder}
                   className="mt-3 w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-cyan-500/40" />

            {refineError && <p className="mt-3 rounded-lg bg-rose-500/15 px-3 py-2 text-center text-sm text-rose-300">{refineError}</p>}
          </div>
        </section>
      )}

      {/* ===================== سوییچر زبان + CTA شناور (پایین، هم‌سو با زبان) ===================== */}
      <div className={`fixed bottom-6 z-50 flex flex-col gap-3 ${floatSide}`}>
        {/* کادر ناوبری */}
        {navOpen && batches.length > 0 && (
          <div className={`max-h-[55vh] w-64 overflow-y-auto rounded-2xl border border-white/12 bg-[#14141F]/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl ${lang === "en" ? "text-left" : "text-right"}`}>
            <button type="button" onClick={() => scrollTo("top")}
                    className="mb-1 w-full rounded-xl bg-[linear-gradient(135deg,#7C3AED,#4F46E5)] px-3 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
              {t.navFromStart}
            </button>
            <div className="my-1 px-2 text-[11px] text-white/40">{t.navSections}</div>
            {batches.map((b) => (
              <button key={b.id} type="button" onClick={() => scrollTo(`batch-${b.id}`)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs text-white/70 transition hover:bg-white/8 hover:text-white">
                <span className="truncate">{b.title}</span>
                <span className="shrink-0 text-white/30" dir="ltr">#{b.startNumber + 1}</span>
              </button>
            ))}
            <button type="button" onClick={() => scrollTo("refine")}
                    className="mt-1 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-white/8">
              {t.navRefine}
            </button>
          </div>
        )}

        {/* سوییچر زبان — همیشه نمایان */}
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#14141F]/80 p-1 text-xs shadow-lg backdrop-blur-md">
          <span className="px-1 text-white/40">🌐</span>
          <button type="button" onClick={() => setLang("fa")}
                  className={`rounded-full px-2.5 py-1 font-bold transition ${lang === "fa" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"}`}>فا</button>
          <button type="button" onClick={() => setLang("en")}
                  className={`rounded-full px-2.5 py-1 font-bold transition ${lang === "en" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"}`}>EN</button>
        </div>

        {/* دکمه‌ی FAB */}
        {batches.length > 0 && (
          <div className="relative h-14 w-14">
            <div className="pointer-events-none absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#F43F5E,#F59E0B,#10B981,#06B6D4,#7C3AED,#EC4899,#F43F5E)] animate-[spin360_4s_linear_infinite]" />
            {!navOpen && <div className="pointer-events-none absolute -inset-1 rounded-full bg-fuchsia-500/40 blur-xl animate-[haloPulse_2s_ease-in-out_infinite]" />}
            <button type="button" onClick={() => setNavOpen((o) => !o)} aria-label="menu"
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#14141F] text-2xl text-white shadow-[0_8px_30px_rgba(124,58,237,0.5)] transition active:scale-95">
              {navOpen ? "✕" : "✦"}
            </button>
          </div>
        )}
      </div>

      {/* ===================== فوتر ===================== */}
      <footer className="border-t border-white/8 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xl font-black tracking-tight text-white/80">
              {t.brandDot}<span className="text-violet-400">.</span>
            </span>
            <p className="mt-1 text-xs text-white/35">
              <span dir="ltr">© {new Date().getFullYear()}</span> {t.rights}
            </p>
          </div>
          <p className="text-sm text-white/35">
            {t.footerCredit}{" "}
            <a href="https://yaldajahanshahi.ir" target="_blank" rel="noopener noreferrer"
               className="font-bold text-white/60 underline underline-offset-2 transition-colors hover:text-violet-400">
              YJ19
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
