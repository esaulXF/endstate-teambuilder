import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { RESONATORS, CYCLE_BONUS, usesFor, type Element, type Role, type Resonator } from '../data/characters'
import { ELEMENT_COLOR, Medal, Stars } from './Medal'

const SORTS = {
  nameUp: ['Name A–Z', (a: Resonator, b: Resonator) => a.name.localeCompare(b.name)],
  nameDown: ['Name Z–A', (a: Resonator, b: Resonator) => b.name.localeCompare(a.name)],
  newest: ['Release: newest first', (a: Resonator, b: Resonator) => parseFloat(b.version) - parseFloat(a.version) || a.name.localeCompare(b.name)],
  oldest: ['Release: oldest first', (a: Resonator, b: Resonator) => parseFloat(a.version) - parseFloat(b.version) || a.name.localeCompare(b.name)],
  r5: ['Rarity: 5★ first', (a: Resonator, b: Resonator) => b.rarity - a.rarity || a.name.localeCompare(b.name)],
  r4: ['Rarity: 4★ first', (a: Resonator, b: Resonator) => a.rarity - b.rarity || a.name.localeCompare(b.name)],
} as const
type SortKey = keyof typeof SORTS

const ELEMENTS: Element[] = ['Fusion', 'Glacio', 'Aero', 'Electro', 'Spectro', 'Havoc']
const ROLES: Role[] = ['Main DPS', 'Sub-DPS', 'Support']

interface Props {
  roster: Set<string>
  cycleBonus: boolean
  onToggle: (name: string) => void
  onSetMany: (names: string[], on: boolean) => void
}

export function Roster({ roster, cycleBonus, onToggle, onSetMany }: Props) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('nameUp')
  const [el, setEl] = useState<Element | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  const shown = useMemo(
    () => RESONATORS.filter((c) => (!el || c.element === el) && (!role || c.role === role) && c.name.toLowerCase().includes(q.trim().toLowerCase())).sort(SORTS[sort][1]),
    [q, sort, el, role],
  )

  return (
    <div>
      <div className="toolbar">
        <input type="search" className="field grow" placeholder="Search Resonators" aria-label="Search Resonators" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="inline">
          Sort
          <select className="field" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
      </div>
      <div className="toolbar" role="group" aria-label="Filter by element">
        {ELEMENTS.map((x) => (
          <button key={x} className="chip" aria-pressed={el === x} style={{ ['--el' as string]: ELEMENT_COLOR[x] }} onClick={() => setEl(el === x ? null : x)}>
            <i className="dot" />{x}
          </button>
        ))}
      </div>
      <div className="toolbar" role="group" aria-label="Filter by role">
        {ROLES.map((x) => (
          <button key={x} className="chip" aria-pressed={role === x} onClick={() => setRole(role === x ? null : x)}>{x}</button>
        ))}
        <span className="spacer" />
        <button className="btn ghost" onClick={() => onSetMany(shown.map((c) => c.name), true)}>Select shown</button>
        <button className="btn ghost" onClick={() => onSetMany(shown.map((c) => c.name), false)}>Clear shown</button>
      </div>

      <div className="roster-grid">
        {shown.map((c) => {
          const on = roster.has(c.name)
          const uses = usesFor(c.name, cycleBonus)
          const cyc = cycleBonus && CYCLE_BONUS.resonators.includes(c.name)
          return (
            <motion.button
              key={c.name}
              layout="position"
              whileTap={{ scale: 0.97 }}
              className={`tile rar${c.rarity}`}
              aria-pressed={on}
              style={{ ['--el' as string]: ELEMENT_COLOR[c.element] }}
              onClick={() => onToggle(c.name)}
            >
              <Medal c={c} />
              <span className="tile-text">
                <span className="tile-name">{c.name}{uses === 2 && <b className={`x2${cyc ? ' cyc' : ''}`} title={cyc ? 'Second use from the current cycle' : 'Can be used in two teams'}>×2</b>}</span>
                <span className="tile-meta"><Stars rarity={c.rarity} /> {c.element}, {c.role}</span>
                <span className="tile-meta">v{c.version}</span>
              </span>
              <span className="tick" aria-hidden="true">✓</span>
            </motion.button>
          )
        })}
        {shown.length === 0 && <p className="empty">No Resonators match these filters. Clear a filter or change the search.</p>}
      </div>
    </div>
  )
}
