import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { Badge } from "@/components/ui";
export default function Home() {
  return (
    <>
      <SiteHeader />
      <section className="sec" style={{ paddingBottom: 72 }}>
        <div className="w g hero">
          <div className="stack">
            <h1 className="h1">Your shop, one link.</h1>
            <p className="mut" style={{ fontSize: 16, lineHeight: "24px" }}>
              Add your products, share your link on Instagram or WhatsApp, and
              take orders paid by UPI or cash on delivery.
            </p>
            <div className="acts">
              <Link className="btn auto" href="/login">
                Create your store
              </Link>
              <a className="btn s auto" href="#how">
                See how it works
              </a>
            </div>
            <p className="mut">5 minutes to setup</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              className="card"
              style={{ width: 240, padding: 16, borderRadius: 24 }}
            >
              <b style={{ fontSize: 14 }}>Your Shop Name</b>
              <div className="ph" style={{ height: 140, margin: "12px 0" }}>
                Product photo
              </div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Product name</p>
              <p className="t" style={{ fontSize: 14, marginBottom: 12 }}>
                ₹499
              </p>
              <span className="btn">Order now</span>
            </div>
          </div>
        </div>
      </section>
      <section className="strip">
        <div className="w">
          <span>UPI and cash on delivery</span>
          <span>Works from Instagram and WhatsApp</span>
          <span>Made for India</span>
        </div>
      </section>
      <section id="how" className="sec">
        <div className="w">
          <h2 className="h1s" style={{ fontSize: 22 }}>
            How it works
          </h2>
          <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
            Three steps from nothing to your first order.
          </p>
          <div className="g">
            {[
              [
                "1",
                "Add your products",
                "Upload photos, set prices, and pick a store look.",
              ],
              [
                "2",
                "Share your link",
                "Put it in your Instagram bio or send it on WhatsApp.",
              ],
              [
                "3",
                "Get orders",
                "Buyers check out on one page and pay by UPI or choose cash on delivery.",
              ],
            ].map(([n, t, d]) => (
              <div className="card" key={n}>
                <div className="n">{n}</div>
                <h3 className="h2" style={{ marginBottom: 4 }}>
                  {t}
                </h3>
                <p className="mut">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="sec alt">
        <div className="w">
          <h2 className="h1s">Everything you need to run orders</h2>
          <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
            Share in one tap. See every order’s status in words, not guesswork.
          </p>
          <div className="g">
            <div className="card">
              <h3 className="h2">Share your store</h3>
              <div className="row first">
                <span className="t">reel-store.in/your-shop</span>
              </div>
              <div className="row">
                <span>Send on WhatsApp</span>
              </div>
            </div>
            <div className="card">
              <h3 className="h2">Order status</h3>
              <div className="row first">
                <span>OID48213</span>
                <Badge status="paid" />
              </div>
              <div className="row">
                <span>OID48214</span>
                <Badge status="awaiting_payment" />
              </div>
              <div className="row">
                <span>OID48215</span>
                <Badge status="shipped" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="sec">
        <div className="w" style={{ maxWidth: 720 }}>
          <h2 className="h1s" style={{ marginBottom: 24 }}>
            Questions
          </h2>
          {[
            ["What does it cost?", "Totally free of cost."],
            [
              "Do I need a website?",
              "No. You get a shop link you can share anywhere.",
            ],
            [
              "How do I get paid?",
              "Buyers pay to your own UPI ID or choose cash on delivery, and you confirm each payment.",
            ],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: 24 }}>
              <h3 className="h2" style={{ marginBottom: 4 }}>
                {q}
              </h3>
              <p className="mut" style={{ fontSize: 16, lineHeight: "24px" }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="band">
        <div className="w">
          <h2 className="h1s">Start your store today</h2>
          <p>Create your shop link and share it with your first customer.</p>
          <Link className="btn ob auto" href="/login">
            Create your store
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
