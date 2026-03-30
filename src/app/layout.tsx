import type { Metadata } from "next";
import { Righteous, Inter, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
});

export const metadata: Metadata = {
  title: "Go Turkmenistan — Discover the Undiscovered",
  description:
    "Explore Turkmenistan — the world's last great undiscovered destination. Ancient history, dramatic landscapes, and warm hospitality await.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${righteous.variable} ${inter.variable} ${redHatDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
