"use client";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { StoreShell } from "@/components/storefront/Shell";

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { slug } = useParams<{ slug: string }>();
  return <StoreShell slug={slug}>{children}</StoreShell>;
}
