// موضوعات نمونه: هر موضوع یک متنِ نمونه (فارسی/انگلیسی) برای پیش‌نمایش کارت می‌دهد.
import type { Lang } from "./i18n";

export interface TopicSample {
  brand: string;
  title: string;
  body: string;
}
export interface Topic {
  key: string;
  label: string;
  labelEn: string;
  colors: string[]; // رنگ‌های پیشنهادیِ متناسب با موضوع
  sample: TopicSample; // fa
  sampleEn: TopicSample;
}

export const DEFAULT_SAMPLE: TopicSample = {
  brand: "عنوان",
  title: "عنوان مطلب نمونه",
  body: "این یک متن نمونه برای پیش‌نمایش پالت است و جای محتوای واقعی قرار می‌گیرد.",
};
export const DEFAULT_SAMPLE_EN: TopicSample = {
  brand: "Brand",
  title: "Sample article title",
  body: "This is placeholder text for previewing the palette; real content goes here.",
};

export function sampleFor(t: Topic | undefined, lang: Lang): TopicSample {
  if (!t) return lang === "en" ? DEFAULT_SAMPLE_EN : DEFAULT_SAMPLE;
  return lang === "en" ? t.sampleEn : t.sample;
}
export function labelFor(t: Topic, lang: Lang): string {
  return lang === "en" ? t.labelEn : t.label;
}

