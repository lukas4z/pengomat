import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const display = Fraunces({ variable: "--font-display", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"] });
const text = Nunito({ variable: "--font-text", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pengomat – Peng lost aus. Du schenkst.",
  description: "Der Wichtel-o-mat mit Kater Peng.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2f4a3e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" data-theme="sticker" className={`${display.variable} ${text.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
