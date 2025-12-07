import type { ReactNode } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <AdminHeader />
      <main className="mx-auto px-6 py-8 md:px-12 md:py-10">{children}</main>
    </div>
  );
}
