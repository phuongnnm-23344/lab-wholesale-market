"use client";

import Link from "next/link";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { useApiResource } from "@/components/common/use-api-resource";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { fiscalYearLabel, fiscalYearStart, RULE_STATUS_LABELS, type RuleVersion } from "@/lib/rules/rule-version-types";

type ListResponse = { versions: RuleVersion[]; appliedVersionId: string | null; today: string; quota: Record<string, number>; staff: Record<string, string>; me: CurrentUser };

// SC-10-01 規則版一覧: status, 「適用中」 column computed from today's business date (n3), quota x/4 per fiscal
// year of the effective date (PRM-042: rollback counts, cancelled-before-effective does not).
export default function RuleVersionListPage() {
  const { data, error } = useApiResource<ListResponse>("/api/rule-versions");
  const isMaker = data?.me.role === "RULE";

  return (
    <section className="card">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>規則版・交付率（業務日 {data?.today ?? "—"}）</h1>
      {isMaker && <Link href="/rules/new" className="button-secondary">新しい版を起票</Link>}
      {error && <p className="error-text" role="alert">{error}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead><tr><th align="left">版</th><th align="left">発効日</th><th align="left">状態</th><th align="left">適用中</th><th align="left">年度の発効回数</th><th align="left">起票者 / 承認者</th><th align="left">備考</th></tr></thead>
        <tbody>{(data?.versions ?? []).map((v) => (
          <tr key={v.id} style={{ borderTop: "1px solid var(--border)" }}>
            <td><Link href={v.status === "DRAFT" ? `/rules/${v.id}/rates` : `/rules/${v.id}/review`}>第{v.version_no}版</Link></td>
            <td>{v.effective_from}</td>
            <td>{RULE_STATUS_LABELS[v.status] ?? v.status}{v.rollback_of ? "（ロールバック）" : ""}</td>
            <td>{v.id === data?.appliedVersionId ? "● 適用中" : ""}</td>
            <td>{fiscalYearLabel(v.effective_from)} {data?.quota[fiscalYearStart(v.effective_from)] ?? 0}/4</td>
            <td>{v.maker_id ? data?.staff[v.maker_id] : "—"} / {v.checker_id ? data?.staff[v.checker_id] : "—"}</td>
            <td>{v.note}</td>
          </tr>
        ))}</tbody>
      </table>
      <p className="muted" style={{ fontSize: 13 }}>発効日は月初のみ。承認は年度（発効日基準）4回まで、ロールバックも1回に数えます（PRM-042）。</p>
      <ScreenIdFooter screenId="SC-10-01" trace="FT-10-01 / FR-RULE-01, GOV-RULE-01, PRM-042" />
    </section>
  );
}
