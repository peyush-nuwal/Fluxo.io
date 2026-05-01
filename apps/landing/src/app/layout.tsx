import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";

export const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
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
      className={`${fontHeading.variable} ${fontBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
