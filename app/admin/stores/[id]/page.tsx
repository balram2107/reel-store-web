"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { AdminStore } from "@/lib/types";
import { ErrBox } from "@/components/ui";
import AdminStoreForm from "@/components/AdminStoreForm";
import { ToastProvider } from "@/components/feedback";

const STATUS: Record<string, [string, string]> = {
  live: ["Live", "g"],
  active: ["Live", "g"],
  pending: ["Pending", "n"],
  suspended: ["Suspended", "r"],
  expired: ["Expired", "n"],
  closed: ["Closed", "n"],
};

export default function AdminStorePage() {
  const { id } = useParams<{ id: string }>();

  const [s, setS] = useState<AdminStore | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [reason, setReason] = useState("");

  const o = { auth: true, store: false };

  useEffect(() => {
    let cancelled = false;

    api<{ store: AdminStore }>(`/admin/stores/${id}`, o)
      .then((x) => {
        if (!cancelled) setS(x.store);
      })
      .catch((e) => {
        if (!cancelled) setErr(e);
      });

    return () => {
      cancelled = true;
    };
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
    } finally {
      setBusy(false);
    }
  }

  // Determine the effective status using the expiry date.
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const isDateExpired = !!s?.ends_on && s.ends_on.slice(0, 10) <= todayString;

  // @ts-ignore
  const effectiveStatus =
      s?.status === "live" && isDateExpired ? "expired" : s?.status;

  const status = effectiveStatus
    ? STATUS[effectiveStatus] || [effectiveStatus, "n"]
    : null;

  // @ts-ignore
  const isLive = effectiveStatus === "live" || effectiveStatus === "active";
  const canSuspend = isLive;
  const canReinstate = effectiveStatus === "suspended";

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

      {s && status && (
        <p className="mut" style={{ marginBottom: 16 }}>
          {s.seller_email} ·{" "}
          <span className={"b " + status[1]}>{status[0]}</span>
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
            <h2 className="h2">Store lifecycle</h2>

            {effectiveStatus === "expired" ? (
              <p className="mut">
                This store has expired. Update its expiry date to extend the
                subscription. The database status must also be reactivated by
                the backend if necessary.
              </p>
            ) : canSuspend ? (
              <>
                <p className="mut">This store is currently active.</p>

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
            ) : canReinstate ? (
              <>
                <p className="mut">
                  This store is suspended. You can reinstate it.
                </p>

                <button
                  className="btn"
                  disabled={busy}
                  onClick={() => call("/reinstate", "POST")}
                >
                  Reinstate store
                </button>
              </>
            ) : (
              <p className="mut">
                No lifecycle action is available for this store's current status
                ({status?.[0]}).
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
