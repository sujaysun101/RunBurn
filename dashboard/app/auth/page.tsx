import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-panel backdrop-blur">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Runburn</p>
        <h1 className="mt-4 text-3xl font-semibold">Sign in with GitHub</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Authenticate through Supabase, match your GitHub App installations, and land directly in the dashboard.
        </p>
        <Button asChild className="mt-8 w-full">
          <Link href="/auth/sign-in">
            <Github className="mr-2 size-4" />
            Continue with GitHub
          </Link>
        </Button>
      </div>
    </main>
  );
}
