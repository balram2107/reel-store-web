"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import type { SellerStore } from "@/lib/types";
import { Field } from "@/components/ui";
import {
    ApiAlert,
    FormStatus,
    UnsavedBar,
    useToast,
    useUnsavedChanges,
} from "@/components/feedback";
import StorePreview from "@/components/StorePreview";

type S = Record<string, any>;
type D = {
    template: string;
    button: string;
    accent: string;
    background: string;
    s: S;
};

const OPT: Record<string, [string, string][]> = {
    template: [["classic", "Classic"], ["insta_aesthetic", "Insta Aesthetic"]],
    banner_height: [["small", "Small"], ["medium", "Medium"], ["large", "Large"]],
    text_alignment: [["left", "Left"], ["center", "Centre"]],
    logo_shape: [["circle", "Circle"], ["rounded", "Rounded"], ["square", "Square"]],
    logo_size: [["small", "Small"], ["medium", "Medium"], ["large", "Large"]],
    header_style: [["over_banner", "Over banner"], ["solid", "Solid"]],
    corner_style: [["soft", "Soft"], ["rounded", "Rounded"], ["square", "Square"]],
    font_style: [["modern", "Modern"], ["classic", "Classic"], ["elegant", "Elegant"]],
    button_style: [["filled", "Filled"], ["outline", "Outline"], ["soft", "Soft"]],
    surface_style: [["white", "White"], ["soft_tint", "Soft tint"], ["no_card", "No card"]],
    product_card_style: [["grid", "Grid"], ["large_image", "Large image"], ["list", "List"]],
    phone_columns: [["1", "1 column"], ["2", "2 columns"]],
    image_ratio: [["square", "Square"], ["portrait", "Portrait"], ["landscape", "Landscape"]],
    announcement_color: [["primary", "Button colour"], ["accent", "Accent"], ["background", "Background"]],
    hero_cta_target: [["shop", "All products"], ["new", "New"], ["sale", "Sale"], ["bestsellers", "Bestsellers"]],
};
const SECTIONS: Record<string, string> = {
    announcement: "Announcement bar",
    hero: "Hero",
    featured: "Featured",
    products: "Products",
    about: "About",
    links: "Links",
};

