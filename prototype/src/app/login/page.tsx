import { APP_TITLE } from "@/lib/app-title";
import { SampleDataBanner } from "@/components/common/sample-data-banner";
import { LoginForm } from "./login-form";

// 社内ログイン. Public page; the proxy redirects signed-in users to "/".
export default function LoginPage() {
  return (
    <>
      <SampleDataBanner />
      <main className="login-page">
        <div className="login-card">
          <div className="card">
            <h1>{APP_TITLE}</h1>
            <p className="muted" style={{ textAlign: "center", margin: "0 0 16px", fontSize: 13 }}>社内ログイン</p>
            <LoginForm />
          </div>
          <p className="muted" style={{ fontSize: 12, textAlign: "center" }}>
            アカウントはシステム管理者が発行します（新規登録はできません）。
          </p>
        </div>
      </main>
    </>
  );
}
