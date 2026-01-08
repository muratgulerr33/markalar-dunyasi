"use client"

import { useSyncExternalStore } from "react"

let hydrated = false

function subscribe(onStoreChange: () => void) {
  if (typeof window !== "undefined" && !hydrated) {
    hydrated = true
    // requestAnimationFrame ile bir sonraki frame'de tetikle
    requestAnimationFrame(() => {
      onStoreChange()
    })
  }
  return () => {
    // Cleanup gerekmiyor
  }
}

function getServerSnapshot() {
  return false
}

function getClientSnapshot() {
  return hydrated
}

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!mounted) {
    return null
  }

  return <>{children}</>
}

