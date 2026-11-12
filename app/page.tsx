import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { Badge } from "@/components/ui";

/* ------------------------------------------------------------------
   FILL THESE IN. Anything left empty is hidden automatically,
   so the page never shows a broken link or an empty section.
------------------------------------------------------------------- */

// 1. Live demo store, e.g. "https://reel-store.in/demo-shop"
const DEMO_URL = "https://reel-store.in/demo-reel-store";

// 4. Your WhatsApp number with country code, digits only, e.g. "919876543210"
const WA_NUMBER = "+918572068977";
const WA_TEXT = "Hi, I want to set up my Reel Store. Can you help me?";
const WA_URL = WA_NUMBER
    ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`
    : "";

// 2. Proof: real seller stores. Add 3. Screenshots go in /public/proof/.
// Example:
// { name: "Priya's Boutique", url: "https://reel-store.in/priya", img: "/proof/priya.png", line: "Moved her Instagram orders to one link." }
const PROOF: { name: string; url: string; img: string; line: string }[] = [];

const TITLE = "Reel Store: Stop taking orders in DMs. Get one link, paid by UPI";
const DESC =
    "Stop chasing orders in Instagram and WhatsApp DMs. Create your store in minutes, share one link, and take orders paid straight to your own UPI or by cash on delivery. Made for small sellers in India.";

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

const PAIN = [
  ["Orders buried in DMs", "Every order is one clear page with an order ID, items and address, not a scroll through chats."],
  ["Endless “price?” and “size?” messages", "Buyers see prices, sizes and photos on your link before they message you."],
  ["Payment screenshots to chase", "Buyers pay your UPI ID and you confirm each payment in one tap."],
];

const STEPS = [
  ["1", "Add your products", "Upload photos, set prices, add tags and sizes, and organise by category."],
  ["2", "Choose your store look", "Pick a template and your brand colours, add a banner and an announcement."],
  ["3", "Share your link", "Put it in your Instagram bio or send it on WhatsApp. Buyers order on one page."],
];

const SAFETY = [
  ["Money goes straight to your UPI", "Buyers pay to your own UPI ID. Reel Store never holds your money."],
  ["No commission", "We do not take a cut of your orders."],
  ["You confirm every payment", "An order is only marked paid after you check it in your own UPI app."],
  ["Cash on delivery too", "Let buyers who prefer it pay when the parcel arrives."],
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
  ["Does Reel Store hold my money?", "No. Payments go directly to your UPI ID. We never hold, route or take a cut of your money."],
  ["Do my buyers need an account?", "No. They check out on one page with their details, and get their order confirmation by email."],
  ["I am not technical. Can someone help me set up?", "Yes. Message us on WhatsApp and we will help you set up your store."],
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

        {/* HERO: lead with the pain */}
        <section className="sec" style={{ paddingBottom: 72 }}>
          <div className="w g hero">
            <div className="stack">
              <h1 className="h1">Stop taking orders in DMs.</h1>
              <p className="mut" style={{ fontSize: 16, lineHeight: "24px" }}>
                Give buyers one link to order and pay by UPI or cash on delivery.
                No more screenshots, no more “price?” messages. Your money goes
                straight to your own UPI.
              </p>
              <div className="acts">
                <Link className="btn auto" href="/login">
                  Create your store
                </Link>
                {DEMO_URL && (
                    <a
                        className="btn s auto"
                        href={DEMO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      See a real store
                    </a>
                )}
              </div>
              {WA_URL && (
                  <p>
                    <a
                        className="t"
                        href={WA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                      Set it up for me on WhatsApp →
                    </a>
                  </p>
              )}
              <p className="mut">5 minutes to setup. Free to start. No commission.</p>
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
            <span>UPI straight to you</span>
            <span>Works from Instagram and WhatsApp</span>
            <span>No commission on orders</span>
            <span>Made for India</span>
          </div>
        </section>

        {/* PAIN */}
        <section className="sec">
          <div className="w">
            <h2 className="h1s" style={{ fontSize: 22 }}>Selling on Instagram should not feel like this</h2>
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              If your orders live in chats, you lose time and sales. One link fixes it.
            </p>
            <div className="g">
              {PAIN.map(([t, d]) => (
                  <div className="card" key={t}>
                    <h3 className="h2" style={{ marginBottom: 4 }}>{t}</h3>
                    <p className="mut">{d}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO */}
        {DEMO_URL && (
            <section className="sec alt">
              <div className="w">
                <h2 className="h1s">See what your buyers see</h2>
                <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
                  Open a real store, add something to the cart and go through checkout.
                </p>
                <a
                    className="btn auto"
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  See a real store
                </a>
              </div>
            </section>
        )}

        {/* PROOF */}
        {PROOF.length > 0 && (
            <section className="sec">
              <div className="w">
                <h2 className="h1s">Sellers already using Reel Store</h2>
                <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
                  Real stores, taking real orders.
                </p>
                <div className="g">
                  {PROOF.map((p) => (
                      <div className="card" key={p.url}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={p.img}
                            alt={`${p.name} store on Reel Store`}
                            loading="lazy"
                            style={{ width: "100%", height: "auto", borderRadius: 12, marginBottom: 12 }}
                        />
                        <h3 className="h2" style={{ marginBottom: 4 }}>{p.name}</h3>
                        <p className="mut" style={{ marginBottom: 8 }}>{p.line}</p>
                        <a
                            className="t"
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                          Visit store →
                        </a>
                      </div>
                  ))}
                </div>
              </div>
            </section>
        )}

        <section id="how" className="sec alt">
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
            {WA_URL && (
                <p style={{ marginTop: 24 }}>
                  <a
                      className="btn s auto"
                      href={WA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    Set it up for me on WhatsApp
                  </a>
                </p>
            )}
          </div>
        </section>

        {/* PAYMENT SAFETY */}
        <section id="safety" className="sec">
          <div className="w">
            <h2 className="h1s">Your money goes straight to you</h2>
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              Buyers pay your UPI ID directly. We never hold your money.
            </p>
            <div className="g">
              {SAFETY.map(([t, d]) => (
                  <div className="card" key={t}>
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
            <h2 className="h1s">Stop taking orders in DMs. Start today.</h2>
            <p>Create your shop link and share it with your first customer.</p>
            <div className="acts">
              <Link className="btn ob auto" href="/login">
                Create your store
              </Link>
              {WA_URL && (
                  <a
                      className="btn ob auto"
                      href={WA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    Set it up for me on WhatsApp
                  </a>
              )}
            </div>
          </div>
        </section>

        <SiteFooter />
      </>
  );
}