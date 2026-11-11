"use client";
/**
 * Reel Store feedback components (design language v0.3).
 *
 * Add these tokens to your global CSS (defaults below are used as fallbacks):
 *   --ink:#0F172A  --muted:#64748B  --surface:#FFFFFF  --border:#E2E8F0
 *   --blue:#1E4FD6 --blue-tint:#E8EEFC
 *   --success:#15803D --success-tint:#DCFCE7
 *   --warning:#F59E0B --warning-text:#92400E --warning-tint:#FEF3C7
 *   --danger:#DC2626
 *   --danger-text:#991B1B --danger-tint:#FEE2E2   <- PROPOSED, not in the design MD yet; verify contrast
 *
 * Rules followed: status is always icon + word + colour; green = confirmed success only;
 * ink text on saffron; 44px touch targets; 12px card radius; flat (no shadow) except
 * the toast stack, which is an overlay (overlay shadow is still TBD in the design MD).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";

/* ───────────────────────── tones ───────────────────────── */

export type Tone = "success" | "warning" | "error" | "info";

const TONE: Record<
  Tone,
  {
    label: string;
    icon: string;
    fg: string;
    bg: string;
    edge: string;
    iconBg: string;
    iconFg: string;
  }
> = {
  success: {
    label: "Success",
    icon: "✓",
    fg: "var(--success, #15803D)",
    bg: "var(--success-tint, #DCFCE7)",
    edge: "var(--success, #15803D)",
    iconBg: "var(--success, #15803D)",
    iconFg: "#FFFFFF", // white on green = 5.02
  },
  warning: {
    label: "Check this",
    icon: "!",
    fg: "var(--warning-text, #92400E)", // 6.37 on tint
    bg: "var(--warning-tint, #FEF3C7)",
    edge: "var(--warning, #F59E0B)",
    iconBg: "var(--warning, #F59E0B)",
    iconFg: "var(--ink, #0F172A)", // ink on saffron, never white
  },
  error: {
    label: "Couldn't save",
    icon: "✕",
    fg: "var(--danger-text, #991B1B)",
    bg: "var(--danger-tint, #FEE2E2)",
    edge: "var(--danger, #DC2626)",
    iconBg: "var(--danger, #DC2626)",
    iconFg: "#FFFFFF", // white on danger = 4.83
  },
  info: {
    label: "Note",
    icon: "i",
    fg: "var(--blue, #1E4FD6)", // 5.75 on blue-tint
    bg: "var(--blue-tint, #E8EEFC)",
    edge: "var(--blue, #1E4FD6)",
    iconBg: "var(--blue, #1E4FD6)",
    iconFg: "#FFFFFF",
  },
};

function Icon({ tone }: { tone: Tone }) {
  const t = TONE[tone];
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        width: 22,
        height: 22,
        borderRadius: 999,
        background: t.iconBg,
        color: t.iconFg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {t.icon}
    </span>
  );
}

/* ───────────────── backend message parsing ─────────────────
 * Turns whatever api() throws into readable sentences.
 * Handles: string, Error, {error}, {message}, {errors: string[]},
 * {errors: {price: ["is invalid"]}}, and one level of {body|data|details}.
 * Adjust KNOWN_CODES to turn backend error codes into friendly copy.
 */

const KNOWN_CODES: Record<string, string> = {
  "product.stock_exceeded": "Not enough stock for this product.",
  "authz.invalid_session": "Your session ended. Log in again to continue.",
  "server.internal_error":
    "Something went wrong on our side. Try again in a moment.",
};

