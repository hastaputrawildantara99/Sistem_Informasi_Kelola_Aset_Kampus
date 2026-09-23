import Navbar from "@/components/dashboard/navbar";
import { getCurrentUser } from "@/lib/auth";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar
        user={user ? {
          name: typeof user.name === "string" ? user.name : "",
          email: typeof user.email === "string" ? user.email : "",
          role: typeof user.role === "string" ? user.role : "",
          jenisUser: typeof user.jenisUser === "string" ? user.jenisUser : null,
          identifier: typeof user.identifier === "string" ? user.identifier : null,
        } : undefined}
      />

      <main className="pt-16">...</main>
    </>
  );
}
