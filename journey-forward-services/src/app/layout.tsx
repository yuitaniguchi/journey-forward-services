import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Journey Forward Services",
  description: "Quickly book and clear out unwanted items.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans bg-neutral-50 text-slate-900`}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
