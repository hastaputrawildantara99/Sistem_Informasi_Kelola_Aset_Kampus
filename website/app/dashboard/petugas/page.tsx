import Sidebar from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function PetugasPage() {
  const user: any = await getCurrentUser();

  return (
    <>
      <Sidebar
        role="petugas"
        activeMenu="Dashboard"
        user={{
          name: user?.name || "",
          email: user?.email || "",
          role: user?.role || "",
          jenisUser: user?.jenisUser || null,
          identifier: user?.identifier || null,
        }}
      />

      <main className="ml-[230px]">...</main>
    </>
  );
}
