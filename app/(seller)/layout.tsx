"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api, ApiError, getToken, clearToken, errText } from "@/lib/api";
import type { Me } from "@/lib/types";
import { Wordmark, Alert } from "@/components/ui";
import ImpersonationBanner from "@/components/ImpersonationBanner"; // NEW
import { getImpersonation } from "@/lib/impersonation"; // NEW
const NAV = [
    ["Dashboard", "/dashboard"],
    ["Orders", "/orders"],
    ["Products", "/products"],
    ["Settings", "/settings"],
];
export default function SellerLayout({ children }: { children: ReactNode }) {
    const r = useRouter();
    const path = usePathname();
    const [me, setMe] = useState<Me | null>(null);
    const [err, setErr] = useState("");
    useEffect(() => {
        if (!getToken()) {
            r.replace("/login");
            return;
        }
        const imp = getImpersonation(); // NEW
        api<Me>("/me", { auth: true })
            .then((m) => {
                if (!m.store) r.replace(imp ? "/admin/stores" : "/stores"); // NEW
                else if (!imp && !m.store.onboarding_complete) // NEW
                    r.replace("/onboarding/" + m.store.onboarding_step);
                else setMe(m);
            })
            .catch((e) => {
                if (e instanceof ApiError && e.status === 422)
                    r.replace(imp ? "/admin/stores" : "/stores"); // NEW
                else setErr(errText(e));
            });
    }, [r]);
    const out = () => {
        api("/auth/session", { method: "DELETE", auth: true })
            .catch(() => {})
            .finally(() => {
                clearToken();
                r.replace("/login");
            });
    };
    const imp = getImpersonation(); // NEW
    return (
        <div>
            <ImpersonationBanner /> {/* NEW */}
            <header className="hd">
                <div className="w hdr">
          <span
              style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px 16px",
                  flexWrap: "wrap",
              }}
          >
            <Wordmark />
            <span className="mut">{me?.store?.name}</span>
            <nav className="nav">
              {NAV.map(([l, h]) => (
                  <Link
                      key={h}
                      href={h}
                      aria-current={path.startsWith(h) ? "page" : undefined}
                  >
                      {l}
                  </Link>
              ))}
            </nav>
          </span>
                    <span className="nav">
            {me?.store && <Link href={"/" + me.store.slug}>View store</Link>}
                        {!imp && <Link href="/stores?all=1">Switch store</Link>} {/* NEW */}
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                out();
                            }}
                        >
              Log out
            </a>
          </span>
                </div>
            </header>
            <main className="w" style={{ padding: "32px 20px 48px" }}>
                {err && <Alert>{err}</Alert>}
                {me ? children : !err && <p className="mut">Loading…</p>}
            </main>
        </div>
    );
}