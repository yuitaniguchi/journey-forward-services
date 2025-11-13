import {
  getTokenFromCookies,
  verifyAdminJWT,
  clearSessionCookie,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminHome() {
  const token = await getTokenFromCookies();
  if (!token) redirect("/admin/login");
  let username = "admin";
  try {
    const s = await verifyAdminJWT(token);
    username = s.username;
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Home</h1>
      <p className="mb-6">Welcome, {username}!</p>
      <form action="/api/admin/logout" method="post">
        <button className="border rounded px-4 py-2">Logout</button>
      </form>
    </div>
  );
}
