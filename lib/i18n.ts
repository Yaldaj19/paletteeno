// دوزبانه: فارسی / انگلیسی — دیکشنری کامل UI + نام پالت‌ها
export type Lang = "fa" | "en";

export interface Dict {
  dir: "rtl" | "ltr";
  brandDot: string;
  heroBadge: string;
  heroTagline: string;
  tabName: string;
  tabPick: string;
  tabSolid: string;
  tabGradient: string;
  angleLabel: string;
  namePlaceholder: string;
  pickBaseHint: string;
  suggestions: string[];
  guide: string;
  descPlaceholder: string;
  topicIntro: string;
  topicAuto: string;
  urlLabel: string;
  addUrl: string;
  build: string;
  building: string;
  errNeed: string;
  siteLabel: string;
  refineTitle: string;
  refineDesc: string;
  tabNew: string;
  tabVariations: string;
  tabCombine: string;
  newDesc: string;
  newBtn: string;
  make: string;
  combineBtn: string;
  refineDescPlaceholder: string;
  addNumber: string;
  navFromStart: string;
  navSections: string;
  navRefine: string;
  footerCredit: string;
  rights: string;
  suggestedTitle: string;
  // کارت
  cardNav: [string, string, string];
  cardBrand: string;
  cardTitle: string;
  cardBody: string;
  more: string;
  btnPrimary: string;
  btnAccent: string;
  btnGhost: string;
  chipTag: string;
  chipComp: string;
  chipActive: string;
  swLight: string;
  swDark: string;
  swSurface: string;
  swBrand: string;
  swBg: string;
  swInner: string;
  swAccent: string;
  captionLightFrame: string; // پالت روشن داخل قاب تیره
  captionDarkFrame: string;
  tagLight: string;
  tagDark: string;
  copied: string;
  // با آرگومان
  varPlaceholder: (total: number) => string;
  errRange: (total: number) => string;
  errCombine: string;
  errTopic: string;
  titleColor: (v: string) => string;
  titleTopic: (labels: string) => string;
  titleByDesc: string;
  titleBySite: string;
  titleNew: string;
  titleVariations: (n: number) => string;
  titleCombine: (list: string) => string;
  topicPrefix: string;
}

