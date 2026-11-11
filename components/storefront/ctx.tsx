"use client";
import { createContext, useContext } from "react";
import type { Categories, Store } from "@/lib/storefront-types";

export type Ctx = {
  slug: string;
  store: Store;
  cats: Categories | null;
  insta: boolean;
};
export const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreShell");
  return c;
};
