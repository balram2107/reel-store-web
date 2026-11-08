import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getStore, themeVars } from "@/lib/store";
import type { Product } from "@/lib/types";
import Unavailable from "@/components/Unavailable";
import { PoweredBy } from "@/components/ui";
import ProductView from "./ProductView";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const store = await getStore(slug);
  if (store.status !== "open") return <Unavailable store={store} />;
  let p: Product;
  try {
    p = (
      await api<{ product: Product }>(`/public/stores/${slug}/products/${id}`, {
        revalidate: 30,
      })
    ).product;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <div className="mob th" style={themeVars(store)}>
      <header className="shd">
        <Link href={`/${slug}`} style={{ fontSize: 14 }}>
          ← {store.name}
        </Link>
        <Link className="btn s auto" href={`/${slug}/cart`}>
          Cart
        </Link>
      </header>
      <ProductView
        slug={slug}
        p={p}
        insta={store.theme.template === "insta_aesthetic"}
        wa={store.whatsapp_number || null}
      />
      <PoweredBy />
    </div>
  );
}
