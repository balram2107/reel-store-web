"use client";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import { fromPaise, toPaise } from "@/lib/forms";
import type { Category, Img, SellerProduct } from "@/lib/types";
import { Field } from "./ui";
import {
  ConfirmDialog,
  FieldError,
  FormStatus,
  SubmitButton,
  apiMessages,
  useToast,
  useUnsavedChanges,
} from "./feedback";

const DEFAULT_TAGS = ["new", "bestsellers", "sale", "gifts"];
const MAX_TAGS = 10;
const MAX_PHOTOS = 8;
type V = { name: string; options: string };
type FieldKey = "name" | "price" | "mrp" | "stock";
type FieldErrors = Partial<Record<FieldKey, string>>;
const sortImgs = (a: Img[]) => [...a].sort((x, y) => x.position - y.position);
const cleanTag = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 30);
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function TagInput({
  tags,
  setTags,
  suggestions,
}: {
  tags: string[];
  setTags: (t: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const commit = (raw: string) => {
    const next = raw.split(",").map(cleanTag).filter(Boolean);
    if (!next.length) return setDraft("");
    setTags([...new Set([...tags, ...next])].slice(0, MAX_TAGS));
    setDraft("");
  };
  const unused = suggestions.filter((s) => !tags.includes(s));
  return (
    <div>
      {tags.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
        >
          {tags.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: "#eef2ff",
                fontSize: 14,
              }}
            >
              {t}
              <button
                type="button"
                aria-label={`Remove tag ${t}`}
                onClick={() => setTags(tags.filter((x) => x !== t))}
                style={{
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className="in"
        value={draft}
        placeholder="Type a tag and press Enter (e.g. handmade, diwali, under-500)"
        disabled={tags.length >= MAX_TAGS}
        onChange={(e) => {
          if (e.target.value.includes(",")) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // don't submit the whole form
            commit(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) {
            setTags(tags.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
      />
      {unused.length > 0 && tags.length < MAX_TAGS && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <span className="mut t">Quick add:</span>
          {unused.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              className="btn s auto"
              onClick={() => commit(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <p className="mut t" style={{ marginTop: 6 }}>
        Up to {MAX_TAGS} tags. Shoppers can find your products by these.
      </p>
    </div>
  );
}

export default function ProductForm({
  product,
  onSaved,
  onSaveNext,
  nextLabel = "Save & next product →",
  nextDisabled = false,
  label = "Save product",
}: {
  product?: SellerProduct;
  onSaved: (p: SellerProduct) => void;
  onSaveNext?: (p: SellerProduct) => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  label?: string;
}) {
  const toast = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>(DEFAULT_TAGS);
  const [created, setCreated] = useState<SellerProduct | null>(null);
  const cur = product ?? created;
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

  // Form-level messages (shown at the top, next to the Save button's result)
  const [err, setErr] = useState<unknown>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [fe, setFe] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  // Remove-photo confirmation
  const [confirmImg, setConfirmImg] = useState<Img | null>(null);
  const [removing, setRemoving] = useState(false);

  // Warn before the tab closes with unsaved edits
  const snapshot = (t: string[] = tags) =>
    JSON.stringify({
      name,
      desc,
      price,
      mrp,
      stock,
      cat,
      vars,
      tags: t,
      visible,
      files: files.length,
    });
  const [baseline, setBaseline] = useState(snapshot);
  useUnsavedChanges(snapshot() !== baseline);

  const clearField = (k: FieldKey) =>
    setFe((f) => (f[k] ? { ...f, [k]: undefined } : f));

  useEffect(() => {
    api<{ categories: Category[] }>("/categories")
      .then((x) => setCats(x.categories))
      .catch(() => {});
    api<{ tags: string[] }>("/seller/products/tags", { auth: true })
      .then((x) =>
        setTagSuggestions([...new Set([...DEFAULT_TAGS, ...x.tags])]),
      )
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

  // Photo actions happen far from the top of the form, so they report with toasts.
  const add = async (fs: File[]) => {
    if (!product || !fs.length) return;
    const room = MAX_PHOTOS - imgs.length;
    if (room <= 0) {
      toast.warning(
        `This product already has ${MAX_PHOTOS} photos. Remove one to add more.`,
        {
          title: "Photo limit reached",
        },
      );
      return;
    }
    if (fs.length > room) {
      toast.warning(
        `You can add ${plural(room, "more photo")} (${MAX_PHOTOS} maximum).`,
        {
          title: "Too many photos",
        },
      );
      return;
    }
    try {
      setImgs(sortImgs(await upload(product.id, fs)));
      toast.success(`${plural(fs.length, "photo")} added.`);
    } catch (x) {
      toast.fromError(x, { title: "Photos not added" });
    }
  };

  const patch = async (
    m: Img,
    body: { cover?: boolean; position?: number },
  ) => {
    if (!product) return;
    try {
      const r = await api<{ images: Img[] }>(
        `/seller/products/${product.id}/images/${m.id}`,
        { method: "PATCH", body, auth: true },
      );
      setImgs(sortImgs(r.images));
      if (body.cover) toast.success("Cover photo updated.");
    } catch (x) {
      toast.fromError(x, { title: "Photo not updated" });
    }
  };

  const rm = async () => {
    if (!product || !confirmImg) return;
    setRemoving(true);
    try {
      await api(`/seller/products/${product.id}/images/${confirmImg.id}`, {
        method: "DELETE",
        auth: true,
      });
      setImgs(imgs.filter((i) => i.id !== confirmImg.id));
      toast.success("Photo removed.");
    } catch (x) {
      toast.fromError(x, { title: "Photo not removed" });
    }
    setRemoving(false);
    setConfirmImg(null);
  };

  async function save(andNext = false) {
    setErr(null);
    setWarn(null);

    // Validate, then show every problem next to its field at once.
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = "Enter a product name.";
    const p = toPaise(price);
    if (p === undefined || Number.isNaN(p))
      errs.price = "Enter a valid price, like 499 or 499.50.";
    const m = toPaise(mrp);
    if (
      m !== undefined &&
      (Number.isNaN(m) || (p !== undefined && !Number.isNaN(p) && m < p))
    )
      errs.mrp = "MRP must be a number at least as high as the price.";
    const sn = stock.trim() === "" ? null : Number(stock);
    if (sn !== null && (!Number.isInteger(sn) || sn < 0))
      errs.stock =
        "Stock must be a whole number, or leave it empty for no limit.";
    setFe(errs);
    if (Object.keys(errs).length) {
      setErr("Some fields need fixing. Check the messages below.");
      return;
    }
    if (p === undefined) return; // narrows the type; unreachable after validation

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
      mrp_paise: m === undefined ? null : m, // null lets the seller clear MRP
      stock: sn,
      category_id: cat ? Number(cat) : null, // null lets the seller clear category
      variants,
      visible,
      tags,
    };

    setBusy(true);
    let out: SellerProduct;
    const isNew = !cur;
    try {
      const r = await api<{ product: SellerProduct }>(
        cur ? `/seller/products/${cur.id}` : "/seller/products",
        { method: cur ? "PATCH" : "POST", body, auth: true },
      );
      out = r.product;
      if (!cur) setCreated(out); // a retry after a failed photo upload will PATCH, not create a duplicate
    } catch (x) {
      setErr(x); // backend message shown at the top of the form
      setBusy(false);
      return;
    }

    // The product is saved. A photo failure from here on is a warning, not a failure.
    if (files.length) {
      try {
        const im = await upload(out.id, files);
        out = { ...out, images: im };
        setFiles([]);
        setImgs(sortImgs(im));
      } catch (x) {
        setWarn(
          `Your product was ${isNew ? "created" : "saved"}, but the photos didn't upload (${apiMessages(x)[0]}). Select the photos again and press save.`,
        );
        setBusy(false);
        return;
      }
    }

    setTags(out.tags || tags);
    setTagSuggestions((s) => [...new Set([...s, ...(out.tags || [])])]);
    setBaseline(snapshot(out.tags || tags));
    toast.success(isNew ? "Product created." : "Product updated.");
    setBusy(false);
    if (andNext && onSaveNext) onSaveNext(out);
    else onSaved(out);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save(false);
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate>
        <FormStatus
          error={err}
          warning={warn}
          onDismiss={() => setWarn(null)}
        />

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
                      onClick={() => patch(m, { position: i })}
                    >
                      ←
                    </button>
                  )}
                  {i < imgs.length - 1 && (
                    <button
                      type="button"
                      className="btn s auto"
                      aria-label="Move later"
                      onClick={() => patch(m, { position: i + 2 })}
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn s auto"
                    onClick={() => setConfirmImg(m)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label className="f">
          {product
            ? "Add photos"
            : `Photos (up to ${MAX_PHOTOS}; the first is the cover)`}
          <input
            className="in"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const fs = Array.from(e.target.files || []);
              if (product) {
                add(fs);
                e.target.value = "";
              } else {
                if (fs.length > MAX_PHOTOS)
                  toast.warning(
                    `Only the first ${MAX_PHOTOS} photos were kept (${MAX_PHOTOS} maximum).`,
                    { title: "Too many photos" },
                  );
                setFiles(fs.slice(0, MAX_PHOTOS));
              }
            }}
          />
        </label>
        {!product && files.length > 0 && (
          <p className="mut" style={{ marginBottom: 12 }}>
            {plural(files.length, "photo")} selected
          </p>
        )}

        <h2 className="h2" style={{ marginTop: 16 }}>
          Details
        </h2>
        <Field
          label="Name"
          required
          value={name}
          aria-invalid={!!fe.name || undefined}
          aria-describedby={fe.name ? "pf-name-err" : undefined}
          onChange={(e) => {
            setName(e.target.value);
            clearField("name");
          }}
        />
        <FieldError id="pf-name-err">{fe.name}</FieldError>
        <label className="f">
          Description
          <textarea
            className="in"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </label>
        <div className="two-f">
          <div>
            <Field
              label="Price (₹)"
              required
              inputMode="decimal"
              value={price}
              aria-invalid={!!fe.price || undefined}
              aria-describedby={fe.price ? "pf-price-err" : undefined}
              onChange={(e) => {
                setPrice(e.target.value);
                clearField("price");
              }}
            />
            <FieldError id="pf-price-err">{fe.price}</FieldError>
          </div>
          <div>
            <Field
              label="MRP (₹), optional"
              inputMode="decimal"
              value={mrp}
              aria-invalid={!!fe.mrp || undefined}
              aria-describedby={fe.mrp ? "pf-mrp-err" : undefined}
              onChange={(e) => {
                setMrp(e.target.value);
                clearField("mrp");
              }}
            />
            <FieldError id="pf-mrp-err">{fe.mrp}</FieldError>
          </div>
        </div>
        <Field
          label="Stock (empty for no limit)"
          inputMode="numeric"
          value={stock}
          aria-invalid={!!fe.stock || undefined}
          aria-describedby={fe.stock ? "pf-stock-err" : undefined}
          onChange={(e) => {
            setStock(e.target.value);
            clearField("stock");
          }}
        />
        <FieldError id="pf-stock-err">{fe.stock}</FieldError>
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
          Tags
        </h2>
        <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} />
        <label
          className="check"
          style={{ alignItems: "center", marginTop: 12 }}
        >
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Show this product in my store
        </label>

        <SubmitButton busy={busy}>{label}</SubmitButton>
        {onSaveNext && (
          <SubmitButton
            type="button"
            busy={busy}
            disabled={nextDisabled}
            style={{ marginTop: 8 }}
            onClick={() => save(true)}
          >
            {nextLabel}
          </SubmitButton>
        )}
      </form>

      <ConfirmDialog
        open={!!confirmImg}
        title="Remove this photo?"
        confirmLabel="Remove photo"
        cancelLabel="Keep photo"
        busy={removing}
        onConfirm={rm}
        onCancel={() => setConfirmImg(null)}
      >
        It will disappear from your store right away.
      </ConfirmDialog>
    </>
  );
}
