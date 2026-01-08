"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Direction = 1 | -1;

interface NavDirectionContextType {
  direction: Direction;
  setForward: () => void;
  setBack: () => void;
}

const NavDirectionContext = createContext<NavDirectionContextType | undefined>(
  undefined
);

export function NavDirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<Direction>(1);

  const setForward = () => setDirection(1);
  const setBack = () => setDirection(-1);

  useEffect(() => {
    const handlePopState = () => {
      setBack();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <NavDirectionContext.Provider value={{ direction, setForward, setBack }}>
      {children}
    </NavDirectionContext.Provider>
  );
}

export function useNavDirection() {
  const context = useContext(NavDirectionContext);
  if (context === undefined) {
    throw new Error("useNavDirection must be used within NavDirectionProvider");
  }
  return context;
}

