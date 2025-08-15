import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// Font setup
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // ensures text is visible during font load
  weight: ["400", "500", "600", "700"], // optional: preload needed weights
});

export const metadata: Metadata = {
  title: "ViewTube",
  description: "YouTube Clone",
  icons: {
    icon: "./logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl={"/"}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
