import { SiteHeader, SiteFooter } from "@/components/Site";
export const metadata = { title: "Terms of Service" };
export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="doc">
        <h1>Terms of Service</h1>
        <p className="mut">Effective [EFFECTIVE DATE]</p>
        <p className="note">
          Draft for review. Have a lawyer check this before you publish it, and
          fill in every [BRACKET].
        </p>
        <h2>About Reel Store</h2>
        <p>
          Reel Store is a technology platform run by [LEGAL ENTITY NAME].
          Sellers use it to run online shops. We are not the seller of any
          product and not a party to a sale between a buyer and a seller.
        </p>
        <h2>Accounts</h2>
        <p>
          Sellers sign in with their email and a one-time code. Keep your
          details accurate and your account secure. One person may own more than
          one store.
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
          <li>Enter your UPI ID correctly. You are responsible for it.</li>
        </ul>
        <h2>What you may not sell or do</h2>
        <p>
          No illegal, counterfeit or restricted items, no fraud or spam, and
          nothing that harms others. Digital products and services are available
          only to sellers we have enabled for them.
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
        <h2>Suspension and closing a store</h2>
        <p>
          We may suspend or close a store that breaks these terms or the law.
          Sellers can close their store at any time.
        </p>
        <h2>Fees</h2>
        <p>[PRICING AND COMMISSION TERMS]</p>
        <h2>Our liability</h2>
        <p>
          Reel Store is provided as is. To the extent the law allows, we are not
          liable for indirect losses or for disputes between buyers and sellers
          [LAWYER TO CONFIRM].
        </p>
        <h2>Governing law and contact</h2>
        <p>
          These terms follow the laws of India, and the courts at [CITY, STATE]
          have jurisdiction. Questions: [EMAIL]. We may update these terms and
          will show the new effective date at the top.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
