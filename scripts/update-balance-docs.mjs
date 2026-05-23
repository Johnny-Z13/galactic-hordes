import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const write = (path, text) => writeFileSync(resolve(root, path), text)

const balance = read('src/game-balance.ts')
const powerups = read('src/powerup-balance.ts')
const run = read('src/run-balance.ts')
const surface = read('src/surface-balance.ts')
const sector = read('src/sector-map.ts')
const activeMode = balance.match(/export const GAME_BALANCE_MODE = '([^']+)'/)?.[1] ?? 'unknown'
const profileBlock = balance.match(new RegExp(`${activeMode}: \\{([\\s\\S]*?)\\n  \\}`))?.[1] ?? ''
const label = profileBlock.match(/label: '([^']+)'/)?.[1] ?? activeMode
const multiplier = (name) => profileBlock.match(new RegExp(`${name}: ([0-9.]+)`))?.[1] ?? ''
const configValue = (name) => powerups.match(new RegExp(`${name}: ([0-9.]+)`))?.[1] ?? ''
const scopedConfigValue = (scope, name) => powerups.match(new RegExp(`${scope}: \\{[\\s\\S]*?${name}: ([0-9.]+)`))?.[1] ?? ''
const scopedRunValue = (scope, name) => run.match(new RegExp(`${scope}: \\{[\\s\\S]*?${name}: ([0-9.]+)`))?.[1] ?? ''
const surfaceValue = (name) => surface.match(new RegExp(`${name}: ([0-9.]+)`))?.[1] ?? ''
const scopedSurfaceValue = (scope, name) => surface.match(new RegExp(`${scope}: \\{[\\s\\S]*?${name}: ([0-9.]+)`))?.[1] ?? ''
const unionValues = (name, source) => source.match(new RegExp(`export type ${name} = ([^\\n]+)`))?.[1].replaceAll("'", '`').replaceAll(' | ', ', ') ?? ''

const enemyRows = [...balance.matchAll(/^\s+(\w+): \{ hp: ([0-9.]+), radius: ([0-9.]+), speed: ([0-9.]+), value: ([0-9.]+), color: '[^']+', contactDamage: ([0-9.]+), timeGateSeconds: ([0-9.]+), spawnRollCeiling: ([0-9.]+)/gm)]
  .map((match) => `| ${match[1]} | ${match[2]} | ${match[4]} | ${match[6]} | ${match[7]}s | ${match[8]} |`)
  .join('\n')

const generated = `### Active Balance Snapshot

Active balance mode: \`${activeMode}\` (${label}).

| Multiplier | Value |
| --- | ---: |
| Enemy HP | ${multiplier('enemyHpMultiplier')} |
| Enemy damage | ${multiplier('enemyDamageMultiplier')} |
| Enemy speed | ${multiplier('enemySpeedMultiplier')} |
| Enemy projectile speed | ${multiplier('enemyProjectileSpeedMultiplier')} |
| Enemy attack cooldown | ${multiplier('enemyAttackCooldownMultiplier')} |
| Spawn rate | ${multiplier('spawnRateMultiplier')} |
| Boss rate | ${multiplier('bossRateMultiplier')} |
| Surface HP | ${multiplier('surfaceEnemyHpMultiplier')} |
| Surface damage | ${multiplier('surfaceEnemyDamageMultiplier')} |
| Surface speed | ${multiplier('surfaceEnemySpeedMultiplier')} |

| Enemy | HP | Speed | Contact | Time Gate | Spawn Roll |
| --- | ---: | ---: | ---: | ---: | ---: |
${enemyRows}

### Power-Up Balance Snapshot

| System | Value |
| --- | ---: |
| Weapon base cooldown | ${configValue('baseFireCooldown')}s |
| Weapon minimum cooldown | ${configValue('minFireCooldown')}s |
| Weapon base damage | ${configValue('baseDamage')} |
| XP pickup radius | ${scopedConfigValue('xp', 'radius')} |
| XP merge radius max | ${scopedConfigValue('xp', 'mergeRadiusMax')} |
| Workbench base choices | ${configValue('baseChoiceCount')} |
| Relic chance base | ${configValue('relicChanceBase')} |
| Surface gun damage | ${configValue('baseGunDamage')} |
| Surface health base | ${configValue('baseHealth')} |

### Run And Surface Balance Snapshot

| System | Value |
| --- | ---: |
| Starter hull | ${scopedRunValue('player', 'baseHull')} |
| Starter speed | ${scopedRunValue('player', 'baseSpeed')} |
| Starting XP threshold | ${scopedRunValue('xp', 'startingNext')} |
| XP growth multiplier | ${scopedRunValue('xp', 'growthMultiplier')} |
| Chest respawn minimum | ${scopedRunValue('spaceChest', 'respawnMinSeconds')}s |
| Station repair hull | ${scopedRunValue('station', 'repairHull')} |
| Surface world | ${surfaceValue('width')} x ${surfaceValue('height')} |
| Surface cache safe distance | ${scopedSurfaceValue('resource', 'cacheSafeDistance')} |
| Surface ambush base count | ${scopedSurfaceValue('cacheAmbush', 'baseCount')} |
| Boss cache safe distance | ${scopedSurfaceValue('bossCache', 'safeDistance')} |

### Sector Node Config Snapshot

| Config Area | Values |
| --- | --- |
| Themes | ${unionValues('SectorNodeTheme', sector)} |
| Wave orders | ${unionValues('SectorWaveOrder', sector)} |
| Hazard tags | ${unionValues('SectorHazardTag', sector)} |
| Planet config | count range, density, archetype bias |
| Enemy config | starting spawns, enemy bias, spawn multiplier, max alive multiplier |
| Wave config | trigger seconds, label, enemy counts, notes |
| Hazard config | asteroid density/damage/drift and encounter bias |
| Reward config | resource multiplier, chest interval multiplier, upgrade signal chance |

Generated from \`src/game-balance.ts\`, \`src/powerup-balance.ts\`, \`src/run-balance.ts\`, \`src/surface-balance.ts\`, and \`src/sector-map.ts\`. Do not edit this section by hand.`

const replaceGeneratedSection = (path) => {
  const start = '<!-- BALANCE-GENERATED:START -->'
  const end = '<!-- BALANCE-GENERATED:END -->'
  const doc = read(path)
  if (!doc.includes(start) || !doc.includes(end)) throw new Error(`${path} is missing balance generated markers`)
  const next = doc.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${generated}\n${end}`)
  if (next !== doc) write(path, next)
}

replaceGeneratedSection('README.md')
replaceGeneratedSection('docs/game-balance-design.md')
