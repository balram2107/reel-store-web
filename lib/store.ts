import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { api, ApiError } from "./api";
import { onColor } from "./format";
import type { PublicStore } from "./types";
export async function getStore(slug: string): Promise<PublicStore> {
  try {
    return (
      await api<{ store: PublicStore }>("/public/stores/" + slug, {
        revalidate: 60,
      })
    ).store;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
export const themeVars = (s: PublicStore) =>
  ({
    "--tb": s.theme.button,
    "--ta": s.theme.accent,
    "--tbg": s.theme.background,
    "--tbt": onColor(s.theme.button),
    background: s.theme.background,
  }) as CSSProperties;
