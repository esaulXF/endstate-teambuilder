import type { Resonator } from '../data/characters'

export const ELEMENT_COLOR: Record<string, string> = {
  Fusion: 'var(--el-fusion)', Glacio: 'var(--el-glacio)', Aero: 'var(--el-aero)', Electro: 'var(--el-electro)', Spectro: 'var(--el-spectro)', Havoc: 'var(--el-havoc)',
}

// Portraits are optional: drop files named like the Resonator (e.g. shorekeeper.webp,
// rover-aero.webp, xiangli-yao.webp) into src/assets/portraits and they appear automatically.
const PORTRAITS = import.meta.glob('../assets/portraits/*.{webp,png,jpg,jpeg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const portraitFor = (slug: string) => Object.entries(PORTRAITS).find(([path]) => path.split('/').pop()!.replace(/\.[a-z]+$/, '') === slug)?.[1]

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Portrait circle: the Resonator's portrait file if present, else their initial. */
export function Medal({ c, size = 44 }: { c: Resonator; size?: number }) {
  const src = portraitFor(slug(c.name))
  return (
    <span className="medal" style={{ width: size, height: size, ['--el' as string]: ELEMENT_COLOR[c.element] }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : <span className="medal-letter">{c.name[0]}</span>}
    </span>
  )
}

export function Stars({ rarity }: { rarity: 4 | 5 }) {
  return <span className={`stars r${rarity}`} role="img" aria-label={`${rarity}-star`}>{'★'.repeat(rarity)}</span>
}
