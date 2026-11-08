"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, errText, getToken, setStoreId } from "@/lib/api";
import { Wordmark, Alert } from "@/components/ui";

const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NewStore() {
    const r = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [touched, setTouched] = useState(false);
    const [ig, setIg] = useState("");
    const [err, setErr] = useState("");
    const [fields, setFields] = useState<Record<string, string[]>>({});
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!getToken()) return r.replace("/login");
        setBusy(true);
        setErr("");
        setFields({});
        try {
            const s = await api<{ id: number }>("/seller/stores", {
                method: "POST",
                auth: true,
                store: false,
                body: { name, slug, instagram_handle: ig.replace(/^@/, "") },
            });
            setStoreId(s.id);
            r.push("/dashboard");
        } catch (e) {
            setErr(errText(e));
            if (e instanceof ApiError) setFields(e.fields);
            setBusy(false);
        }
    }

    const fe = (k: string) =>
        fields[k]?.length ? <span className="mut" style={{ color: "#b91c1c" }}>{fields[k][0]}</span> : null;

    return (
        <div style={{ minHeight: "100vh" }}>
            <header className="hd">
                <div className="w hdr">
                    <Wordmark size={20} />
                    <button className="btn s auto" onClick={() => r.push("/stores?all=1")}>Back to stores</button>
                </div>
            </header>
            <main className="w" style={{ maxWidth: 480, padding: "32px 20px 48px" }}>
                <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600 }}>Add a new store</h1>
                <p className="mut m16">You’ll add products and payments next.</p>
                {err && <Alert>{err}</Alert>}
                <form className="card" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <label>Store name
                        <input className="in" required value={name}
                               onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
                        {fe("name")}
                    </label>
                    <label>Store link (reel-store.in/…)
                        <input className="in" required value={slug}
                               onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)); }} />
                        {fe("slug")}
                    </label>
                    <label>Instagram handle
                        <input className="in" placeholder="@yourhandle" value={ig} onChange={(e) => setIg(e.target.value)} />
                        {fe("instagram_handle")}
                    </label>
                    <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create store"}</button>
                </form>
            </main>
        </div>
    );
}