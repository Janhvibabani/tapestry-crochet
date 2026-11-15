"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "@/components/doodles/Doodles";

const links = [
  { href: "/", label: "upload" },
  { href: "/studio", label: "pattern" },
  { href: "/crochet", label: "crochet mode" },
];

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:pt-6">
      <Link href="/" className="group flex min-h-11 items-center gap-2 rounded-lg">
        <Star className="h-8 w-8 transition-transform group-hover:rotate-12" />
        <span className="font-display text-2xl sm:text-3xl">tiny tapestry</span>
      </Link>
      <nav aria-label="Main" className="flex gap-1.5 sm:gap-2">
        {links.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`paper inline-flex min-h-11 items-center px-3 py-1 text-base sm:text-lg ${active ? "bg-lilac" : "bg-paper/80 hover:bg-butter"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
