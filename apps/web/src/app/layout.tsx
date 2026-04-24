import type { Metadata } from "next";
import type { Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Fluxo",
  description: "Fluxo web app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} min-h-dvh overflow-x-hidden antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
