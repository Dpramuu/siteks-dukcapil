import Sidebar from "../components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-bg text-ink">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">
        {children}
      </main>
    </div>
  );
}