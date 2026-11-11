"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getImpersonation,
  stopImpersonation,
  type Impersonation,
} from "@/lib/impersonation";

export default function ImpersonationBanner() {
  const router = useRouter();
  const [imp, setImp] = useState<Impersonation | null>(null);
  useEffect(() => setImp(getImpersonation()), []);
  if (!imp) return null;
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 20px",
        background: "#0F172A",
        color: "#FFFFFF",
        fontSize: 14,
      }}
    >
      <span>
        Viewing <b>{imp.name}</b> as admin. Changes are saved to this store.
      </span>
      <button
        onClick={() => {
          stopImpersonation();
          router.push("/admin/stores");
        }}
        style={{
          minHeight: 44,
          padding: "0 20px",
          borderRadius: 8,
          border: "1px solid #FFFFFF",
          background: "#FFFFFF",
          color: "#1E4FD6",
          font: "500 14px Inter, sans-serif",
          cursor: "pointer",
        }}
      >
        Exit to admin
      </button>
    </div>
  );
}
