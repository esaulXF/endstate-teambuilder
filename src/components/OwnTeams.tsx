import { motion, AnimatePresence } from 'framer-motion'
import { BY_NAME } from '../data/characters'
import { countUsage, teamProblem } from '../lib/solver'

export type Slot = string | null

interface Props {
  roster: string[]
  teams: Slot[][]
  usesOf: (n: string) => number
  onChange: (teams: Slot[][]) => void
  onSendAll: () => void
  onSendRemaining: () => void
}

export function OwnTeams({ roster, teams, usesOf, onChange, onSendAll, onSendRemaining }: Props) {
  const usage = countUsage(teams)
  const problems = teams.map((t) => teamProblem(t, usage, usesOf))
  const allValid = teams.length > 0 && problems.every((p) => p === null)
  const sorted = [...roster].sort((a, b) => a.localeCompare(b))
  const slotsLeft = sorted.reduce((a, n) => a + Math.max(0, usesOf(n) - (usage[n] || 0)), 0)

  const setSlot = (ti: number, si: number, v: Slot) => onChange(teams.map((t, i) => (i === ti ? t.map((x, j) => (j === si ? v : x)) : t)))

  let status = ''
  if (teams.length) {
    status = allValid
      ? `${teams.length > 1 ? `All ${teams.length} teams follow` : 'Your team follows'} the rules and can be built like this. ${slotsLeft < 3 ? 'Not enough Resonators are left for another team.' : `${slotsLeft} team slots can still be filled from what is left.`}`
      : `Fix your teams before sending: ${problems.map((p, i) => (p ? `team ${i + 1} ${p}` : '')).filter(Boolean).join('; ')}.`
  }
  const hint = teams.length
    ? 'Send roster is only available while no teams are added here. Remove your teams to use it.'
    : roster.length < 3 ? 'Select at least 3 Resonators in step 1 first.' : 'Send remaining roster unlocks once you add a valid team.'

  return (
    <div>
      <div className="toolbar"><button className="btn" onClick={() => onChange([...teams, [null, null, null]])}>Add a team</button></div>
      <div className="team-grid">
        <AnimatePresence initial={false}>
          {teams.map((t, ti) => (
            <motion.div key={ti} layout className="team-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
              <header className="team-head">
                <h3>Your team {ti + 1}</h3>
                <button className="btn ghost small" onClick={() => onChange(teams.filter((_, i) => i !== ti))} aria-label={`Remove your team ${ti + 1}`}>Remove</button>
              </header>
              {t.map((v, si) => (
                <select key={si} className="field slot" aria-label={`Team ${ti + 1}, slot ${si + 1}`} value={v ?? ''} onChange={(e) => setSlot(ti, si, e.target.value || null)}>
                  <option value="">Empty slot</option>
                  {sorted.map((n) => (
                    <option key={n} value={n} disabled={n !== v && (t.includes(n) || (usage[n] || 0) >= usesOf(n))}>{n} ({BY_NAME[n].rarity}★)</option>
                  ))}
                </select>
              ))}
              <p className={problems[ti] ? 'note bad' : 'note ok'}>{problems[ti] ? `Not valid: ${problems[ti]}` : 'Valid'}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {status && <p className={`status ${allValid ? 'ok' : 'bad'}`} role="status">{status}</p>}
      <div className="toolbar">
        <button className="btn primary" disabled={teams.length > 0 || roster.length < 3} onClick={onSendAll}>Send roster</button>
        <button className="btn primary" disabled={!allValid} onClick={onSendRemaining}>Send remaining roster</button>
      </div>
      <p className="hint">{hint}</p>
    </div>
  )
}
