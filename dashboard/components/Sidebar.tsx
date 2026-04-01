"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FlaskConical, FolderKanban, Home, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const items = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/repos", label: "Repositories", icon: FolderKanban },
  { href: "/dashboard/workflows/runburn-demo/platform-web/CI%20%2F%20test-and-build", label: "Workflows", icon: BarChart3 },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-border/70 bg-card/55 px-4 py-6 backdrop-blur md:flex md:w-[280px] md:flex-col">
      <div className="flex items-center gap-3 px-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <FlaskConical className="size-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Runburn</p>
          <h1 className="text-lg font-semibold">CI Cost Intelligence</h1>
        </div>
      </div>
      <Separator className="my-6" />
      <nav className="flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-muted/50 hover:text-foreground",
                active && "bg-muted text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-[1.4rem] border border-border/60 bg-background/75 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Free tier watch</p>
        <p className="mt-2 text-sm text-muted-foreground">Track 5 repos on free. Upgrade to unlock recommendations and 12-month history.</p>
      </div>
    </aside>
  );
}
