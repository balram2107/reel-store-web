import type { PublicStore } from "@/lib/types";
import { waUrl } from "@/lib/format";
import { PoweredBy } from "./ui";
const T: Record<string, string> = {
  closed: "This store is closed right now",
  ended: "This store has ended",
  suspended: "This store isn’t available",
};
export default function Unavailable({ store }: { store: PublicStore }) {
  const wa = waUrl(store.whatsapp_number);
  return (
    <div className="mob plain">
      <p className="sname">{store.name}</p>
      <div style={{ padding: "16px" }}>
        <div className="card pad">
          <h1 className="h1s">{T[store.status] || T.suspended}</h1>
          {store.unavailable_message && (
            <p className="mut m16" style={{ fontSize: 16, lineHeight: "24px" }}>
              {store.unavailable_message}
            </p>
          )}
          {wa && (
            <a className="btn s" style={{ marginTop: 16 }} href={wa}>
              Message the seller on WhatsApp
            </a>
          )}
        </div>
      </div>
      <PoweredBy />
    </div>
  );
}
