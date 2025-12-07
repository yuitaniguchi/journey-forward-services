import AdminLoginForm from "@/components/admin/AdminLoginForm";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  // 🔴 Promise を await してから使う
  const sp = await searchParams;
  const rawNext = sp.next;

  // next パラメータを安全に取り出す
  let next = "/admin";
  if (typeof rawNext === "string" && rawNext.startsWith("/")) {
    next = rawNext;
  }

  return <AdminLoginForm next={next} />;
}
