import type { Metadata, Viewport } from "next";
import { Cherry_Bomb_One, Patrick_Hand } from "next/font/google";
import { SiteHeader } from "@/components/ui/SiteHeader";
import "./globals.css";

const cherry = Cherry_Bomb_One({ variable: "--font-cherry", weight: "400", subsets: ["latin"] });
const patrick = Patrick_Hand({ variable: "--font-patrick", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "tiny tapestry",
  description: "Turn any picture into a crochet tapestry pattern, one colour per stitch.",
};

export const viewport: Viewport = {
  themeColor: "#fbf5e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cherry.variable} ${patrick.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
        <footer className="px-4 py-8 text-center text-ink-soft text-base">
          made with yarn &amp; love ✿ one colour per stitch
        </footer>
      </body>
    </html>
  );
}
