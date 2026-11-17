import { motion } from 'framer-motion'
import { BY_NAME } from '../data/characters'
import { ELEMENT_COLOR, Medal, Stars } from './Medal'
import type { Team } from '../lib/solver'

export interface Pool { names: string[]; caps: Record<string, number>; manual: string[][]; usedUp: string[] }

interface Props {
  pool: Pool | null
  teams: Team[] | null
  leftover: string[]
  onBuild: () => void
}

export function Results({ pool, teams, leftover, onBuild }: Props) {
  return (
    <div>
      <p className="lede" role="status">
        {!pool
          ? 'Nothing sent yet. Use a send button in step 2 first.'
          : pool.manual.length
            ? `Using the ${pool.names.length} Resonators left after your ${pool.manual.length} team${pool.manual.length > 1 ? 's' : ''}.${pool.usedUp.length ? ` Already used and removed: ${pool.usedUp.join(', ')}.` : ''}`
            : `Using your full roster: ${pool.names.length} Resonators.`}
      </p>
      {pool && (
        <div className="pool">
          {pool.names.map((n) => (
            <span key={n} className="pill" style={{ ['--el' as string]: ELEMENT_COLOR[BY_NAME[n].element] }}>
              {n}{pool.manual.some((m) => m.includes(n)) && pool.caps[n] === 1 ? ' (1 use left)' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="toolbar"><button className="btn primary" disabled={!pool} onClick={onBuild}>Build teams</button></div>
      <p className="hint">Builds as many full teams as the sent Resonators allow. Resonators already in your own teams are removed from the pool. Shared supports keep one use if you used them once. Stability Accords uses up to 3 teams, and Singularity Expansion has no limit.</p>

      {teams && (
        <>
          {teams.length === 0 && <p className="empty">Not enough Resonators for a full team.</p>}
          <div className="team-grid">
            {teams.map((t, i) => (
              <motion.article key={i} className="team-card built" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.3 }}>
                <header className="team-head"><h3>Team {i + 1}</h3></header>
                {t.map((n) => {
                  const c = BY_NAME[n]
                  const also = teams.map((x, j) => (j !== i && x.includes(n) ? `Team ${j + 1}` : '')).filter(Boolean)
                  const withYours = pool?.manual.some((m) => m.includes(n))
                  return (
                    <div key={n} className="member" style={{ ['--el' as string]: ELEMENT_COLOR[c.element] }}>
                      <Medal c={c} size={38} />
                      <span>
                        <span className="tile-name">{n}</span>
                        <span className="tile-meta"><Stars rarity={c.rarity} /> {c.element}, {c.role}{also.length ? `, also in ${also.join(', ')}` : ''}{withYours ? ', also in your own teams' : ''}</span>
                      </span>
                    </div>
                  )
                })}
              </motion.article>
            ))}
          </div>
          <p className="hint">{leftover.length ? `Not used: ${leftover.join(', ')}.` : 'Every Resonator in the pool is on a team.'}</p>
          <p className="hint">Teams are listed strongest first. Ratings and synergies are rough estimates, not official data, so treat the result as a starting point.</p>
        </>
      )}
    </div>
  )
}
