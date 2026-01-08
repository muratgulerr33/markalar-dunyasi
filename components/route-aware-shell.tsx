"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

export default function RouteAwareShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isGalleryRoute =
    pathname === "/yeliz-samet" || pathname.startsWith("/yeliz-samet/");

  // Galeri rotalarında header/nav yok:
  if (isGalleryRoute) {
    return <main className="min-h-dvh">{children}</main>;
  }

  // Diğer her yerde mevcut site shell aynen:
  return (
    <>
      <SiteHeader />
      <main className="safe-header">{children}</main>
    </>
  );
}

