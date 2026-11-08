"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/api";
import { Wordmark } from "./ui";
export function SiteHeader() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => setAuthed(!!getToken()), []);
  return (
      <header className="hd">
        <div className="w hdr">
          <Wordmark size={22} />
          <nav className="nav">
            {authed === true && (
                <Link className="btn auto" href="/dashboard">
                  Go to dashboard
                </Link>
            )}
            {authed === false && (
                <>
                  <Link className="li" href="/login">
                    Log in
                  </Link>
                  <Link className="btn auto" href="/login">
                    Start free
                  </Link>
                </>
            )}
          </nav>
        </div>
      </header>
  );
}
// SiteFooter stays exactly as it is
export function SiteFooter() {
  return (
    <footer className="ft">
      <div className="w ftr">
        <Wordmark size={18} />
        <span className="fl">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
        <span className="mut">Made in India</span>
      </div>
    </footer>
  );
}
