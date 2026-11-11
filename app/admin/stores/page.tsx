"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AdminRow, Meta } from "@/lib/types";
import { ErrBox, Pager } from "@/components/ui";
import { useRouter } from "next/navigation";
import { startImpersonation } from "@/lib/impersonation";

const STATUS: Record<string, [string, string]> = {
  live: ["Live", "g"],
  active: ["Live", "g"],
  pending: ["Pending", "n"],
  suspended: ["Suspended", "r"],
  expired: ["Expired", "n"],
  closed: ["Closed", "n"],
};

export default function AdminStores() {
  const r = useRouter();
  const [q, setQ] = useState("");
  const [qs, setQs] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [d, setD] = useState<{ stores: AdminRow[]; meta: Meta } | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [approving, setApproving] = useState<number | string | null>(null);

  useEffect(() => {
    setD(null);
    setErr(null);

    const p = new URLSearchParams({ page: String(page) });
    if (qs) p.set("q", qs);
    if (status) p.set("status", status);

    api<{ stores: AdminRow[]; meta: Meta }>(`/admin/stores?${p}`, {
      auth: true,
      store: false,
    })
      .then(setD)
      .catch(setErr);
  }, [qs, status, page]);

  const approveStore = async (storeId: number | string) => {
    if (!confirm("Are you sure you want to approve this store?")) return;

    try {
      setApproving(storeId);
      setErr(null);

      await api(`/admin/stores/${storeId}/approve`, {
        method: "PATCH",
        auth: true,
        store: false,
      });

      // Refresh store list
      setD(null);

      const p = new URLSearchParams({ page: String(page) });
      if (qs) p.set("q", qs);
      if (status) p.set("status", status);

      const result = await api<{ stores: AdminRow[]; meta: Meta }>(
        `/admin/stores?${p}`,
        { auth: true, store: false },
      );

      setD(result);
    } catch (error) {
      setErr(error);
    } finally {
      setApproving(null);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600 }}>
          Stores
        </h1>
        <Link className="btn auto" href="/admin/stores/new">
          Create store
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQs(q);
          setPage(1);
        }}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          className="in"
          style={{ marginTop: 0, maxWidth: 320 }}
          type="search"
          aria-label="Search stores"
          placeholder="Store name or seller email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="in"
          style={{ marginTop: 0, maxWidth: 180 }}
          aria-label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="live">Live</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="closed">Closed</option>
          <option value="expired">Ended</option>
        </select>

        <button className="btn auto">Search</button>
      </form>

      <ErrBox e={err} />

      <div className="card">
        {!d && !err && <p className="mut">Loading…</p>}
        {d && d.stores.length === 0 && <p className="mut">No stores found.</p>}

        {d?.stores.map((s, i) => {
          const [l, k] = STATUS[s.status] || [s.status, "n"];

          return (
            <div className={"row" + (i === 0 ? " first" : "")} key={s.id}>
              <span>
                <b>{s.name}</b>
                <br />
                <span className="mut">{s.seller_email}</span>
              </span>

              <span className="mut t">{s.orders_count} orders</span>

              <span className={"b " + k}>{l}</span>

              <span
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {s.status === "pending" && (
                  <button
                    className="btn s auto"
                    disabled={approving === s.id}
                    onClick={() => approveStore(s.id)}
                  >
                    {approving === s.id ? "Approving..." : "Approve store"}
                  </button>
                )}

                <button
                  className="btn s auto"
                  onClick={() => {
                    startImpersonation({ id: s.id, name: s.name });
                    r.push("/dashboard");
                  }}
                >
                  Manage as seller
                </button>

                <Link href={"/admin/stores/" + s.id}>Details</Link>
                <a href={"/" + s.slug}>View store</a>
              </span>
            </div>
          );
        })}
      </div>

      {d && <Pager meta={d.meta} onPage={setPage} />}
    </>
  );
}
