# Brand source files

| File          | What it is                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `ub-mark.svg` | UB's master monogram (blue `#0145B8`, orange `#FE760D`). Same file as `public/brand/original-logo.svg`. |

The site uses these paths directly: `src/components/brand/Monogram.tsx` (inline SVG), and `pnpm brand:assets` regenerates the favicon and public SVGs from it.

Still requested from UB (OI-07): the horizontal logo with the "Universal Bridge Ltd" wordmark as vector outlines, and the brand font, if licensed.

## images/

UB-supplied renders (all AI-generated). They are **not** in `public/` so unapproved originals (~60 MB) are never published. `pnpm db:seed` imports the selected ones into the CMS media library (WebP + responsive sizes, served as AVIF/WebP by next/image) with a visible "Concept" label (OI-06, UI/UX §14.4). The list and alt texts are in `scripts/seed-data/images.ts`.

| Used                                                                | Where                            |
| ------------------------------------------------------------------- | -------------------------------- |
| Futuristic Universal Bridge Lobby Signage                           | Home hero                        |
| Universal Bridge Tech Workspace                                     | Services hero                    |
| Futuristic Universal Bridge Lobby                                   | Solutions hero                   |
| Modern Universal Bridge Coding Hub, AI Innovation Hub, Robotics Hub | Labs cards (home)                |
| Universal Bridge Academy Tech Hub                                   | Academy teaser                   |
| Universal Bridge Tech Office Lobby                                  | About hero                       |
| Futuristic Universal Bridge Office Lobby                            | Careers hero                     |
| Universal Bridge Hackathon Demo Day                                 | Events (UB Hackathon 2024 cover) |

| Not used                                                                                                                            | Why                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Portraits of people (ChatGPT Image…, Confident/Professional Office Portrait, Brand Ambassador, Tech Portrait, Tech Office Portrait) | AI-generated people would read as real staff                                                    |
| Corporate Campus at Dusk, Headquarters at Twilight                                                                                  | SRS: never shown as current facilities (OI-06)                                                  |
| UB Smart_ Connecting Tomorrow                                                                                                       | Product not confirmed (OI-05)                                                                   |
| Business Card / Services Card Mockups                                                                                               | Placeholder contacts; disputed CTO name (OI-11)                                                 |
| Digital Solutions (website concept), Academy posters                                                                                | Text baked into the image                                                                       |
| Internship Certificate                                                                                                              | Reference for the certificate design (S4)                                                       |
| Logo PNGs                                                                                                                           | The site uses the master SVG; `original-logo.png` → `public/brand/ub-mark-email.png` for emails |
