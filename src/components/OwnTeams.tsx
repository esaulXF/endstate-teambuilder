import { motion, AnimatePresence } from 'framer-motion'
import { BY_NAME } from '../data/characters'
import { countUsage, teamProblem } from '../lib/solver'

export type Slot = string | null

interface Props {
  roster: string[]
  teams: Slot[][]
  usesOf: (n: string) => number
  onChange: (teams: Slot[][]) => void
}

export function OwnTeams({ roster, teams, usesOf, onChange }: Props) {
  const usage = countUsage(teams)
  const problems = teams.map((t) => teamProblem(t, usage, usesOf))
  const allValid = teams.length > 0 && problems.every((p) => p === null)
  const sorted = [...roster].sort((a, b) => a.localeCompare(b))

  const setSlot = (ti: number, si: number, v: Slot) => onChange(teams.map((t, i) => (i === ti ? t.map((x, j) => (j === si ? v : x)) : t)))

  const status = teams.length
    ? allValid
      ? teams.length > 1 ? `All ${teams.length} teams are valid.` : 'Your team is valid.'
      : `Fix before sending: ${problems.map((p, i) => (p ? `team ${i + 1} ${p}` : '')).filter(Boolean).join('; ')}.`
    : ''
  return (
    <div>
      <div className="toolbar"><button className="btn" onClick={() => onChange([...teams, [null, null, null]])}>Add a Team</button></div>
      <div className="team-grid">
        <AnimatePresence initial={false}>
          {teams.map((t, ti) => (
            <motion.div key={ti} layout className="team-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
              <header className="team-head">
                <h3>Your Team {ti + 1}</h3>
                <button className="btn ghost small" onClick={() => onChange(teams.filter((_, i) => i !== ti))} aria-label={`Remove your team ${ti + 1}`}>Remove</button>
              </header>
              {t.map((v, si) => (
                <select key={si} className="field slot" aria-label={`Team ${ti + 1}, slot ${si + 1}`} value={v ?? ''} onChange={(e) => setSlot(ti, si, e.target.value || null)}>
                  <option value="">Empty Slot</option>
                  {sorted.map((n) => (
                    <option key={n} value={n} disabled={n !== v && (t.includes(n) || (usage[n] || 0) >= usesOf(n))}>{n} ({BY_NAME[n].rarity}★)</option>
                  ))}
                </select>
              ))}
              {problems[ti] && <p className="note bad">{problems[ti][0].toUpperCase() + problems[ti].slice(1)}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {status && <p className={`status ${allValid ? 'ok' : 'bad'}`} role="status">{status}</p>}
    </div>
  )
}
