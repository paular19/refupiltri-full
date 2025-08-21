import PathStatusView from "@/components/Admin/PathStatusView";

export const revalidate = 0; // siempre datos frescos

export default function StatusPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-poppins font-semibold text-[#1A222B] mb-6">
        Estado del camino y clima
      </h1>
      <PathStatusView />
    </main>
  );
}
