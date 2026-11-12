import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { Badge } from "@/components/ui";

const TITLE = "Reel Store: Your shop, one link. Take orders on UPI or COD";
const DESC =
    "Create your online store in minutes. Add products, share one link on Instagram or WhatsApp, and take orders paid by UPI or cash on delivery. Made for small sellers in India.";

// Set metadataBase (https://reel-store.in) once in app/layout.tsx.
export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Reel Store",
    title: TITLE,
    description: DESC,
    url: "/",
    locale: "en_IN",
    // images: [{ url: "/og.png", width: 1200, height: 630 }], // add when you have one
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const STEPS = [
  ["1", "Add your products", "Upload photos, set prices, add tags and sizes, and organise by category."],
  ["2", "Choose your store look", "Pick a template and your brand colours, add a banner and an announcement."],
  ["3", "Share your link", "Put it in your Instagram bio or send it on WhatsApp. Buyers order on one page."],
];

const LOOK = [
  ["Two templates", "Start with Classic or the Insta Aesthetic look. Switch any time."],
  ["Your colours", "Choose button, accent and background colours. We warn you if text would be hard to read."],
  ["Banner and hero", "Add a banner image, a headline, a short line and a button that goes where you choose."],
  ["Announcement bar", "Show an offer like “Free shipping above ₹999” and hide it automatically on a date you pick."],
  ["Sections your way", "Show, hide and reorder Featured, Products, About and Links."],
  ["Fonts, corners and layout", "Pick fonts, corner style, product layout, image shape and columns on phones."],
];

const FEATURES = [
  ["Products and tags", "Add your own tags, filter by category, and move quickly with “Save & next product”."],
  ["UPI and cash on delivery", "Buyers pay to your own UPI ID or choose cash on delivery. You confirm each payment."],
  ["UPI QR payment link", "Send a QR with the order amount filled in, or a shareable pay page that expires in 10 minutes."],
  ["Emails to you and your buyer", "Order receipts and payment confirmations go to both of you automatically."],
  ["Clear order tracking", "Order IDs like OID48213, status in plain words, shipping details before you mark shipped, and a Track order page for buyers."],
  ["Store controls", "Close your store or set an end date. Buyers see a clear page instead of an error. Turn on WhatsApp contact when you want it."],
];

const FAQ = [
  ["What does it cost?", "Free to start, and there is no commission on your orders."],
  ["Do I need a website?", "No. You get a shop link you can share anywhere, on Instagram, WhatsApp or in your bio."],
  ["How do I get paid?", "Buyers pay to your own UPI ID or choose cash on delivery, and you confirm each payment. The money goes straight to you."],
  ["Do my buyers need an account?", "No. They check out on one page with their details, and get their order confirmation by email."],
  ["Can I change how my store looks?", "Yes. Choose a template, your colours, a banner, an announcement bar, and which sections show and in what order."],
  ["Can I run more than one store?", "Yes. One login can manage multiple stores."],
  ["Can I close my store for a while?", "Yes. Close it or set an end date. Buyers see a friendly page explaining the store is unavailable."],
  ["Is it only for India?", "Yes. Reel Store is made for sellers in India, with UPI, cash on delivery and rupee pricing."],
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reel Store",
    url: "https://reel-store.in",
    description: DESC,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
];

export default function Home() {
  return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
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
              <p className="mut">5 minutes to setup. Free to start.</p>
            </div>
            {/* Swap this card for a real storefront screenshot when you have one */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="card" style={{ width: 240, padding: 16, borderRadius: 24 }}>
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
            <span>No commission on orders</span>
            <span>Made for India</span>
          </div>
        </section>

        <section id="how" className="sec">
          <div className="w">
            <h2 className="h1s" style={{ fontSize: 22 }}>How it works</h2>
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              Three steps from nothing to your first order.
            </p>
            <div className="g">
              {STEPS.map(([n, t, d]) => (
                  <div className="card" key={n}>
                    <div className="n">{n}</div>
                    <h3 className="h2" style={{ marginBottom: 4 }}>{t}</h3>
                    <p className="mut">{d}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section id="look" className="sec alt">
          <div className="w">
            <h2 className="h1s">Make it look like your brand</h2>
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              No design skills needed. Change the look in a few taps and see a live preview as you go.
            </p>
            <div className="g">
              {LOOK.map(([t, d]) => (
                  <div className="card" key={t}>
                    <h3 className="h2" style={{ marginBottom: 4 }}>{t}</h3>
                    <p className="mut">{d}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="sec">
          <div className="w">
            <h2 className="h1s">Everything you need to run orders</h2>
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              From the first product to the last parcel, in one place.
            </p>
            <div className="g">
              {FEATURES.map(([t, d]) => (
                  <div className="card" key={t}>
                    <h3 className="h2" style={{ marginBottom: 4 }}>{t}</h3>
                    <p className="mut">{d}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec alt">
          <div className="w">
            <h2 className="h1s">See every order at a glance</h2>
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

        <section id="faq" className="sec">
          <div className="w" style={{ maxWidth: 720 }}>
            <h2 className="h1s" style={{ marginBottom: 24 }}>Questions</h2>
            {FAQ.map(([q, a]) => (
                <div key={q} style={{ marginBottom: 24 }}>
                  <h3 className="h2" style={{ marginBottom: 4 }}>{q}</h3>
                  <p className="mut" style={{ fontSize: 16, lineHeight: "24px" }}>{a}</p>
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