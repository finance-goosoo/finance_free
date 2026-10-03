// ═══════════════════════════════════════════
// 로컬 저장소 (서버 없음 — 이 기기 브라우저에만 저장)
// ⚠️ STORAGE_KEY를 바꾸면 기존 사용자 데이터가 전부 안 보이게 돼요. 절대 변경 금지.
// ═══════════════════════════════════════════
export const STORAGE_KEY = "finance_free:v1";
const SCHEMA_VERSION = 1;

export const PALETTE = [
  "#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4",
  "#ec4899", "#84cc16", "#6366f1", "#14b8a6", "#f97316", "#64748b",
];

export const DEFAULT_SETTINGS = {
  title: "나의 가계부",
  incomeCats: ["월급", "부수입", "기타수입"],
  expenseCats: ["식비", "생활", "교통", "주거·통신", "쇼핑", "의료", "여가", "기타"],
};

export const DEFAULT_ASSET_ITEMS = [
  { name: "입출금통장", grp: "savings", hidden: false },
  { name: "적금", grp: "savings", hidden: false },
  { name: "주식", grp: "invest", hidden: false },
  { name: "연금", grp: "invest", hidden: false },
];

export function emptyState() {
  return {
    version: SCHEMA_VERSION,
    onboarded: false,
    settings: { ...DEFAULT_SETTINGS },
    transactions: [],   // { id, type: income|expense, date: "YYYY-MM-DD", category, amount, memo }
    assets: [],         // { id, name, month: "2026.10월", amount }
    assetItems: [],     // { name, grp: savings|invest, hidden }
    memos: {},          // { [month]: { [assetName]: memo } }
    lastBackup: null,   // ISO 문자열
  };
}

// 불러온 데이터가 깨져 있어도 앱이 죽지 않도록 형태를 맞춰줌
export function normalize(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  const s = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
  const strArr = (v, fb) => (Array.isArray(v) && v.every((x) => typeof x === "string") && v.length ? v : fb);
  return {
    version: SCHEMA_VERSION,
    onboarded: !!raw.onboarded,
    settings: {
      title: typeof s.title === "string" && s.title.trim() ? s.title : base.settings.title,
      incomeCats: strArr(s.incomeCats, base.settings.incomeCats),
      expenseCats: strArr(s.expenseCats, base.settings.expenseCats),
    },
    transactions: Array.isArray(raw.transactions)
      ? raw.transactions.filter((t) => t && typeof t.date === "string" && typeof t.amount === "number")
      : [],
    assets: Array.isArray(raw.assets)
      ? raw.assets.filter((a) => a && typeof a.name === "string" && typeof a.month === "string" && typeof a.amount === "number")
      : [],
    assetItems: Array.isArray(raw.assetItems)
      ? raw.assetItems.filter((i) => i && typeof i.name === "string").map((i) => ({ name: i.name, grp: i.grp === "invest" ? "invest" : "savings", hidden: !!i.hidden }))
      : [],
    memos: raw.memos && typeof raw.memos === "object" ? raw.memos : {},
    lastBackup: typeof raw.lastBackup === "string" ? raw.lastBackup : null,
  };
}

export function loadState() {
  try {
    const txt = localStorage.getItem(STORAGE_KEY);
    if (!txt) return emptyState();
    return normalize(JSON.parse(txt));
  } catch (e) {
    console.error("불러오기 실패", e);
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("저장 실패", e);
    return false;
  }
}

// 브라우저가 저장공간을 임의로 지우지 않도록 요청 (지원하는 브라우저만)
export async function requestPersist() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch (e) { /* 무시 */ }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 이름 기반으로 항상 같은 색 (자산 항목 등)
export function hashColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function isStandalone() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  } catch (e) {
    return false;
  }
}

export function isIOS() {
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}
