import Sidebar from "../components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-zinc-950 p-6">
        {children}
      </main>
    </div>
  );
}