"use client";

import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { TabletNumericPad } from "@/components/common/tablet-numeric-pad";
import { apiRequest } from "@/lib/http/api-client";

type Target = "employeeNo" | "pin";

// SC-00-02 利用者切替（PIN）— online only (offline PIN = mock M03). Only shop-floor roles / heads
// (role-list P12) can switch, never to SYSADM / RULE / 照合事務局 without head authority (Expert N1).
export default function SwitchUserPage() {
  const [employeeNo, setEmployeeNo] = useState("S");
  const [pin, setPin] = useState("");
  const [target, setTarget] = useState<Target>("pin");
  const [message, setMessage] = useState<string | null>(null);
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
    if (!res.ok) return setMessage(res.message);
    window.location.replace("/"); // full reload: header must show the new user immediately
  }

  const box = (t: Target) => ({ fontSize: 28, padding: 8, width: 220, border: target === t ? "2px solid var(--primary)" : undefined });
  return (
    <section className="card" style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>利用者切替（PIN）</h1>
      <p className="muted" style={{ margin: 0 }}>共有端末で操作する人を切り替えます。通信断中の切替は試作対象外です。</p>
      <label>社員番号<br />
        <input style={box("employeeNo")} value={employeeNo} onFocus={() => setTarget("employeeNo")}
          onChange={(e) => setEmployeeNo(e.target.value.toUpperCase())} />
      </label>
      <label>PIN（4桁）<br />
        <input style={box("pin")} type="password" inputMode="numeric" value={pin} onFocus={() => setTarget("pin")}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
      </label>
      <TabletNumericPad onKey={handleKey} />
      {message && <p className="error-text" role="alert">{message}</p>}
      <button type="button" className="button-primary" style={{ minHeight: 56, fontSize: 20 }}
        disabled={busy || pin.length !== 4 || employeeNo.length < 2} onClick={handleSwitch}>
        切り替える
      </button>
      <ScreenIdFooter screenId="SC-00-02" trace="FT-02-04 / NFR-SEC-03, role-list P12（オフライン・端末鍵は試作対象外）" />
    </section>
  );
}
