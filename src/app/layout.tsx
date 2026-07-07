import type { Metadata } from "next";
import { Cairo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Azzam — منشئ السير الذاتية بالذكاء الاصطناعي",
  description: "Azzam — حوّل بياناتك المهنية إلى سيرة ذاتية احترافية ثنائية اللغة بالذكاء الاصطناعي. قوالب ATS، تخصيص ألوان، تنزيل PDF و Word.",
  keywords: ["Azzam", "عزام", "سيرة ذاتية", "CV", "ذكاء اصطناعي", "AI", "PDF", "عربي", "ATS"],
  authors: [{ name: "Azzam" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <body
        className={`${cairo.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
