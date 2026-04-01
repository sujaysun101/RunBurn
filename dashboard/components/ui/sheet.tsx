"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used inside <Sheet>");
  }
  return context;
}

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({
  asChild,
  children
}: {
  asChild?: boolean;
  children: React.ReactElement;
}) {
  const { setOpen } = useSheetContext();
  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent) => {
      children.props.onClick?.(event);
      setOpen(true);
    }
  });
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />;
}

export function SheetContent({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open, setOpen } = useSheetContext();

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <div className={cn("fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm border-r bg-background p-6 shadow-panel", className)}>
        {children}
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </button>
      </div>
    </>
  );
}
