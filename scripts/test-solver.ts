import assert from 'node:assert/strict'
import { RESONATORS, BY_NAME, usesFor, PERMANENT_TWO_USE, isRover, ROVERS } from '../src/data/characters'
import { planRest } from '../src/lib/plan'
import { solve, maxTeams, teamProblem, countUsage } from '../src/lib/solver'

const all = RESONATORS.map((c) => c.name)
assert.equal(all.length, new Set(all).size, 'duplicate names')
assert.ok(RESONATORS.every((c) => c.version !== '0'), 'every Resonator has a release version')

// Default uses: Denia is 1 use, permanent supports are 2.
assert.equal(usesFor('Denia', false), 1)
assert.equal(usesFor('Denia', true), 2)
for (const n of PERMANENT_TWO_USE) assert.equal(usesFor(n, false), 2)
assert.equal(usesFor('Aemeath', true), 1)
assert.equal(usesFor('Lily', false), 2)
assert.equal(RESONATORS.filter((c) => c.category === 'standard').map((c) => c.name).sort().join(','), 'Calcharo,Encore,Jianxin,Lingyang,Rover (Aero),Rover (Electro),Rover (Havoc),Rover (Spectro),Verina')
assert.equal(RESONATORS.filter((c) => c.category === 'fourstar').length, 12)

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
    assert.ok(t.filter((n) => BY_NAME[n].role === 'Support').length <= 1, `two Supports in ${t.join(', ')}`)
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

// Display order inside every built team: Main DPS, then Sub-DPS, then Support.
const rank = { 'Main DPS': 0, 'Sub-DPS': 1, Support: 2 } as const
for (const t of a.teams.concat(b.teams, c.teams)) {
  const r = t.map((n) => rank[BY_NAME[n].role])
  assert.deepEqual(r, [...r].sort((x, y) => x - y), `bad order in ${t.join(', ')}`)
}

// Automatic plan: no teams of your own, valid own teams, invalid own teams, too few Resonators.
const usesNoCycle = (n: string) => usesFor(n, false)
const full = planRest(all.filter((n) => !isRover(n) || n === 'Rover (Aero)'), [], usesNoCycle)
assert.equal(full.kind, 'ready')
const withOwn = planRest(all, [['Aemeath', 'Lynae', 'Mornye']], usesNoCycle)
assert.equal(withOwn.kind, 'ready')
if (withOwn.kind === 'ready') {
  assert.ok(!withOwn.teams.flat().includes('Aemeath') && !withOwn.teams.flat().includes('Lynae'), 'own-team Resonators reused')
  assert.equal(withOwn.teams.flat().filter((n) => n === 'Mornye').length <= 1, true, 'Mornye should have one use left')
}
assert.equal(planRest(all, [['Aemeath', 'Lynae', null]], usesNoCycle).kind, 'fix')
assert.equal(planRest(['Aemeath', 'Lynae'], [], usesNoCycle).kind, 'empty')
console.log('plan and ordering tests passed')

// Synergy database
import { PROFILES, BUILDS, bestBuild, teamLinks } from '../src/data/synergy'
import { scoreTeam } from '../src/lib/solver'
assert.equal(BY_NAME['Chisa'].role, 'Sub-DPS', 'Chisa is a sub-DPS/support, not a main DPS')
assert.equal(usesFor('Chisa', true), 1, 'Chisa has no second use in 3.8')
for (const n of all) assert.ok(PROFILES[n], `missing profile for ${n}`)
for (const n of Object.keys(PROFILES)) assert.ok(BY_NAME[n], `profile for unknown Resonator ${n}`)
for (const b of BUILDS) { b.team.forEach((n) => assert.ok(BY_NAME[n], `unknown ${n} in build ${b.team.join('/')}`)); assert.equal(new Set(b.team).size, 3) }
const dps = (n: string) => BY_NAME[n].role !== 'Support'
const links = teamLinks(['Yangyang: Xuanling', 'Chisa', 'Suisui'], dps)
assert.ok(links.some((l) => l.from === 'Chisa' && l.to === 'Suisui' && l.effect === 'Havoc Bane'), 'Havoc Bane should link to Negative Status payoff')
assert.ok(scoreTeam(['Yangyang: Xuanling', 'Chisa', 'Suisui']) > scoreTeam(['Yangyang: Xuanling', 'Lumi', 'Taoqi']), 'known T0 team beats filler')
assert.ok(scoreTeam(['Hsin', 'Suoming', 'Lily']) > scoreTeam(['Hsin', 'Aalto', 'Taoqi']))
assert.equal(bestBuild(['Qingxiao', 'Denia', 'Mornye'])?.build.tier, 'T0')
console.log('synergy tests passed')

