import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
export const metadata = { title: "Page not found" };
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="doc" style={{ textAlign: "center", minHeight: "50vh" }}>
        <p className="mut">Error 404</p>
        <h1 style={{ margin: "8px 0" }}>We couldn’t find that page</h1>
        <p
          className="mut"
          style={{ marginBottom: 24, fontSize: 16, lineHeight: "24px" }}
        >
          The link may be wrong, or the store may have moved. Check the address
          and try again.
        </p>
        <Link className="btn auto" style={{ display: "inline-flex" }} href="/">
          Go to Reel Store
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
