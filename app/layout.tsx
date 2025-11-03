import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "HireSight - AI-Powered Recruitment Platform",
  description: "Evaluate candidates intelligently with AI-powered CV analysis and LinkedIn profile evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a14] text-white min-h-screen">
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

