import type { Metadata } from "next";
import "./globals.css";
import {
  Poppins,
  Plus_Jakarta_Sans,
  Geist,
  Gochi_Hand,
} from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

export const fontHeadingSecondary = Gochi_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading-secondary",
});

export const fontBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const metadata: Metadata = {
  title: "Fluxo.io",
  description: "A modern system Diagram design app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        fontHeading.variable,
        fontBody.variable,
        fontHeadingSecondary.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
