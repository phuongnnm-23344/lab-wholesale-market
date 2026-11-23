import type { Metadata } from "next";
import { APP_TITLE } from "@/lib/app-title";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "試作版（LAB-2）。表示されるデータはすべて架空のサンプルです。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
