"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import { slugify } from "@/lib/forms";
import type { AdminFeatures } from "@/lib/types";
import { Field } from "./ui";
export type AdminFormValue = {
  seller_email?: string;
  name: string;
  slug: string;
  instagram_handle?: string;
  features: AdminFeatures;
  ends_on?: string;
};
const FEATS: [keyof AdminFeatures, string][] = [
  ["digital_products", "Allow digital products"],
  ["services", "Allow services"],
  ["whatsapp_button", "Show WhatsApp order button"],
];
export default function AdminStoreForm({
  create,
  initial,
  busy,
  label,
  onSubmit,
}: {
  create?: boolean;
  initial?: AdminFormValue;
  busy: boolean;
  label: string;
  onSubmit: (v: AdminFormValue) => void;
}) {
  const [email, setEmail] = useState(initial?.seller_email || "");
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [touched, setTouched] = useState(!create);
  const [insta, setInsta] = useState("");
  const [feat, setFeat] = useState<AdminFeatures>(initial?.features || {});
  const [ends, setEnds] = useState(initial?.ends_on || "");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      seller_email: create ? email : undefined,
      name,
      slug,
      instagram_handle: create && insta ? insta : undefined,
      features: feat,
      ends_on: ends || undefined,
    });
  };
  return (
    <form onSubmit={submit}>
      {create && (
        <>
          <Field
            label="Seller email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mut" style={{ margin: "-4px 0 12px" }}>
            They sign in with this email and a one-time code.
          </p>
        </>
      )}
      <Field
        label="Store name"
        required
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!touched) setSlug(slugify(e.target.value));
        }}
      />
      <Field
        label="Store link"
        required
        value={slug}
        onChange={(e) => {
          setTouched(true);
          setSlug(e.target.value.toLowerCase());
        }}
      />
      {create && (
        <Field
          label="Instagram handle, optional"
          placeholder="@theirshop"
          value={insta}
          onChange={(e) => setInsta(e.target.value)}
        />
      )}
      <h2 className="h2" style={{ marginTop: 8 }}>
        Features for this store
      </h2>
      {FEATS.map(([k, l]) => (
        <label className="check" style={{ alignItems: "center" }} key={k}>
          <input
            type="checkbox"
            checked={!!feat[k]}
            onChange={(e) => setFeat({ ...feat, [k]: e.target.checked })}
          />
          {l}
        </label>
      ))}
      <Field
        label="Store end date, optional"
        type="date"
        value={ends}
        onChange={(e) => setEnds(e.target.value)}
      />
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : label}
      </button>
    </form>
  );
}
