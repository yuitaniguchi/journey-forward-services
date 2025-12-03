"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/landing/NavBar";
import Footer from "@/components/landing/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <NavBar />}

      <main className="min-h-screen">{children}</main>

      {!isAdminPage && <Footer />}
    </>
  );
}
