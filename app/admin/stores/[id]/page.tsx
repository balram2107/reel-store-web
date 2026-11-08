"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { AdminStore } from "@/lib/types";
import { ErrBox } from "@/components/ui";
import AdminStoreForm from "@/components/AdminStoreForm";
export default function AdminStorePage() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<AdminStore | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [reason, setReason] = useState("");
  const o = { auth: true, store: false };
  useEffect(() => {
    api<{ store: AdminStore }>(`/admin/stores/${id}`, {
      auth: true,
      store: false,
    })
      .then((x) => setS(x.store))
      .catch(setErr);
  }, [id]);
  async function call(path: string, method: string, body?: unknown) {
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      const x = await api<{ store: AdminStore }>(`/admin/stores/${id}${path}`, {
        method,
        body,
        ...o,
      });
      setS(x.store);
      setOk(true);
    } catch (e) {
      setErr(e);
    }
    setBusy(false);
  }
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
          margin: "8px 0 4px",
        }}
      >
        {s?.name || "Store"}
      </h1>
      {s && (
        <p className="mut" style={{ marginBottom: 16 }}>
          {s.seller_email} ·{" "}
          <span className={"b " + (s.status === "live" ? "g" : "r")}>
            {s.status === "live" ? "Live" : "Suspended"}
          </span>
        </p>
      )}
      <ErrBox e={err} />
      {ok && (
        <div className="alert i" role="status">
          Saved.
        </div>
      )}
      {!s && !err && <p className="mut">Loading…</p>}
      {s && (
        <div
          className="g"
          style={{
            alignItems: "start",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,640px))",
          }}
        >
          <div className="card" style={{ padding: 24 }}>
            <h2 className="h2">Store</h2>
            <AdminStoreForm
              busy={busy}
              label="Save changes"
              initial={{
                name: s.name,
                slug: s.slug,
                features: s.features,
                ends_on: s.ends_on || "",
              }}
              onSubmit={(v) =>
                call("", "PATCH", {
                  name: v.name,
                  slug: v.slug,
                  features: v.features,
                  ends_on: v.ends_on,
                })
              }
            />
          </div>
          <div className="card">
            <h2 className="h2">
              {s.status === "live" ? "Suspend store" : "Reinstate store"}
            </h2>
            {s.status === "live" ? (
              <>
                <label className="f">
                  Reason (optional)
                  <input
                    className="in"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <button
                  className="btn s"
                  style={{ color: "var(--red)" }}
                  disabled={busy}
                  onClick={() => call("/suspend", "POST", { reason })}
                >
                  Suspend store
                </button>
              </>
            ) : (
              <button
                className="btn"
                disabled={busy}
                onClick={() => call("/reinstate", "POST")}
              >
                Reinstate store
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
