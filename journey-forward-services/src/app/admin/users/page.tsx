import { prisma } from "@/lib/prisma";
import AdminUsersClient, {
  AdminUser,
} from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

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
