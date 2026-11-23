"use client";

import { useState } from "react";
import { TabletNumericPad } from "@/components/common/tablet-numeric-pad";
import { PageHeader } from "@/components/ui/page-header";
import { useToast, savePendingToast } from "@/components/ui/toast-provider";
import { apiRequest } from "@/lib/http/api-client";

type Target = "employeeNo" | "pin";

// 利用者切替（PIN）— online only. Only shop-floor roles / heads can switch, never to システム管理者 /
// ルール管理者 / 照合事務局 without head authority. Success → full reload to ホーム with a toast.
export default function SwitchUserPage() {
  const { showToast } = useToast();
  const [employeeNo, setEmployeeNo] = useState("S");
  const [pin, setPin] = useState("");
  const [target, setTarget] = useState<Target>("pin");
  const [busy, setBusy] = useState(false);

  function handleKey(key: string) {
    const set = target === "pin" ? setPin : setEmployeeNo;
    const max = target === "pin" ? 4 : 10;
    if (key === "C") set("");
    else if (key === "←") set((v) => v.slice(0, -1));
    else set((v) => (v.length < max ? v + key : v));
  }

  async function handleSwitch() {
    setBusy(true);
    const res = await apiRequest("/api/auth/pin-switch", { method: "POST", body: { employeeNo, pin } });
    setBusy(false);
    setPin("");
    if (!res.ok) return showToast(res.message, "error");
    savePendingToast(`利用者を切り替えました（${employeeNo}）`);
    window.location.replace("/"); // full reload: header must show the new user immediately
  }

  const box = (t: Target) => ({ fontSize: 26, width: 240, borderWidth: 2, borderColor: target === t ? "var(--primary)" : undefined });
  return (
    <div className="tablet-screen">
      <PageHeader title="利用者切替（PIN）" />
      <p className="muted">共有端末で操作する人を切り替えます（通信できる場合のみ）。</p>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 600 }}>社員番号<br />
            <input style={box("employeeNo")} value={employeeNo} onFocus={() => setTarget("employeeNo")}
              onChange={(e) => setEmployeeNo(e.target.value.toUpperCase())} />
          </label>
          <label style={{ fontWeight: 600 }}>PIN（4桁）<br />
            <input style={box("pin")} type="password" inputMode="numeric" value={pin} onFocus={() => setTarget("pin")}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </label>
          <button type="button" className="button-primary button-large"
            disabled={busy || pin.length !== 4 || employeeNo.length < 2} onClick={handleSwitch}>
            切り替える
          </button>
        </div>
        <TabletNumericPad onKey={handleKey} />
      </div>
    </div>
  );
}
