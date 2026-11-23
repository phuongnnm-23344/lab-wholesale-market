"use client";

import Link from "next/link";
import { useApiResource } from "@/components/common/use-api-resource";
import { PageHeader } from "@/components/ui/page-header";
import { ListStates, StatusBadge } from "@/components/ui/status-states";
import type { CurrentUser } from "@/lib/auth/app-role-types";
import { formatDate } from "@/lib/format/display-format";
import { fiscalYearLabel, fiscalYearStart, RULE_STATUS_LABELS, RULE_STATUS_TONES, type RuleVersion } from "@/lib/rules/rule-version-types";

type ListResponse = { versions: RuleVersion[]; appliedVersionId: string | null; today: string; quota: Record<string, number>; staff: Record<string, string>; me: CurrentUser };

// 規則版一覧: status, 「適用中」 computed from today's business date, approvals used per fiscal year
// of the effective date (rollback counts, cancelled-before-effective does not).
export default function RuleVersionListPage() {
  const { data, error } = useApiResource<ListResponse>("/api/rule-versions");
  const isMaker = data?.me.role === "RULE";
  const versions = data?.versions ?? [];

  return (
    <>
      <PageHeader title="規則版・交付率" actions={isMaker ? <Link href="/rules/new" className="button-primary">新しい版を起票</Link> : undefined} />
      <p className="muted" style={{ fontSize: 13 }}>発効日は月初のみです。承認は年度（発効日基準）4回まで、ロールバックも1回に数えます。</p>
      <ListStates loading={!data} error={error} empty={versions.length === 0} emptyText="規則版はありません。">
        <table>
          <thead><tr><th>版</th><th>発効日</th><th>状態</th><th>適用中</th><th>年度の発効回数</th><th>起票者 / 承認者</th><th>備考</th></tr></thead>
          <tbody>{versions.map((v) => (
            <tr key={v.id}>
              <td><Link href={v.status === "DRAFT" ? `/rules/${v.id}/rates` : `/rules/${v.id}/review`}>第{v.version_no}版</Link></td>
              <td>{formatDate(v.effective_from)}</td>
              <td><StatusBadge tone={RULE_STATUS_TONES[v.status]}>{RULE_STATUS_LABELS[v.status] ?? v.status}</StatusBadge>{v.rollback_of && <> <StatusBadge tone="info">ロールバック</StatusBadge></>}</td>
              <td>{v.id === data?.appliedVersionId && <StatusBadge tone="success">適用中</StatusBadge>}</td>
              <td>{fiscalYearLabel(v.effective_from)} {data?.quota[fiscalYearStart(v.effective_from)] ?? 0}/4</td>
              <td>{v.maker_id ? data?.staff[v.maker_id] : "—"} / {v.checker_id ? data?.staff[v.checker_id] : "—"}</td>
              <td>{v.note}</td>
            </tr>
          ))}</tbody>
        </table>
      </ListStates>
    </>
  );
}
