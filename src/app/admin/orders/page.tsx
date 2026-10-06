import Link from "next/link";
import { getOrders } from "@/lib/admin-data";
import { STATUS_LABELS } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

interface OrderPageProps {
    searchParams: Promise<{ page?: string; date?: string }>;
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
const { page: pageStr, date } = await searchParams;
const page = Math.max(1, Number(pageStr) || 1);

const { orders, totalPages } = await getOrders({ page, date: date || null });

return (
    <section>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">Order</h1>
              <p className="mt-1 text-ink/70">
                Daftar pesanan masuk (Halaman {page} dari {totalPages})
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-ink/60">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tanggal & Waktu</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Item</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-semibold text-ink">#{o.id}</td>
                    <td className="px-4 py-3 text-ink/80">
                      {o.date} <span className="text-xs text-ink/50">{o.time}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-ink">
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{o.items}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Link ke Rute Dinamis */}
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link
                href={`/admin/orders?page=${page - 1}`}
                className="rounded-lg bg-white px-4 py-2 font-medium shadow-sm hover:bg-stone-50"
              >
                ← Halaman Sebelumnya
              </Link>
            ) : <div />}

            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                className="rounded-lg bg-white px-4 py-2 font-medium shadow-sm hover:bg-stone-50"
              >
                Halaman Berikutnya →
              </Link>
            )}
          </div>
        </section>
    );
}