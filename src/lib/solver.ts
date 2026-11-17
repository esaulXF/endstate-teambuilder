import { BY_NAME } from '../data/characters'
import { synergyScore } from '../data/synergy'

export type Team = string[] // up to 3 Resonator names

/** Team score: power, role balance, effect links between kits and known build tiers (see data/synergy.ts). Not official. */
const SCORE_CACHE = new Map<string, number>()
export function scoreTeam(team: Team): number {
  const key = [...team].sort().join('|')
  const hit = SCORE_CACHE.get(key)
  if (hit !== undefined) return hit
  const v = computeScore(team)
  SCORE_CACHE.set(key, v)
  return v
}

function computeScore(team: Team): number {
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

const ROLE_ORDER = { 'Main DPS': 0, 'Sub-DPS': 1, Support: 2 } as const

/** Display order inside a team: Main DPS first, then Sub-DPS, then Support (higher power first on ties). */
export function orderTeam(team: Team): Team {
  return team.sort((a, b) => ROLE_ORDER[BY_NAME[a].role] - ROLE_ORDER[BY_NAME[b].role] || BY_NAME[b].power - BY_NAME[a].power || a.localeCompare(b))
}

const isSupport = (n: string) => BY_NAME[n].role === 'Support'

/**
 * Can `k` full teams still be built from these remaining uses? A Resonator fills at most one slot per
 * team, and a team never holds two Supports, so Supports can fill at most one slot per team in total.
 */
function feasible(caps: Record<string, number>, k: number): boolean {
  if (k <= 0) return true
  let sup = 0, rest = 0
  for (const [n, c] of Object.entries(caps)) {
    if (c <= 0) continue
    if (isSupport(n)) sup += Math.min(c, k)
    else rest += Math.min(c, k)
  }
  return Math.min(sup, k) + rest >= 3 * k
}

/**
 * Can `a` strict teams (at most one Support) plus `b` salvage teams (at most two Supports) still be filled?
 * Every team needs three different Resonators, so a Resonator fills at most one slot per team.
 */
export function feasible2(caps: Record<string, number>, a: number, b: number): boolean {
  const k = a + b
  if (k <= 0) return true
  let sup = 0, rest = 0
  for (const [n, c] of Object.entries(caps)) {
    if (c <= 0) continue
    if (isSupport(n)) sup += Math.min(c, k)
    else rest += Math.min(c, k)
  }
  return rest >= 2 * a + b && Math.min(sup, a + 2 * b) + rest >= 3 * k
}

/** Number of full teams the uses can fill (no team has two Supports). */
export function maxTeams(caps: Record<string, number>): number {
  let k = Math.min(24, Math.floor(Object.values(caps).reduce((a, b) => a + Math.max(b, 0), 0) / 3))
  while (k > 0 && !feasible(caps, k)) k--
  return k
}

/** Team count including salvage teams (up to two Supports per team, at least one damage dealer). */
export function maxTeamsWithSalvage(caps: Record<string, number>): number {
  let k = Math.min(30, Math.floor(Object.values(caps).reduce((a, b) => a + Math.max(b, 0), 0) / 3))
  for (; k > 0; k--) {
    let sup = 0, rest = 0
    for (const [n, c] of Object.entries(caps)) {
      if (c <= 0) continue
      if (isSupport(n)) sup += Math.min(c, k)
      else rest += Math.min(c, k)
    }
    if (rest >= k && Math.min(sup, 2 * k) + rest >= 3 * k) return k
  }
  return 0
}

/**
 * Builds up to `count` full teams. caps[name] = remaining uses.
 * Best team first: the highest-scoring team the pool can form is locked in, then the next best from
 * what is left, and so on, so the leftovers end up in the weakest teams (one strong and one weak team
 * beats two middling ones). A pick is only allowed if the remaining uses can still fill the other teams.
 * Never uses a Resonator more often than its cap, twice in one team, or with a second Support.
 * Deterministic for the same input.
 */
export function solve(pool: string[], caps: Record<string, number>, count: number, extra = 0): Team[] {
  const left: Record<string, number> = {}
  pool.forEach((n) => (left[n] = caps[n] ?? 0))
  const names = pool.filter((n) => left[n] > 0).sort()
  let k = count
  while (k > 0 && !feasible2(left, k, extra)) k--
  if (!k) return []

  // Every legal trio, best first.
  const trios: { t: Team; s: number }[] = []
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++)
      for (let l = j + 1; l < names.length; l++) {
        const t = [names[i], names[j], names[l]]
        if (t.filter(isSupport).length > 1) continue
        trios.push({ t, s: scoreTeam(t) })
      }
  trios.sort((x, y) => y.s - x.s)

  const teams: Team[] = []
  for (let n = 0; n < k; n++) {
    const pick = trios.find(({ t }) => {
      if (t.some((m) => left[m] < 1)) return false
      t.forEach((m) => left[m]--)
      const ok = feasible2(left, k - n - 1, extra)
      t.forEach((m) => left[m]++)
      return ok
    })
    if (!pick) break
    pick.t.forEach((m) => left[m]--)
    teams.push([...pick.t])
  }
  teams.forEach(orderTeam)
  return teams.sort((a, b) => scoreTeam(b) - scoreTeam(a))
}

/**
 * Salvage pass for leftover uses. The main solver never pairs two Supports; once the real teams are built,
 * what is left may form extra teams that hold up to two Supports (never three, and never zero damage dealers).
 * `caps` are the uses still unspent. Best-scoring trio first, repeated until no legal trio remains.
 */
export function salvage(caps: Record<string, number>, target = Infinity): Team[] {
  const left = { ...caps }
  const out: Team[] = []
  for (;;) {
    const names = Object.keys(left).filter((n) => left[n] > 0).sort()
    if (out.length >= target) break
    let best: { t: Team; s: number } | null = null
    for (let i = 0; i < names.length; i++)
      for (let j = i + 1; j < names.length; j++)
        for (let l = j + 1; l < names.length; l++) {
          const t = [names[i], names[j], names[l]]
          const sup = t.filter(isSupport).length
          if (sup > 2) continue
          t.forEach((m) => left[m]--)
          const ok = target === Infinity || feasible2(left, 0, target - out.length - 1)
          t.forEach((m) => left[m]++)
          if (!ok) continue
          const v = scoreTeam(t)
          if (!best || v > best.s) best = { t, s: v }
        }
    if (!best) break
    best.t.forEach((m) => left[m]--)
    out.push(orderTeam([...best.t]))
  }
  return out
}
