// Synergy database: what each Resonator's kit APPLIES to teammates, what it WANTS from teammates,
// and the known/best team builds. Written from public guides (Game8, wuwawiki, genshin-builds, u7buy,
// wuwalabo) for patch 3.8. Ratings are community consensus, not official data.
// conf: 'high' = read from the kit page, 'med' = from team guides, 'low' = older/partial info.

export type Eff =
  // Negative statuses (any of these satisfies a 'Negative Status' want)
  | 'Havoc Bane' | 'Glacio Chafe' | 'Fusion Burst' | 'Electro Flare' | 'Aero Erosion' | 'Spectro Frazzle'
  | 'Negative Status'
  // Mechanics
  | 'Tune Break' | 'Hack' | 'Unison' | 'Coordinated Attack' | 'Shield'
  // Damage-type amplifiers (given by one Resonator, wanted by whoever deals that damage)
  | 'Echo Skill DMG' | 'Heavy Attack DMG' | 'Basic Attack DMG' | 'Skill DMG' | 'Liberation DMG'
  // General support
  | 'All DMG Amp' | 'Team ATK' | 'Crit' | 'Energy' | 'Healing' | 'RES Shred'

type Weighted = Eff | `${Eff}:${1 | 2 | 3}` // strength 1 minor, 2 normal (default), 3 core to the kit

export type ArchetypeId =
  | 'havoc-bane' | 'tune-break' | 'unison' | 'echo-skill' | 'heavy-shield' | 'glacio-chafe' | 'aero-erosion'
  | 'frazzle' | 'electro-flare' | 'hack' | 'coordinated' | 'skill-fusion' | 'liberation' | 'basic-attack' | 'starter'

export const NEGATIVE_STATUSES: Eff[] = ['Havoc Bane', 'Glacio Chafe', 'Fusion Burst', 'Electro Flare', 'Aero Erosion', 'Spectro Frazzle']

export const ARCHETYPES: Record<ArchetypeId, { label: string; blurb: string }> = {
  'havoc-bane': { label: 'Havoc Bane', blurb: 'Stack Havoc Bane to cut enemy DEF; Chisa raises the cap, Suisui and Yangyang: Xuanling profit from every Negative Status.' },
  'tune-break': { label: 'Tune Break', blurb: 'Build Off-Tune with Tune Rupture/Strain, then Tune Break; Mornye amplifies it.' },
  unison: { label: 'Unison', blurb: 'Hsin, Suoming and Lily trigger each other through Unison and Unison Boon.' },
  'echo-skill': { label: 'Echo Skill', blurb: 'Echo Skill damage dealers fed by Echo Skill DMG amplifiers and ATK buffs.' },
  'heavy-shield': { label: 'Heavy Attack and Shield', blurb: 'Heavy Attack carries with shield providers and Heavy Attack DMG amplifiers.' },
  'glacio-chafe': { label: 'Glacio Chafe', blurb: 'Glacio Chafe applied by Hiyuki, Lucilla and Suisui for team ATK and damage.' },
  'aero-erosion': { label: 'Aero Erosion', blurb: 'Aero Erosion appliers feeding Cartethyia\'s team buff.' },
  frazzle: { label: 'Spectro Frazzle', blurb: 'Spectro Frazzle stacking with Zani, Phoebe and Rover (Spectro).' },
  'electro-flare': { label: 'Electro Flare', blurb: 'Electro Flare stacks from Rover (Electro), Buling and Hsin.' },
  hack: { label: 'Hack', blurb: 'Hack - Shifting/Interfered from Rebecca and Lucy.' },
  coordinated: { label: 'Coordinated Attack', blurb: 'Off-field Coordinated Attack damage (Phrolova, Cantarella, Yinlin).' },
  'skill-fusion': { label: 'Resonance Skill', blurb: 'Resonance Skill carries with skill amplifiers (Fusion and Spectro).' },
  liberation: { label: 'Liberation', blurb: 'Liberation burst damage with Liberation DMG amplifiers.' },
  'basic-attack': { label: 'Basic Attack', blurb: 'Basic Attack scalers with Basic Attack DMG amplifiers.' },
  starter: { label: 'Early game / F2P', blurb: 'Free or early-game Resonators with simple teams.' },
}

