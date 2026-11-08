"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { AdminStore } from "@/lib/types";
import { ErrBox } from "@/components/ui";
import AdminStoreForm from "@/components/AdminStoreForm";
export default function NewAdminStore() {
  const r = useRouter();
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Link href="/admin/stores" style={{ fontSize: 14 }}>
        ← Stores
      </Link>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          margin: "8px 0 16px",
        }}
      >
        Create store for a seller
      </h1>
      <div className="card" style={{ maxWidth: 640, padding: 24 }}>
        <ErrBox e={err} />
        <AdminStoreForm
          create
          busy={busy}
          label="Create store"
          onSubmit={async (v) => {
            setBusy(true);
            setErr(null);
            try {
              const x = await api<{ store: AdminStore }>("/admin/stores", {
                method: "POST",
                body: v,
                auth: true,
                store: false,
              });
              r.push("/admin/stores/" + x.store.id);
            } catch (e) {
              setErr(e);
              setBusy(false);
            }
          }}
        />
      </div>
    </>
  );
}
