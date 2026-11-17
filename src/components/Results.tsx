import { motion } from 'framer-motion'
import { BY_NAME } from '../data/characters'
import { ELEMENT_COLOR, Medal, Stars } from './Medal'
import type { Plan } from '../lib/plan'
import { ARCHETYPES, bestBuild, describeTeam, teamLinks } from '../data/synergy'

const isDps = (n: string) => BY_NAME[n].role !== 'Support'

function Tags({ team }: { team: string[] }) {
  const bb = bestBuild(team)
  const links = teamLinks(team, isDps).filter((l, i, a) => a.findIndex((x) => x.from === l.from && x.effect === l.effect) === i).slice(0, 2)
  if (!bb && !links.length) return null
  return (
    <div className="tags">
      {bb && <span className={`tag tier-${bb.build.tier.replace('.', '')}`} title={bb.exact ? 'Known build' : 'Close to a known build'}>{bb.build.tier} {ARCHETYPES[bb.build.arch].label}{bb.exact ? '' : ' (close)'}</span>}
      {links.map((l) => <span key={l.from + l.to + l.effect} className="tag">{l.from} gives {l.to} {l.effect}</span>)}
    </div>
  )
}

export function Results({ plan, busy, stale, showWhy }: { plan: Plan | null; busy: boolean; stale: boolean; showWhy: boolean }) {
  if (!plan) return <p className="empty">Press Build teams to see your teams here.</p>
  if (plan.kind === 'empty') return <p className="empty">Select at least 3 Resonators in step 1 to see teams here.</p>
  if (plan.kind === 'fix') return <p className="empty bad">Finish or fix your teams in step 2 to build the rest.</p>
  const { teams, leftover, manual, summary } = plan
  return (
    <div className={busy || stale ? 'results busy' : 'results'}>
      {stale && <p className="hint stale" role="status">Your roster changed. Press Build teams to update.</p>}
      <p className="lede" role="status">{summary}</p>
      {teams.length === 0 && <p className="empty">Not enough Resonators left for a full team.</p>}
      <div className="team-grid">
        {teams.map((t, i) => (
          <motion.article key={t.join('|')} className="team-card built" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }}>
            <header className="team-head"><h3>Team {i + 1}<span className="desc">{describeTeam(t, (n) => BY_NAME[n].role)}</span></h3></header>
            {t.map((n) => {
              const c = BY_NAME[n]
              const also = teams.map((x, j) => (j !== i && x.includes(n) ? `Team ${j + 1}` : '')).filter(Boolean)
              const withYours = manual.some((m) => m.includes(n))
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
            {showWhy && <Tags team={t} />}
          </motion.article>
        ))}
      </div>
      {teams.length > 0 && <p className="hint">{leftover.length ? `Not used: ${leftover.join(', ')}.` : 'Every Resonator is on a team.'}</p>}
    </div>
  )
}
