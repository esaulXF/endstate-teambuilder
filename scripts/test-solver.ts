import assert from 'node:assert/strict'
import { RESONATORS, usesFor, PERMANENT_TWO_USE } from '../src/data/characters'
import { solve, maxTeams, teamProblem, countUsage } from '../src/lib/solver'

const all = RESONATORS.map((c) => c.name)
assert.equal(all.length, new Set(all).size, 'duplicate names')
assert.ok(RESONATORS.every((c) => c.version !== '0'), 'every Resonator has a release version')

// Default uses: Denia is 1 use, permanent supports are 2.
assert.equal(usesFor('Denia', false), 1)
assert.equal(usesFor('Denia', true), 2)
for (const n of PERMANENT_TWO_USE) assert.equal(usesFor(n, false), 2)
assert.equal(usesFor('Aemeath', true), 1)

function check(cycle: boolean, used: string[] = []) {
  const caps: Record<string, number> = {}
  all.forEach((n) => (caps[n] = usesFor(n, cycle) - used.filter((u) => u === n).length))
  const pool = all.filter((n) => caps[n] > 0)
  const count = maxTeams(caps)
  const teams = solve(pool, caps, count)
  const use: Record<string, number> = {}
  teams.forEach((t) => {
    assert.equal(t.length, 3, 'team not full')
    assert.equal(new Set(t).size, 3, 'duplicate inside a team')
    t.forEach((n) => (use[n] = (use[n] || 0) + 1))
  })
  for (const [n, k] of Object.entries(use)) assert.ok(k <= caps[n], `${n} used ${k} > cap ${caps[n]}`)
  assert.deepEqual(solve(pool, caps, count), teams, 'not deterministic')
  return { teams, use, count }
}

const a = check(false)
const b = check(true)
const c = check(false, ['Shorekeeper', 'Aemeath', 'Shorekeeper'])
assert.ok(!c.use['Aemeath'], 'used character reappeared')
assert.ok(!c.use['Shorekeeper'], 'Shorekeeper should be spent after two uses')
console.log(`default: ${a.count} teams | with cycle bonus: ${b.count} teams | after manual teams: ${c.count} teams`)

// Manual team validation
const usesOf = (n: string) => usesFor(n, false)
assert.equal(teamProblem(['Aemeath', 'Lynae', null], {}, usesOf), 'needs 1 more Resonator')
assert.equal(teamProblem(['Aemeath', 'Aemeath', 'Lynae'], countUsage([['Aemeath', 'Aemeath', 'Lynae']]), usesOf), 'has the same Resonator twice')
const two = [['Aemeath', 'Lynae', 'Mornye'], ['Aemeath', 'Denia', 'Lupa']]
assert.equal(teamProblem(two[1], countUsage(two), usesOf), 'uses a Resonator more often than allowed')
assert.equal(teamProblem(['Aemeath', 'Lynae', 'Mornye'], countUsage([['Aemeath', 'Lynae', 'Mornye']]), usesOf), null)
console.log('all solver tests passed')
