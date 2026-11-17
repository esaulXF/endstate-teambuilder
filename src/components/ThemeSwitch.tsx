import { useRef, type ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'flamingo'
export const THEMES: { id: Theme; label: string; icon: ReactNode }[] = [
  { id: 'dark', label: 'Dark', icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15a.6.6 0 0 0-.7-.8Z" /></svg> },
  { id: 'light', label: 'Light', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg> },
  { id: 'flamingo', label: 'Flamingo', icon: <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L21 10l-5.2 4 1.9 7L12 17.2 6.3 21l1.9-7L3 10l6.8-1.7L12 2Z" /></svg> },
]

/** Three-way theme picker. The highlight slides to the chosen segment; arrow keys move between themes. */
export function ThemeSwitch({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = THEMES.findIndex((t) => t.id === value)
  const move = (to: number) => {
    const next = (to + THEMES.length) % THEMES.length
    onChange(THEMES[next].id)
    refs.current[next]?.focus()
  }
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Theme" style={{ ['--i' as string]: index }}>
      <span className="slider" aria-hidden="true" />
      {THEMES.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el }}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          aria-label={`${t.label} theme`}
          tabIndex={value === t.id ? 0 : -1}
          className="seg"
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i + 1) }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i - 1) }
          }}
        >
          {t.icon}<span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
