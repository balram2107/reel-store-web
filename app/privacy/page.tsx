import { SiteHeader, SiteFooter } from "@/components/Site";
export const metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
      <>
        <SiteHeader />
        <main className="doc">
          <h1>Privacy Policy</h1>
          <p className="mut">Effective 8 November 2026</p>
          <p className="note">
            Reel Store is an early-stage product. This policy explains in plain
            words what data we handle and why. We will update it as the product
            grows and show the new date at the top.
          </p>
          <h2>Who we are</h2>
          <p>
            Reel Store (reel-store.in) is currently run by an individual founder,
            Balram, India. It is not yet a registered company. It lets
            sellers create a shop link and take orders from buyers.
          </p>
          <h2>What we collect</h2>
          <ul>
            <li>
              Sellers: email address, store details (name, link, Instagram
              handle, products, photos, prices), UPI ID, and shipping details
              they enter.
            </li>
            <li>
              Buyers: name, phone number, email address, delivery address, order
              details, and the payment reference (UTR) they enter after paying.
            </li>
            <li>
              Sign-in: we email a one-time code to log you in. We do not use
              passwords. We store your sign-in token in your browser so you stay
              logged in.
            </li>
            <li>
              Usage data: basic device and server log information, such as IP
              address, used to keep the service running and prevent misuse.
            </li>
          </ul>
          <h2>Why we use it</h2>
          <p>
            To run accounts and orders, send sign-in codes and order emails,
            prevent misuse, fix problems, and meet legal obligations.
          </p>
          <h2>Who sees it</h2>
          <p>
            A seller sees the order details of the buyers who order from them, so
            they can fulfil those orders. We use service providers to host our
            systems and to send emails (including Resend for email delivery);
            they handle data only to provide those services to us. We share data
            with authorities only when the law requires it. We do not sell
            personal data.
          </p>
          <p>
            The Reel Store team can open a seller’s store dashboard to give
            support. This access is only for helping sellers and fixing problems,
            and each such session is logged.
          </p>
          <h2>Payments</h2>
          <p>
            Buyers pay the seller’s own UPI ID or choose cash on delivery. Reel
            Store does not collect or hold that money. We store the payment
            reference a buyer enters so the seller can confirm the payment.
          </p>
          <h2>Your choices and rights</h2>
          <p>
            You can ask us to show, correct or delete your data, or to withdraw
            your consent, by emailing us at the address below. We will reply
            within 30 days. If you ask us to delete your data, we may keep what we
            must keep to meet legal duties or settle a dispute about an order.
            This follows the rights in India’s Digital Personal Data Protection
            Act, 2023.
          </p>
          <h2>How long we keep it</h2>
          <p>
            We keep seller data while the account is active. Order data is kept as
            long as needed to run orders and handle disputes, and we delete or
            anonymise it when it is no longer needed or when you ask us to, subject
            to the point above.
          </p>
          <h2>Security</h2>
          <p>
            We use reasonable safeguards to protect your data, including
            encrypted connections. No system is completely secure, so we cannot
            promise absolute security.
          </p>
          <h2>Children</h2>
          <p>Reel Store is not meant for people under 18.</p>
          <h2>Contact and grievances</h2>
          <p>
            Questions, requests or complaints about your data: balram@reel-store.in. We
            will do our best to respond within 30 days.
          </p>
        </main>
        <SiteFooter />
      </>
  );
}