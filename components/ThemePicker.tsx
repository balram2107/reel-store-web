"use client";
import type { Theme } from "@/lib/types";
const KEYS = [
  ["button", "Button"],
  ["accent", "Accent"],
  ["background", "Background"],
] as const;
export default function ThemePicker({
  v,
  set,
}: {
  v: Theme;
  set: (t: Theme) => void;
}) {
  return (
    <div>
      <div className="g" style={{ marginBottom: 12 }}>
        {(["classic", "insta_aesthetic"] as const).map((t) => (
          <label className="card" key={t} style={{ display: "block" }}>
            <span
              className="check"
              style={{ alignItems: "center", marginBottom: 8 }}
            >
              <input
                type="radio"
                name="template"
                checked={v.template === t}
                onChange={() => set({ ...v, template: t })}
              />
              {t === "classic" ? "Classic" : "Insta Aesthetic"}
            </span>
            <div className="ph" style={{ height: 96 }}>
              {t === "classic"
                ? "Banner and 2-column products"
                : "Profile, collections, 3-column grid"}
            </div>
          </label>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
          gap: 12,
        }}
      >
        {KEYS.map(([k, l]) => (
          <label className="f" key={k}>
            {l}
            <input
              className="in"
              type="color"
              style={{ padding: 4 }}
              value={v[k]}
              onChange={(e) => set({ ...v, [k]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
