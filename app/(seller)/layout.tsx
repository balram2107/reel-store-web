"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api, ApiError, getToken, clearToken, errText } from "@/lib/api";
import type { Me } from "@/lib/types";
import { Wordmark, Alert } from "@/components/ui";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import { getImpersonation } from "@/lib/impersonation";

const NAV = [
  ["Dashboard", "/dashboard"],
  ["Orders", "/orders"],
  ["Products", "/products"],
  ["Settings", "/settings"],
  ["Store Look", "/design"],
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const r = useRouter();
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [err, setErr] = useState("");

  // Impersonation lives in browser storage, so read it after mount.
  // Until then the server and the first client render both show the same HTML.
  const [imp, setImp] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setImp(!!getImpersonation());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      r.replace("/login");
      return;
    }
    const isImp = !!getImpersonation();
    api<Me>("/me", { auth: true })
      .then((m) => {
        if (!m.store) r.replace(isImp ? "/admin/stores" : "/stores");
        else if (!isImp && !m.store.onboarding_complete)
          r.replace("/onboarding/" + m.store.onboarding_step);
        else setMe(m);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 422)
          r.replace(isImp ? "/admin/stores" : "/stores");
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

  return (
    <div>
      <ImpersonationBanner />
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
            {ready && !imp && (
              <Link href="/stores?all=1">Switch store</Link>
            )}{" "}
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
