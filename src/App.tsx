import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BY_NAME, CYCLE_BONUS, PERMANENT_TWO_USE, usesFor } from './data/characters'
import { countUsage, maxTeams, solve, type Team } from './lib/solver'
import { usePersistent } from './lib/storage'
import { Roster } from './components/Roster'
import { OwnTeams, type Slot } from './components/OwnTeams'
import { Results, type Pool } from './components/Results'

export default function App() {
  const [rosterList, setRosterList] = usePersistent<string[]>('wuwa-endstate-roster', [], (r) => (Array.isArray(r) ? r.filter((n) => typeof n === 'string' && n in BY_NAME) : []))
  const [cycle, setCycle] = usePersistent<boolean>('wuwa-endstate-cycle-v2', false)
  const [manual, setManual] = usePersistent<Slot[][]>('wuwa-endstate-manual-v2', [], (r) =>
    Array.isArray(r) ? r.map((t) => (Array.isArray(t) ? t.slice(0, 3).map((n) => (typeof n === 'string' && n in BY_NAME ? n : null)) : [null, null, null])) : [],
  )
  const [pool, setPool] = useState<Pool | null>(null)
  const [built, setBuilt] = useState<Team[] | null>(null)
  const [leftover, setLeftover] = useState<string[]>([])

  const roster = useMemo(() => new Set(rosterList), [rosterList])
  const usesOf = (n: string) => usesFor(n, cycle)

  // Drop manual picks that are no longer in the roster.
  useEffect(() => {
    if (manual.some((t) => t.some((n) => n && !roster.has(n)))) setManual(manual.map((t) => t.map((n) => (n && roster.has(n) ? n : null))))
  }, [roster, manual, setManual])

  // Anything sent or built earlier is stale once the roster, teams or cycle option change.
  useEffect(() => { setPool(null); setBuilt(null); setLeftover([]) }, [rosterList, manual, cycle])

  const capacity = useMemo(() => {
    const caps: Record<string, number> = {}
    rosterList.forEach((n) => (caps[n] = usesFor(n, cycle)))
    return maxTeams(caps)
  }, [rosterList, cycle])

  const toggle = (n: string) => setRosterList(roster.has(n) ? rosterList.filter((x) => x !== n) : [...rosterList, n])
  const setMany = (names: string[], on: boolean) => setRosterList(on ? [...new Set([...rosterList, ...names])] : rosterList.filter((n) => !names.includes(n)))

  const sendAll = () => {
    const caps: Record<string, number> = {}
    rosterList.forEach((n) => (caps[n] = usesOf(n)))
    setPool({ names: [...rosterList], caps, manual: [], usedUp: [] })
  }
  const sendRemaining = () => {
    const used = countUsage(manual)
    const caps: Record<string, number> = {}
    rosterList.forEach((n) => (caps[n] = usesOf(n) - (used[n] || 0)))
    setPool({ names: rosterList.filter((n) => caps[n] > 0), caps, manual: manual.map((t) => t.filter((n): n is string => !!n)), usedUp: rosterList.filter((n) => caps[n] <= 0) })
  }
  const build = () => {
    if (!pool) return
    const teams = solve(pool.names, pool.caps, maxTeams(pool.caps))
    const usedNames = new Set(teams.flat())
    setBuilt(teams)
    setLeftover(pool.names.filter((n) => !usedNames.has(n)))
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <h1>Endstate Matrix team builder</h1>
          <label className="switch">
            <input type="checkbox" checked={cycle} onChange={(e) => setCycle(e.target.checked)} />
            <span>Include cycle bonuses <b className="cycle-tag">{CYCLE_BONUS.name}, patch {CYCLE_BONUS.patch}</b></span>
          </label>
        </div>
        <motion.div className="readout" key={capacity} initial={{ opacity: 0.4, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} aria-live="polite">
          <span className="readout-num">{capacity}</span>
          <span className="readout-label">{capacity === 1 ? 'team' : 'teams'} your roster can fill</span>
          <span className="readout-sub">{rosterList.length} Resonators selected</span>
        </motion.div>
      </header>

      <section className="panel" aria-labelledby="s1">
        <h2 id="s1"><span className="step">1</span>Your roster</h2>
        <Roster roster={roster} cycleBonus={cycle} onToggle={toggle} onSetMany={setMany} />
      </section>

      <section className="panel" aria-labelledby="s2">
        <h2 id="s2"><span className="step">2</span>Your own teams <small>optional</small></h2>
        <OwnTeams roster={rosterList} teams={manual} usesOf={usesOf} onChange={setManual} onSendAll={sendAll} onSendRemaining={sendRemaining} />
      </section>

      <section className="panel" aria-labelledby="s3">
        <h2 id="s3"><span className="step">3</span>Build the rest</h2>
        <Results pool={pool} teams={built} leftover={leftover} onBuild={build} />
      </section>

      <footer className="foot">Unofficial fan tool, not affiliated with Kuro Games. Ratings and synergies are rough estimates.</footer>
    </div>
  )
}
