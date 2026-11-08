"""python scripts/make_engine_brief.py > engine_brief.md    (run from the STUDIO folder)
Builds the brief for a fresh Claude that writes the THEME PATCH for the engine (cast colours, palettes, fonts)."""
import pathlib
ST = pathlib.Path.cwd()
def rd(paths, head=None):
    for p in paths:
        f = ST / p
        if f.exists():
            t = f.read_text(encoding='utf-8-sig')
            if head: t = '\n'.join(t.splitlines()[:head])
            return t.strip()
    return '(NOT FOUND on this machine: %s)' % paths[0]
SRC = [
 ('src/engine/rig.tsx (first 70 lines: C, Look, CastName, LOOKS)', ['src/engine/rig.tsx'], 70),
 ('src/engine/kit.tsx (first 32 lines: the D dusk and N night palettes)', ['src/engine/kit.tsx'], 32),
 ('src/engine/fonts.ts', ['src/engine/fonts.ts'], None),
 ('src/engine/episode.tsx', ['src/engine/episode.tsx'], None),
 ('src/engine/index.ts', ['src/engine/index.ts'], None),
 ('src/studio.config.ts', ['src/studio.config.ts', 'studio.config.ts'], None),
 ('src/episodes/promo/index.tsx (how an episode wires itself)', ['src/episodes/promo/index.tsx', 'src/episodes/glimpse60/index.tsx'], None),
]
T = r'''# BRIEF: write the THEME PATCH for the animation engine (cast colours, palettes, fonts)

Today every episode looks identical because the look is hard-coded in the engine: the cast colours (LOOKS and C in rig.tsx),
the dusk and night palettes (D and N in kit.tsx) and the typefaces (fonts.ts). You write a small patch that makes all three
configurable from a theme.json, with the CURRENT values as the defaults, so an episode with no theme renders exactly as today.
You write code only. The user applies it on their VM and tests it there. You cannot render here.

## The design (follow it, it keeps the patch small)
1. NEW file src/engine/theme.ts exports:
   - `type Theme` (schema below) and `applyTheme(theme?: Theme): void`.
   - At first import it takes a deep snapshot of the defaults of C, D, N, LOOKS and FONT.
   - applyTheme FIRST restores every live object from that snapshot (Object.assign in place, never reassign the exports), THEN applies the
     theme's overrides in place. This matters: one bundle holds many episodes, and themes must never leak from one episode into the next.
   - Validate colours with /^#[0-9A-Fa-f]{6}$/. Bad or unknown keys are skipped with a console.warn naming the key. Never throw.
   - Fonts: a static map of whitelisted Google fonts, each imported from '@remotion/google-fonts/<Name>' and loaded (loadFont) only when
     chosen. Use the family name that loadFont returns. title: BricolageGrotesque (default), Anton, Oswald, Poppins. ui: FragmentMono (default),
     JetBrainsMono, SpaceMono. hand: Kalam (default), Caveat, PatrickHand. If you are not sure a module exists, still list it and say so in your reply.
2. In episode.tsx: EpisodeProps gets `theme?: Theme`. `Episode` and `Board` call applyTheme(theme) at the top of their render (before any child renders),
   and use theme.bg, theme.grain, theme.vignette when given (they override the props of the same name). defineEpisode passes the theme through.
3. Existing code keeps reading D.x, N.x, C.x, LOOKS[name], FONT.x as today. Do NOT touch sets, props, ui, furnish, light or room unless a
   module-level constant is computed from D, N or C at import time (it would ignore the theme); if you find one, fix it by reading the value inside
   the component instead, and list it in your reply. You only have the top of rig.tsx and kit.tsx, so say which files the user must grep:
   `grep -n "= D\.\|= N\.\|= C\." src/engine/*.tsx src/engine/sets/*.tsx` at module level.
4. Episodes pick a theme in their own index.tsx: `import theme from '../../themes/<name>.json'` then `defineEpisode('<Id>', { ..., theme })`.

## theme.json schema (every key optional, {} means the defaults)
{ "name": "string",
  "bg": "#hex", "grain": true, "vignette": true,
  "palette": { "skin","skinShade","ink","jacket","jacketShade","shoe","orange","limb": "#hex" },          // overrides C
  "dusk":  { "skyTop","skyMid","horizon","sun","warm","rim","night": "#hex" },                                // overrides D
  "night": { "skyTop","skyMid","horizon","moon","moonShade","glow","rim": "#hex" },                           // overrides N
  "cast":  { "pip|pipHood|pipInk|mo|sis|mom|suit": { "skin","skinShade","hand","jacket","jacketShade","accent","limb","line","shoe","face","hair": "#hex" } },  // partial overrides of LOOKS
  "fonts": { "title": "Anton", "ui": "FragmentMono", "hand": "Kalam" } }

## Deliverable: ONE zip, patch.zip, paths relative to the studio folder
- src/engine/theme.ts (new, complete)
- patch_engine.py (Python 3, stdlib only). It edits the existing files by EXACT string replacement: for each edit it asserts the old text occurs exactly
  once (else prints which edit failed and exits without writing anything), skips an edit whose new text is already present (so it can rerun), and copies
  src/engine to src/engine.bak first if that folder does not exist. Do not rewrite whole existing files: send only the small replacements. Copy the old
  strings character for character from the sources below.
- themes/default.json ({"name":"default"}), themes/night-indigo.json and themes/sunrise-green.json: two complete themes that look CLEARLY different
  from today (different jackets, skin tones, shoes and sky colours for every cast member, one different font each) and from each other.
- references/theme.md: at most 45 lines for the writer Claude who makes episodes: the schema, how to pick a theme, and one rule: keep a channel's cast
  colours the same across its episodes.
- scripts/check_theme.py: `python3 scripts/check_theme.py themes/x.json` prints every bad key or colour, exits 1 on any.
- TEST.md: the exact commands to test: `npx tsc --noEmit`, `python3 patch_engine.py`, a one-line edit pointing the promo index.tsx at a theme, and
  `npx remotion still src/index.ts PromoPipeline out/theme_test.png --frame=300`.

## Rules
- Write each file once. No read-back, no restating files, no long explanations. Do not retype any engine file you are not changing.
- If you have a code sandbox, make scratch copies from the sources below and run patch_engine.py once against them, plus `python3 -m py_compile`. If you have
  none, re-check every old string against the text below.
- No new dependencies beyond @remotion/google-fonts (already installed). No secrets in any file. No em or en dashes in any text.
- Defaults must reproduce today's look exactly: same hex values, same fonts.

## Reply (6 lines or fewer)
What is in the zip, any font module you are unsure exists, any module-level constant you found or could not check, and anything you could not verify.

## SOURCES (the current files)
'''
out = [T]
for title, paths, head in SRC:
    out.append('\n----- BEGIN %s -----\n%s\n----- END -----\n' % (title, rd(paths, head)))
print(''.join(out))
