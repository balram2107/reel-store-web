"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { SellerProduct } from "@/lib/types";
import { ErrBox } from "@/components/ui";
import ProductForm from "@/components/ProductForm";
export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();
  const [p, setP] = useState<SellerProduct | null>(null);
  const [err, setErr] = useState<unknown>(null);
  useEffect(() => {
    api<{ product: SellerProduct }>(`/seller/products/${id}`, { auth: true })
      .then((x) => setP(x.product))
      .catch(setErr);
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
            <ProductForm product={p} onSaved={setP} />
          </div>
          <div className="card">
            <h2 className="h2">Delete product</h2>
            <p className="mut" style={{ marginBottom: 12 }}>
              Removes the product and its photos from your store.
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
