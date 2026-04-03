"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            antisocial
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Compose
            </Link>
            <Link
              href="/settings"
              className={cn(
                "transition-colors hover:text-foreground",
                pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Platforms
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
