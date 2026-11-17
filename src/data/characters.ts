// All Resonator data lives here. Edit this file when a new Resonator releases.
// e = element, r = role, p = rough power rating 1-10 (my estimate, NOT official data), s = rarity, v = release version.

export type Element = 'Fusion' | 'Glacio' | 'Aero' | 'Electro' | 'Spectro' | 'Havoc'
export type Role = 'Main DPS' | 'Sub-DPS' | 'Support'

export interface Resonator {
  name: string
  element: Element
  role: Role
  power: number
  rarity: 4 | 5
  version: string
}

const E: Record<string, Element> = { F: 'Fusion', G: 'Glacio', A: 'Aero', E: 'Electro', S: 'Spectro', H: 'Havoc' }
const R: Record<string, Role> = { D: 'Main DPS', S: 'Sub-DPS', H: 'Support' }

// name,element,role,power
const RAW = `Aemeath,F,D,10|Aalto,A,S,3|Augusta,E,D,8|Baizhi,G,H,4|Brant,F,H,6|Buling,E,H,5|Calcharo,E,D,6|Camellya,H,D,8|Cantarella,H,S,7|Carlotta,G,D,8|Cartethyia,A,D,8|Changli,F,D,8|Chisa,H,D,8|Chixia,F,D,3|Ciaccona,A,S,7|Danjin,H,D,4|Denia,F,S,8|Encore,F,D,6|Galbrena,F,D,9|Hiyuki,G,D,9|Hsin,E,D,9|Iuno,A,S,8|Jianxin,A,H,5|Jingran,F,D,8|Jinhsi,S,D,8|Jiyan,A,D,7|Lily,S,H,9|Lingyang,G,D,5|Lucilla,G,S,8|Lucy,S,D,8|Lumi,E,H,3|Lupa,F,S,8|Luuk Herssen,S,D,8|Lynae,S,S,8|Mornye,F,H,9|Mortefi,F,S,3|Phoebe,S,D,8|Phrolova,H,D,8|Qingxiao,A,D,9|Qiuyuan,A,S,8|Rebecca,E,S,8|Roccia,H,S,6|Rover (Aero),A,S,5|Rover (Electro),E,S,5|Rover (Havoc),H,D,6|Rover (Spectro),S,D,6|Sanhua,G,S,6|Shorekeeper,S,H,10|Sigrika,A,D,8|Suisui,G,H,8|Suoming,E,S,8|Taoqi,H,H,4|Verina,S,H,7|Xiangli Yao,E,D,8|Yangyang,A,S,3|Yangyang: Xuanling,H,D,7|Yinlin,E,S,7|Youhu,G,H,4|Yuanwu,E,S,3|Zani,S,D,8|Zhezhi,G,S,7`

// Release version per Resonator. Unconfirmed: Denia (3.3) and Rover (Havoc) (1.0).
const VERSIONS: [string, string][] = [
  ['1.0', 'Aalto,Baizhi,Calcharo,Chixia,Danjin,Encore,Jianxin,Jiyan,Lingyang,Mortefi,Rover (Spectro),Rover (Havoc),Sanhua,Taoqi,Verina,Yangyang,Yuanwu,Yinlin'],
  ['1.1', 'Jinhsi,Changli'], ['1.2', 'Zhezhi,Xiangli Yao'], ['1.3', 'Shorekeeper,Youhu'], ['1.4', 'Camellya,Lumi'],
  ['2.0', 'Carlotta,Roccia'], ['2.1', 'Phoebe,Brant'], ['2.2', 'Cantarella,Rover (Aero)'], ['2.3', 'Zani,Ciaccona'],
  ['2.4', 'Cartethyia,Lupa'], ['2.5', 'Phrolova'], ['2.6', 'Augusta,Iuno'], ['2.7', 'Galbrena,Qiuyuan'],
  ['2.8', 'Chisa,Buling'], ['3.0', 'Lynae,Mornye'], ['3.1', 'Aemeath,Luuk Herssen'], ['3.2', 'Sigrika'],
  ['3.3', 'Hiyuki,Denia'], ['3.4', 'Lucy,Rebecca,Lucilla'], ['3.5', 'Yangyang: Xuanling,Suisui,Rover (Electro)'],
  ['3.6', 'Qingxiao,Jingran'], ['3.7', 'Hsin,Suoming'], ['3.8', 'Lily'],
]
const VERSION_OF: Record<string, string> = {}
VERSIONS.forEach(([v, list]) => list.split(',').forEach((n) => (VERSION_OF[n] = v)))

const FOUR_STAR = new Set(['Aalto', 'Baizhi', 'Buling', 'Chixia', 'Danjin', 'Lumi', 'Mortefi', 'Sanhua', 'Taoqi', 'Yangyang', 'Yuanwu', 'Youhu'])

export const RESONATORS: Resonator[] = RAW.split('|').map((s) => {
  const [name, e, r, p] = s.split(',')
  return { name, element: E[e], role: R[r], power: +p, rarity: FOUR_STAR.has(name) ? 4 : 5, version: VERSION_OF[name] ?? '0' }
})

export const BY_NAME: Record<string, Resonator> = Object.fromEntries(RESONATORS.map((c) => [c.name, c]))

// Known good pairings and trios (rough, from guides). Used as a small score bonus.
const GROUPS: string[][] = [
  ['Lucy', 'Rebecca'], ['Galbrena', 'Qiuyuan', 'Lily'], ['Sigrika', 'Qiuyuan', 'Lily'], ['Sigrika', 'Lucilla', 'Lily'],
  ['Hsin', 'Suoming', 'Lily'], ['Hsin', 'Suoming', 'Shorekeeper'], ['Aemeath', 'Lynae', 'Mornye'], ['Galbrena', 'Denia', 'Lupa'],
  ['Luuk Herssen', 'Sanhua', 'Mornye'], ['Carlotta', 'Zhezhi', 'Shorekeeper'], ['Zani', 'Phoebe', 'Rover (Spectro)'],
  ['Chisa', 'Yangyang: Xuanling', 'Suisui'], ['Cartethyia', 'Ciaccona', 'Rover (Aero)'], ['Augusta', 'Iuno', 'Shorekeeper'],
  ['Jinhsi', 'Yinlin', 'Shorekeeper'],
]
export const SYNERGY = new Set<string>()
GROUPS.forEach((g) => g.forEach((a) => g.forEach((b) => { if (a < b) SYNERGY.add(`${a}|${b}`) })))

// ---- Endstate Matrix uses ----
// Default: every Resonator has 1 use. These support characters have 2 permanently.
export const PERMANENT_TWO_USE = new Set(['Shorekeeper', 'Verina', 'Mornye', 'Baizhi', 'Suisui', 'Buling'])

// Extra second uses from the current challenge cycle (Emergency Agent bonus).
// PLACEHOLDER for Adversity Vanguard (3.8): update this list when the next cycle starts.
export const CYCLE_BONUS = { name: 'Adversity Vanguard (3.8)', resonators: ['Chisa', 'Denia'] }

export function usesFor(name: string, cycleBonus: boolean): number {
  if (PERMANENT_TWO_USE.has(name)) return 2
  if (cycleBonus && CYCLE_BONUS.resonators.includes(name)) return 2
  return 1
}
