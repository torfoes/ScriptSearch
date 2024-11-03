import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScriptSearch",
  description: "Semantically search within youtube video transcripts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header/>
        <main className="flex-grow flex items-center justify-center ">
          {children}
        </main>
      </body>
    </html>
  );
}
