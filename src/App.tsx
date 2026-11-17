import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BY_NAME, CYCLE_BONUS, isRover, usesFor } from './data/characters'
import { maxTeams } from './lib/solver'
import { planRest, type Plan } from './lib/plan'
import { usePersistent } from './lib/storage'
import { Roster } from './components/Roster'
import { OwnTeams, type Slot } from './components/OwnTeams'
import { Results } from './components/Results'

// Only one Rover can be selected at a time.
const onlyOneRover = (names: string[]) => {
  let seen = false
  return names.filter((n) => (isRover(n) ? (seen ? false : (seen = true)) : true))
}

export default function App() {
  const [rosterList, setRosterList] = usePersistent<string[]>('wuwa-endstate-roster', [], (r) =>
    onlyOneRover(Array.isArray(r) ? r.filter((n) => typeof n === 'string' && n in BY_NAME) : []),
  )
  const [light, setLight] = usePersistent<boolean>('wuwa-endstate-light', false, (r) => r === true)
  const [why, setWhy] = usePersistent<boolean>('wuwa-endstate-why', false, (r) => r === true)
  const [cycle, setCycle] = usePersistent<boolean>('wuwa-endstate-cycle-v2', false)
  const [manual, setManual] = usePersistent<Slot[][]>('wuwa-endstate-manual-v2', [], (r) =>
    Array.isArray(r) ? r.map((t) => (Array.isArray(t) ? t.slice(0, 3).map((n) => (typeof n === 'string' && n in BY_NAME ? n : null)) : [null, null, null])) : [],
  )
  const [built, setBuilt] = useState<{ plan: Plan; key: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (light) document.documentElement.dataset.theme = 'light'
    else delete document.documentElement.dataset.theme
  }, [light])

  const roster = useMemo(() => new Set(rosterList), [rosterList])
  const usesOf = (n: string) => usesFor(n, cycle)

  // Drop own-team picks that are no longer in the roster.
  useEffect(() => {
    if (manual.some((t) => t.some((n) => n && !roster.has(n)))) setManual(manual.map((t) => t.map((n) => (n && roster.has(n) ? n : null))))
  }, [roster, manual, setManual])

  // Teams are only built when the button is pressed, so selecting Resonators stays fast.
  const inputKey = JSON.stringify([rosterList, manual, cycle])
  const stale = !!built && built.key !== inputKey
  const build = () => {
    setBusy(true)
    setTimeout(() => {
      setBuilt({ plan: planRest(rosterList, manual, (n) => usesFor(n, cycle)), key: inputKey })
      setBusy(false)
    }, 30)
  }

  const capacity = useMemo(() => {
    const caps: Record<string, number> = {}
    rosterList.forEach((n) => (caps[n] = usesFor(n, cycle)))
    return maxTeams(caps)
  }, [rosterList, cycle])

  const toggle = (n: string) => {
    if (roster.has(n)) return setRosterList(rosterList.filter((x) => x !== n))
    setRosterList([...(isRover(n) ? rosterList.filter((x) => !isRover(x)) : rosterList), n])
  }
  const setMany = (names: string[], on: boolean) =>
    setRosterList(on ? [...new Set([...rosterList, ...names.filter((n) => !isRover(n))])] : rosterList.filter((n) => !names.includes(n)))

  return (
    <div className="shell">
      <div className="topbar">
        <span className="theme-label" id="theme-label">{light ? 'Light Mode' : 'Dark Mode'}</span>
        <button type="button" className="theme-toggle" role="switch" aria-checked={light} aria-labelledby="theme-label" onClick={() => setLight(!light)}>
          <span className="knob">
            <svg className="ico moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a.6.6 0 0 0-.8-.7A9.5 9.5 0 1 0 21.2 15a.6.6 0 0 0-.7-.8Z" /></svg>
            <svg className="ico sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
          </span>
        </button>
      </div>
      <header className="hero">
        <div>
          <h1>Endstate Matrix Team Builder</h1>
          <label className="switch">
            <input type="checkbox" checked={cycle} onChange={(e) => setCycle(e.target.checked)} />
            <span>Include Cycle Bonuses <b className="cycle-tag">{CYCLE_BONUS.name}, Patch {CYCLE_BONUS.patch}</b></span>
          </label>
        </div>
        <motion.div className="readout" key={capacity} initial={{ opacity: 0.4, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} aria-live="polite">
          <span className="readout-num">{capacity}</span>
          <span className="readout-label">{capacity === 1 ? 'Team' : 'Teams'} Your Roster Can Fill</span>
          <span className="readout-sub">{rosterList.length} Resonators Selected</span>
        </motion.div>
      </header>

      <section className="panel" aria-labelledby="s1">
        <h2 id="s1"><span className="step">1</span>Your Roster</h2>
        <Roster roster={roster} cycleBonus={cycle} onToggle={toggle} onSetMany={setMany} />
      </section>

      <section className="panel" aria-labelledby="s2">
        <h2 id="s2"><span className="step">2</span>Your Own Teams <small>Optional</small></h2>
        <OwnTeams roster={rosterList} teams={manual} usesOf={usesOf} onChange={setManual} />
      </section>

      <section className="panel" aria-labelledby="s3">
        <h2 id="s3"><span className="step">3</span>Build the Rest</h2>
        <div className="build-bar">
          <button className="btn" onClick={build} disabled={busy || rosterList.length < 3}>{busy ? 'Building…' : 'Build Teams'}</button>
          <label className="switch why-switch">
            <input type="checkbox" checked={why} onChange={(e) => setWhy(e.target.checked)} />
            <span>Show Team Reasoning</span>
          </label>
        </div>
        <Results plan={built?.plan ?? null} busy={busy} stale={stale} showWhy={why} />
      </section>

      <footer className="foot">Unofficial fan tool, not affiliated with Kuro Games. Ratings and synergies are rough estimates.</footer>
    </div>
  )
}