const humanize = (k: string) => {
  const s = k.replace(/[_.]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function collect(v: unknown, out: string[], depth = 0): void {
  if (v == null || depth > 3) return;
  if (typeof v === "string") {
    const s = v.trim();
    if (s) out.push(KNOWN_CODES[s] ?? s);
    return;
  }
  if (Array.isArray(v)) return v.forEach((x) => collect(x, out, depth + 1));
  if (typeof v !== "object") return;
  const o = v as Record<string, unknown>;
  for (const k of ["error", "message", "errors", "details", "body", "data"]) {
    const val = o[k];
    if (val == null) continue;
    if (k === "errors" && typeof val === "object" && !Array.isArray(val)) {
      for (const [field, msgs] of Object.entries(
        val as Record<string, unknown>,
      )) {
        const arr: string[] = [];
        collect(msgs, arr, depth + 1);
        arr.forEach((m) =>
          out.push(KNOWN_CODES[m] ? m : `${humanize(field)} ${m}`),
        );
      }
    } else collect(val, out, depth + 1);
  }
}

export function apiMessages(e: unknown): string[] {
  const out: string[] = [];
  if (e instanceof TypeError && /fetch|network/i.test(e.message))
    return ["Can't reach the server. Check your internet and try again."];
  collect(e, out);
  if (e instanceof Error && !out.length && e.message) out.push(e.message);
  const unique = [...new Set(out)];
  return unique.length ? unique : ["Something went wrong. Please try again."];
}

/* ───────────────────────── Alert ─────────────────────────
 * Inline banner. Use for results that belong next to the form.
 */

export function Alert({
  tone,
  title,
  children,
  messages,
  onDismiss,
  action,
  style,
}: {
  tone: Tone;
  title?: string;
  children?: ReactNode;
  messages?: string[];
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
  style?: CSSProperties;
}) {
  const t = TONE[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: t.bg,
        border: "1px solid var(--border, #E2E8F0)",
        borderLeft: `4px solid ${t.edge}`,
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 16,
        color: "var(--ink, #0F172A)",
        fontSize: 16,
        lineHeight: "24px",
        ...style,
      }}
    >
      <Icon tone={tone} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, color: t.fg }}>
          {title ?? t.label}
        </p>
        {children && <div style={{ marginTop: 2 }}>{children}</div>}
        {messages && messages.length === 1 && (
          <p style={{ margin: "2px 0 0" }}>{messages[0]}</p>
        )}
        {messages && messages.length > 1 && (
          <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
            {messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              minHeight: 44,
              padding: 0,
              border: 0,
              background: "none",
              color: t.fg,
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss message"
          onClick={onDismiss}
          style={{
            flex: "none",
            minWidth: 44,
            minHeight: 44,
            margin: "-10px -12px -10px 0",
            border: 0,
            background: "none",
            color: "var(--muted, #64748B)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

/** Drop-in for ErrBox: pass whatever api() threw. */
export function ApiAlert({ error, title }: { error: unknown; title?: string }) {
  if (!error) return null;
  return <Alert tone="error" title={title} messages={apiMessages(error)} />;
}

/* ──────────────────────── FormStatus ────────────────────────
 * One slot at the top of a form: shows success / warning / error and
 * scrolls into view so the seller never misses it.
 */

export function FormStatus({
  success,
  warning,
  error,
  onDismiss,
}: {
  success?: string | false | null;
  warning?: string | false | null;
  error?: unknown;
  onDismiss?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const active = !!(success || warning || error);
  useEffect(() => {
    if (active)
      ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active, success, warning, error]);
  return (
    <div ref={ref}>
      {error ? <ApiAlert error={error} /> : null}
      {warning ? (
        <Alert tone="warning" onDismiss={onDismiss}>
          {warning}
        </Alert>
      ) : null}
      {success ? (
        <Alert tone="success" title="Saved" onDismiss={onDismiss}>
          {success}
        </Alert>
      ) : null}
    </div>
  );
}

/* ───────────────────────── FieldError ─────────────────────────
 * Put under a Field. Give the input aria-describedby={id} and aria-invalid.
 */

export function FieldError({
  id,
  children,
}: {
  id?: string;
  children?: ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        margin: "4px 0 12px",
        fontSize: 14,
        lineHeight: "20px",
        color: "var(--danger-text, #991B1B)",
        fontWeight: 500,
      }}
    >
      <span aria-hidden="true">✕</span>
      {children}
    </p>
  );
}

/* ───────────────────────── Toast ─────────────────────────
 * Wrap the seller layout once:  <ToastProvider>{children}</ToastProvider>
 * Then:  const toast = useToast();  toast.success("Product saved.");
 * Toasts survive navigation, so they suit "saved, now going back to the list".
 * Errors stay until dismissed; success/info/warning disappear on their own.
 */

type ToastInput = {
  tone: Tone;
  title?: string;
  message?: ReactNode;
  duration?: number; // ms; 0 = stay until dismissed
  action?: { label: string; onClick: () => void };
};
type ToastItem = ToastInput & { id: number };
type Opts = Omit<ToastInput, "tone" | "message">;

type ToastApi = {
  show: (t: ToastInput) => number;
  dismiss: (id: number) => void;
  success: (message: ReactNode, o?: Opts) => number;
  info: (message: ReactNode, o?: Opts) => number;
  warning: (message: ReactNode, o?: Opts) => number;
  error: (message: ReactNode, o?: Opts) => number;
  /** Shows a toast from anything api() threw. */
  fromError: (e: unknown, o?: Opts) => number;
};

const ToastCtx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c;
}

const DEFAULT_MS: Record<Tone, number> = {
  success: 5000,
  info: 6000,
  warning: 9000,
  error: 0,
};
const MAX_VISIBLE = 3;

function ToastCard({ t, onClose }: { t: ToastItem; onClose: () => void }) {
  const tone = TONE[t.tone];
  const [paused, setPaused] = useState(false);
  const ms = t.duration ?? DEFAULT_MS[t.tone];

  useEffect(() => {
    if (!ms || paused) return;
    const h = setTimeout(onClose, ms);
    return () => clearTimeout(h);
  }, [ms, paused, onClose]);

  return (
    <div
      role={t.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: tone.bg,
        border: "1px solid var(--border, #E2E8F0)",
        borderLeft: `4px solid ${tone.edge}`,
        borderRadius: 12,
        padding: "12px 8px 12px 16px",
        color: "var(--ink, #0F172A)",
        fontSize: 16,
        lineHeight: "24px",
        boxShadow: "0 4px 12px rgba(15,23,42,0.12)", // overlay shadow: PROPOSED
      }}
    >
      <Icon tone={t.tone} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, color: tone.fg }}>
          {t.title ?? tone.label}
        </p>
        {t.message && (
          <div style={{ marginTop: 2, overflowWrap: "anywhere" }}>
            {t.message}
          </div>
        )}
        {t.action && (
          <button
            type="button"
            onClick={() => {
              t.action!.onClick();
              onClose();
            }}
            style={{
              minHeight: 44,
              padding: 0,
              border: 0,
              background: "none",
              color: tone.fg,
              fontWeight: 500,
              fontSize: 14,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {t.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={onClose}
        style={{
          flex: "none",
          minWidth: 44,
          minHeight: 44,
          margin: "-10px 0",
          border: 0,
          background: "none",
          color: "var(--muted, #64748B)",
          fontSize: 20,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);

  const dismiss = useCallback(
    (id: number) => setItems((s) => s.filter((t) => t.id !== id)),
    [],
  );
  const show = useCallback((t: ToastInput) => {
    const id = ++next.current;
    setItems((s) => [...s.slice(-(MAX_VISIBLE - 1)), { ...t, id }]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => {
    const make = (tone: Tone) => (message: ReactNode, o?: Opts) =>
      show({ tone, message, ...o });
    return {
      show,
      dismiss,
      success: make("success"),
      info: make("info"),
      warning: make("warning"),
      error: make("error"),
      fromError: (e, o) => {
        const m = apiMessages(e);
        return show({
          tone: "error",
          message:
            m.length === 1 ? (
              m[0]
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {m.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ),
          ...o,
        });
      },
    };
  }, [show, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          width: "min(420px, calc(100vw - 32px))",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        {items.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastCard t={t} onClose={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ───────────────────── SubmitButton ─────────────────────
 * Same "btn" class you already use; adds busy state and a clear label.
 */

export function SubmitButton({
  busy,
  busyLabel = "Saving…",
  children,
  ...rest
}: {
  busy?: boolean;
  busyLabel?: string;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      className="btn"
      {...rest}
      disabled={busy || rest.disabled}
      aria-busy={busy || undefined}
    >
      {busy ? busyLabel : children}
    </button>
  );
}

/* ───────────────────── ConfirmDialog ─────────────────────
 * For Remove photo, Delete product, Discard changes.
 * Uses the native <dialog>: focus trap and Esc come for free.
 */

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Keep it",
  destructive = true,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      style={{
        width: "min(420px, calc(100vw - 32px))",
        border: "1px solid var(--border, #E2E8F0)",
        borderRadius: 12,
        padding: 24,
        color: "var(--ink, #0F172A)",
        background: "var(--surface, #FFFFFF)",
      }}
    >
      <h2 id={titleId} className="h2" style={{ marginTop: 0 }}>
        {title}
      </h2>
      {children && (
        <div style={{ marginBottom: 16, fontSize: 16, lineHeight: "24px" }}>
          {children}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={onConfirm}
          style={
            destructive
              ? { background: "var(--danger, #DC2626)", color: "#FFFFFF" }
              : undefined
          }
        >
          {busy ? "Working…" : confirmLabel}
        </button>
        <button
          type="button"
          className="btn s"
          disabled={busy}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
      </div>
    </dialog>
  );
}

/* ─────────────── unsaved changes: hook + bar ───────────────
 * useUnsavedChanges(dirty) warns on tab close / refresh.
 * <UnsavedBar> sticks to the bottom of the form while dirty.
 */

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

export function UnsavedBar({
  dirty,
  busy,
  onDiscard,
  saveLabel = "Save changes",
}: {
  dirty: boolean;
  busy?: boolean;
  onDiscard: () => void;
  saveLabel?: string;
}) {
  if (!dirty) return null;
  return (
    <div
      role="status"
      style={{
        position: "sticky",
        bottom: "env(safe-area-inset-bottom, 0px)",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        background: "var(--warning-tint, #FEF3C7)",
        border: "1px solid var(--border, #E2E8F0)",
        borderLeft: "4px solid var(--warning, #F59E0B)",
        borderRadius: 12,
        padding: "8px 12px",
        marginTop: 16,
        color: "var(--warning-text, #92400E)",
        fontWeight: 600,
      }}
    >
      <Icon tone="warning" />
      <span style={{ flex: 1, minWidth: 140 }}>You have unsaved changes</span>
      <button
        type="button"
        className="btn s auto"
        disabled={busy}
        onClick={onDiscard}
      >
        Discard
      </button>
      <SubmitButton busy={busy} style={{ width: "auto", padding: "0 16px" }}>
        {saveLabel}
      </SubmitButton>
    </div>
  );
}
