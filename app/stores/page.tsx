"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // NEW
import {
  api,
  ApiError,
  getToken,
  getStoreId,
  setStoreId,
  clearToken,
  errText,
} from "@/lib/api";
import { Wordmark, Alert } from "@/components/ui";
type Row = {
  id: number;
  name: string;
  slug: string;
  status?: "open" | "closed";
  onboarding_complete?: boolean;
};
export default function Stores() {
  const r = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [cur, setCur] = useState<string | null>(null);
  useEffect(() => {
    if (!getToken()) {
      r.replace("/login");
      return;
    }
    setCur(getStoreId());
    const showAll = new URLSearchParams(window.location.search).has("all"); // NEW
    api<{ stores: Row[] }>("/seller/stores", { auth: true, store: false })
        .then((x) => {
          if (x.stores.length === 0) r.replace("/onboarding/1");
          else if (x.stores.length === 1 && !showAll) { // NEW
            setStoreId(x.stores[0].id);
            r.replace("/dashboard");
          } else setRows(x.stores);
        })
        .catch((e) =>
            setErr(
                e instanceof ApiError && e.status === 404
                    ? "The store list endpoint (GET /seller/stores) isn’t available on the backend yet."
                    : errText(e),
            ),
        );
  }, [r]);
  const open = (id: number) => {
    setStoreId(id);
    r.push("/dashboard");
  };
  return (
      <div style={{ minHeight: "100vh" }}>
        <header className="hd">
          <div className="w hdr">
            <Wordmark size={20} />
            <button
                className="btn s auto"
                onClick={() => {
                  clearToken();
                  r.replace("/login");
                }}
            >
              Log out
            </button>
          </div>
        </header>
        <main className="w" style={{ maxWidth: 640, padding: "32px 20px 48px" }}>
          <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600 }}>
            Your stores {/* NEW */}
          </h1>
          <p className="mut m16">
            Pick the store you want to work on, or add a new one. {/* NEW */}
          </p>
          {err && <Alert>{err}</Alert>}
          {rows?.map((s) => (
              <div className="card" style={{ marginBottom: 12 }} key={s.id}>
                <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                >
              <span>
                <b>{s.name}</b>
                <br />
                <span className="mut">reel-store.in/{s.slug}</span>
              </span>
                  <span
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                  >
                {s.status && (
                    <span className={"b " + (s.status === "open" ? "g" : "n")}>
                    {s.status === "open" ? "Open" : "Closed"}
                  </span>
                )}
                    {s.onboarding_complete === false && (
                        <span className="b a">Setup incomplete</span>
                    )}
                    {String(s.id) === cur && <span className="b b">Current</span>}
                    <button
                        className={"btn auto" + (String(s.id) === cur ? " s" : "")}
                        onClick={() => open(s.id)}
                    >
                  {String(s.id) === cur ? "Keep working here" : "Open store"}
                </button>
              </span>
                </div>
              </div>
          ))}
          {rows && ( // NEW
              <Link
                  href="/stores/new"
                  className="card"
                  style={{
                      border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", minHeight: 120, gap: 4,
                      textDecoration: "none", color: "#1E4FD6",
                  }}
              >
                  <span style={{ fontSize: 28 }}>+</span>
                  <b>Add new store</b>
              </Link>
          )}
        </main>
      </div>
  );
}