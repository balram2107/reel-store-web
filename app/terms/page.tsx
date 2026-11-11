import { SiteHeader, SiteFooter } from "@/components/Site";
export const metadata = { title: "Terms of Service" };
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="doc">
        <h1>Terms of Service</h1>
        <p className="mut">Effective 8 November 2026</p>
        <p className="note">
          Reel Store is an early-stage product. These terms explain, in plain
          words, how it works and what we each expect. We will update them as
          the product grows and show the new date at the top.
        </p>
        <h2>About Reel Store</h2>
        <p>
          Reel Store (reel-store.in) is a technology platform currently run by
          an individual founder, Balram, India. It is not yet a registered
          company. Sellers use it to run online shops. We are not the seller of
          any product and not a party to a sale between a buyer and a seller.
        </p>
        <h2>Early access</h2>
        <p>
          Reel Store is new. Features may change, break or be removed, and the
          service may be unavailable at times. We try to keep it running and to
          keep your data safe, but we cannot promise it will always work.
        </p>
        <h2>Accounts</h2>
        <p>
          Sellers sign in with their email and a one-time code. Keep your
          details accurate and your email account secure, because anyone who can
          read your email can sign in as you. One person may own more than one
          store.
        </p>
        <h2>Seller responsibilities</h2>
        <ul>
          <li>
            List only lawful products, with accurate descriptions and prices.
          </li>
          <li>
            Honour confirmed orders, deliver them, and handle returns and
            refunds under your own policy and the law.
          </li>
          <li>
            Follow the laws that apply to your business, including consumer and
            tax rules.
          </li>
          <li>
            Enter your UPI ID correctly and confirm payments carefully. You are
            responsible for both.
          </li>
          <li>Only upload photos and text you have the right to use.</li>
        </ul>
        <h2>What you may not sell or do</h2>
        <p>
          No illegal, counterfeit or restricted items, no fraud or spam, no
          attempts to break or misuse the service, and nothing that harms
          others.
        </p>
        <h2>Orders and payments</h2>
        <p>
          Buyers pay the seller directly by UPI or choose cash on delivery, and
          the seller confirms each payment. Once a buyer marks an order as paid,
          the seller cannot cancel it. Refunds are arranged between buyer and
          seller. Reel Store does not process or hold payments and does not
          guarantee them.
        </p>
        <h2>Buyers</h2>
        <p>
          Give correct details when you order. Raise any problem with the seller
          first.
        </p>
        <h2>Support access</h2>
        <p>
          To help sellers and fix problems, the Reel Store team can open a
          seller’s store dashboard and manage it on the seller’s behalf. We use
          this only for support and keep a record of each session.
        </p>
        <h2>Suspension and closing a store</h2>
        <p>
          We may suspend or close a store that breaks these terms or the law.
          Sellers can close their store at any time. You can also ask us to
          delete your account by emailing us.
        </p>
        <h2>Fees</h2>
        <p>
          Reel Store is free to use during early access. If we introduce fees
          later, we will tell sellers by email in advance, and you can close
          your store instead of accepting them.
        </p>
        <h2>Our liability</h2>
        <p>
          Reel Store is provided as is. To the extent the law allows, we are not
          liable for indirect losses, for lost sales or data, or for disputes
          between buyers and sellers.
        </p>
        <h2>Governing law and contact</h2>
        <p>
          These terms follow the laws of India, and the courts at Yamuna Nagar,
          Haryana have jurisdiction. Questions: balram@reel-store.in. We may
          update these terms and will show the new effective date at the top.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
