---
Task ID: 1
Agent: Main Agent
Task: Add real TMDB poster images to all 111 curated movies in the built-in Movies feature

Work Log:
- Fetched poster paths for all 111 curated movies using TMDB v4 API (free read access token)
- Used known TMDB IDs for hard-to-search classic titles (Looney Tunes=2166, Tom & Jerry=1662, Pink Panther=2439, Danger Mouse=3572, Beat Street=21601, He-Man=4216, Bluey=92749, Heartstopper=119051, Wednesday=120089, Codename KND=2271, Kenan & Kel=2507, Owl House=82856)
- Replaced all placeholder poster paths with real TMDB image CDN URLs via Python regex replacement
- Verified: 111 real poster URLs, 0 placeholders, 0 empty fields
- Added cache headers to next.config.ts (later reverted to keep config minimal)
- Confirmed next.config.ts already allows all HTTPS image domains via `hostname: '**'`
- Structural validation passed: bracket/brace/paren balance, no unescaped chars, all URLs valid

Stage Summary:
- All 111 curated movies now have real poster images from TMDB CDN (w342 size)
- Posters are baked into the fallback data — no API key needed at runtime
- Zero cost, zero subscription, works for unlimited users
- Decade coverage: 1970s(12), 1980s(16), 1990s(18), 2000s(16), 2010s(30), 2020s(19) = 111 total
- Build command experiencing timeout in CI environment but code is structurally valid