export interface Profile {
  style: string // main damage type
  alt?: 'Main DPS' | 'Sub-DPS' | 'Support' // secondary role the Resonator is also used in
  applies: Weighted[]
  wants: Weighted[]
  arch: ArchetypeId[]
  conf: 'high' | 'med' | 'low'
  note?: string
}

const P = (style: string, arch: ArchetypeId[], applies: Weighted[], wants: Weighted[], conf: Profile['conf'] = 'high', alt?: Profile['alt'], note?: string): Profile => ({ style, arch, applies, wants, conf, alt, note })

export const PROFILES: Record<string, Profile> = {
  Aemeath: P('Liberation', ['tune-break'], ['Tune Break', 'Fusion Burst'], ['Tune Break:3', 'Liberation DMG']),
  Aalto: P('Basic Attack', ['starter'], [], ['Basic Attack DMG'], 'low'),
  Augusta: P('Heavy Attack', ['heavy-shield'], ['Team ATK:1', 'Shield:1'], ['Heavy Attack DMG:3', 'Shield']),
  Baizhi: P('Healing', ['starter'], ['Healing:3', 'Team ATK'], ['Energy'], 'med'),
  Brant: P('Resonance Skill', ['skill-fusion'], ['Healing', 'Team ATK:1'], ['Energy'], 'med', 'Main DPS'),
  Buling: P('Healing', ['electro-flare'], ['Healing:3', 'Electro Flare', 'Skill DMG', 'All DMG Amp:1'], ['Energy']),
  Calcharo: P('Liberation', ['starter'], [], ['Liberation DMG', 'Team ATK'], 'low'),
  Camellya: P('Basic Attack', ['basic-attack'], ['Basic Attack DMG:1'], ['Basic Attack DMG:3'], 'med'),
  Cantarella: P('Coordinated Attack', ['coordinated'], ['Healing', 'Coordinated Attack:1'], ['All DMG Amp']),
  Carlotta: P('Resonance Skill', ['skill-fusion'], ['Skill DMG'], ['Skill DMG:3']),
  Cartethyia: P('Heavy Attack', ['aero-erosion'], ['Team ATK'], ['Aero Erosion:3', 'Negative Status', 'Healing:1']),
  Changli: P('Resonance Skill', ['skill-fusion'], [], ['Skill DMG:2', 'Fusion Burst'], 'med'),
  Chisa: P('Havoc Bane support', ['havoc-bane'], ['Havoc Bane:3', 'All DMG Amp:2', 'Healing:1', 'Shield:1'], ['Negative Status:2'], 'high', 'Support',
    'Applies Havoc Bane and raises the max Negative Status stacks; heals and shields. Not a main DPS.'),
  Chixia: P('Basic Attack', ['starter'], [], ['Basic Attack DMG'], 'low'),
  Ciaccona: P('Aero Erosion', ['aero-erosion', 'echo-skill'], ['Aero Erosion:3', 'All DMG Amp', 'Spectro Frazzle:1'], ['Energy'], 'high', 'Support'),
  Danjin: P('Basic Attack', ['starter'], ['RES Shred:1'], ['Healing:2'], 'low'),
  Denia: P('Tune Break', ['tune-break'], ['Tune Break:3', 'Fusion Burst', 'All DMG Amp'], ['Tune Break:2']),
  Encore: P('Resonance Skill', ['starter'], [], ['Skill DMG'], 'low'),
  Galbrena: P('Echo Skill', ['echo-skill'], ['Team ATK'], ['Echo Skill DMG:3', 'Heavy Attack DMG']),
  Hiyuki: P('Liberation', ['glacio-chafe', 'havoc-bane'], ['Glacio Chafe:3', 'Havoc Bane'], ['Liberation DMG', 'Negative Status:2', 'Havoc Bane:2']),
  Hsin: P('Resonance Skill', ['unison', 'electro-flare'], ['Electro Flare:3', 'Unison:3'], ['Unison:3', 'Skill DMG', 'Electro Flare']),
  Iuno: P('Shield support', ['heavy-shield'], ['Shield:3', 'All DMG Amp:3', 'Heavy Attack DMG:3'], ['Energy:1'], 'high', 'Support'),
  Jianxin: P('Healing', ['starter'], ['Healing'], ['Energy'], 'low'),
  Jingran: P('Heavy Attack', ['heavy-shield'], ['Shield', 'Team ATK'], ['Shield:3', 'Heavy Attack DMG:2', 'Healing:1']),
  Jinhsi: P('Resonance Skill', ['skill-fusion'], [], ['Skill DMG:2'], 'med'),
  Jiyan: P('Heavy Attack', ['heavy-shield'], ['Heavy Attack DMG'], ['Heavy Attack DMG:3'], 'med'),
  Lily: P('Echo Skill support', ['unison', 'echo-skill'], ['Unison:3', 'Echo Skill DMG:3', 'Tune Break', 'All DMG Amp:3', 'Team ATK', 'Healing'], ['Unison'], 'high', 'Sub-DPS'),
  Lingyang: P('Basic Attack', ['starter'], [], ['Basic Attack DMG'], 'low'),
  Lucilla: P('Glacio Chafe', ['glacio-chafe', 'echo-skill'], ['Glacio Chafe:3', 'Team ATK:3'], ['Echo Skill DMG:1']),
  Lucy: P('Heavy Attack', ['hack'], ['Hack'], ['Hack:3', 'Heavy Attack DMG:2']),
  Lumi: P('Healing', ['starter'], ['Electro Flare:1', 'Healing:1'], ['Energy'], 'low'),
  Lupa: P('Liberation', ['skill-fusion'], ['RES Shred', 'All DMG Amp'], ['Liberation DMG:1'], 'med'),
  'Luuk Herssen': P('Basic Attack', ['tune-break', 'basic-attack'], ['Tune Break:1'], ['Tune Break:3', 'Basic Attack DMG:2']),
  Lynae: P('Tune Break', ['tune-break'], ['Tune Break:3', 'All DMG Amp:3', 'Liberation DMG'], ['Tune Break:2']),
  Mornye: P('Tune Break support', ['tune-break'], ['Tune Break:3', 'All DMG Amp:3', 'Healing:3'], ['Tune Break:2']),
  Mortefi: P('Heavy Attack', ['starter'], ['Heavy Attack DMG'], ['Energy'], 'low'),
  Phoebe: P('Spectro Frazzle', ['frazzle'], ['Spectro Frazzle:3'], ['Spectro Frazzle:2'], 'med', 'Main DPS'),
  Phrolova: P('Echo Skill', ['echo-skill', 'coordinated'], ['Team ATK'], ['Echo Skill DMG:3', 'Coordinated Attack']),
  Qingxiao: P('Tune Break', ['tune-break'], ['Tune Break:3'], ['Tune Break:3', 'Team ATK:3', 'Basic Attack DMG:1']),
  Qiuyuan: P('Echo Skill support', ['echo-skill'], ['Echo Skill DMG:3', 'Tune Break:1'], ['Energy'], 'high', 'Support'),
  Rebecca: P('Hack', ['hack'], ['Hack:3', 'All DMG Amp:3', 'Team ATK', 'Heavy Attack DMG'], ['Hack:2']),
  Roccia: P('Coordinated Attack', ['coordinated'], ['All DMG Amp'], ['Energy'], 'med'),
  'Rover (Aero)': P('Aero Erosion', ['aero-erosion'], ['Aero Erosion', 'Healing', 'All DMG Amp:1'], ['Energy'], 'med', 'Support'),
  'Rover (Electro)': P('Electro Flare', ['electro-flare'], ['Electro Flare:3', 'Team ATK', 'All DMG Amp'], ['Energy'], 'med'),
  'Rover (Havoc)': P('Resonance Skill', ['starter'], ['RES Shred'], ['Energy'], 'med', 'Main DPS'),
  'Rover (Spectro)': P('Spectro Frazzle', ['frazzle'], ['Spectro Frazzle:3', 'RES Shred', 'Healing:1', 'Tune Break:1'], ['Spectro Frazzle:1'], 'med', 'Support'),
  Sanhua: P('Basic Attack support', ['basic-attack'], ['Basic Attack DMG:3', 'Team ATK:1'], ['Energy'], 'high', 'Support'),
  Shorekeeper: P('Healing', ['starter'], ['Healing:3', 'Crit:3', 'Team ATK', 'Energy:3', 'All DMG Amp:1'], [], 'high'),
  Sigrika: P('Echo Skill', ['echo-skill'], ['Team ATK'], ['Echo Skill DMG:3']),
  Suisui: P('Negative Status support', ['glacio-chafe', 'havoc-bane'], ['Glacio Chafe', 'Healing:3', 'All DMG Amp:3', 'Team ATK:3'], ['Negative Status:3', 'Electro Flare']),
  Suoming: P('Basic Attack', ['unison'], ['Unison:3', 'All DMG Amp'], ['Unison:3'], 'high', 'Main DPS'),
  Taoqi: P('Shield', ['starter'], ['Shield'], [], 'low'),
  Verina: P('Healing', ['starter'], ['Healing:3', 'Team ATK:3', 'All DMG Amp:1'], [], 'high'),
  'Xiangli Yao': P('Liberation', ['liberation'], ['Liberation DMG'], ['Liberation DMG:3', 'Coordinated Attack:1'], 'med'),
  Yangyang: P('Basic Attack', ['starter'], ['Aero Erosion:1'], [], 'low'),
  'Yangyang: Xuanling': P('Heavy Attack', ['havoc-bane'], ['Havoc Bane:3', 'Tune Break', 'Echo Skill DMG'], ['Negative Status:3', 'Heavy Attack DMG:3', 'Havoc Bane:2']),
  Yinlin: P('Coordinated Attack', ['coordinated'], ['Coordinated Attack', 'All DMG Amp:3', 'Liberation DMG', 'Team ATK'], ['Energy'], 'med'),
  Youhu: P('Healing', ['starter'], ['Healing'], [], 'low'),
  Yuanwu: P('Resonance Skill', ['starter'], ['Skill DMG:1'], [], 'low'),
  Zani: P('Spectro Frazzle', ['frazzle'], ['Spectro Frazzle:3'], ['Spectro Frazzle:3', 'Heavy Attack DMG:1'], 'med'),
  Zhezhi: P('Basic Attack', ['skill-fusion'], ['Skill DMG:3', 'All DMG Amp:1'], ['Energy'], 'med'),
}

