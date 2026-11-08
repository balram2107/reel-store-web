"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rupees, waUrl } from "@/lib/format";
import { addLine } from "@/lib/cart";
import type { Product } from "@/lib/types";
export default function ProductView({
  slug,
  p,
  insta,
  wa,
}: {
  slug: string;
  p: Product;
  insta: boolean;
  wa: string | null;
}) {
  const r = useRouter();
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const imgs = p.images;
  const ready = p.variants.every((v) => sel[v.name]);
  const can = p.in_stock && ready;
  const add = () => {
    addLine(slug, {
      product_id: p.id,
      variant: p.variants.length ? sel : undefined,
      quantity: 1,
    });
    setAdded(true);
  };
  const buy = () => {
    add();
    r.push(`/${slug}/checkout`);
  };
  const link = waUrl(wa);
  return (
    <>
      <div className="gal">
        {imgs[i] ? (
          <img src={imgs[i].url} alt={`${p.name}, photo ${i + 1}`} />
        ) : (
          <div className="ph">Photo</div>
        )}
        {imgs.length > 1 && (
          <span className="cnt">
            {i + 1} / {imgs.length}
          </span>
        )}
      </div>
      {imgs.length > 1 &&
        (insta ? (
          <div className="dots" role="group" aria-label="Photos">
            {imgs.map((m, k) => (
              <span key={m.id} className={k === i ? "on" : ""} />
            ))}
          </div>
        ) : null)}
      {imgs.length > 1 && (
        <div
          className={insta ? "thumbs" : "thumbs"}
          role="group"
          aria-label="Choose a photo"
        >
          {imgs.map((m, k) => (
            <button
              key={m.id}
              aria-label={`Show photo ${k + 1}`}
              aria-current={k === i}
              onClick={() => setI(k)}
            >
              <img src={m.thumb_url} alt="" />
            </button>
          ))}
        </div>
      )}
      <div style={{ padding: "0 16px 24px" }}>
        <h1 className="h1s">{p.name}</h1>
        <p
          style={{
            display: "flex",
            gap: 8,
            alignItems: "baseline",
            marginTop: 4,
          }}
        >
          <b className="t" style={{ fontSize: 22 }}>
            {rupees(p.price_paise)}
          </b>
          {p.mrp_paise && p.mrp_paise > p.price_paise && (
            <s className="mut t">{rupees(p.mrp_paise)}</s>
          )}
          <span className={"b " + (p.in_stock ? "g" : "n")}>
            {p.stock_label}
          </span>
        </p>
        {p.variants.map((v) => (
          <fieldset key={v.name}>
            <legend>{v.name}</legend>
            <div className="chips">
              {v.options.map((o) => (
                <label className="chip" key={o}>
                  <input
                    type="radio"
                    name={v.name}
                    checked={sel[v.name] === o}
                    onChange={() => setSel({ ...sel, [v.name]: o })}
                  />
                  {o}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="two" style={{ marginTop: 16 }}>
          <button className="btn s" disabled={!can} onClick={add}>
            {added ? "Added to cart" : "Add to cart"}
          </button>
          <button className="btn" disabled={!can} onClick={buy}>
            Buy now
          </button>
        </div>
        {!ready && p.in_stock && (
          <p className="mut" style={{ marginTop: 8 }}>
            Choose{" "}
            {p.variants
              .filter((v) => !sel[v.name])
              .map((v) => v.name.toLowerCase())
              .join(" and ")}{" "}
            to continue.
          </p>
        )}
        {added && (
          <p className="mut" style={{ marginTop: 8 }}>
            <Link href={`/${slug}/cart`}>View cart</Link>
          </p>
        )}
        {link && (
          <a className="btn s" style={{ marginTop: 8 }} href={link}>
            Ask about this on WhatsApp
          </a>
        )}
        {p.description && (
          <>
            <h2 className="h2" style={{ marginTop: 24, marginBottom: 4 }}>
              About this product
            </h2>
            <p
              className="mut"
              style={{
                fontSize: 16,
                lineHeight: "24px",
                whiteSpace: "pre-line",
              }}
            >
              {p.description}
            </p>
          </>
        )}
        <div className="row" style={{ marginTop: 12 }}>
          <span>Delivery</span>
          <span className="t">{rupees(p.delivery_charge_paise)}</span>
        </div>
      </div>
    </>
  );
}
