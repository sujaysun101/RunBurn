import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Runburn",
  description: "GitHub Actions cost intelligence dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