// ---- Known builds (community tiers for patch 3.8) ----
export type Tier = 'T0' | 'T0.5' | 'T1' | 'T2' | 'T3' | 'F2P'
export const TIER_POINTS: Record<Tier, number> = { T0: 10, 'T0.5': 8, T1: 6, T2: 4, T3: 2, F2P: 1 }
export interface Build { team: [string, string, string]; tier: Tier; arch: ArchetypeId }

const B = (tier: Tier, arch: ArchetypeId, ...teams: string[]): Build[] => teams.map((t) => ({ tier, arch, team: t.split('/') as [string, string, string] }))
const YX = 'Yangyang: Xuanling', RE = 'Rover (Electro)', RA = 'Rover (Aero)', RS = 'Rover (Spectro)', RH = 'Rover (Havoc)', LH = 'Luuk Herssen', XY = 'Xiangli Yao'

export const BUILDS: Build[] = [
  ...B('T0', 'unison', 'Hsin/Suoming/Lily'),
  ...B('T0', 'havoc-bane', `${YX}/Chisa/Suisui`),
  ...B('T0', 'tune-break', 'Qingxiao/Denia/Mornye'),
  ...B('T0', 'heavy-shield', 'Jingran/Iuno/Shorekeeper'),
  ...B('T0.5', 'glacio-chafe', 'Hiyuki/Lucilla/Chisa', 'Hiyuki/Lucilla/Suisui'),
  ...B('T0.5', 'tune-break', 'Aemeath/Lynae/Mornye', 'Aemeath/Denia/Chisa', `${LH}/Denia/Mornye`),
  ...B('T0.5', 'echo-skill', 'Sigrika/Qiuyuan/Lily'),
  ...B('T0.5', 'electro-flare', `Hsin/${RE}/Buling`, `Hsin/${RE}/Suisui`),
  ...B('T1', 'echo-skill', 'Sigrika/Qiuyuan/Shorekeeper', 'Sigrika/Lucilla/Shorekeeper', 'Sigrika/Qiuyuan/Ciaccona', 'Sigrika/Lucilla/Lily', 'Galbrena/Qiuyuan/Shorekeeper', 'Galbrena/Lupa/Mornye', 'Galbrena/Lupa/Shorekeeper', 'Galbrena/Qiuyuan/Lily', 'Phrolova/Cantarella/Qiuyuan', 'Phrolova/Cantarella/Shorekeeper', 'Phrolova/Cantarella/Buling'),
  ...B('T1', 'heavy-shield', 'Augusta/Iuno/Shorekeeper', 'Augusta/Rebecca/Shorekeeper', 'Jingran/Lupa/Mornye', 'Jingran/Lynae/Mornye', 'Iuno/Yinlin/Shorekeeper'),
  ...B('T1', 'tune-break', 'Qingxiao/Lynae/Mornye', 'Qingxiao/Sanhua/Mornye', 'Qingxiao/Denia/Ciaccona', `${LH}/Lynae/Mornye`, 'Suoming/Lynae/Mornye', 'Aemeath/Lupa/Mornye', 'Galbrena/Denia/Lupa'),
  ...B('T1', 'havoc-bane', `${YX}/Rebecca/Chisa`, `${YX}/Rebecca/Suisui`, `${YX}/Lynae/Mornye`, `${YX}/Phrolova/Shorekeeper`, `${YX}/Chisa/Shorekeeper`, 'Hiyuki/Lynae/Chisa', 'Hiyuki/Chisa/Shorekeeper', 'Hiyuki/Lynae/Mornye', `Hsin/${RE}/Chisa`),
  ...B('T1', 'unison', 'Hsin/Suoming/Shorekeeper', 'Hsin/Suoming/Verina', 'Hsin/Jinhsi/Shorekeeper'),
  ...B('T1', 'hack', 'Lucy/Rebecca/Mornye', 'Lucy/Rebecca/Shorekeeper'),
  ...B('T2', 'aero-erosion', 'Cartethyia/Ciaccona/Chisa', `Cartethyia/Ciaccona/${RA}`, 'Cartethyia/Sanhua/Shorekeeper', `Jiyan/Iuno/Ciaccona`),
  ...B('T2', 'frazzle', `Zani/Phoebe/${RS}`, 'Zani/Phoebe/Shorekeeper', `Zani/${RS}/Baizhi`, `Phoebe/${RS}/Chisa`),
  ...B('T2', 'skill-fusion', 'Jinhsi/Zhezhi/Verina', 'Jinhsi/Yuanwu/Verina', 'Galbrena/Lupa/Brant', 'Changli/Lupa/Brant', 'Carlotta/Lynae/Mornye'),
  ...B('T2', 'havoc-bane', `${YX}/Mortefi/Chisa`),
  ...B('T2', 'coordinated', 'Phrolova/Roccia/Cantarella', 'Phrolova/Danjin/Buling', 'Sanhua/Cantarella/Shorekeeper'),
  ...B('T2', 'hack', 'Lucy/Rebecca/Verina'),
  ...B('T2', 'heavy-shield', 'Augusta/Mortefi/Shorekeeper'),
  ...B('T3', 'skill-fusion', 'Carlotta/Zhezhi/Shorekeeper', 'Carlotta/Zhezhi/Baizhi', 'Carlotta/Zhezhi/Buling', 'Changli/Chixia/Baizhi', 'Jinhsi/Zhezhi/Buling'),
  ...B('T3', 'liberation', `${XY}/Lynae/Mornye`, `${XY}/Yinlin/Verina`, `${XY}/Yinlin/Shorekeeper`, `${XY}/Jianxin/Shorekeeper`, `Calcharo/${XY}/Shorekeeper`, 'Calcharo/Yinlin/Shorekeeper'),
  ...B('T3', 'coordinated', 'Yinlin/Youhu/Shorekeeper', 'Zhezhi/Yinlin/Youhu'),
  ...B('T3', 'basic-attack', 'Camellya/Sanhua/Shorekeeper', 'Camellya/Sanhua/Baizhi', 'Brant/Sanhua/Verina', 'Encore/Sanhua/Shorekeeper', 'Lingyang/Sanhua/Shorekeeper', 'Lumi/Sanhua/Shorekeeper'),
  ...B('T3', 'starter', `${RH}/Roccia/Shorekeeper`, `${RH}/Danjin/Shorekeeper`, `${RH}/Sanhua/Verina`, 'Jiyan/Mortefi/Shorekeeper', 'Jiyan/Aalto/Shorekeeper', `Iuno/Ciaccona/${RA}`),
  ...B('F2P', 'starter', `${RH}/Sanhua/Baizhi`, 'Encore/Sanhua/Verina', 'Encore/Sanhua/Baizhi', 'Calcharo/Jianxin/Verina', 'Calcharo/Yangyang/Verina', 'Calcharo/Yangyang/Baizhi', 'Chixia/Yangyang/Baizhi', `${RS}/Yangyang/Baizhi`, 'Jianxin/Aalto/Verina', 'Lingyang/Yangyang/Baizhi', `Jiyan/Mortefi/${RA}`),
]

