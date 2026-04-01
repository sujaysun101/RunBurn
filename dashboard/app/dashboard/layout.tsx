import { ReactNode } from "react";
import { MobileSidebar } from "@/components/MobileSidebar";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Operator Workspace</p>
              <h1 className="text-2xl font-semibold">CI Spend Intelligence</h1>
            </div>
            <MobileSidebar />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
