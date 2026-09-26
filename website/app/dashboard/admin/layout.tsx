import Sidebar from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user: any = await getCurrentUser();

  return (
    <>
      <Sidebar
        role="admin"
        activeMenu="Dashboard Overview"
        user={{
          name: user?.name || "",
          email: user?.email || "",
          role: user?.role || "",
          jenisUser: user?.jenisUser || null,
          identifier: user?.identifier || null,
        }}
      />
      <main className="ml-[230px] min-h-screen bg-[#f7f9fb]">
        {children}
      </main>
    </>
  );
}
