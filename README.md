# Health Cost Mini-Calculator (static)

A super-light, client-only app that estimates common healthcare prices by service, ZIP, and insurance type. No backend, no tracking, deploys instantly to Vercel/GitHub Pages.

## Quick start
1) Download or clone this folder.
2) Commit & push to a new GitHub repo.
3) Deploy on Vercel:
   - New Project → Import GitHub repo
   - Framework: **Other**
   - Build Command: **(leave empty)**
   - Output Directory: **/** (root)
   - It will serve `index.html` directly.

### GitHub Pages (optional)
- Settings → Pages → Source: `Deploy from a branch`
- Branch: `main` → `/ (root)`

## Edit price data
Update `data/prices.json`:
- Add new `services` with a `code`, `name`, and `base.low/high`.
- Tweak `regionFactors` multipliers.
- Add tip arrays under `tips`.

## Notes
- Estimates are rough guidance only.
- ZIP → region uses the first digit of ZIP for a coarse factor.
- Insurance effect multipliers are heuristic defaults in `script.js`.

## Roadmap (Premium $0.99/mo later)
- Save favorites (localStorage for free; Stripe-gated for premium).
- More services & city-level factors.
- CSV export of saved searches.
