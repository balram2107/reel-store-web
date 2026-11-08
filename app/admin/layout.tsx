"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getToken, clearToken } from "@/lib/api";
import type { Me } from "@/lib/types";
import { Wordmark } from "@/components/ui";
export default function AdminLayout({ children }: { children: ReactNode }) {
  const r = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!getToken()) {
      r.replace("/login");
      return;
    }
    api<Me>("/me", { auth: true, store: false })
      .then((m) => {
        if (m.user.role !== "admin") r.replace("/dashboard");
        else setOk(true);
      })
      .catch(() => r.replace("/login"));
  }, [r]);
  const out = () => {
    api("/auth/session", { method: "DELETE", auth: true })
      .catch(() => {})
      .finally(() => {
        clearToken();
        r.replace("/login");
      });
  };
  return (
    <div>
      <header className="hd">
        <div className="w hdr">
          <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Wordmark />
            <span className="b n">Admin</span>
            <nav className="nav">
              <Link href="/admin/stores" aria-current="page">
                Stores
              </Link>
            </nav>
          </span>
          <a
            className="nav"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              out();
            }}
          >
            Log out
          </a>
        </div>
      </header>
      <main className="w" style={{ padding: "32px 20px 48px" }}>
        {ok ? children : <p className="mut">Loading…</p>}
      </main>
    </div>
  );
}
