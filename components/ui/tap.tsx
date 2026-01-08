"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { softHaptic } from "@/lib/haptics";

interface TapButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * TapButton - Provides haptic feedback and visual tap animation
 * Use for buttons, links, and interactive elements
 */
export function TapButton({
  className,
  asChild = false,
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: TapButtonProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    softHaptic();
    onPointerDown?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      softHaptic();
    }
    onKeyDown?.(e);
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "touch-manipulation select-none",
        "active:scale-[0.98] active:opacity-90",
        "transition-[transform,opacity] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        className
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface TapIconButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * TapIconButton - Icon buttons with minimum tap target size (44x44px)
 * Use for icon-only buttons to ensure accessibility
 */
export function TapIconButton({
  className,
  asChild = false,
  children,
  onPointerDown,
  onKeyDown,
  ...props
}: TapIconButtonProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    softHaptic();
    onPointerDown?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      softHaptic();
    }
    onKeyDown?.(e);
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "touch-manipulation select-none",
        "min-h-10 min-w-10",
        "active:scale-[0.98] active:opacity-90",
        "transition-[transform,opacity] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        className
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Comp>
  );
}
