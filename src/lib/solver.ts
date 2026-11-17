import { BY_NAME } from '../data/characters'
import { synergyScore } from '../data/synergy'

export type Team = string[] // up to 3 Resonator names

/** Team score: power, role balance, effect links between kits and known build tiers (see data/synergy.ts). Not official. */
export function scoreTeam(team: Team): number {
  const m = team.map((n) => BY_NAME[n])
  let s = 0, dps = 0, sup = 0
  m.forEach((c) => { s += c.power; if (c.role === 'Main DPS') dps++; if (c.role === 'Support') sup++ })
  s -= (3 - m.length) * 6
  if (!dps) s -= 8
  if (dps > 1) s -= 2 * (dps - 1)
  if (sup === 1) s += 2
  if (sup > 1) s -= 4
  if (m.length === 3) s += synergyScore(team, (n) => BY_NAME[n].role !== 'Support')
  return s
}

/** Why a manual team is not valid, or null when it is. `usage` counts uses across all manual teams. */
export function teamProblem(team: (string | null)[], usage: Record<string, number>, usesOf: (n: string) => number): string | null {
  const f = team.filter((n): n is string => !!n)
  if (f.length < 3) return `needs ${3 - f.length} more Resonator${3 - f.length === 1 ? '' : 's'}`
  if (new Set(f).size < 3) return 'has the same Resonator twice'
  if (f.some((n) => usage[n] > usesOf(n))) return 'uses a Resonator more often than allowed'
  return null
}

export function countUsage(teams: (string | null)[][]): Record<string, number> {
  const u: Record<string, number> = {}
  teams.forEach((t) => t.forEach((n) => { if (n) u[n] = (u[n] || 0) + 1 })
  )
  return u
}

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const ROLE_ORDER = { 'Main DPS': 0, 'Sub-DPS': 1, Support: 2 } as const

/** Display order inside a team: Main DPS first, then Sub-DPS, then Support (higher power first on ties). */
export function orderTeam(team: Team): Team {
  return team.sort((a, b) => ROLE_ORDER[BY_NAME[a].role] - ROLE_ORDER[BY_NAME[b].role] || BY_NAME[b].power - BY_NAME[a].power || a.localeCompare(b))
}

/** Number of full teams the pool can fill given each Resonator's remaining uses. */
export function maxTeams(caps: Record<string, number>): number {
  return Math.min(24, Math.floor(Object.values(caps).reduce((a, b) => a + b, 0) / 3))
}

/**
 * Builds `count` teams of up to 3 from the pool. caps[name] = remaining uses.
 * Deterministic for the same input. Never uses a Resonator more than its cap
 * or twice in one team.
 */
export function solve(pool: string[], caps: Record<string, number>, count: number): Team[] {
  if (!count) return []
  const R = rng(7)
  const slots = count * 3
  const valid = (sl: (string | null)[]) => {
    const used: Record<string, number> = {}
    for (let t = 0; t < count; t++) {
      const seg = sl.slice(t * 3, t * 3 + 3)
      for (let j = 0; j < 3; j++) {
        const v = seg[j]
        if (!v) continue
        if (seg.indexOf(v) !== j) return false
        used[v] = (used[v] || 0) + 1
        if (used[v] > (caps[v] ?? 0)) return false
      }
    }
    return true
  }
  const total = (sl: (string | null)[]) => {
    let s = 0
    for (let t = 0; t < count; t++) s += scoreTeam(sl.slice(t * 3, t * 3 + 3).filter((n): n is string => !!n))
    return s
  }
  let best: (string | null)[] = Array(slots).fill(null)
  let bestScore = -Infinity
  const rounds = count > 8 ? 6 : 14
  for (let r = 0; r < rounds; r++) {
    const sl: (string | null)[] = Array(slots).fill(null)
    pool.map((n) => [n, BY_NAME[n].power + R() * 4] as const).sort((a, b) => b[1] - a[1]).forEach(([n]) => {
      const order = [...Array(count).keys()].sort(() => R() - 0.5)
      for (const t of order) {
        const seg = sl.slice(t * 3, t * 3 + 3)
        if (seg.includes(n)) continue
        const k = seg.indexOf(null)
        if (k < 0) continue
        sl[t * 3 + k] = n
        if (!valid(sl)) { sl[t * 3 + k] = null; continue }
        break
      }
    })
    // Fill any hole left by the greedy pass with a Resonator that still has uses left.
    const left = (n: string) => (caps[n] ?? 0) - sl.filter((x) => x === n).length
    for (let i = 0; i < slots; i++) {
      if (sl[i]) continue
      const seg = Math.floor(i / 3) * 3
      const cand = pool.filter((n) => left(n) > 0 && !sl.slice(seg, seg + 3).includes(n)).sort((a, b) => BY_NAME[b].power - BY_NAME[a].power)[0]
      if (cand) sl[i] = cand
    }
    let cur = total(sl)
    for (let it = 0; it < 4000; it++) {
      const a = Math.floor(R() * slots), pa = sl[a]
      let b = -1, pb: string | null = null
      if (R() < 0.5) {
        b = Math.floor(R() * slots); pb = sl[b]
        if (a === b) continue
        sl[a] = pb; sl[b] = pa
      } else {
        sl[a] = pool[Math.floor(R() * pool.length)]
      }
      if (valid(sl)) { const s = total(sl); if (s >= cur) { cur = s; continue } }
      sl[a] = pa
      if (b >= 0) sl[b] = pb
    }
    if (cur > bestScore) { bestScore = cur; best = sl.slice() }
  }
  const teams: Team[] = []
  for (let t = 0; t < count; t++) {
    const seg = best.slice(t * 3, t * 3 + 3).filter((n): n is string => !!n)
    if (seg.length) teams.push(seg)
  }
  teams.forEach(orderTeam)
  return teams.sort((a, b) => scoreTeam(b) - scoreTeam(a))
}
