"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SellerProduct } from "@/lib/types";
import { ErrBox } from "@/components/ui";
import ProductForm, { SuccessNote } from "@/components/ProductForm";

const FLASH = "product_flash";
type Page = { products: { id: number }[]; meta: { total: number } };

// Finds the product after `id` in the same order as the list (position, id).
async function findNext(id: number): Promise<number | null> {
  const per = 100;
  for (let page = 1; ; page++) {
    const r = await api<Page>(`/seller/products?page=${page}&per_page=${per}`, {
      auth: true,
    });
    const i = r.products.findIndex((x) => x.id === id);
    if (i >= 0) {
      if (i + 1 < r.products.length) return r.products[i + 1].id;
      if (page * per < r.meta.total) {
        const n = await api<Page>(
          `/seller/products?page=${page + 1}&per_page=${per}`,
          { auth: true },
        );
        return n.products[0]?.id ?? null;
      }
      return null;
    }
    if (r.products.length === 0 || page * per >= r.meta.total) return null;
  }
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [p, setP] = useState<SellerProduct | null>(null);
  const [nextId, setNextId] = useState<number | null | undefined>(undefined); // undefined = loading
  const [flash, setFlash] = useState("");
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    setP(null);
    setErr(null);
    setNextId(undefined);
    const f = sessionStorage.getItem(FLASH);
    if (f) sessionStorage.removeItem(FLASH);
    setFlash(f || "");
    api<{ product: SellerProduct }>(`/seller/products/${id}`, { auth: true })
      .then((x) => setP(x.product))
      .catch(setErr);
    findNext(Number(id))
      .then(setNextId)
      .catch(() => setNextId(null));
  }, [id]);

  async function del() {
    if (!confirm("Delete this product? This can’t be undone.")) return;
    try {
      await api(`/seller/products/${id}`, { method: "DELETE", auth: true });
      r.push("/products");
    } catch (e) {
      setErr(e);
    }
  }

  return (
    <>
      <Link href="/products" style={{ fontSize: 14 }}>
        ← Products
      </Link>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          margin: "8px 0 16px",
        }}
      >
        Edit product
      </h1>
      {flash && <SuccessNote>{flash}</SuccessNote>}
      <ErrBox e={err} />
      {!p && !err && <p className="mut">Loading…</p>}
      {p && (
        <div
          className="g"
          style={{
            alignItems: "start",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,640px))",
          }}
        >
          <div className="card" style={{ padding: 24 }}>
            <ProductForm
              key={p.id}
              product={p}
              onSaved={setP}
              nextDisabled={typeof nextId !== "number"}
              nextLabel={
                nextId === null ? "No next product" : "Save & next product →"
              }
              onSaveNext={(saved) => {
                setP(saved);
                if (typeof nextId === "number") {
                  sessionStorage.setItem(
                    FLASH,
                    `“${saved.name}” saved successfully. Now editing the next product.`,
                  );
                  r.push(`/products/${nextId}`);
                }
              }}
            />
          </div>
          <div className="card">
            <h2 className="h2">Delete product</h2>
            <p className="mut" style={{ marginBottom: 12 }}>
              Removes the product and its photos from your store. A product that
              already has orders can’t be deleted; hide it instead.
            </p>
            <button
              className="btn s"
              style={{ color: "var(--red)" }}
              onClick={del}
            >
              Delete product
            </button>
          </div>
        </div>
      )}
    </>
  );
}
