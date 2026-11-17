# Endstate Matrix Team Builder

An unofficial fan tool for Wuthering Waves. Mark the Resonators you own, optionally lock in your own teams,
and the builder splits the rest into as many full teams of three as your roster allows.

Not affiliated with Kuro Games. Wuthering Waves and related names belong to Kuro Games.
Power ratings and team synergies are rough estimates, not official data.

## How the rules work

- Most Resonators can be used in one team.
- Shorekeeper, Verina, Mornye, Baizhi, Suisui and Buling can be used in two teams (permanent).
- The "Include current cycle bonuses" switch adds the current cycle's Emergency Agent second uses.
- Step 2 checks your own teams before anything is sent on. Resonators you used there are removed from step 3.

## Run it locally

```bash
npm install
npm run dev      # local preview
npm test         # solver and rule tests
npm run build    # production build in dist/
```

## Updating for a new cycle or new Resonator

Everything lives in `src/data/characters.ts`:

- New Resonator: add it to `RAW`, to `VERSIONS`, and to `FOUR_STAR` if it is 4-star.
- New cycle: edit `CYCLE_BONUS` (the name and the Resonators who get +1 Vigor).
- Permanent two-use supports: `PERMANENT_TWO_USE`.

## Portraits (optional)

Put image files in `src/assets/portraits/`, named like the Resonator in lowercase with dashes:
`shorekeeper.webp`, `rover-aero.webp`, `xiangli-yao.webp`, `yangyang-xuanling.webp`.
They show up automatically. Only use images you have the right to publish.

## Deploying to GitHub Pages

1. Push this project to the `main` branch.
2. In the repository, open Settings, then Pages, and set Source to "GitHub Actions".
3. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes on every push.
