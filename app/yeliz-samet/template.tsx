"use client";

import { useNavDirection } from "@/components/yeliz-samet-nav-direction";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function YelizSametTemplate({ children }: { children: ReactNode }) {
  const { direction } = useNavDirection();
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

  const slideVariants = {
    initial: (dir: number) => ({
      x: dir === 1 ? 30 : -30,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir === 1 ? -30 : 30,
      opacity: 0,
    }),
  };

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.22,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

