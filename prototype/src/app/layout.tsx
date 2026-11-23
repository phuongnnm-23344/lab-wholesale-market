import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { APP_TITLE } from "@/lib/app-title";
import "./globals.css";
import "./ui-components.css";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "試作版。表示されるデータはすべて架空のサンプルです。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={notoSansJp.variable}>
      <body>{children}</body>
    </html>
  );
}
