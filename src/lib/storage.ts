import { useEffect, useState } from 'react'

/** useState that saves to localStorage and survives blocked storage. */
export function usePersistent<T>(key: string, initial: T, revive?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        return revive ? revive(parsed) : (parsed as T)
      }
    } catch { /* storage blocked or corrupt: fall back */ }
    return initial
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  }, [key, value])
  return [value, setValue] as const
}
