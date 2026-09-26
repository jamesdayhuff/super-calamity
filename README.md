# Super Calamity

An 8-bit tower defense game for desktop browsers, built with Phaser 3 + TypeScript + Vite.
One engine, three worlds: hold the line across 5 maps per world with 7 tower types against 13 enemy
archetypes (shields, splitters, healers, stealth, swarms and a boss per map), and spend meta-currency
between runs to unlock towers and level-3 tiers.

| World | Setting | You defend | Currency |
|---|---|---|---|
| **Star Defense** | Sci-fi stations, asteroid mines and orbital platforms | The Core | Cores |
| **Iron Front** | WW2 hedgerows, ruined cities, winter forests and river crossings | The Bunker | Medals |
| **Dust & Lead** | Wild West streets, canyons, gold mines and rail junctions | The Bank | Gold |

Each world keeps its own unlocks and progress.

## Getting started

### Prerequisites

- **Node.js 22.12 or newer** (includes npm). Check with `node -v`; get it from
  [nodejs.org](https://nodejs.org/) or a version manager like [nvm](https://github.com/nvm-sh/nvm).
- **Git**, to clone the repo (or use GitHub's **Code → Download ZIP** and unzip it instead).
- A **desktop browser** (Chrome, Firefox, Safari or Edge). The game is played with mouse and keyboard.

### Download and install

```bash
git clone https://github.com/jamesdayhuff/super-calamity.git
cd super-calamity
npm install
```

### Play

```bash
npm run dev
```

Then open the URL it prints, normally <http://localhost:5173>. The page reloads automatically when you
edit the source. Stop the server with `Ctrl+C`.

### All commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Run unit tests and the reference-bot balance check |
| `npm run typecheck` | Type-check without building |
| `npm run build` | Type-check and produce a static bundle in `dist/` |
| `npm run preview` | Serve the built `dist/` locally to try the production build |

### Hosting your own copy

`npm run build` produces a fully static `dist/` folder. Upload it to any static host (GitHub Pages,
Netlify, itch.io as an HTML5 game, an S3 bucket…). It uses relative paths, so it works from a
subfolder too. No server or database is needed; progress is stored in the player's browser.

### Troubleshooting

- **`npm install` fails or Vite reports an unsupported engine** — your Node.js is too old. Upgrade to
  22.12+ and run `npm install` again.
- **Port 5173 is already in use** — Vite picks the next free port and prints it; open that URL instead,
  or choose one with `npm run dev -- --port 3000`.
- **Want to reset your progress** — clear site data for the page in your browser, or run
  `localStorage.removeItem('super-calamity/progression')` in its devtools console.

## Controls

| Input | Action |
|---|---|
| `1`–`7` / click tower bar | Pick a tower to place (click again or `Esc` / right-click to cancel) |
| Click tile | Place tower (hold `Shift` to keep placing) |
| Click tower | Select: stats, upgrade, sell, targeting mode |
| `U` / `S` / `T` | Upgrade / sell / cycle targeting (first · last · strongest) |
| `Space` | Send next wave |
| `F` | Toggle 1× / 2× speed |
| `P` / `Esc` | Pause (volume, restart, quit) |
| `M` | Mute |

Dev builds only: `C` +500 cash, `K` kill all, `N` clear wave, `L` unlock everything (also on the map screen).

## Project layout

```
src/
  balance/       Shared mechanics — archetypes, tower/enemy stats, wave curves, economy, damage table.
                 Authored once; no skin may change a number here.
  skins/         Flavor only — one directory per world (space, ww2, west), plus the registry that
                 merges a skin with src/balance to produce the TowerDef / EnemyDef the game consumes.
  state/         ProgressionState (per-skin save blocks), RunState, SaveAdapter
  systems/       Pure logic: DamageModel, WaveSpawner, Path, Grid, Economy
  game/          World (run rules, Phaser-free), Combat, Enemy, Tower, Projectile, Effects
  scenes/        Boot, Preload, SkinSelect, MapSelect, Armory, Game (render/input shell), HUD, Pause, Result
  assets/        Manifest, pixel-art baker (SpriteFactory), WebAudio synth + generative music
  sim/           Headless reference bot used by the balance test
tests/           Vitest suites
```

## How skins work

The split is **mechanics vs. flavor**. `src/balance/` owns every number; `src/skins/<id>/` owns every
name, sprite, color, sound and map layout. The registry merges them, so nothing downstream of
`src/skins/registry.ts` knows that skins exist — `World`, `Combat`, `Tower` and `Enemy` see exactly the
same `TowerDef` / `EnemyDef` shapes they always have.

Archetype ids name what a thing *does*, never what it looks like:

| Tower | Star Defense | Iron Front | Dust & Lead |
|---|---|---|---|
| `direct` | Laser Turret | MG Nest | Rifle Tower |
| `splash` | Plasma Mortar | Howitzer | Dynamite Launcher |
| `slow` | Cryo Emitter | Minefield | Tar Pit |
| `antishield` | EMP Tower | AT Rifle Team | Buffalo Gun |
| `sniper` | Railgun | 88mm AT Gun | Sharpshooter Perch |
| `chain` | Arc Coil | Strafing Run | Ricochet Revolver |
| `support` | Drone Bay | Radio Post | Lookout Tower |

Enemies work the same way (`scout`, `grunt`, `armored`, `shielded`, `splitter`, `splitling`, `healer`,
`stealth`, `boss_1`..`boss_5`).

### Adding a world

Copy `src/skins/space/`, add the id to `SkinId` in `src/skins/types.ts`, and register it in
`src/skins/registry.ts`. The type system does the rest of the checklist for you: `SkinDef` requires
every archetype, `SfxEvent` requires every sound, and `SkinStrings` requires every piece of copy, so a
half-authored world is a compile error rather than a blank sprite at runtime. `tests/skins.test.ts`
additionally asserts structural parity, and `tests/balance.test.ts` will run your maps through the bot.

A skin supplies:

- **`towers.ts` / `enemies.ts`** — names, blurbs and effect colors per archetype.
- **`maps.ts`** — 5 layouts. Map N uses `WAVE_CURVES[N]`, so pacing is shared and only the path differs.
- **`themes.ts`** — one tileset definition per map.
- **`strings.ts`** — subtitle, tagline, currency names, level noun, win/lose banners, ending text.
- **`art/`** — a 17-color palette, tower platform + head rows, enemy/decor/fx sprites, `drawTile`, backdrop.
- **`audio/`** — a recipe per `SfxEvent` and a generative track per map.

All art shares one character vocabulary (`o d m l w r R y g G n b B c p P t`, documented in
`src/assets/sprites/palette.ts`), so rows are portable between worlds and swapping a palette reskins
every sprite at once.

## Swapping in real art and audio

Every sprite and sound is referenced by key. Placeholders are generated procedurally at boot, but only
for keys that weren't loaded from a file. To replace one, put the file under `public/` and add it to
`src/assets/manifest.ts`:

```ts
export const TEXTURE_FILES = {
  enemy_scout: { url: 'assets/scout.png', frameWidth: 12, frameHeight: 12 }, // animated sheet
  base_object: { url: 'assets/base.png' },                                    // single image
};
export const AUDIO_FILES = {
  sfx_fire_direct: 'assets/laser.ogg',
  music_station: 'assets/station-theme.ogg',
};
```

Texture keys: `tower_<archetype>_base_<1-3>`, `tower_<archetype>_head_<1-3>`, `icon_tower_<archetype>`,
`enemy_<archetype>`, `base_object`, `proj_*`, `fx_*`, `icon_*`, `tile_<theme>_floor_<0-2>`,
`tile_<theme>_path`, `decor_*`. Audio keys are `sfx_<event>` and `music_<track>`.
Multi-frame sheets automatically get a looping `<key>_anim` animation.

Because only one world's textures are resident at a time, keys are not namespaced by skin — switching
worlds clears and re-bakes them (`clearSkinTextures` / `bakeSkinTextures`). File overrides survive a
switch, so an override applies to whichever world is active.

## Persistence

Progress is saved to `localStorage` under `super-calamity/progression`, falling back to memory-only
where storage is unavailable (private mode, tests). The save holds global settings plus one block per
world:

```ts
{ version: 2, activeSkin, settings, skins: { space: {...}, ww2: {...}, west: {...} } }
```

Each block is validated against **its own** world's towers and maps, so playing one world never
prunes another's progress. A v1 save (a single flat blob, no `skins` field) migrates into the space
block automatically.

## Balance

Every number lives in `src/balance/` and is shared by all three worlds, so one balance pass stays valid
everywhere — worlds play differently because their path layouts and tileset readability differ, not
because their stats do.

`tests/balance.test.ts` runs a deliberately simple bot (`src/sim/bot.ts`) through all 15 maps with the
towers a player would plausibly have unlocked by then, and fails if any map becomes unwinnable.
`BOT_PLANS` is indexed by map *slot*, not by world. Run
`npx vitest run tests/balance.test.ts --reporter=verbose` to see per-map HP and leaks.

When authoring a new layout, the thing the bot is most sensitive to is **lane spacing**: a map needs at
least one pair of parallel path runs 2–3 tiles apart so a single tower can cover both. Slot 4 in
particular will fail without it.

## Design decisions

- **Map unlocks** are completion-based; meta-currency buys tower types and each tower's level-3 tier.
- **Stealth enemies** can't be targeted, but AoE (splash, slow pulses, chain bounces) still hits them
  and support towers reveal them.
- **Meta payout** per wave cleared (also on defeat), plus a first-clear bonus and a smaller replay bonus.
- **Sell refund** is 70% of total invested. Boss slows are partially resisted.

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `npm test` and `npm run build` so the
type-check and balance bot both pass. New worlds are the easiest place to start; see
[Adding a world](#adding-a-world).

## License

[MIT](LICENSE) © James Dayhuff