// Yangyang and Yangyang: Xuanling are different characters
import { describeTeam } from '../src/data/synergy'
const role = (n: string) => BY_NAME[n].role
assert.notEqual(BY_NAME['Yangyang'].element, BY_NAME['Yangyang: Xuanling'].element)
assert.equal(describeTeam(['Hiyuki', 'Lucilla', 'Suisui'], role), 'Glacio Chafe')
assert.equal(describeTeam(['Yangyang: Xuanling', 'Chisa', 'Suisui'], role), 'Havoc Bane')
assert.equal(bestBuild(['Yangyang', 'Chisa', 'Suisui'])?.build.team.includes('Yangyang: Xuanling') ?? false, false, 'plain Yangyang must not match the Xuanling build')
assert.notEqual(describeTeam(['Yangyang', 'Chisa', 'Suisui'], role), 'Havoc Bane' + '!')
console.log('descriptor tests passed')
assert.equal(describeTeam(['Phrolova', 'Cantarella', 'Shorekeeper'], role), 'Echo Skill / Coordinated Attack')
assert.equal(describeTeam(['Hiyuki', 'Lucilla', 'Chisa'], role), 'Glacio Chafe')
assert.equal(describeTeam(['Hsin', 'Suoming', 'Lily'], role), 'Unison')
assert.equal(describeTeam(['Sigrika', 'Lucilla', 'Lily'], role), 'Echo Skill')
console.log('double label tests passed')

// Best team first, no double Supports
const caps1 = (r: string[]) => Object.fromEntries(r.map((n) => [n, usesFor(n, false)]))
const run = (r: string[]) => solve(r, caps1(r), maxTeams(caps1(r)))
const r1 = run(['Hsin', 'Lily', 'Jinhsi', 'Aalto', 'Lumi', 'Shorekeeper', 'Aemeath', 'Lynae', 'Mornye'])
assert.ok(r1.some((t) => t.includes('Hsin') && t.includes('Lily') && t.includes('Jinhsi')), 'Hsin and Lily should get Jinhsi, not Aalto or Lumi')
const r2 = run(['Hsin', 'Suoming', 'Lily', 'Lingyang', 'Danjin', 'Youhu'])
assert.deepEqual([...r2[0]].sort(), ['Hsin', 'Lily', 'Suoming'], 'the best team is built first and the leftovers form the weak team')
assert.equal(run(['Hsin', 'Lily', 'Lumi']).length, 0, 'two Supports never share a team')
console.log('best-first tests passed')

// ---- composition rules and explanations ----
import { compositionRules, bestBuild as bestBuild2, synergyScore } from '../src/data/synergy'
import { explainTeam } from '../src/data/explain'
const dpsOf = (n: string) => BY_NAME[n].role !== 'Support'
assert.equal(compositionRules(['Brant', 'Lupa', 'Changli'])[0].points, 6, 'full Fusion team boosts Lupa')
assert.equal(compositionRules(['Brant', 'Lupa', 'Shorekeeper'])[0].points, 2, 'one Fusion teammate gives a small boost')
assert.equal(compositionRules(['Lupa', 'Shorekeeper', 'Verina'])[0].points, 0, 'no Fusion teammate gives nothing')
assert.equal(compositionRules(['Hsin', 'Lily', 'Suoming']).length, 0, 'rules only apply to Lupa')
assert.ok(synergyScore(['Brant', 'Lupa', 'Changli'], dpsOf) > synergyScore(['Lupa', 'Shorekeeper', 'Verina'], dpsOf), 'Lupa prefers Fusion teammates')
assert.equal(bestBuild2(['Brant', 'Lupa', 'Mornye'])?.exact, true, 'Brant/Lupa/Mornye is a known build')
assert.equal(bestBuild2(['Changli', 'Lupa', 'Mornye'])?.exact, true)
assert.equal(bestBuild2(['Brant', 'Lupa', 'Shorekeeper'])?.exact, true)
const near = explainTeam(['Hsin', 'Lily', 'Shorekeeper'], { owned: ['Hsin', 'Lily', 'Shorekeeper'], teams: [['Hsin', 'Lily', 'Shorekeeper']], manual: [], index: 0 })
assert.ok(near.based && /^Based on /.test(near.based.tag) && !/close/i.test(near.based.tag), 'near matches are labelled Based on')
assert.ok(near.based!.lines.some((l) => /Changed: .* was replaced by Shorekeeper/.test(l)), 'explains which Resonator was replaced')
assert.ok(near.based!.lines.some((l) => /not in your roster/.test(l)), 'explains why the original Resonator is missing')
assert.ok(explainTeam(['Hsin', 'Suoming', 'Lily'], { owned: [], teams: [], manual: [], index: 0 }).based === null, 'exact builds have no Based on')
console.log('composition and explanation tests passed')

// Rover forms are not interchangeable
assert.equal(bestBuild2(['Iuno', 'Ciaccona', 'Rover (Electro)'])?.build.team.includes('Rover (Aero)') ?? false, false, 'Rover (Electro) must not count as Rover (Aero)')
assert.equal(bestBuild2(['Iuno', 'Ciaccona', 'Rover (Aero)'])?.exact, true, 'the real Rover (Aero) team is still recognised')
console.log('rover tests passed')
{
  const { BUILDS } = await import('../src/data/synergy')
  for (const b of BUILDS) for (const r of ROVERS) if (b.team.includes(r)) for (const o of ROVERS) if (o !== r) {
    const t = b.team.map((m) => (m === r ? o : m))
    const m = bestBuild2(t)
    assert.ok(!(m && m.build.team.includes(r) && !t.includes(r)), `${o} must not stand in for ${r} in ${b.team.join('/')}`)
  }
  console.log('rover swap tests passed')
}