// ---- Scoring ----
const parse = (w: Weighted): [Eff, number] => {
  const [tag, n] = w.split(':')
  return [tag as Eff, n ? +n : 2]
}
const DEFAULT_WANTS: Weighted[] = ['All DMG Amp:1', 'Team ATK:1', 'Havoc Bane:1']
const WEIGHT: Partial<Record<Eff, number>> = { 'All DMG Amp': 1.2, 'Team ATK': 1.2, Crit: 1.2, Energy: 0.6, Healing: 0.6, 'RES Shred': 1.2, Shield: 1.2 }
const LINK_CAP = 14

export interface Link { from: string; to: string; effect: Eff; points: number }

function wantsOf(name: string, mainOrSub: boolean): [Eff, number][] {
  const p = PROFILES[name]
  const base = (mainOrSub ? DEFAULT_WANTS : []).concat(p?.wants ?? [])
  return base.map(parse)
}

/** Every provider to receiver link in a team, strongest first. */
export function teamLinks(team: string[], isDps: (n: string) => boolean): Link[] {
  const out = new Map<string, Link>()
  for (const to of team) {
    for (const [want, ws] of wantsOf(to, isDps(to))) {
      for (const from of team) {
        if (from === to) continue
        for (const [tag, as] of (PROFILES[from]?.applies ?? []).map(parse)) {
          const hit = tag === want || (want === 'Negative Status' && NEGATIVE_STATUSES.includes(tag))
          if (!hit) continue
          const points = ((as * ws) / 2) * (WEIGHT[want] ?? 1)
          const key = `${from}>${to}>${want}`
          const prev = out.get(key)
          if (!prev || prev.points < points) out.set(key, { from, to, effect: tag, points })
        }
      }
    }
  }
  return [...out.values()].sort((a, b) => b.points - a.points)
}

export function bestBuild(team: string[]): { build: Build; exact: boolean } | null {
  let best: { build: Build; exact: boolean; v: number } | null = null
  for (const b of BUILDS) {
    const n = b.team.filter((m) => team.includes(m)).length
    if (n < 2) continue
    const v = TIER_POINTS[b.tier] * (n === 3 ? 1 : 0.3)
    if (!best || v > best.v) best = { build: b, exact: n === 3, v }
  }
  return best && { build: best.build, exact: best.exact }
}

/** Synergy points for a team (linked effects, capped, plus the best matching known build). */
export function synergyScore(team: string[], isDps: (n: string) => boolean): number {
  const links = teamLinks(team, isDps)
  // Each effect type from each provider counts once so one buff cannot be farmed several times.
  const seen = new Set<string>()
  let s = 0
  for (const l of links) {
    const k = `${l.from}>${l.effect}`
    if (seen.has(k)) continue
    seen.add(k)
    s += l.points
  }
  const bb = bestBuild(team)
  return Math.min(s, LINK_CAP) + (bb ? TIER_POINTS[bb.build.tier] * (bb.exact ? 1 : 0.3) : 0)
}
