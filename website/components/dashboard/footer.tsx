export default function DashboardFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center text-xs text-slate-500 sm:px-8">
      <p>
        © {new Date().getFullYear()} Sistem Informasi Kelola Aset Kampus.
        Semua hak dilindungi.
      </p>
    </footer>
  );
}
