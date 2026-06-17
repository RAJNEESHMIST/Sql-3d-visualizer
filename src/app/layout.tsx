import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQLVision 3D - Interactive SQL Query Visualization Platform",
  description: "An educational 3D query simulator to teach SQL visually. Pastes queries and animates exactly how database joins, aggregates, scans, and ordering work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-foreground">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 glass-panel py-3 px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-neon-blue rounded-full hologram-effect" />
              <span className="font-bold text-lg tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                SQLVISION 3D
              </span>
            </Link>
          </div>
          
          <nav className="flex gap-6 items-center">
            <Link
              href="/playground"
              className="text-sm text-gray-300 hover:text-neon-blue transition-colors"
            >
              Playground
            </Link>
            <Link
              href="/learn"
              className="text-sm text-gray-300 hover:text-neon-blue transition-colors"
            >
              Learn
            </Link>
            <Link
              href="/challenge"
              className="text-sm text-gray-300 hover:text-neon-blue transition-colors"
            >
              Challenges
            </Link>
          </nav>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="w-full border-t border-white/5 py-4 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2 glass-panel">
          <div>© {new Date().getFullYear()} SQLVision 3D. Educational interactive visualizer.</div>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Terms</span>
            <span className="hover:text-gray-300 cursor-pointer">Privacy</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
