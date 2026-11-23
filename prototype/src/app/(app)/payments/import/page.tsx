"use client";

import { useState } from "react";
import { PaymentBatchList } from "@/components/payments/payment-batch-list";
import { FormField } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorAlert, InfoAlert } from "@/components/ui/status-states";
import { useToast } from "@/components/ui/toast-provider";

type ImportResult = { imported: number; errors: { line: number; reason: string; buyer_no?: string }[] };

// 入金CSV取込: provisional sample format 「買受人番号,入金日,金額」 (the real accounting format is still
// to be confirmed with the customer). Preview, import; unknown 買受人番号 lines are listed and skipped.
export default function PaymentImportPage() {
  const { showToast } = useToast();
  const [fileName, setFileName] = useState("");
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imports, setImports] = useState(0);

  async function pick(file: File | undefined) {
    setResult(null);
    if (!file) return;
    if (file.size > 1_000_000) return showToast("ファイルは1MBまでです", "error");
    setFileName(file.name);
    setCsv(await file.text());
  }

  async function importFile() {
    try {
      const res = await fetch("/api/payments/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName, csv }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setImports((n) => n + 1);
        showToast(`入金データを ${(json as ImportResult).imported}件 取り込みました`);
      }
      if (res.ok || res.status === 422) {
        if (res.status === 422) showToast("取り込めない行があります。内容を確認してください", "error");
        return setResult(json as ImportResult);
      }
      showToast(json?.error?.message ?? `エラー（${res.status}）`, "error");
    } catch {
      showToast("サーバーに接続できません", "error");
    }
  }

  return (
    <>
      <PageHeader title="入金CSV取込" />
      <InfoAlert>取込形式（仮）：見出し行「買受人番号,入金日,金額」、例「N01,2026-11-07,123456」。正式な形式は確認中です。</InfoAlert>
      <div className="form-grid">
        <FormField label="CSVファイル" required hint="1MBまで">
          <input type="file" accept=".csv,text/csv" onChange={(e) => pick(e.target.files?.[0])} />
        </FormField>
      </div>
      {csv && (
        <>
          <h3>プレビュー（先頭15行）</h3>
          <pre style={{ maxHeight: 220, overflow: "auto", background: "var(--surface-muted)", border: "1px solid var(--border)", padding: 10, fontSize: 13 }}>{csv.split(/\r?\n/).slice(0, 15).join("\n")}</pre>
        </>
      )}
      <div className="form-actions"><button type="button" className="button-primary" disabled={!csv} onClick={importFile}>取り込む</button></div>
      {result && (
        <>
          <p>取込 <strong>{result.imported}</strong> 件 ／ エラー <strong>{result.errors.length}</strong> 件</p>
          {result.errors.length > 0 && <ErrorAlert message={result.errors.map((e) => `${e.line}行目 ${e.buyer_no ?? ""}：${e.reason}`).join(" ／ ")} />}
        </>
      )}
      <PaymentBatchList reloadKey={imports} />
    </>
  );
}
