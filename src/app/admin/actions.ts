"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getOrder, updatePizzaPrices } from "@/lib/admin-data";
import { pizzaExists } from "@/lib/data";
import { shouldFail, simulateLatency } from "@/lib/demo";
import { parsePrice } from "@/lib/format";
import type { PizzaSize } from "@/lib/types";
import { getOrderStatus, setOrderStatus } from "@/lib/admin-data";
import { canTransition, isOrderStatus, nextStatuses, OrderStatus } from "@/lib/orders";

const SIZES: PizzaSize[] = ["S", "M", "L"];

export type PriceFormState = {
  errors: Partial<Record<PizzaSize | "form", string>>;
  // What the user typed, so the form can show it again after an error
  values: Record<PizzaSize, string>;
} | null;

export async function updatePricesAction(
  _prev: PriceFormState,
  formData: FormData,
): Promise<PriceFormState> {
  const id = formData.get("id");
  const values = {
    S: String(formData.get("S") ?? ""),
    M: String(formData.get("M") ?? ""),
    L: String(formData.get("L") ?? ""),
  };

  if (typeof id !== "string" || !(await pizzaExists(id))) {
    return { errors: { form: "Produk tidak dikenal." }, values };
  }

  const errors: NonNullable<PriceFormState>["errors"] = {};
  const prices = { S: 0, M: 0, L: 0 };
  for (const size of SIZES) {
    const price = parsePrice(values[size]);
    if (price === null) {
      errors[size] = "Masukkan angka 0.01–100, maksimal 2 desimal.";
    } else {
      prices[size] = price;
    }
  }
  if (Object.keys(errors).length === 0 && !(prices.S < prices.M && prices.M < prices.L)) {
    errors.form = "Harga harus naik sesuai ukuran: S < M < L.";
  }
  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await simulateLatency("write");
  if (await shouldFail()) {
    return { errors: { form: "Gagal menyimpan. Coba lagi." }, values };
  }

  await updatePizzaPrices(id, prices);
  // The shop's menu and detail pages are cached with cacheTag("menu"):
  // expire them now so customers see the new price on their next request
  updateTag("menu");
  redirect(`/admin/products?updated=${id}`);
}
   
export type OrderActionState = {
        error?: string;
    } | null;

export async function updateOrderStatusAction(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
    // "use server"

    const id = Number(formData.get("orderId"));
    const nextStatus = formData.get("status");

    if(!Number.isInteger(id) || id <= 0 || isOrderStatus(nextStatus)) {
        return { error: "Data order atau status tidak valid" };
    }

    const currentStatus = await getOrderStatus(id);
    if (!currentStatus) {
        return { error: "Order tidakd itemukan"};
    }

    if (!canTransition(currentStatus, nextStatus)) {
        return {
            error: "Transisi Ilegal: tidak bisa mengubah status",
        };
    }

    await setOrderStatus(id, nextStatus as OrderStatus);

    updateTag("order");
    redirect(`/admin/orders?updated=${id}`);
}