export const TOPICS: Topic[] = [
  { key: "medical", label: "پزشکی", labelEn: "Medical", colors: ["#0EA5A4", "#2563EB", "#16A34A"], sample: { brand: "کلینیک سلامت", title: "نوبت‌دهی و مشاوره‌ی آنلاین", body: "خدمات درمانی تخصصی با پزشکان مجرب و پیگیری آسان بیماران." }, sampleEn: { brand: "HealthClinic", title: "Online booking & consult", body: "Specialized care with expert doctors and easy patient follow-up." } },
  { key: "industrial", label: "صنعتی", labelEn: "Industrial", colors: ["#0F766E", "#334155", "#EA580C"], sample: { brand: "فرسام صنعت", title: "تجهیزات اتوماسیون صنعتی", body: "قطعات و راهکارهای کنترل و برق صنعتی با کیفیت و گارانتی." }, sampleEn: { brand: "FarsamInd", title: "Industrial automation gear", body: "Control and power components with quality and warranty." } },
  { key: "beauty", label: "زیبایی", labelEn: "Beauty", colors: ["#DB2777", "#A855F7", "#F472B6"], sample: { brand: "سالن آرا", title: "خدمات پوست، مو و ناخن", body: "جدیدترین متدهای زیبایی با کادر حرفه‌ای و محیطی آرام." }, sampleEn: { brand: "AraSalon", title: "Skin, hair & nails", body: "The latest beauty methods with a pro team and calm space." } },
  { key: "agri", label: "کشاورزی", labelEn: "Agriculture", colors: ["#16A34A", "#65A30D", "#0F766E"], sample: { brand: "کشت‌سبز", title: "نهاده و بذر باکیفیت", body: "محصولات و مشاوره‌ی تخصصی برای افزایش بهره‌وری مزرعه." }, sampleEn: { brand: "GreenGrow", title: "Quality seeds & inputs", body: "Products and expert advice to boost farm productivity." } },
  { key: "edu", label: "آموزشی", labelEn: "Education", colors: ["#4F46E5", "#0EA5E9", "#F59E0B"], sample: { brand: "آکادمی نو", title: "دوره‌های آنلاین و حضوری", body: "یادگیری گام‌به‌گام با اساتید برتر و مدرک معتبر پایان دوره." }, sampleEn: { brand: "NovaAcademy", title: "Online & in-person courses", body: "Step-by-step learning with top mentors and a valid certificate." } },
  { key: "shop", label: "فروشگاهی", labelEn: "E-commerce", colors: ["#DC2626", "#EA580C", "#7C3AED"], sample: { brand: "فروشگاه من", title: "جدیدترین محصولات", body: "خرید آسان با ارسال سریع و ضمانت اصالت کالا." }, sampleEn: { brand: "MyStore", title: "Newest products", body: "Easy shopping with fast delivery and authenticity guarantee." } },
  { key: "tech", label: "فناوری", labelEn: "Technology", colors: ["#6366F1", "#06B6D4", "#8B5CF6"], sample: { brand: "تک‌لَب", title: "راهکارهای نرم‌افزاری", body: "توسعه‌ی محصولات دیجیتال مدرن با تمرکز بر تجربه‌ی کاربری." }, sampleEn: { brand: "TechLab", title: "Software solutions", body: "Building modern digital products with a focus on UX." } },
  { key: "food", label: "رستوران و کافه", labelEn: "Food & Café", colors: ["#EA580C", "#DC2626", "#B45309"], sample: { brand: "کافه رست", title: "منوی ویژه‌ی امروز", body: "طعم‌های خاص با مواد اولیه‌ی تازه در فضایی دلنشین." }, sampleEn: { brand: "RoastCafé", title: "Today’s special menu", body: "Distinct flavors with fresh ingredients in a cozy space." } },
  { key: "finance", label: "مالی و بانکی", labelEn: "Finance", colors: ["#1E3A8A", "#0F766E", "#334155"], sample: { brand: "پرداخت‌آسان", title: "خدمات مالی هوشمند", body: "مدیریت پرداخت‌ها و تراکنش‌ها با امنیت و سرعت بالا." }, sampleEn: { brand: "EasyPay", title: "Smart financial services", body: "Manage payments and transactions with speed and security." } },
  { key: "legal", label: "حقوقی", labelEn: "Legal", colors: ["#1E3A8A", "#334155", "#B45309"], sample: { brand: "دادیار", title: "مشاوره‌ی حقوقی تخصصی", body: "همراهی وکلای مجرب در تمام مراحل پرونده‌ی شما." }, sampleEn: { brand: "LawAdvisor", title: "Expert legal counsel", body: "Experienced lawyers by your side through every case step." } },
  { key: "sport", label: "ورزشی", labelEn: "Sports", colors: ["#16A34A", "#EA580C", "#2563EB"], sample: { brand: "فیت‌کلاب", title: "برنامه‌ی تمرین و تغذیه", body: "رسیدن به تناسب اندام با مربیان حرفه‌ای و پیگیری مستمر." }, sampleEn: { brand: "FitClub", title: "Training & nutrition plan", body: "Reach your fitness goals with pro coaches and steady tracking." } },
  { key: "travel", label: "گردشگری", labelEn: "Travel", colors: ["#0EA5E9", "#0D9488", "#F59E0B"], sample: { brand: "سفرنو", title: "تورها و اقامتگاه‌ها", body: "رزرو آسان سفر با بهترین قیمت و پشتیبانی شبانه‌روزی." }, sampleEn: { brand: "NovaTrip", title: "Tours & stays", body: "Easy travel booking at the best price with 24/7 support." } },
  { key: "realestate", label: "املاک", labelEn: "Real estate", colors: ["#0F766E", "#B45309", "#334155"], sample: { brand: "خانه‌یاب", title: "خرید، فروش و اجاره", body: "بهترین فرصت‌های ملکی با مشاوره‌ی تخصصی و بازدید آسان." }, sampleEn: { brand: "HomeFinder", title: "Buy, sell & rent", body: "The best property deals with expert advice and easy visits." } },
  { key: "kids", label: "کودک", labelEn: "Kids", colors: ["#F59E0B", "#EC4899", "#22C55E"], sample: { brand: "دنیای کودک", title: "بازی و سرگرمی آموزشی", body: "محیطی شاد و امن برای رشد و یادگیری کودکان." }, sampleEn: { brand: "KidWorld", title: "Play & learn", body: "A joyful, safe space for kids to grow and learn." } },
  { key: "art", label: "هنری", labelEn: "Art", colors: ["#7C3AED", "#DB2777", "#F59E0B"], sample: { brand: "گالری هنر", title: "آثار و نمایشگاه‌ها", body: "معرفی هنرمندان و آثار اصیل در فضایی الهام‌بخش." }, sampleEn: { brand: "ArtGallery", title: "Works & exhibitions", body: "Showcasing artists and original works in an inspiring space." } },
  { key: "construction", label: "ساختمانی", labelEn: "Construction", colors: ["#B45309", "#334155", "#EA580C"], sample: { brand: "سازه‌گستر", title: "اجرا و طراحی پروژه", body: "خدمات ساخت‌وساز با استانداردهای روز و تحویل به‌موقع." }, sampleEn: { brand: "BuildPro", title: "Design & build", body: "Construction services to modern standards, delivered on time." } },
  { key: "beautyshop", label: "آرایشی و بهداشتی", labelEn: "Cosmetics", colors: ["#DB2777", "#C026D3", "#F472B6"], sample: { brand: "بیوتی‌شاپ", title: "لوازم آرایشی اصل", body: "برندهای معتبر با تضمین اصالت و ارسال سریع." }, sampleEn: { brand: "BeautyShop", title: "Authentic cosmetics", body: "Trusted brands with authenticity guarantee and fast shipping." } },
  { key: "news", label: "خبری و مجله", labelEn: "News & Magazine", colors: ["#DC2626", "#1E3A8A", "#334155"], sample: { brand: "خبرنو", title: "تازه‌ترین اخبار", body: "پوشش لحظه‌ای رویدادها و تحلیل‌های تخصصی." }, sampleEn: { brand: "NewsNow", title: "Latest news", body: "Live coverage of events with expert analysis." } },
];
