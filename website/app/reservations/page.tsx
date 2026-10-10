import { redirect } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";
import ReservationHistory from "@/components/reservations/reservation-history";
import { getCurrentUser } from "@/lib/auth";

export default async function ReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar
        user={{
          name: typeof user.name === "string" ? user.name : "",
          email: typeof user.email === "string" ? user.email : "",
          role: typeof user.role === "string" ? user.role : "",
          jenisUser:
            typeof user.jenisUser === "string" ? user.jenisUser : null,
          identifier:
            typeof user.identifier === "string" ? user.identifier : null,
        }}
      />

      <main className="min-h-screen bg-gray-50 pt-16">
        <ReservationHistory />
      </main>
    </>
  );
}