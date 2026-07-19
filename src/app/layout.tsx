import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rewind — Remember the Good Days",
  description: "Take a nostalgic trip back to your childhood. Remember who you were before the world told you who to be.",
  keywords: ["nostalgia", "childhood memories", "retro", "remember", "rewind", "90s", "80s", "2000s"],
  authors: [{ name: "Rewind" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📼</text></svg>",
  },
  openGraph: {
    title: "Rewind — Remember the Good Days",
    description: "Take a nostalgic trip back to your childhood.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rewind — Remember the Good Days",
    description: "Take a nostalgic trip back to your childhood.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Special+Elite&family=LXGW+WenKai&display=swap" rel="stylesheet" />
      </body>
    </html>
  );
}
