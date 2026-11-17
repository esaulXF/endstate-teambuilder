import { BY_NAME } from './characters'
import { NEGATIVE_STATUSES, PROFILES, bestBuild, buildLabel, compositionRules, teamLinks, type Eff } from './synergy'

export interface Explain {
  /** Set when the team is a modified known build, e.g. "Based on T0 Unison". */
  based: { tag: string; lines: string[] } | null
  lines: string[]
}

export interface ExplainContext {
  owned: string[]
  teams: string[][] // all built teams, in order
  manual: string[][] // the player's own teams
  index: number // position of this team in `teams`
}

const tagOf = (w: string) => w.split(':')[0] as Eff
const strength = (w: string) => (w.includes(':') ? +w.split(':')[1] : 2)
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
const isDps = (n: string) => BY_NAME[n].role !== 'Support'

function offers(n: string, min = 2): Eff[] {
  return (PROFILES[n]?.applies ?? []).filter((w) => strength(w) >= min).map(tagOf)
}

/** Why a Resonator is missing from this team: not owned, or already spent elsewhere. */
function whyMissing(name: string, ctx: ExplainContext): string {
  if (!ctx.owned.includes(name)) return `${name} is not in your roster`
  const inTeams = ctx.teams.map((t, i) => (i !== ctx.index && t.includes(name) ? `Team ${i + 1}` : '')).filter(Boolean)
  const inOwn = ctx.manual.some((m) => m.includes(name))
  const where = [...inTeams, ...(inOwn ? ['your own teams'] : [])]
  if (where.length) return `${name} is already used in ${list(where)} and has no uses left`
  return `${name} was not free for this team`
}

export function explainTeam(team: string[], ctx: ExplainContext): Explain {
  const lines: string[] = []
  const bb = bestBuild(team)
  let based: Explain['based'] = null

  if (bb && !bb.exact) {
    const b = bb.build
    const kept = b.team.filter((m) => team.includes(m))
    const missing = b.team.filter((m) => !team.includes(m))
    const added = team.filter((m) => !b.team.includes(m))
    const bl: string[] = [`This team starts from the ${b.tier} ${buildLabel(b.arch)} build (${b.team.join(', ')}).`, `Kept from it: ${list(kept)}.`]
    missing.forEach((m, i) => {
      const r = added[i]
      if (!r) return
      bl.push(`Changed: ${m} was replaced by ${r}. ${whyMissing(m, ctx)}.`)
      const keep = offers(r)
      const lost = offers(m).filter((e) => !keep.includes(e))
      const gain = keep.filter((e) => !offers(m).includes(e))
      if (lost.length) bl.push(`The team loses what ${m} brings: ${list([...new Set(lost)])}.`)
      if (gain.length) bl.push(`${r} brings ${list([...new Set(gain)])} instead.`)
      if (!lost.length && !gain.length) bl.push(`${r} covers a similar job.`)
    })
    bl.push('Because the full build is not complete, it scores only a fraction of the build bonus.')
    based = { tag: `Based on ${b.tier} ${buildLabel(b.arch)}`, lines: bl }
  } else if (bb?.exact) {
    lines.push(`Matches the known ${bb.build.tier} ${buildLabel(bb.build.arch)} build exactly, so it gets the full build bonus.`)
  }

  // Roles
  const byRole = (r: string) => team.filter((n) => BY_NAME[n].role === r)
  const roleBits = (['Main DPS', 'Sub-DPS', 'Support'] as const).map((r) => (byRole(r).length ? `${list(byRole(r))} (${r})` : '')).filter(Boolean)
  lines.push(`Roles: ${roleBits.join(', ')}.${byRole('Main DPS').length === 0 ? ' There is no Main DPS, which costs score.' : ''}`)

  // Links
  const links = teamLinks(team, isDps)
  const seen = new Set<string>()
  const top = links.filter((l) => (seen.has(`${l.from}>${l.effect}`) ? false : (seen.add(`${l.from}>${l.effect}`), true))).slice(0, 4)
  if (top.length) lines.push(`What they give each other: ${top.map((l) => `${l.from} gives ${l.to} ${l.effect}`).join('; ')}.`)
  else lines.push('The kits do not feed each other much, so this team leans on raw power.')

  // Team conditions
  compositionRules(team).forEach((r) => lines.push(r.text))

  // Unmet strong wants
  const unmet: string[] = []
  for (const n of team) {
    for (const w of PROFILES[n]?.wants ?? []) {
      if (strength(w) < 3) continue
      const want = tagOf(w)
      const fed = team.some((o) => o !== n && (PROFILES[o]?.applies ?? []).some((a) => tagOf(a) === want || (want === 'Negative Status' && NEGATIVE_STATUSES.includes(tagOf(a)))))
      if (!fed) unmet.push(`${n} wants ${want}`)
    }
  }
  if (unmet.length && !bb?.exact) lines.push(`Not covered: ${unmet.slice(0, 3).join('; ')} and nobody on this team provides it.`)

  return { based, lines }
}
