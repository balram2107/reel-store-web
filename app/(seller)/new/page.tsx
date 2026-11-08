"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, errText, setStoreId } from "@/lib/api";

const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NewStorePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [touched, setTouched] = useState(false);
    const [ig, setIg] = useState("");
    const [error, setError] = useState("");
    const [fields, setFields] = useState<Record<string, string[]>>({});
    const [busy, setBusy] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError("");
        setFields({});
        try {
            const store = await api<{ id: number }>("/seller/stores", { // ADAPT: same path as your GET stores
                method: "POST",
                auth: true,
                store: false,
                body: { name, slug, instagram_handle: ig.replace(/^@/, "") },
            });
            setStoreId(store.id);
            router.push("/seller/onboarding"); // ADAPT
        } catch (err) {
            setError(errText(err));
            if (err instanceof ApiError) setFields(err.fields);
            setBusy(false);
        }
    }

    const input = "w-full min-h-11 rounded-lg border border-purple-300 bg-white px-3";
    const fe = (k: string) =>
        fields[k]?.length ? <span className="text-xs font-normal text-red-700">{fields[k][0]}</span> : null;

    return (
        <form onSubmit={submit} className="mx-auto mt-12 flex max-w-md flex-col gap-5 rounded-2xl border border-purple-200 bg-white p-6">
            <h1 className="text-2xl font-bold">Add a new store</h1>
            <label className="flex flex-col gap-1 text-sm font-semibold">Store name
                <input className={input} value={name} required
                       onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
                {fe("name")}
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Store link
                <div className="flex items-center gap-1">
                    <span className="font-normal text-gray-600">reel-store.in/</span>
                    <input className={input} value={slug} required
                           onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)); }} />
                </div>
                {fe("slug")}
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Instagram handle
                <input className={input} value={ig} placeholder="@yourhandle" onChange={(e) => setIg(e.target.value)} />
                {fe("instagram_handle")}
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => router.back()} className="min-h-11 rounded-lg border border-purple-300 px-5 font-semibold text-purple-800">Cancel</button>
                <button disabled={busy} className="min-h-11 rounded-lg bg-pink-700 px-5 font-semibold text-white disabled:opacity-60">
                    {busy ? "Creating…" : "Create store"}
                </button>
            </div>
        </form>
    );
}