import Link from "next/link";
import { api } from "@/lib/api";
import { rupees } from "@/lib/format";
import { getStore, themeVars } from "@/lib/store";
import type { ProductRow, Meta } from "@/lib/types";
import Unavailable from "@/components/Unavailable";
import { PoweredBy } from "@/components/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await getStore(slug);
  return { title: s.name };
}
export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; highlight?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const store = await getStore(slug);
  if (store.status !== "open") return <Unavailable store={store} />;
  const q = new URLSearchParams({ page: sp.page || "1" });
  if (sp.highlight) q.set("highlight", sp.highlight);
  const { products, meta } = await api<{ products: ProductRow[]; meta: Meta }>(
    `/public/stores/${slug}/products?${q}`,
    { revalidate: 30 },
  );
  const insta = store.theme.template === "insta_aesthetic";
  const hl = (h?: string) => `/${slug}${h ? `?highlight=${h}` : ""}`;
  const pg = (p: number) =>
    `/${slug}?page=${p}${sp.highlight ? `&highlight=${sp.highlight}` : ""}`;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="mob th" style={themeVars(store)}>
      <header className="shd">
        <b>
          {insta
            ? "@" + (store.instagram_handle || store.slug).replace(/^@/, "")
            : store.name}
        </b>
        <Link className="btn s auto" href={`/${slug}/cart`}>
          Cart
        </Link>
      </header>
      {insta ? (
        <div className="prof">
          <div className="avatar">
            {store.logo_url ? (
              <img src={store.logo_url} alt="" />
            ) : (
              <div className="ph">Logo</div>
            )}
          </div>
          <div>
            <h1 className="h2" style={{ marginBottom: 0 }}>
              {store.name}
            </h1>
            {store.bio && <p className="mut">{store.bio}</p>}
          </div>
        </div>
      ) : (
        <>
          {store.banner_url && (
            <img className="banner" src={store.banner_url} alt="" />
          )}
          <div style={{ padding: "8px 16px" }}>
            <h1 className="h2" style={{ marginBottom: 0 }}>
              {store.name}
            </h1>
            {store.bio && <p className="mut">{store.bio}</p>}
          </div>
        </>
      )}
      {store.highlights.length > 0 &&
        (insta ? (
          <nav className="hls" aria-label="Collections">
            {store.highlights.map((h) => (
              <Link key={h} href={hl(h)} className="hl">
                <i>{h[0].toUpperCase()}</i>
                {cap(h)}
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="tags" aria-label="Collections">
            <Link href={hl()}>All</Link>
            {store.highlights.map((h) => (
              <Link key={h} href={hl(h)}>
                {cap(h)}
              </Link>
            ))}
          </nav>
        ))}
      {products.length === 0 && (
        <p className="mut" style={{ padding: 16 }}>
          No products to show yet.
        </p>
      )}
      {insta ? (
        <div className="grid3">
          {products.map((p) => (
            <Link
              key={p.id}
              className="tile"
              href={`/${slug}/p/${p.id}`}
              aria-label={`${p.name}, ${rupees(p.price_paise)}`}
            >
              {p.cover_url ? (
                <img src={p.cover_url} alt="" />
              ) : (
                <div className="ph">Photo</div>
              )}
              <span className="chipx t">
                {p.in_stock ? rupees(p.price_paise) : "Sold out"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid2">
          {products.map((p) => (
            <Link key={p.id} className="card pc" href={`/${slug}/p/${p.id}`}>
              {p.cover_url ? (
                <img src={p.cover_url} alt="" />
              ) : (
                <div className="ph">Photo</div>
              )}
              <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
              <span className="t" style={{ fontSize: 14 }}>
                {p.in_stock ? rupees(p.price_paise) : "Sold out"}
              </span>
            </Link>
          ))}
        </div>
      )}
      <div className="pager">
        <span>
          {meta.page > 1 && <Link href={pg(meta.page - 1)}>Previous</Link>}
        </span>
        <span>
          {meta.total > meta.page * meta.per_page && (
            <Link href={pg(meta.page + 1)}>Next</Link>
          )}
        </span>
      </div>
      <PoweredBy />
    </div>
  );
}
