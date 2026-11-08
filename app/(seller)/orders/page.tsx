"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { rupees, fmtDate } from "@/lib/format";
import type { OrderRow, Meta } from "@/lib/types";
import { Badge, ErrBox, Pager } from "@/components/ui";
const F = [
  ["all", "All"],
  ["to_pack", "To pack"],
  ["awaiting_payment", "Awaiting payment"],
  ["shipped", "Shipped"],
];
export default function Orders() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [qs, setQs] = useState("");
  const [page, setPage] = useState(1);
  const [d, setD] = useState<{ orders: OrderRow[]; meta: Meta } | null>(null);
  const [err, setErr] = useState<unknown>(null);
  useEffect(() => {
    setD(null);
    setErr(null);
    const p = new URLSearchParams({ filter, page: String(page) });
    if (qs) p.set("q", qs);
    api<{ orders: OrderRow[]; meta: Meta }>(`/seller/orders?${p}`, {
      auth: true,
    })
      .then(setD)
      .catch(setErr);
  }, [filter, qs, page]);
  return (
    <>
      <h1
        style={{
          fontSize: 28,
          lineHeight: "36px",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Orders
      </h1>
      <div className="tabs" role="group" aria-label="Filter orders">
        {F.map(([k, l]) => (
          <button
            key={k}
            aria-pressed={filter === k}
            onClick={() => {
              setFilter(k);
              setPage(1);
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQs(q);
          setPage(1);
        }}
        style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 480 }}
      >
        <input
          className="in"
          style={{ marginTop: 0 }}
          type="search"
          aria-label="Search orders"
          placeholder="Order ID or customer name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn auto">Search</button>
      </form>
      <ErrBox e={err} />
      <div className="card">
        {d && d.orders.length === 0 && <p className="mut">No orders found.</p>}
        {!d && !err && <p className="mut">Loading…</p>}
        {d?.orders.map((o, i) => (
          <div className={"row" + (i === 0 ? " first" : "")} key={o.id}>
            <span>
              <b>{o.public_id}</b> · {o.customer_name}
              <br />
              <span className="mut">{fmtDate(o.placed_at)}</span>
            </span>
            <span className="t">{rupees(o.total_paise)}</span>
            <Badge status={o.status} />
            <Link href={"/orders/" + o.id}>Open</Link>
          </div>
        ))}
      </div>
      {d && <Pager meta={d.meta} onPage={setPage} />}
    </>
  );
}
