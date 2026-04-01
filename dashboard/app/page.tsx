import Link from "next/link";
import { ArrowRight, Flame, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-between gap-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Flame className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Runburn</p>
              <p className="text-sm text-muted-foreground">GitHub Actions Cost Intelligence</p>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/auth">Sign in</Link>
          </Button>
        </header>

        <section className="grid items-end gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="size-3.5" />
              GitHub Developer Program ready
            </p>
            <div className="max-w-4xl space-y-6">
              <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
                Turn Actions minutes into team-level cost decisions.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Runburn ingests workflow runs from your GitHub organization, prices every run in dollars, spots waste,
                and generates AI-backed YAML fixes engineers can apply immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/auth">
                  Connect GitHub
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">View demo dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-panel backdrop-blur">
            <div className="rounded-[1.5rem] bg-background/85 p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Monthly CI spend</span>
                <span className="rounded-full bg-danger/15 px-3 py-1 text-danger">+$318 wasted</span>
              </div>
              <p className="mt-4 text-5xl font-semibold">$1,842</p>
              <div className="mt-8 flex flex-col gap-4">
                {[
                  ["macOS runner overuse", "$142/mo savings"],
                  ["No dependency caching", "$64/mo savings"],
                  ["Branch-trigger overreach", "$33/mo savings"]
                ].map(([title, value]) => (
                  <div key={title} className="flex items-center justify-between rounded-[1.25rem] bg-muted/65 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <GitBranch className="size-4 text-primary" />
                      <span className="text-sm">{title}</span>
                    </div>
                    <span className="text-sm text-success">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
