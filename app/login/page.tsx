"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken, setStoreId, errText } from "@/lib/api";
import type { Session } from "@/lib/types";
import { Wordmark, Field, Alert } from "@/components/ui";
export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  async function send() {
    setBusy(true);
    setErr("");
    try {
      const x = await api<{ resend_in_seconds: number }>("/auth/otp/request", {
        method: "POST",
        body: { email },
      });
      setSent(true);
      setWait(x.resend_in_seconds);
    } catch (e) {
      setErr(errText(e));
    }
    setBusy(false);
  }
  async function verify() {
    setBusy(true);
    setErr("");
    try {
      const s = await api<Session>("/auth/otp/verify", {
        method: "POST",
        body: { email, code },
      });
      setToken(s.token);
      setStoreId(s.store ? s.store.id : null);
      if (s.user.role === "admin") r.replace("/admin/stores");
      else if (!s.store) r.replace(s.is_new_user ? "/onboarding/1" : "/stores");
      else if (!s.store.onboarding_complete)
        r.replace("/onboarding/" + s.store.onboarding_step);
      else r.replace("/dashboard");
    } catch (e) {
      setErr(errText(e));
      setBusy(false);
    }
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 400, padding: 24 }}
      >
        <Wordmark size={22} />
        <h1 className="h1s" style={{ margin: "16px 0 4px" }}>
          Log in or create your store
        </h1>
        <p className="mut" style={{ marginBottom: 16 }}>
          We’ll email you a 6-digit code. No password needed.
        </p>
        {err && <Alert>{err}</Alert>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sent ? verify() : send();
          }}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={sent}
          />
          {sent && (
            <Field
              label="6-digit code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          )}
          <button
            className="btn"
            disabled={busy || (sent && code.length !== 6)}
          >
            {sent ? "Log in" : "Send code"}
          </button>
        </form>
        {sent && (
          <p className="mut" style={{ marginTop: 12 }}>
            Didn’t get it?{" "}
            {wait > 0 ? (
              `You can resend in ${wait}s.`
            ) : (
              <button
                type="button"
                className="btn s auto"
                style={{ display: "inline-flex", minHeight: 44 }}
                onClick={send}
                disabled={busy}
              >
                Send again
              </button>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
