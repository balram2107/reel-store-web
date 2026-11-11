"use client";
import { useStore } from "@/components/storefront/ctx";
import { Empty } from "@/components/storefront/ui";

export default function Policies() {
  const { store } = useStore();
  const blocks = [
    ["shipping", "Shipping policy", store.shipping_policy],
    ["returns", "Returns policy", store.return_policy],
  ] as const;
  return (
    <div className="rs-wrap" style={{ maxWidth: 760, paddingTop: 32 }}>
      <h1 style={{ margin: "0 0 24px", font: "700 30px var(--font)" }}>
        Policies
      </h1>
      {blocks.map(([id, t, body]) => (
        <section key={id} id={id} style={{ marginBottom: 32 }}>
          <h2 style={{ font: "700 20px var(--font)" }}>{t}</h2>
          {body ? (
            <p
              style={{
                font: "400 15px/1.7 var(--font)",
                color: "var(--muted)",
                whiteSpace: "pre-line",
              }}
            >
              {body}
            </p>
          ) : (
            <Empty title="Not provided yet" />
          )}
        </section>
      ))}
      {(store.contact.email || store.contact.phone) && (
        <section id="contact">
          <h2 style={{ font: "700 20px var(--font)" }}>Contact</h2>
          <p
            style={{ font: "400 15px/1.7 var(--font)", color: "var(--muted)" }}
          >
            {store.contact.email && (
              <a href={`mailto:${store.contact.email}`}>
                {store.contact.email}
              </a>
            )}
            {store.contact.email && store.contact.phone && " · "}
            {store.contact.phone && (
              <a href={`tel:${store.contact.phone}`}>{store.contact.phone}</a>
            )}
          </p>
        </section>
      )}
    </div>
  );
}
