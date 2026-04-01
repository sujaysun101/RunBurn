"use client";

import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="md:hidden">
          <Menu className="mr-2 size-4" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="-mx-4 -my-6 h-full">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
