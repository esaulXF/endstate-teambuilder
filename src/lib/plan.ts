import { countUsage, maxTeams, solve, teamProblem, type Team } from './solver'

export type Slot = string | null

export type Plan =
  | { kind: 'empty' } // fewer than 3 Resonators selected
  | { kind: 'fix' } // own teams exist but are incomplete or break a rule
  | { kind: 'ready'; summary: string; teams: Team[]; leftover: string[]; spare: Record<string, number>; manual: string[][] }

export function manualProblems(manual: Slot[][], usesOf: (n: string) => number) {
  const usage = countUsage(manual)
  return manual.map((t) => teamProblem(t, usage, usesOf))
}

/** Uses what is left after the player's own teams and builds as many full teams as possible. */
export function planRest(roster: string[], manual: Slot[][], usesOf: (n: string) => number): Plan {
  if (roster.length < 3) return { kind: 'empty' }
  if (manualProblems(manual, usesOf).some((p) => p !== null)) return { kind: 'fix' }
  const used = countUsage(manual)
  const caps: Record<string, number> = {}
  roster.forEach((n) => (caps[n] = usesOf(n) - (used[n] || 0)))
  const pool = roster.filter((n) => caps[n] > 0)
  const usedUp = roster.filter((n) => caps[n] <= 0)
  const teams = solve(pool, caps, maxTeams(caps))
  const inTeams = new Set(teams.flat())
  const own = manual.map((t) => t.filter((n): n is string => !!n))
  const summary = own.length
    ? `${pool.length} Resonators left after your ${own.length === 1 ? 'team' : `${own.length} teams`}.${usedUp.length ? ` Used up: ${usedUp.join(', ')}.` : ''}`
    : `Full roster: ${pool.length} Resonators.`
  const spare: Record<string, number> = {}
  const usedHere = countUsage(teams)
  pool.forEach((n) => { const r = caps[n] - (usedHere[n] || 0); if (r > 0) spare[n] = r })
  return { kind: 'ready', summary, teams, leftover: pool.filter((n) => !inTeams.has(n)), spare, manual: own }
}
