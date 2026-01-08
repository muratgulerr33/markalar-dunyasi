import { NavDirectionProvider } from "@/components/yeliz-samet-nav-direction";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://markalar-dunyasi.vercel.app"),
  title: "Yeliz & Samet",
  description: "7 Ocak 2026 • Akdeniz Belediyesi Nikah Dairesi",
  openGraph: {
    type: "website",
    url: "/yeliz-samet",
    title: "Yeliz & Samet",
    description: "7 Ocak 2026 • Akdeniz Belediyesi Nikah Dairesi",
    images: [
      {
        url: "https://markalar-dunyasi.vercel.app/yeliz-samet/salon-foto/IMG-20260107-WA0192.webp",
        width: 1200,
        height: 630,
        alt: "Yeliz & Samet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yeliz & Samet",
    description: "7 Ocak 2026 • Akdeniz Belediyesi Nikah Dairesi",
    images: [
      "https://markalar-dunyasi.vercel.app/yeliz-samet/salon-foto/IMG-20260107-WA0192.webp",
    ],
  },
};

export default function YelizSametLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark bg-black text-white min-h-screen native-scroll">
      <NavDirectionProvider>{children}</NavDirectionProvider>
    </div>
  );
}

