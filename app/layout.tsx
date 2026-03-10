import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Second Brain",
  description: "A clean, searchable reference for memories and conversations."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
