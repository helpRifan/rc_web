# Third-party notices

## React Bits

Source: https://reactbits.dev (https://github.com/DavidHDev/react-bits)

Components used, installed from the React Bits shadcn registry into `src/components/reactbits/`:
- FaultyTerminal (the homepage glyph field; its render loop is adapted for this site)
- DecryptedText (page headlines)
- Hyperspeed (the Events road)
- ScrollStack (the past events deck)
- DomeGallery (the Gallery dome)
- LiquidEther (the Join background)
- ProfileCard (the faculty coordinator card)
- Lanyard (the Team ID badges), with its `card.glb` model in `public/models/` (its demo texture removed by `scripts/slim-card-glb.mjs`; the badges are printed by the site)
- InfiniteMenu (the core team sphere)
- TechText (the homepage title, with its exploded view on scroll)
- ScrollReveal (the homepage About lead; scrubbed without GSAP)
- SplitFlapText (the homepage numbers)
- FlowingMenu (the homepage "What we do"; its marquee runs on CSS)
- DriftWall (the homepage latest photos)

Every component's colours are changed to the club's logo palette, and some are adapted further for this site. Each file keeps its React Bits origin.

Used as part of this website; not redistributed on their own.

These components depend on open-source packages under their own licences (MIT unless noted): three, @react-three/fiber, @react-three/drei, @react-three/rapier, meshline, postprocessing, gsap (the GSAP "no charge" licence), lenis, gl-matrix, @use-gesture/react, ogl and motion. The badges' QR codes are drawn with uqr (MIT).

The React Bits licence, copied verbatim from `LICENSE.md` in the React Bits repository:

---

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