const fa: Dict = {
  dir: "rtl",
  brandDot: "پالتینو",
  heroBadge: "سیستم دیزاین اتوماتیک پلت رنگی",
  heroTagline: "از یک رنگ، اسم یا موضوع شروع کن؛ شش پالتِ هماهنگ با رنگ‌های مکمل تحویل بگیر — سه روشن و سه دارک، هماهنگ با استانداردهای طراحی و آماده‌ی پیاده‌سازی.",
  tabName: "اسم رنگ بگو",
  tabPick: "رنگ انتخاب کن",
  tabSolid: "رنگ ساده",
  tabGradient: "گرادینت",
  angleLabel: "زاویه‌ی گرادینت",
  namePlaceholder: "مثلاً: بنفش سلطنتی، آبی نفتی، #7C3AED…",
  pickBaseHint: "رنگ پایه را انتخاب کن",
  suggestions: ["سبز لوکس", "آبی نفتی", "بنفش سلطنتی", "زمردی", "نارنجی گرم", "طلایی", "سرمه‌ای", "صورتی مدرن", "موکا موس", "کورال", "نعنایی", "ایندیگو", "هلویی", "خردلی", "سایان", "روبی"],
  guide: "رنگ موردنظرت را می‌دانی؟ همین بالا انتخاب یا وارد کن. اگر نمی‌دانی، در «توضیحات» بنویس یا از پایین «موضوع / کاربرد» را انتخاب کن تا خودمان رنگِ متناسب پیشنهاد بدهیم.",
  descPlaceholder: "توضیحات دلخواه (اختیاری): حس و حال برند، سبک، مخاطب…",
  topicIntro: "موضوع یا کاربردت را انتخاب کن — برای سایت، بنر، اپ، پوستر یا هر چیز دیگر (حداکثر ۲ مورد). بعد «پیشنهاد خودکار» را بزن تا چند پالتِ متناسب (روشن و دارک) بسازیم. روی نمونه‌متنِ پیش‌نمایشِ کارت‌ها هم اثر می‌گذارد.",
  topicAuto: "✨ پیشنهاد خودکار رنگ بر اساس موضوع",
  urlLabel: "آدرس سایت مرجع (اختیاری، مخصوص طراحی سایت — برای الهام از رنگ‌های همان سایت):",
  addUrl: "+ افزودن سایت دیگر",
  build: "ساخت پالت‌ها ✦",
  building: "در حال ساخت پالت‌ها…",
  errNeed: "حداقل یک رنگ، توضیح یا موضوع وارد کن.",
  siteLabel: "site",
  refineTitle: "بازآفرینی و ترکیب",
  refineDesc: "کدام پالت را دوست داشتی؟ شماره‌اش را بده تا از رویش نمونه‌های تازه بسازم — یا چند شماره بده تا ترکیبشان کنم. نتیجه به‌صورت بخش جدید پایین اضافه می‌شود و پالت‌های قبلی حفظ می‌مانند.",
  tabNew: "پالت‌های تازه",
  tabVariations: "بازآفرینی از یک پالت",
  tabCombine: "ترکیب چند پالت",
  newDesc: "بدون انتخاب عدد، یک دسته پالتِ کاملاً تازه با رنگ‌های مدرن و متفاوت بساز. هر بار زدن، رنگِ جدید.",
  newBtn: "✨ ساخت پالت‌های تازه",
  make: "بساز",
  combineBtn: "ترکیب و ساخت",
  refineDescPlaceholder: "توضیح دلخواه برای جهت‌دهی (اختیاری): مثلاً روشن‌تر، مینیمال‌تر، لوکس‌تر…",
  addNumber: "+ شماره",
  navFromStart: "+ ساخت از اول",
  navSections: "بخش‌های ساخته‌شده:",
  navRefine: "بازآفرینی و ترکیب ↺",
  footerCredit: "طراحی و توسعه توسط",
  rights: "پالتینو — تمامی حقوق محفوظ است.",
  suggestedTitle: "پلت‌های پیشنهادی",
  cardNav: ["عنوان", "عنوان دوم", "عنوان سوم"],
  cardBrand: "عنوان",
  cardTitle: "عنوان مطلب نمونه",
  cardBody: "این یک متن نمونه برای پیش‌نمایش پالت است و جای محتوای واقعی قرار می‌گیرد.",
  more: "بیشتر ←",
  btnPrimary: "دکمه اصلی",
  btnAccent: "دکمه مکمل",
  btnGhost: "جزئیات",
  chipTag: "برچسب",
  chipComp: "مکمل",
  chipActive: "فعال",
  swLight: "روشن",
  swDark: "دارک",
  swSurface: "سطح",
  swBrand: "برند",
  swBg: "زمینه",
  swInner: "سطح",
  swAccent: "اکسنت",
  captionLightFrame: "پیش‌نمایش روشن روی زمینه‌ی تیره",
  captionDarkFrame: "پیش‌نمایش دارک روی زمینه‌ی روشن",
  tagLight: "روشن",
  tagDark: "دارک",
  copied: "کپی شد ✓",
  varPlaceholder: (t) => `شماره پالت (۱ تا ${t})`,
  errRange: (t) => `یک شماره بین ۱ تا ${t} وارد کن.`,
  errCombine: "حداقل دو شماره پالت برای ترکیب انتخاب کن.",
  errTopic: "اول یک موضوع انتخاب کن.",
  titleColor: (v) => `پالت‌های «${v}»`,
  titleTopic: (l) => `پالت‌های موضوع «${l}»`,
  titleByDesc: "پالت‌ها بر اساس توضیحات",
  titleBySite: "پالت‌ها بر اساس سایت",
  titleNew: "پالت‌های تازه",
  titleVariations: (n) => `بازآفرینی از پالت #${n}`,
  titleCombine: (list) => `ترکیب پالت‌های ${list}`,
  topicPrefix: "موضوع",
};

