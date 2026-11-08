"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import { fromPaise, toPaise } from "@/lib/forms";
import type { Category, Img, SellerProduct } from "@/lib/types";
import { ErrBox, Field } from "./ui";
const TAGS = ["new", "bestsellers", "sale", "gifts"];
type V = { name: string; options: string };
const sortImgs = (a: Img[]) => [...a].sort((x, y) => x.position - y.position);
export default function ProductForm({
  product,
  onSaved,
  label = "Save product",
}: {
  product?: SellerProduct;
  onSaved: (p: SellerProduct) => void;
  label?: string;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name || "");
  const [desc, setDesc] = useState(product?.description || "");
  const [price, setPrice] = useState(fromPaise(product?.price_paise));
  const [mrp, setMrp] = useState(fromPaise(product?.mrp_paise));
  const [stock, setStock] = useState(
    product && product.stock != null ? String(product.stock) : "",
  );
  const [cat, setCat] = useState(
    product?.category_id ? String(product.category_id) : "",
  );
  const [vars, setVars] = useState<V[]>(
    (product?.variants || []).map((v) => ({
      name: v.name,
      options: v.options.join(", "),
    })),
  );
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [visible, setVisible] = useState(product ? product.visible : true);
  const [files, setFiles] = useState<File[]>([]);
  const [imgs, setImgs] = useState<Img[]>(sortImgs(product?.images || []));
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    api<{ categories: Category[] }>("/categories")
      .then((x) => setCats(x.categories))
      .catch(() => {});
  }, []);
  const upload = async (id: number, fs: File[]) => {
    const fd = new FormData();
    fs.forEach((f) => fd.append("images[]", f));
    return (
      await api<{ images: Img[] }>(`/seller/products/${id}/images`, {
        method: "POST",
        form: fd,
        auth: true,
      })
    ).images;
  };
  const add = async (fs: File[]) => {
    if (!product || !fs.length) return;
    setErr(null);
    try {
      setImgs(sortImgs(await upload(product.id, fs)));
    } catch (x) {
      setErr(x);
    }
  };
  const patch = async (
    m: Img,
    body: { cover?: boolean; position?: number },
  ) => {
    if (!product) return;
    setErr(null);
    try {
      const r = await api<{ images: Img[] }>(
        `/seller/products/${product.id}/images/${m.id}`,
        { method: "PATCH", body, auth: true },
      );
      setImgs(sortImgs(r.images));
    } catch (x) {
      setErr(x);
    }
  };
  const rm = async (m: Img) => {
    if (!product) return;
    setErr(null);
    try {
      await api(`/seller/products/${product.id}/images/${m.id}`, {
        method: "DELETE",
        auth: true,
      });
      setImgs(imgs.filter((i) => i.id !== m.id));
    } catch (x) {
      setErr(x);
    }
  };
  async function save(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    const p = toPaise(price);
    if (p === undefined || Number.isNaN(p))
      return setErr("Enter a valid price.");
    const m = toPaise(mrp);
    if (m !== undefined && (Number.isNaN(m) || m < p))
      return setErr("MRP must be a number at least as high as the price.");
    const sn = stock.trim() === "" ? null : Number(stock);
    if (sn !== null && (!Number.isInteger(sn) || sn < 0))
      return setErr("Stock must be a whole number, or empty for no limit.");
    const variants = vars
      .filter((v) => v.name.trim() && v.options.trim())
      .map((v) => ({
        name: v.name.trim(),
        options: v.options
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      }));
    const body = {
      name,
      description: desc,
      price_paise: p,
      mrp_paise: m,
      stock: sn,
      category_id: cat ? Number(cat) : undefined,
      variants,
      visible,
      tags,
    };
    setBusy(true);
    try {
      const r = await api<{ product: SellerProduct }>(
        product ? `/seller/products/${product.id}` : "/seller/products",
        { method: product ? "PATCH" : "POST", body, auth: true },
      );
      let out = r.product;
      if (files.length) {
        const im = await upload(out.id, files);
        out = { ...out, images: im };
        setFiles([]);
        setImgs(sortImgs(im));
      }
      setOk(true);
      onSaved(out);
    } catch (x) {
      setErr(x);
    }
    setBusy(false);
  }
  return (
    <form onSubmit={save}>
      <ErrBox e={err} />
      {ok && (
        <div className="alert i" role="status">
          Saved.
        </div>
      )}
      <h2 className="h2">Photos</h2>
      {product && imgs.length > 0 && (
        <div className="imgs">
          {imgs.map((m, i) => (
            <div key={m.id}>
              <img src={m.thumb_url} alt={`Photo ${i + 1}`} />
              <p className="mut" style={{ margin: "4px 0" }}>
                {m.cover ? "Cover" : "Photo " + (i + 1)}
              </p>
              <div className="actions">
                {!m.cover && (
                  <button
                    type="button"
                    className="btn s auto"
                    onClick={() => patch(m, { cover: true })}
                  >
                    Make cover
                  </button>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    className="btn s auto"
                    aria-label="Move earlier"
                    onClick={() => patch(m, { position: m.position - 1 })}
                  >
                    ←
                  </button>
                )}
                {i < imgs.length - 1 && (
                  <button
                    type="button"
                    className="btn s auto"
                    aria-label="Move later"
                    onClick={() => patch(m, { position: m.position + 1 })}
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  className="btn s auto"
                  onClick={() => rm(m)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="f">
        {product ? "Add photos" : "Photos (up to 8; the first is the cover)"}
        <input
          className="in"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const fs = Array.from(e.target.files || []).slice(0, 8);
            if (product) {
              add(fs);
              e.target.value = "";
            } else setFiles(fs);
          }}
        />
      </label>
      {!product && files.length > 0 && (
        <p className="mut" style={{ marginBottom: 12 }}>
          {files.length} photo{files.length > 1 ? "s" : ""} selected
        </p>
      )}
      <h2 className="h2" style={{ marginTop: 16 }}>
        Details
      </h2>
      <Field
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="f">
        Description
        <textarea
          className="in"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </label>
      <div className="two-f">
        <Field
          label="Price (₹)"
          required
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Field
          label="MRP (₹), optional"
          inputMode="decimal"
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
        />
      </div>
      <Field
        label="Stock (empty for no limit)"
        inputMode="numeric"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <label className="f">
        Product category
        <select
          className="in"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">No category</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <h2 className="h2" style={{ marginTop: 16 }}>
        Variants
      </h2>
      {vars.map((v, i) => (
        <div className="two-f" key={i} style={{ alignItems: "end" }}>
          <Field
            label="Name (e.g. Size)"
            value={v.name}
            onChange={(e) =>
              setVars(
                vars.map((x, j) =>
                  j === i ? { ...x, name: e.target.value } : x,
                ),
              )
            }
          />
          <Field
            label="Options, comma separated"
            value={v.options}
            onChange={(e) =>
              setVars(
                vars.map((x, j) =>
                  j === i ? { ...x, options: e.target.value } : x,
                ),
              )
            }
          />
          <button
            type="button"
            className="btn s auto"
            style={{ marginBottom: 12 }}
            onClick={() => setVars(vars.filter((_, j) => j !== i))}
          >
            Remove variant
          </button>
        </div>
      ))}
      {vars.length < 3 && (
        <button
          type="button"
          className="btn s auto"
          style={{ marginBottom: 12 }}
          onClick={() => setVars([...vars, { name: "", options: "" }])}
        >
          Add variant
        </button>
      )}
      <h2 className="h2" style={{ marginTop: 16 }}>
        Show in collections
      </h2>
      <div style={{ display: "flex", gap: "0 20px", flexWrap: "wrap" }}>
        {TAGS.map((t) => (
          <label className="check" style={{ alignItems: "center" }} key={t}>
            <input
              type="checkbox"
              checked={tags.includes(t)}
              onChange={(e) =>
                setTags(
                  e.target.checked ? [...tags, t] : tags.filter((x) => x !== t),
                )
              }
            />
            {t[0].toUpperCase() + t.slice(1)}
          </label>
        ))}
      </div>
      <label className="check" style={{ alignItems: "center", marginTop: 8 }}>
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
        />
        Show this product in my store
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Saving…" : label}
      </button>
    </form>
  );
}
