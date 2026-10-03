import { useState, useRef } from "react";
import { normalize, isIOS, isStandalone, DEFAULT_SETTINGS, DEFAULT_ASSET_ITEMS, emptyState } from "./store";

// ── 공통 스타일 ──
const page = {
  fontFamily: "'Pretendard Variable', 'Pretendard', system-ui, -apple-system, sans-serif",
  background: "#f8fafc", minHeight: "100vh", maxWidth: 480, margin: "0 auto",
};
const cardSt = { background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const inputSt = {
  padding: "11px 13px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 15, fontWeight: 500,
  color: "#0f172a", background: "#fff", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit",
};
const primaryBtn = {
  width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "#0f172a",
  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};
const ghostBtn = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff",
  color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};
const label = { fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 };

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// ═══════════════════════════════════════════
// 항목 편집기 (수입/지출/자산 공용)
// ═══════════════════════════════════════════
export function ItemEditor({ items, onChange, color = "#0f172a", placeholder = "새 항목 이름", canDelete, onRename }) {
  const [draft, setDraft] = useState("");
  const [editIdx, setEditIdx] = useState(-1);
  const [editVal, setEditVal] = useState("");

  function add() {
    const n = draft.trim();
    if (!n) return;
    if (items.includes(n)) { alert("이미 있는 이름이에요."); return; }
    onChange([...items, n]);
    setDraft("");
  }
  function commitRename(i) {
    const n = editVal.trim();
    const old = items[i];
    setEditIdx(-1);
    if (!n || n === old) return;
    if (items.includes(n)) { alert("이미 있는 이름이에요."); return; }
    if (onRename) onRename(old, n);
    else onChange(items.map((x, j) => (j === i ? n : x)));
  }
  function remove(i) {
    if (canDelete && !canDelete(items[i])) return;
    if (items.length <= 1) { alert("항목은 최소 1개는 있어야 해요."); return; }
    onChange(items.filter((_, j) => j !== i));
  }
  function moveUp(i) {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  }

  return (
    <div>
      {items.map((it, i) => (
        <div key={it} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
          {editIdx === i ? (
            <input
              autoFocus value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={() => commitRename(i)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitRename(i); } }}
              style={{ ...inputSt, padding: "5px 8px", fontSize: 14, flex: 1 }}
            />
          ) : (
            <span onClick={() => { setEditIdx(i); setEditVal(it); }} style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
              {it}
            </span>
          )}
          <button onClick={() => moveUp(i)} disabled={i === 0} style={{ border: "none", background: "none", color: i === 0 ? "#e2e8f0" : "#94a3b8", fontSize: 13, cursor: i === 0 ? "default" : "pointer", padding: "2px 6px" }} aria-label="위로">▲</button>
          <button onClick={() => remove(i)} style={{ border: "none", background: "none", color: "#cbd5e1", fontSize: 16, cursor: "pointer", padding: "2px 6px" }} aria-label="삭제">✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        <input
          value={draft} placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          style={{ ...inputSt, padding: "8px 10px", fontSize: 14 }}
        />
        <button onClick={add} style={{ ...ghostBtn, background: color, color: "#fff", border: "none", flexShrink: 0 }}>추가</button>
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>이름을 누르면 바꿀 수 있어요</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// 홈 화면 설치 안내
// ═══════════════════════════════════════════
export function InstallGuide({ compact }) {
  const ios = isIOS();
  const installed = isStandalone();
  if (installed) {
    return <div style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>✓ 홈 화면에 설치된 앱으로 사용 중이에요</div>;
  }
  return (
    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
      {!compact && (
        <div style={{ marginBottom: 8 }}>
          홈 화면에 추가하면 앱처럼 쓸 수 있고, {ios ? "아이폰에서는 데이터도 더 안전하게 보관돼요." : "더 빠르게 열 수 있어요."}
        </div>
      )}
      {ios ? (
        <div>
          <b>아이폰:</b> Safari 하단의 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>카카오톡 등 앱 안에서 열었다면 먼저 Safari로 열어주세요.</div>
        </div>
      ) : (
        <div>
          <b>안드로이드:</b> Chrome 오른쪽 위 <b>⋮ 메뉴</b> → <b>홈 화면에 추가</b> (또는 앱 설치)
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 백업 내보내기 / 불러오기
// ═══════════════════════════════════════════
async function exportBackup(state) {
  const json = JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
  const fileName = "가계부백업_" + todayStr() + ".json";
  const blob = new Blob([json], { type: "application/json" });
  try {
    const file = new File([blob], fileName, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName });
      return true;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return false; // 사용자가 공유 취소
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

function readBackupFile(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const raw = JSON.parse(r.result);
        if (!raw || !raw.settings || !Array.isArray(raw.transactions)) throw new Error("형식 오류");
        resolve(normalize({ ...raw, onboarded: true }));
      } catch (e) {
        resolve(null);
      }
    };
    r.onerror = () => resolve(null);
    r.readAsText(file);
  });
}

function RestoreButton({ onRestore, style, children }) {
  const ref = useRef(null);
  return (
    <>
      <button onClick={() => ref.current && ref.current.click()} style={style}>{children}</button>
      <input
        ref={ref} type="file" accept=".json,application/json" style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files && e.target.files[0];
          e.target.value = "";
          if (!file) return;
          const st = await readBackupFile(file);
          if (!st) { alert("백업 파일을 읽을 수 없어요. 이 앱에서 내보낸 파일이 맞는지 확인해주세요."); return; }
          const msg = "백업 파일을 불러올까요?\n\n내역 " + st.transactions.length + "건, 자산 기록 " + st.assets.length + "건\n\n⚠️ 지금 이 기기에 있는 데이터는 백업 파일 내용으로 바뀌어요.";
          if (window.confirm(msg)) onRestore(st);
        }}
      />
    </>
  );
}

// ═══════════════════════════════════════════
// 첫 실행 설정
// ═══════════════════════════════════════════
export function Onboarding({ onDone, onRestore }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(DEFAULT_SETTINGS.title);
  const [inc, setInc] = useState(DEFAULT_SETTINGS.incomeCats);
  const [exp, setExp] = useState(DEFAULT_SETTINGS.expenseCats);
  const [sav, setSav] = useState(DEFAULT_ASSET_ITEMS.filter((i) => i.grp === "savings").map((i) => i.name));
  const [inv, setInv] = useState(DEFAULT_ASSET_ITEMS.filter((i) => i.grp === "invest").map((i) => i.name));
  const TOTAL = 5;

  function finish() {
    const dupe = sav.find((n) => inv.includes(n));
    if (dupe) { alert("'" + dupe + "'이(가) 예적금과 투자에 모두 있어요. 한쪽만 남겨주세요."); return; }
    onDone({
      settings: { title: title.trim() || DEFAULT_SETTINGS.title, incomeCats: inc, expenseCats: exp },
      assetItems: [
        ...sav.map((name) => ({ name, grp: "savings", hidden: false })),
        ...inv.map((name) => ({ name, grp: "invest", hidden: false })),
      ],
    });
  }

  const header = (t, sub) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.35 }}>{t}</div>
      {sub && <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );

  const nav = (
    <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
      {step > 1 && <button onClick={() => setStep(step - 1)} style={{ ...primaryBtn, width: 90, background: "#e2e8f0", color: "#475569" }}>이전</button>}
      {step < TOTAL
        ? <button onClick={() => setStep(step + 1)} style={primaryBtn}>다음</button>
        : <button onClick={finish} style={primaryBtn}>가계부 시작하기</button>}
    </div>
  );

  if (step === 0) {
    return (
      <div style={{ ...page, padding: "56px 24px 32px", display: "flex", flexDirection: "column", minHeight: "100vh", boxSizing: "border-box" }}>
        <div style={{ fontSize: 44 }}>💜</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginTop: 14, lineHeight: 1.3 }}>
          가입 없이 바로 쓰는<br />나만의 가계부
        </div>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 14, lineHeight: 1.7 }}>
          수입·지출을 내 방식대로 나눠 기록하고, 한 해 흐름과 자산 변화를 한눈에 볼 수 있어요.
        </div>
        <div style={{ ...cardSt, marginTop: 24, background: "#f1f5f9", boxShadow: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>🔒 데이터는 이 기기에만 저장돼요</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 1.6 }}>
            서버로 전송되지 않아서 나만 볼 수 있어요. 대신 폰을 바꾸거나 브라우저 데이터를 지우면 사라지니, 설정에서 가끔 백업 파일을 만들어 두세요.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setStep(1)} style={primaryBtn}>시작하기</button>
        <RestoreButton onRestore={onRestore} style={{ ...primaryBtn, background: "none", color: "#64748b", fontSize: 13, fontWeight: 600, marginTop: 6 }}>
          백업 파일로 복원하기
        </RestoreButton>
      </div>
    );
  }

  return (
    <div style={{ ...page, padding: "28px 22px 32px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 26 }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? "#0f172a" : "#e2e8f0" }} />
        ))}
      </div>

      {step === 1 && (
        <>
          {header("가계부 이름을 정해주세요", "앱 맨 위에 보이는 이름이에요. 나중에 바꿀 수 있어요.")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={20} style={inputSt} placeholder="예: 지민이네 가계부" />
        </>
      )}

      {step === 2 && (
        <>
          {header("수입은 어떻게 나눌까요?", "자주 들어오는 돈의 종류를 적어주세요.")}
          <div style={cardSt}><ItemEditor items={inc} onChange={setInc} color="#059669" placeholder="예: 용돈" /></div>
        </>
      )}

      {step === 3 && (
        <>
          {header("지출은 어떻게 나눌까요?", "식비·교통처럼 용도별로 나눠도 되고, 카드별(A카드, B카드, 현금)로 나눠도 돼요. 편한 방식으로 정하세요.")}
          <div style={cardSt}><ItemEditor items={exp} onChange={setExp} color="#f43f5e" placeholder="예: 경조사" /></div>
        </>
      )}

      {step === 4 && (
        <>
          {header("자산 항목을 정해주세요", "매달 잔액을 기록할 통장·계좌예요. 지금 정하지 않아도 자산 탭에서 언제든 추가할 수 있어요.")}
          <div style={cardSt}>
            <div style={{ ...label, color: "#3b82f6" }}>예적금</div>
            <ItemEditor items={sav} onChange={setSav} color="#3b82f6" placeholder="예: 파킹통장" />
          </div>
          <div style={cardSt}>
            <div style={{ ...label, color: "#8b5cf6" }}>투자</div>
            <ItemEditor items={inv} onChange={setInv} color="#8b5cf6" placeholder="예: ISA" />
          </div>
        </>
      )}

      {step === 5 && (
        <>
          {header("준비 끝! 🎉", "마지막으로 홈 화면에 추가해두면 앱처럼 편하게 쓸 수 있어요.")}
          <div style={cardSt}><InstallGuide /></div>
          <div style={{ ...cardSt, background: "#fffbeb", boxShadow: "none" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>📦 백업 잊지 마세요</div>
            <div style={{ fontSize: 12, color: "#a16207", marginTop: 4, lineHeight: 1.6 }}>
              오른쪽 위 ⚙ 설정 → 백업 파일 내보내기로 데이터를 저장해둘 수 있어요. 한 달에 한 번 정도 추천해요.
            </div>
          </div>
        </>
      )}

      {nav}
    </div>
  );
}

// ═══════════════════════════════════════════
// 설정 화면
// ═══════════════════════════════════════════
export function Settings({ state, onChange, onClose }) {
  const { settings, transactions, assets, assetItems, memos } = state;
  const [title, setTitle] = useState(settings.title);
  const [newAsset, setNewAsset] = useState("");
  const [newAssetGrp, setNewAssetGrp] = useState("savings");
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const set = (patch) => onChange({ ...state, ...patch });
  const setSettings = (patch) => set({ settings: { ...settings, ...patch } });

  const usedCount = (type, name) => transactions.filter((t) => t.type === type && t.category === name).length;
  const guardDelete = (type) => (name) => {
    const n = usedCount(type, name);
    if (n > 0) {
      alert("'" + name + "'으로 기록된 내역이 " + n + "건 있어서 삭제할 수 없어요.\n이름을 눌러서 바꾸는 건 가능해요.");
      return false;
    }
    return true;
  };
  const renameCat = (type, key) => (oldName, newName) => {
    set({
      settings: { ...settings, [key]: settings[key].map((c) => (c === oldName ? newName : c)) },
      transactions: transactions.map((t) => (t.type === type && t.category === oldName ? { ...t, category: newName } : t)),
    });
  };

  // 자산 항목 (등록된 항목 + 기록만 있는 이름)
  const assetNames = [...new Set([...assetItems.map((i) => i.name), ...assets.map((a) => a.name)])];
  const itemOf = (name) => assetItems.find((i) => i.name === name) || { name, grp: "savings", hidden: false };
  const upsertItem = (it) => set({ assetItems: [...assetItems.filter((i) => i.name !== it.name), it] });

  function renameAsset(oldName) {
    const n = renameVal.trim();
    setRenaming(null);
    if (!n || n === oldName) return;
    if (assetNames.includes(n)) { alert("이미 있는 이름이에요."); return; }
    const nextMemos = {};
    Object.keys(memos).forEach((m) => {
      const mm = { ...memos[m] };
      if (oldName in mm) { mm[n] = mm[oldName]; delete mm[oldName]; }
      nextMemos[m] = mm;
    });
    set({
      assetItems: [...assetItems.filter((i) => i.name !== oldName), { ...itemOf(oldName), name: n }],
      assets: assets.map((a) => (a.name === oldName ? { ...a, name: n } : a)),
      memos: nextMemos,
    });
  }

  function addAsset() {
    const n = newAsset.trim();
    if (!n) return;
    if (assetNames.includes(n)) { alert("이미 있는 이름이에요."); return; }
    upsertItem({ name: n, grp: newAssetGrp, hidden: false });
    setNewAsset("");
  }

  async function doExport() {
    const ok = await exportBackup(state);
    if (ok) set({ lastBackup: new Date().toISOString() });
  }

  function doReset() {
    const typed = window.prompt("모든 데이터(내역, 자산, 설정)가 이 기기에서 삭제돼요.\n되돌릴 수 없으니 먼저 백업을 권장해요.\n\n계속하려면 '초기화'라고 입력하세요.");
    if (typed === "초기화") onChange(emptyState());
  }

  const daysSince = state.lastBackup ? Math.floor((Date.now() - new Date(state.lastBackup).getTime()) / 86400000) : null;

  return (
    <div style={{ ...page, paddingBottom: 40 }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", position: "sticky", top: 0, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>설정</span>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 14, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>완료</button>
      </div>

      <div style={{ padding: "14px 18px" }}>
        <div style={cardSt}>
          <div style={label}>가계부 이름</div>
          <input
            value={title} maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setSettings({ title: title.trim() || DEFAULT_SETTINGS.title })}
            style={inputSt}
          />
        </div>

        <div style={cardSt}>
          <div style={{ ...label, color: "#059669" }}>수입 항목</div>
          <ItemEditor
            items={settings.incomeCats} color="#059669" placeholder="새 수입 항목"
            onChange={(v) => setSettings({ incomeCats: v })}
            canDelete={guardDelete("income")} onRename={renameCat("income", "incomeCats")}
          />
        </div>

        <div style={cardSt}>
          <div style={{ ...label, color: "#f43f5e" }}>지출 항목</div>
          <ItemEditor
            items={settings.expenseCats} color="#f43f5e" placeholder="새 지출 항목"
            onChange={(v) => setSettings({ expenseCats: v })}
            canDelete={guardDelete("expense")} onRename={renameCat("expense", "expenseCats")}
          />
        </div>

        <div style={cardSt}>
          <div style={label}>자산 항목</div>
          {assetNames.length === 0 && <div style={{ fontSize: 12, color: "#94a3b8" }}>아직 자산 항목이 없어요</div>}
          {assetNames.map((name) => {
            const it = itemOf(name);
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                {renaming === name ? (
                  <input
                    autoFocus value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={() => renameAsset(name)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); renameAsset(name); } }}
                    style={{ ...inputSt, padding: "5px 8px", fontSize: 14, flex: 1 }}
                  />
                ) : (
                  <span onClick={() => { setRenaming(name); setRenameVal(name); }} style={{ flex: 1, fontSize: 14, fontWeight: 600, color: it.hidden ? "#cbd5e1" : "#334155", cursor: "pointer" }}>
                    {name}{it.hidden && <span style={{ fontSize: 10, marginLeft: 4 }}>(숨김)</span>}
                  </span>
                )}
                <button
                  onClick={() => upsertItem({ ...it, grp: it.grp === "invest" ? "savings" : "invest" })}
                  style={{ ...ghostBtn, padding: "3px 8px", fontSize: 11, color: it.grp === "invest" ? "#8b5cf6" : "#3b82f6", borderColor: it.grp === "invest" ? "#ddd6fe" : "#bfdbfe" }}
                >
                  {it.grp === "invest" ? "투자" : "예적금"}
                </button>
                <button onClick={() => upsertItem({ ...it, hidden: !it.hidden })} style={{ ...ghostBtn, padding: "3px 8px", fontSize: 11 }}>
                  {it.hidden ? "표시" : "숨기기"}
                </button>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input value={newAsset} placeholder="새 자산 항목" onChange={(e) => setNewAsset(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAsset(); } }}
              style={{ ...inputSt, padding: "8px 10px", fontSize: 14 }} />
            <button onClick={() => setNewAssetGrp(newAssetGrp === "invest" ? "savings" : "invest")} style={{ ...ghostBtn, flexShrink: 0, color: newAssetGrp === "invest" ? "#8b5cf6" : "#3b82f6" }}>
              {newAssetGrp === "invest" ? "투자" : "예적금"}
            </button>
            <button onClick={addAsset} style={{ ...ghostBtn, background: "#0f172a", color: "#fff", border: "none", flexShrink: 0 }}>추가</button>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>
            이름을 누르면 바꿀 수 있어요. 숨긴 항목은 값이 없는 달에만 안 보이고 지난 기록은 남아요.
          </div>
        </div>

        <div style={cardSt}>
          <div style={label}>데이터 백업</div>
          <div style={{ fontSize: 12, color: daysSince === null || daysSince > 30 ? "#b45309" : "#64748b", marginBottom: 10 }}>
            {daysSince === null ? "아직 백업한 적이 없어요" : daysSince === 0 ? "오늘 백업했어요" : "마지막 백업: " + daysSince + "일 전"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={doExport} style={{ ...primaryBtn, padding: "11px 0", fontSize: 13 }}>백업 파일 내보내기</button>
            <RestoreButton onRestore={(st) => onChange(st)} style={{ ...primaryBtn, padding: "11px 0", fontSize: 13, background: "#e2e8f0", color: "#334155" }}>
              불러오기
            </RestoreButton>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
            백업 파일은 카카오톡 나에게 보내기, 메일, 파일 앱 등에 저장해두세요. 폰을 바꿀 때 새 폰에서 '불러오기'로 옮길 수 있어요.
          </div>
        </div>

        <div style={cardSt}>
          <div style={label}>홈 화면에 설치</div>
          <InstallGuide compact />
        </div>

        <div style={cardSt}>
          <div style={label}>데이터 초기화</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>이 기기의 모든 데이터를 지우고 처음부터 다시 설정해요.</div>
          <button onClick={doReset} style={{ ...ghostBtn, color: "#ef4444", borderColor: "#fecaca" }}>모든 데이터 초기화</button>
        </div>

        <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.6, padding: "8px 12px" }}>
          모든 데이터는 이 기기의 브라우저에만 저장되며<br />어떤 서버로도 전송되지 않아요.
        </div>
      </div>
    </div>
  );
}
