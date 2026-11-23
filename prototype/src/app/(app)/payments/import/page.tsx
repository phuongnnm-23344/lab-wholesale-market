"use client";

import { useState } from "react";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { PaymentBatchList } from "@/components/payments/payment-batch-list";

type ImportResult = { imported: number; errors: { line: number; reason: string; buyer_no?: string }[] };

// SC-09-01 入金CSV取込: FICTIONAL format 「買受人番号,入金日,金額」 (mock M07 — the real accounting format is
// open question E-01). Preview the file, import; unknown 買受人番号 lines are listed and skipped.
export default function PaymentImportPage() {
  const [fileName, setFileName] = useState("");
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imports, setImports] = useState(0);

  async function pick(file: File | undefined) {
    setResult(null);
    if (!file) return;
    if (file.size > 1_000_000) return setMessage("ファイルは1MBまでです");
    setFileName(file.name);
    setCsv(await file.text());
    setMessage(null);
  }

  async function importFile() {
    const res = await fetch("/api/payments/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName, csv }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setImports((n) => n + 1);
    if (res.ok || res.status === 422) return setResult(json as ImportResult);
    setMessage(json?.error?.message ?? `エラー（${res.status}）`);
  }

  return (
    <section className="card" style={{ display: "grid", gap: 10 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>入金CSV取込（サンプル形式）</h1>
      <p className="muted" style={{ margin: 0 }}>見出し行：買受人番号,入金日,金額 ／ 例：N01,2026-11-07,123456（架空データのみ）</p>
      <input type="file" accept=".csv,text/csv" onChange={(e) => pick(e.target.files?.[0])} />
      {csv && <pre style={{ maxHeight: 200, overflow: "auto", background: "var(--bg)", padding: 8 }}>{csv.split(/\r?\n/).slice(0, 15).join("\n")}</pre>}
      <button type="button" className="button-primary" disabled={!csv} onClick={importFile}>取り込む</button>
      {message && <p className="error-text" role="alert">{message}</p>}
      {result && (
        <div>
          <p>取込 {result.imported}件 ／ エラー {result.errors.length}件</p>
          <ul>{result.errors.map((e, i) => <li key={i} className="error-text">{e.line}行目 {e.buyer_no ?? ""}：{e.reason}</li>)}</ul>
        </div>
      )}
      <PaymentBatchList reloadKey={imports} />
      <ScreenIdFooter screenId="SC-09-01" trace="FT-09-01, FT-09-03 / B.5, FIG-013（形式は仮：E-01）" />
    </section>
  );
}
