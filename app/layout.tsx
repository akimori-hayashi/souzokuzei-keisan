import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "相続税 簡易計算ツール",
  description: "相続税の概算を簡単に計算できるツールです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-white text-gray-800 font-sans">
        <header className="bg-gray-100 border-b border-gray-200 py-4 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-gray-800">
              相続税 簡易計算ツール
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              概算額の目安です。正確な税額は税理士にご相談ください。
            </p>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
