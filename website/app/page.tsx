import Navbar from "@/components/dashboard/navbar";

export default function Page() {
  return (
    <>
      <Navbar
        isLoggedIn
        user={{
          name: "Harits Permana",
          role: "USER",
          jenisUser: "DOSEN",
          identifier: "24060124140131",
        }}
      />

      <main className="pt-16">...</main>
    </>
  );
}
