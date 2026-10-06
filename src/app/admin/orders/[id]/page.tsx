import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrder, setOrderStatus } from "@/lib/admin-data";
import { STATUS_LABELS, nextStatuses, type OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { updateOrderStatusAction } from "../../actions";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {                                                                       
    const { id } = await params;                                                                                                                          
    const orderId = Number(id);                                                                                                                           
                                                                                                                                                            
    // if (isNaN(orderId)) {
    // notFound();
    // }

      const order = await getOrder(orderId);
      if (!order) {
        notFound();
      }

      const possibleNextStatuses = nextStatuses(order.status);
                                                                                                                                                            
      // Server Action untuk mengupdate status                                                                                                              
      async function updateStatus(formData: FormData) {                                                                                                     
        "use server";                                                                                                                                       
        const nextStatus = formData.get("status") as OrderStatus;                                                                                           
        if (nextStatus) {                                                                                                                                   
          await setOrderStatus(orderId, nextStatus);                                                                                                        
          revalidatePath(`/admin/orders/${orderId}`);                                                                                                       
          revalidatePath("/admin/orders");                                                                                                                  
          revalidatePath("/admin");                                                                                                                         
        }                                                                                                                                                   
      }         
      
      const allowedNextStatuses = nextStatuses(order.status)

      return (                                                                                                                                              
        <section className="space-y-6">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-brand hover:underline">
              ← Kembali ke daftar order
            </Link>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Order #{order.id}</h1>
                <p className="mt-1 text-sm text-ink/60">
                  Waktu: {order.date} pukul {order.time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold text-ink">
                  Status: {STATUS_LABELS[order.status] ?? order.status}
                </span>

                {/* Tombol transisi status berikutnya */}
                {allowedNextStatuses.map((status) => (
                  <form key={status} action={updateStatus}>
                    <input type="hidden" name="status" value={status} />
                    <button                                                                                                                                 
                      type="submit"
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition ${
                        status === "cancelled"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-brand hover:bg-brand/90"                                                                                                    
                      }`}
                    >
                      Ubah ke {STATUS_LABELS[status]}                                                                                                       
                    </button>
                  </form>
                ))}
              </div>
            </div>                                                                                                                                          
          </div>

          {/* Tabel Item Pesanan */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b border-black/5 px-6 py-4 font-bold text-ink">
              Rincian Menu Pesanan
            </div>                                                                                                                                          
            <table className="w-full text-left text-sm">                                                                                                    
              <thead className="bg-stone-50 text-xs uppercase text-ink/60">                                                                                 
                <tr>                                                                                                                                        
                  <th className="px-6 py-3">Menu</th>                                                                                                       
                  <th className="px-6 py-3">Ukuran</th>                                                                                                     
                  <th className="px-6 py-3 text-right">Kuantitas</th>                                                                                       
                  <th className="px-6 py-3 text-right">Harga Satuan</th>                                                                                    
                  <th className="px-6 py-3 text-right">Subtotal</th>                                                                                        
                </tr>                                                                                                                                       
              </thead>                                                                                                                                      
              <tbody className="divide-y divide-black/5">                                                                                                   
                {order.lines.map((line, index) => (                                                                                                         
                  <tr key={index}>                                                                                                                          
                    <td className="px-6 py-3 font-medium text-ink">{line.name}</td>                                                                         
                    <td className="px-6 py-3 font-semibold text-ink/70">{line.size}</td>                                                                    
                    <td className="px-6 py-3 text-right">{line.quantity}</td>                                                                               
                    <td className="px-6 py-3 text-right">{formatPrice(line.price)}</td>                                                                     
                    <td className="px-6 py-3 text-right font-medium">                                                                                       
                      {formatPrice(line.price * line.quantity)}                                                                                             
                    </td>                                                                                                                                   
                  </tr>                                                                                                                                     
                ))}                                                                                                                                         
              </tbody>                                                                                                                                      
              <tfoot className="border-t border-black/10 bg-stone-50 font-bold">                                                                            
                <tr>                                                                                                                                        
                  <td colSpan={4} className="px-6 py-4 text-right">Total Tagihan</td>                                                                       
                  <td className="px-6 py-4 text-right text-lg text-ink">                                                                                    
                    {formatPrice(order.total)}                                                                                                              
                  </td>
                </tr>
              </tfoot>                                                                                                                                      
            </table>
          </div>
        </section>
      );
    }