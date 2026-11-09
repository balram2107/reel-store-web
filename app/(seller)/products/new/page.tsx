"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";
export default function NewProduct() {
  const r = useRouter();
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
        Add product
      </h1>
      <div className="card" style={{ maxWidth: 640, padding: 24 }}>
        <ProductForm
          label="Add product"
          onSaved={(p) => r.push("/products")}
        />
      </div>
    </>
  );
}