// WCAG contrast, same maths as the backend
const lum = (hex: string) => {
    const c = hex.replace("#", "").match(/../g)!.map((h) => parseInt(h, 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => p - q);
    return (y + 0.05) / (x + 0.05);
};
const HEX = /^#[0-9a-fA-F]{6}$/;

const init = (st: SellerStore): D => {
    const t: any = st.theme ?? {};
    return {
        template: t.template ?? "classic",
        button: t.button ?? "#1E4FD6",
        accent: t.accent ?? "#F59E0B",
        background: t.background ?? "#F8FAFC",
        s: { links: [], section_order: [], section_visibility: {}, ...(t.settings ?? {}) },
    };
};

export default function StoreLook() {
    const toast = useToast();
    const [store, setStore] = useState<SellerStore | null>(null);
    const [d, setD] = useState<D | null>(null);
    const [err, setErr] = useState<unknown>(null);
    const [busy, setBusy] = useState(false);
    const [ver, setVer] = useState(0);

    const dirty = !!d && !!store && JSON.stringify(d) !== JSON.stringify(init(store));
    useUnsavedChanges(dirty);

    useEffect(() => {
        api<{ store: SellerStore }>("/seller/store", { auth: true })
            .then((x) => { setStore(x.store); setD(init(x.store)); })
            .catch(setErr);
    }, []);

    if (!d || !store)
        return err ? <ApiAlert error={err} title="Couldn't load store look" /> : <p className="mut">Loading…</p>;

    const top = <K extends keyof D>(k: K, v: D[K]) => setD((x) => x && { ...x, [k]: v });
    const set = (k: string, v: any) => setD((x) => x && { ...x, s: { ...x.s, [k]: v } });

    const Sel = ({ k, label }: { k: string; label: string }) => {
        const isTop = k === "template"; // lives on theme, not theme.settings
        return (
            <label className="f">
                {label}
                <select
                    className="in"
                    value={isTop ? d.template : String(d.s[k] ?? "")}
                    onChange={(e) => (isTop ? top("template", e.target.value) : set(k, e.target.value))}
                >
                    {OPT[k].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                    ))}
                </select>
            </label>
        );
    };
    const Chk = ({ k, label }: { k: string; label: string }) => (
        <label className="check" style={{ alignItems: "center" }}>
            <input type="checkbox" checked={!!d.s[k]} onChange={(e) => set(k, e.target.checked)} />
            {label}
        </label>
    );

    // Plain render helper (called as a function, NOT used as <Swatch/>), so the
    // native colour picker doesn't remount and close while dragging.
    // Must live INSIDE the component because it needs `d` and `top`.
    const swatch = (k: "button" | "accent" | "background", label: string) => (
        <label className="swatch">
            <input
                type="color"
                value={d[k]}
                onChange={(e) => top(k, e.target.value)}
                aria-label={`${label} picker`}
            />
            <span className="swatch-label">{label}</span>
            <span className="swatch-hex">{d[k].toUpperCase()}</span>
        </label>
    );

    const order: string[] = d.s.section_order?.length ? d.s.section_order : Object.keys(SECTIONS);
    const move = (i: number, dir: -1 | 1) => {
        const o = [...order];
        const j = i + dir;
        if (j < 0 || j >= o.length) return;
        [o[i], o[j]] = [o[j], o[i]];
        set("section_order", o);
    };
    const vis = (n: string) => d.s.section_visibility?.[n] !== false;
    const links: { label: string; url: string }[] = d.s.links ?? [];
    const setLink = (i: number, k: "label" | "url", v: string) =>
        set("links", links.map((l, n) => (n === i ? { ...l, [k]: v } : l)));

    // Warnings only; colours still save.
    const warns: string[] = [];
    if (HEX.test(d.button) && ratio("#FFFFFF", d.button) < 4.5)
        warns.push("White text on your button colour is hard to read. Pick a darker button colour.");
    if (HEX.test(d.accent) && ratio("#0F172A", d.accent) < 4.5)
        warns.push("Dark text on your accent colour is hard to read. Pick a lighter accent.");
    if (HEX.test(d.button) && HEX.test(d.background) && ratio(d.button, d.background) < 3)
        warns.push("Your button colour is too close to the background.");

    function check(): string | null {
        const s = d!.s;
        if (String(s.announcement_text ?? "").trim().length > 80) return "Announcement can be at most 80 characters.";
        if (String(s.hero_title ?? "").trim().length > 60) return "Hero title can be at most 60 characters.";
        if (String(s.hero_subtitle ?? "").trim().length > 120) return "Hero subtitle can be at most 120 characters.";
        if (String(s.hero_cta_label ?? "").trim().length > 20) return "Hero button text can be at most 20 characters.";
        if (s.announcement_end_date && !/^\d{4}-\d{2}-\d{2}$/.test(s.announcement_end_date)) return "Enter a valid announcement end date.";
        for (const l of links) {
            if (!l.label.trim() || l.label.trim().length > 20) return "Each link needs a label of up to 20 characters.";
            if (!/^https:\/\/[^\s/]+/i.test(l.url)) return "Links must start with https://";
        }
        return null;
    }

    async function save(e: FormEvent) {
        e.preventDefault();
        setErr(null);
        const bad = check();
        if (bad) return setErr(bad);
        const { template, button, accent, background, s } = d!;
        const { template: _stray, ...settings } = s;
        setBusy(true);
        try {
            const x = await api<{ store: SellerStore }>("/seller/store", {
                method: "PATCH",
                body: { theme: { template, button, accent, background, settings } },
                auth: true,
            });
            setStore(x.store);
            setD(init(x.store));
            toast.success("Store look saved.");
        } catch (x) {
            setErr(x);
        }
        setBusy(false);
    }

    return (
        <div className="look-grid">
            <style>{`
      .look-grid{display:grid;gap:24px;grid-template-columns:minmax(0,1fr)}
      .look-preview{position:sticky;top:16px;align-self:start}
      @media (min-width:1024px){.look-grid{grid-template-columns:minmax(0,560px) 380px}}
      @media (max-width:1023px){.look-preview{position:static}}

      .swatches{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}
      .swatch{display:flex;flex-direction:column;align-items:flex-start;gap:6px;font-size:14px;cursor:pointer}
      .swatch input[type=color]{width:48px;height:48px;padding:0;border:1px solid #CBD5E1;border-radius:10px;background:none;cursor:pointer}
      .swatch input[type=color]::-webkit-color-swatch-wrapper{padding:0}
      .swatch input[type=color]::-webkit-color-swatch{border:0;border-radius:9px}
      .swatch input[type=color]::-moz-color-swatch{border:0;border-radius:9px}
      .swatch-label{font-weight:500}
      .swatch-hex{font-size:12px;color:#64748B;font-variant-numeric:tabular-nums}
    `}</style>

            <form onSubmit={save} noValidate style={{ maxWidth: 720 }}>
                <h1 style={{ fontSize: 28, lineHeight: "36px", fontWeight: 600, marginBottom: 16 }}>Store look</h1>
                <FormStatus error={err} />
                <div style={{ display: "grid", gap: 16 }}>
                    <div className="card">
                        <h2 className="h2">Template &amp; colours</h2>
                        <Sel k="template" label="Template" />
                        <div className="swatches">
                            {swatch("button", "Button")}
                            {swatch("accent", "Accent")}
                            {swatch("background", "Background")}
                        </div>
                        {warns.map((w) => <p key={w} className="mut" role="alert">⚠ {w}</p>)}
                    </div>

                    <div className="card">
                        <h2 className="h2">Header</h2>
                        <Sel k="banner_height" label="Banner height" />
                        <Sel k="header_style" label="Header style" />
                        <Sel k="logo_shape" label="Logo shape" />
                        <Sel k="logo_size" label="Logo size" />
                        <Sel k="text_alignment" label="Text alignment" />
                    </div>

                    <div className="card">
                        <h2 className="h2">Style</h2>
                        <Sel k="font_style" label="Fonts" />
                        <Sel k="corner_style" label="Corners" />
                        <Sel k="button_style" label="Button style" />
                        <Sel k="surface_style" label="Card surface" />
                    </div>

                    <div className="card">
                        <h2 className="h2">Products</h2>
                        <Sel k="product_card_style" label="Product layout" />
                        <Sel k="phone_columns" label="Columns on phones" />
                        <Sel k="image_ratio" label="Image shape" />
                        <Chk k="discount_badge" label="Show discount badge" />
                        <Chk k="quick_add" label="Show quick add button" />
                        <Chk k="featured_enabled" label="Show featured products" />
                    </div>

                    <div className="card">
                        <h2 className="h2">Announcement bar</h2>
                        <Chk k="announcement_enabled" label="Show announcement" />
                        <Field label="Announcement text" maxLength={80} placeholder="Free shipping above ₹999"
                               value={d.s.announcement_text ?? ""} onChange={(e) => set("announcement_text", e.target.value)} />
                        <Sel k="announcement_color" label="Bar colour" />
                        <Field label="Hide after, optional" type="date"
                               value={d.s.announcement_end_date ?? ""} onChange={(e) => set("announcement_end_date", e.target.value)} />
                    </div>

                    <div className="card">
                        <h2 className="h2">Hero</h2>
                        <Field label="Title" maxLength={60} value={d.s.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} />
                        <Field label="Subtitle" maxLength={120} value={d.s.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} />
                        <Field label="Button text" maxLength={20} value={d.s.hero_cta_label ?? ""} onChange={(e) => set("hero_cta_label", e.target.value)} />
                        <Sel k="hero_cta_target" label="Button goes to" />
                        <Chk k="show_stats" label="Show store stats" />
                    </div>

                    <div className="card">
                        <h2 className="h2">Page sections</h2>
                        <p className="mut">Choose what shows and in what order.</p>
                        {order.map((n, i) => (
                            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                                <label className="check" style={{ alignItems: "center", flex: 1 }}>
                                    <input type="checkbox" checked={vis(n)}
                                           onChange={(e) => set("section_visibility", { ...d.s.section_visibility, [n]: e.target.checked })} />
                                    {SECTIONS[n] ?? n}
                                </label>
                                <button type="button" className="in" style={{ width: 44, height: 44 }} disabled={i === 0}
                                        aria-label={`Move ${SECTIONS[n]} up`} onClick={() => move(i, -1)}>↑</button>
                                <button type="button" className="in" style={{ width: 44, height: 44 }} disabled={i === order.length - 1}
                                        aria-label={`Move ${SECTIONS[n]} down`} onClick={() => move(i, 1)}>↓</button>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <h2 className="h2">Links</h2>
                        <p className="mut">Up to 3 links, shown at the bottom of your store.</p>
                        {links.map((l, i) => (
                            <div key={i} style={{ display: "grid", gap: 4, marginBottom: 12 }}>
                                <Field label={`Link ${i + 1} label`} maxLength={20} value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} />
                                <Field label={`Link ${i + 1} URL`} type="url" placeholder="https://" value={l.url} onChange={(e) => setLink(i, "url", e.target.value)} />
                                <button type="button" className="in" style={{ minHeight: 44 }}
                                        onClick={() => set("links", links.filter((_, n) => n !== i))}>Remove link {i + 1}</button>
                            </div>
                        ))}
                        {links.length < 3 && (
                            <button type="button" className="in" style={{ minHeight: 44 }}
                                    onClick={() => set("links", [...links, { label: "", url: "https://" }])}>Add link</button>
                        )}
                    </div>

                    <UnsavedBar dirty={dirty} busy={busy} saveLabel="Save store look"
                                onDiscard={() => { setD(init(store)); setErr(null); toast.info("Your changes were discarded.", { title: "Reverted" }); }} />
                </div>
            </form>
            <StorePreview
                slug={store.slug}
                version={ver}
                theme={{
                    template: d.template,
                    button: d.button,
                    accent: d.accent,
                    background: d.background,
                    settings: d.s,
                }}
            />
        </div>
    );
}