const en: Dict = {
  dir: "ltr",
  brandDot: "Palettino",
  heroBadge: "Automatic color-palette design system",
  heroTagline: "Start from a color, a name or a topic and get six coordinated palettes with complementary colors — three light and three dark, on-standard and ready to ship.",
  tabName: "Say a color",
  tabPick: "Pick a color",
  tabSolid: "Solid",
  tabGradient: "Gradient",
  angleLabel: "Gradient angle",
  namePlaceholder: "e.g. Royal purple, Petrol blue, #7C3AED…",
  pickBaseHint: "Pick a base color",
  suggestions: ["Luxe green", "Petrol blue", "Royal purple", "Emerald", "Warm orange", "Gold", "Navy", "Modern pink", "Mocha mousse", "Coral", "Mint", "Indigo", "Peach", "Mustard", "Cyan", "Ruby"],
  guide: "Know the color you want? Pick or type it above. If not, describe it in “Description” or choose a “Topic / use case” below and we’ll suggest a matching color.",
  descPlaceholder: "Optional description: brand mood, style, audience…",
  topicIntro: "Choose a topic or use case — for a website, banner, app, poster or anything else (up to 2). Then hit “Auto-suggest” and we’ll build matching palettes (light and dark). It also affects the card preview text.",
  topicAuto: "✨ Auto-suggest colors by topic",
  urlLabel: "Reference site URL (optional, for web design — to draw inspiration from that site’s colors):",
  addUrl: "+ Add another site",
  build: "Generate palettes ✦",
  building: "Generating palettes…",
  errNeed: "Enter at least a color, description or topic.",
  siteLabel: "site",
  refineTitle: "Regenerate & Combine",
  refineDesc: "Which palette did you like? Enter its number to spin up fresh variations — or enter several numbers to combine them. Results are appended below as a new section and previous palettes stay.",
  tabNew: "Fresh palettes",
  tabVariations: "Regenerate from one",
  tabCombine: "Combine several",
  newDesc: "No number needed — generate a brand-new batch with modern, different colors. Each click, a new color.",
  newBtn: "✨ Generate fresh palettes",
  make: "Make",
  combineBtn: "Combine & make",
  refineDescPlaceholder: "Optional direction: e.g. lighter, more minimal, more luxe…",
  addNumber: "+ number",
  navFromStart: "+ Start over",
  navSections: "Generated sections:",
  navRefine: "Regenerate & Combine ↺",
  footerCredit: "Designed & developed by",
  rights: "Palettino — All rights reserved.",
  suggestedTitle: "Suggested palettes",
  cardNav: ["Title", "Second title", "Third title"],
  cardBrand: "Brand",
  cardTitle: "Sample article title",
  cardBody: "This is placeholder text for previewing the palette; real content goes here.",
  more: "More →",
  btnPrimary: "Primary",
  btnAccent: "Complement",
  btnGhost: "Details",
  chipTag: "Tag",
  chipComp: "Complement",
  chipActive: "Active",
  swLight: "Light",
  swDark: "Dark",
  swSurface: "Surface",
  swBrand: "Brand",
  swBg: "Bg",
  swInner: "Surface",
  swAccent: "Accent",
  captionLightFrame: "Light preview on a dark frame",
  captionDarkFrame: "Dark preview on a light frame",
  tagLight: "Light",
  tagDark: "Dark",
  copied: "Copied ✓",
  varPlaceholder: (t) => `Palette number (1 to ${t})`,
  errRange: (t) => `Enter a number between 1 and ${t}.`,
  errCombine: "Pick at least two palette numbers to combine.",
  errTopic: "Choose a topic first.",
  titleColor: (v) => `Palettes for “${v}”`,
  titleTopic: (l) => `Palettes for topic “${l}”`,
  titleByDesc: "Palettes from description",
  titleBySite: "Palettes from site",
  titleNew: "Fresh palettes",
  titleVariations: (n) => `Regenerated from #${n}`,
  titleCombine: (list) => `Combination of ${list}`,
  topicPrefix: "Topic",
};

export const DICT: Record<Lang, Dict> = { fa, en };
export const getDict = (lang: Lang): Dict => DICT[lang];
