"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TapButton, TapIconButton } from "@/components/ui/tap";
import { Menu, ArrowLeft } from "lucide-react";
import { useNavDirection } from "@/components/yeliz-samet-nav-direction";

interface YelizSametTopbarProps {
  showBackButton?: boolean;
  onMenuClick: () => void;
  rightContent?: React.ReactNode;
}

export function YelizSametTopbar({
  showBackButton = false,
  onMenuClick,
  rightContent,
}: YelizSametTopbarProps) {
  const router = useRouter();
  const { setBack } = useNavDirection();

  const handleBack = () => {
    setBack();
    router.back();
  };

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <TapIconButton asChild>
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Geri</span>
              </Button>
            </TapIconButton>
          )}
          <TapButton asChild>
            <Link
              href="/yeliz-samet"
              className="text-lg font-semibold hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
            >
              Yeliz & Samet
            </Link>
          </TapButton>
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          <TapIconButton asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü</span>
            </Button>
          </TapIconButton>
        </div>
      </div>
    </div>
  );
}

