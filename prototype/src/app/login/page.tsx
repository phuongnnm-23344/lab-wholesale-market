import { APP_TITLE } from "@/lib/app-title";
import { SampleDataBanner } from "@/components/common/sample-data-banner";
import { ScreenIdFooter } from "@/components/common/screen-id-footer";
import { LoginForm } from "./login-form";

// SC-00-01 社内ログイン. Public page; the proxy redirects signed-in users to "/".
export default function LoginPage() {
  return (
    <>
      <SampleDataBanner />
      <main style={{ maxWidth: 420, margin: "48px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 20 }}>{APP_TITLE}</h1>
        <div className="card">
          <h2 style={{ fontSize: 18, marginTop: 0 }}>社内ログイン</h2>
          <LoginForm />
        </div>
        <p className="muted" style={{ fontSize: 13 }}>
          アカウントはシステム管理者が発行します（新規登録はできません）。
        </p>
        <ScreenIdFooter screenId="SC-00-01" trace="FT-02-01 / FR-IAM-01, NFR-SEC-03（MFA は試作対象外）" />
      </main>
    </>
  );
}
