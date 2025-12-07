// src/app/admin/users/page.tsx
// ❌ "use client" は削除（ここはサーバーコンポーネント）

import { prisma } from "@/lib/prisma";
import AdminUsersClient, {
  AdminUser,
} from "@/components/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const admins = await prisma.admin.findMany({
    orderBy: { id: "asc" },
  });

  const initialUsers: AdminUser[] = admins.map((a) => ({
    id: a.id,
    username: a.username,
    email: a.email,
    createdAt: a.createdAt.toISOString(),
  }));

  return <AdminUsersClient initialUsers={initialUsers} />;
}
