"use client";
import { useEffect, useRef, useState } from "react";

const PAGES: [string, string][] = [
    ["", "Home"],
    ["/shop", "Shop"],
    ["/policies", "Policies"],
    ["/cart", "Cart"],
];

export default function StorePreview({
                                         slug,
                                         theme,
                                         version,
                                     }: {
    slug: string;
    theme: unknown;
    version: number; // bump after save to reload the iframe
}) {
    const ref = useRef<HTMLIFrameElement>(null);
    const [page, setPage] = useState("");
    const json = JSON.stringify(theme);

    const send = () =>
        ref.current?.contentWindow?.postMessage(
            { type: "reel-preview-theme", theme: JSON.parse(json) },
            window.location.origin,
        );
    useEffect(send, [json]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <aside className="look-preview" aria-label="Store preview">
            <div style={{ display: "flex", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                {PAGES.map(([p, label]) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setPage(p)}
                        aria-current={page === p ? "page" : undefined}
                        style={{
                            background: "none",
                            border: 0,
                            padding: 0,
                            minHeight: 44,
                            textDecoration: "underline",
                            fontWeight: page === p ? 600 : 400,
                            cursor: "pointer",
                            color: "inherit",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <iframe
                key={`${slug}${page}${version}`}
                ref={ref}
                title="Store preview"
                src={`/${slug}${page}?preview=1`}
                onLoad={send}
                style={{
                    width: "100%",
                    height: "calc(100vh - 140px)",
                    minHeight: 520,
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    background: "#fff",
                }}
            />
        </aside>
    );
}