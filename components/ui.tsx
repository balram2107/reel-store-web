import Link from "next/link";
import type { ReactNode, ComponentProps } from "react";
import { STATUS } from "@/lib/format";
export const Wordmark = ({ size = 20 }: { size?: number }) => (
  <Link href="/" className="wm" style={{ fontSize: size }}>
    <b>reel</b>
    <span>store</span>
  </Link>
);
export function Field({
  label,
  error,
  ...p
}: { label: string; error?: string } & ComponentProps<"input">) {
  return (
    <label className="f">
      {label}
      <input className="in" aria-invalid={error ? true : undefined} {...p} />
      {error && <span className="err">{error}</span>}
    </label>
  );
}
export const Alert = ({
  children,
  kind = "e",
}: {
  children: ReactNode;
  kind?: "e" | "i";
}) => (
  <div role={kind === "e" ? "alert" : "status"} className={"alert " + kind}>
    {children}
  </div>
);
export const Badge = ({ status }: { status: string }) => {
  const [l, k] = STATUS[status] || [status, "n"];
  return <span className={"b " + k}>{l}</span>;
};
export const PoweredBy = () => (
  <footer style={{ padding: "24px 16px", textAlign: "center" }}>
    <span className="mut">Powered by </span>
    <span className="wm" style={{ fontSize: 14 }}>
      <b>reel</b>
      <span>store</span>
    </span>
  </footer>
);

import { ApiError, errText } from "@/lib/api";
export function ErrBox({ e }: { e: unknown }) {
  if (!e) return null;
  if (typeof e === "string") return <Alert>{e}</Alert>;
  const f = e instanceof ApiError ? Object.entries(e.fields) : [];
  return (
    <Alert>
      {errText(e)}
      {f.map(([k, v]) => (
        <span key={k} style={{ display: "block" }}>
          {k.replace(/_/g, " ")}: {v.join(", ")}
        </span>
      ))}
    </Alert>
  );
}
export function Pager({
  meta,
  onPage,
}: {
  meta: { page: number; per_page: number; total: number };
  onPage: (p: number) => void;
}) {
  return (
    <div className="pager">
      <span>
        {meta.page > 1 && (
          <button className="btn s auto" onClick={() => onPage(meta.page - 1)}>
            Previous
          </button>
        )}
      </span>
      <span>
        {meta.total > meta.page * meta.per_page && (
          <button className="btn s auto" onClick={() => onPage(meta.page + 1)}>
            Next
          </button>
        )}
      </span>
    </div>
  );
}
