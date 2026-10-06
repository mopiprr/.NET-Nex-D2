import { Suspense } from "react";
import Link from "next/link";
import { getLatestDay, getStatusCounts, getTopPizzas } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";

async function LatestDayStats() {
  const latest = await getLatestDay();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Tanggal Terakhir
        </p>
        <p className="mt-2 text-2xl font-black text-ink">{latest.date}</p>
      </div>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Total Order
        </p>
        <p className="mt-2 text-2xl font-black text-ink">
          {latest.orders.toLocaleString("en-US")}
        </p>
      </div>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
          Pendapatan
        </p>
        <p className="mt-2 text-2xl font-black text-ink">
          {formatPrice(latest.revenue)}
        </p>
      </div>
    </div>
  );
}

async function StatusCountsWidget() {
  const counts = await getStatusCounts();

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
    preparing: { label: "Menyiapkan", color: "bg-blue-100 text-blue-800" },
    ready: { label: "Siap", color: "bg-purple-100 text-purple-800" },
    delivered: { label: "Terkirim", color: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "Dibatalkan", color: "bg-rose-100 text-rose-800" },
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold">Status Pesanan</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(counts).map(([status, count]) => {
          const info = statusLabels[status] ?? {
            label: status,
            color: "bg-stone-100 text-stone-800",
          };
          return (
            <div
              key={status}
              className={`flex flex-col items-center rounded-lg p-3 ${info.color}`}
            >
              <span className="text-xs font-semibold">{info.label}</span>
              <span className="mt-1 text-2xl font-black">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function TopPizzasWidget() {
  const topPizzas = await getTopPizzas();

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">5 Pizza Terlaris</h2>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Lihat semua produk →
        </Link>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead className="border-b border-black/5 text-xs uppercase text-ink/60">
          <tr>
            <th className="py-2">Pizza</th>
            <th className="py-2 text-right">Terjual</th>
            <th className="py-2 text-right">Pendapatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {topPizzas.map((pizza) => (
            <tr key={pizza.id}>
              <td className="py-2.5 font-medium">{pizza.name}</td>
              <td className="py-2.5 text-right font-semibold">
                {pizza.sold.toLocaleString("en-US")}
              </td>
              <td className="py-2.5 text-right font-semibold">
                {formatPrice(pizza.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonWidget() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
      <div className="h-5 w-32 rounded bg-black/10" />
      <div className="mt-4 h-24 rounded bg-black/5" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Overview</h1>
        <p className="mt-1 text-ink/70">Ringkasan operasional toko</p>
      </div>

      <Suspense fallback={<SkeletonWidget />}>
        <LatestDayStats />
      </Suspense>

      <Suspense fallback={<SkeletonWidget />}>
        <StatusCountsWidget />
      </Suspense>

      <Suspense fallback={<SkeletonWidget />}>
        <TopPizzasWidget />
      </Suspense>
    </section>
  );
}
