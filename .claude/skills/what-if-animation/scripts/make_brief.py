"""python scripts/make_brief.py <pack> "<topic>" <seconds> "<call to action or none>" > brief.md   (run from the STUDIO folder)
LEAN brief: the VM already has every script, so Claude writes only the 4 episode files.
Optional env: STYLE=<name> (a file in styles/) and LOOK=<palette>. Both are picked from the topic when not set."""
import hashlib, json, os, pathlib, re, sys
SC = pathlib.Path(__file__).resolve().parent; SK = SC.parent; ST = pathlib.Path.cwd()
if len(sys.argv) != 5: sys.exit(__doc__)
pack, topic, secs, cta = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
words, maxshots = round(secs * 2.8), max(10, round(secs * 0.7))
PALS = {
 'ocean':   dict(bg='#0A1E2C', skin='#C98E68', skinShade='#B07A58', jacket='#2BA6A0', jacketShade='#1F837E', accent='#F26B5B', shoe='#F26B5B', hair='#1A1A22', fjacket='#F2C14E', fjacketShade='#C99A2E', faccent='#2BA6A0', grain='true', vig='true'),
 'sunrise': dict(bg='#2A1620', skin='#E7B48A', skinShade='#CF9A70', jacket='#F2A65A', jacketShade='#D4833C', accent='#4FB286', shoe='#2B2B3A', hair='#2A1C18', fjacket='#4FB286', fjacketShade='#3A8E69', faccent='#F2A65A', grain='true', vig='true'),
 'plum':    dict(bg='#1D0F26', skin='#D9A47E', skinShade='#BF8C68', jacket='#C65D9B', jacketShade='#A24780', accent='#7DD6C0', shoe='#7DD6C0', hair='#241418', fjacket='#7DD6C0', fjacketShade='#5BB3A0', faccent='#C65D9B', grain='true', vig='true'),
 'ember':   dict(bg='#14100F', skin='#8D5A3E', skinShade='#774A32', jacket='#E4572E', jacketShade='#BC4222', accent='#F6C945', shoe='#F6C945', hair='#1A1210', fjacket='#3C4A5E', fjacketShade='#2E3A4A', faccent='#F6C945', grain='true', vig='true'),
 'forest':  dict(bg='#0D1F17', skin='#F2D2B6', skinShade='#DDB898', jacket='#9BC53D', jacketShade='#7BA02B', accent='#E8E1CF', shoe='#E8E1CF', hair='#3A2A1C', fjacket='#C97B4A', fjacketShade='#A8613A', faccent='#9BC53D', grain='true', vig='true'),
 'slate':   dict(bg='#12161F', skin='#E2B48C', skinShade='#C99B74', jacket='#7C8CF8', jacketShade='#5F6FD6', accent='#F7B267', shoe='#F7B267', hair='#20202A', fjacket='#F7B267', fjacketShade='#D4924A', faccent='#7C8CF8', grain='true', vig='true'),
}
H = lambda x: int(hashlib.sha1(x.encode()).hexdigest(), 16)
styles = sorted(q.stem for q in (SK / 'styles').glob('*.md')) if (SK / 'styles').exists() else []
style = os.environ.get('STYLE') or (styles[H(topic + 's') % len(styles)] if styles else '')
if style and style not in styles: sys.exit('unknown STYLE %s (choose: %s)' % (style, ', '.join(styles)))
STYLE_TXT = (SK / 'styles' / (style + '.md')).read_text(encoding='utf-8').strip() if style else ''
_m = re.search(r'(?m)^look:\s*(\w+)', STYLE_TXT)
look = os.environ.get('LOOK') or (_m.group(1) if _m else sorted(PALS)[H(topic) % len(PALS)])
if look not in PALS: sys.exit('unknown LOOK %s (choose: %s)' % (look, ', '.join(sorted(PALS))))
PH = {'@@LOOK@@': look}
PH.update({'@@%s@@' % k.upper(): v for k, v in PALS[look].items()})
sys.stderr.write('style: %s, look: %s\n' % (style or 'none', look))
def rd(p):
    p = pathlib.Path(p)
    return re.sub(r'\n{3,}', '\n\n', p.read_text(encoding='utf-8-sig')).strip() if p.exists() else '(not found: %s)' % p
ENG = ST / 'src/engine' if (ST / 'src/engine/index.ts').exists() else None
if not ENG:
    for c in list(ST.rglob('engine/index.ts'))[:1] + list(SK.rglob('engine/index.ts'))[:1]: ENG = c.parent
exd = next((ST / 'src/episodes' / n for n in ('glimpse60', 'promo') if (ST / 'src/episodes' / n / 'episode.json').exists()), None)
if pack == 'promo' and (ST / 'src/episodes/promo/episode.json').exists(): exd = ST / 'src/episodes/promo'
HOOKS = [
    "Open on the finished clip, then say: That came from one typed line.",
    "Say: Still dragging clips on a timeline at midnight?",
    "Say: No editor to rent. These are files you own.",
    "A skeptic says one line cannot make a video, then cut straight to the finished clip as the proof.",
    "Say: What if a video was just a text file?",
]
_hk = os.environ.get('HOOK', '')
HOOK = HOOKS[int(_hk) - 1] if _hk.isdigit() and 1 <= int(_hk) <= len(HOOKS) else HOOKS[H(topic + 'h') % len(HOOKS)]
PROMO_SHAPE = ("Open on a finished sample clip for 4 seconds, no voice. Hook: " + HOOK + " One line on who it is for: faceless creators comfortable with a terminal. "
    "One typed topic line goes in and the real stages run, each shown by one picture. The finished video again, held long enough to judge. "
    "What you get (the files you own: engine, cast, sets, scripts, guides) and what you bring (your own keys, none included). Call to action. "
    "The sample clip is the pipeline's own output, never shown as any channel's video. No earnings, no view counts, no speed claims, no viral. No power field.")
if pack == 'what-if':
    status = 'tested'
    if secs <= 30: shape = 'SHORT, 45 to 65 words. Beats 1 to 4 in full (cold open with three quick demos of the power, premise card, the fun part, the cost with ONE real fact and "That\'s real."), beats 5 to 7 folded into one last line that leaves a question open. Needs a "power" field.'
    elif secs <= 90: shape = 'ONE MINUTE, 100 to 180 words. Cold open demos, premise, the fun part, beat 4 in full (the real fact, then its consequence shown on screen), the suit notices (5), the sister is in danger (6), ends on "Part 1". Needs a "power" field.'
    else: shape = 'LONG, all seven beats, set "format":"long" and "minutes". Cold open, premise and rules, the fun part, the cost with real science, someone powerful notices, a moral choice with family at stake, cliffhanger. Needs a "power" field.'
else:
    status = 'UNTESTED DRAFT, treat as a prototype'
    shape = {'explainer': 'Hook (a surprising TRUE claim) / the question / the simple model built on screen / the twist that breaks it / the real answer with a checked number / one line takeaway. No "power" field.',
             'listicle': 'Hook promising N items / N items of 8 to 12 s each (claim, one picture, one number), weakest to strongest / call to comment. No "power" field.',
             'story': 'Setup (who wants what) / inciting incident / two escalations / turn / short resolution or cliffhanger. Two locations at most. No "power" field.',
             'promo': PROMO_SHAPE}.get(pack)
    if not shape: sys.exit('unknown pack: ' + pack)
T = r'''# BRIEF: write one animated episode as 4 files in a ZIP

You write a complete episode for a faceless YouTube channel: flat vector SVG scenes animated with Remotion from a ready kit. You write the narration, shots, cuts, sound plan and shot code. EVERY script already exists on the VM (voice, plan, sound, render, master, run_episode.sh, package.json, registry). You write NONE of them. The VM unzips your zip and runs `bash run_episode.sh <slug>`.

## Topic
@@TOPIC@@

## Pack: @@PACK@@ (@@STATUS@@)
@@SHAPE@@
About @@SECS@@ seconds, about @@WORDS@@ spoken words. Call to action: @@CTA@@ (if "none": no call to action and no contact details; never invent a link, number or handle).

## Deliverable: <slug>.zip with ONLY these 4 files (paths exact)
src/episodes/<slug>/episode.json, narration.txt, shots.tsx, index.tsx
If you cannot make a zip, reply with each file as `=== FILE: <name> ===` then its text, ending with `=== END ===`, and nothing else.

## Keep the output small (your reply has a hard length limit)
- Write the 4 files once each. No code comments, no read-back, no restating, no explanations, no self-test, no scratch copies. The VM tests it.
- shots.tsx: shared helpers once at the top, each shot 8 to 25 lines, reuse a component with props when a picture repeats, no unused code.
- At most @@MAXSHOTS@@ shots, at most 8 distinct sound clips and 24 sound events. episode.json compact, one line per array item.
- Final reply: ONE line with the zip path.

## What the VM does with your files
voice: one ElevenLabs call per script[].text, builds words.json (the time of every spoken word). plan: turns your cues into frames and prints the pace. sound: generates each clip once and places events. Then it renders (silent) and masters to -14 LUFS.

## episode.json
Keys: id (PascalCase), slug, pack, topic, title ["LINE 1","LINE 2"], accent (a short label), script, science, cast, shots, edit, tail, fx, sound. "power" {word, rule, look} for what-if only. Optional: format, minutes, fps, lead, end, gap.
- script: [{"beat","text"}], each text one spoken line of 6 to 18 words, written to be heard (short sentences, plain words, second person, present tense), one idea per line, showable as one picture. First line is a hook.
- science: [{"claim","working","source"}] for EVERY number or fact in the script. Work the arithmetic. Never invent a statistic or promise results.
- shots: [{"id":"S1","size","set","key","note"}]. "set" must be one of the kit sets (listed below) unless the shot is hand-drawn in shots.tsx. No two neighbouring shots share a size and angle.
- edit: [{"shot","at"}], one per cut in time order, first at frame 0. A word cut lands 2 frames before the word.
- fx: [{"at",...}]. sound: {"clips":{name:[prompt,seconds]},"events":[[cue,clip,gain,"onset"|"peak",untilCue?]],"repeats","music","music_alt","levels":{"sfx_lu","music_lu"}} (see the sound reference).
Cues: word, word#2 (second occurrence, counting from the previous cue's word; write plain word when it is spoken once after the previous cue), word+3 (3 frames after), S3+2 (2 frames after shot S3 starts; fx and sound only), +18 (after the previous cut; edit only), s:4.2, f:126. Each shot's cue word must be spoken after the previous shot's cue word. A cue word must be spoken in the script and have no hyphen or plus sign.
narration.txt is the script texts, one line per row, with any asterisks removed. Spacing and a final newline do not matter. Generate it with a script from episode.json, never by hand.
shots.tsx: `export const S1 ... Sn`, one per shot id, built from the kit. index.tsx: `export const <name> = defineEpisode('<Id>', {...})` exactly as in the example, <Id> equal to episode.json "id". Import only from '../../engine' and your own files; never from another episode.

## Hard rules
- Original characters only (Pip is "you", Mo the best friend, sis, mom, suit). No real people, third-party brands or famous characters.
- Never name other creators or channels, never imply any channel uses this pipeline or Claude.
- A hit that illustrates a word lands in the pause AFTER it (4 to 6 frames later), never on it.
- Pace: 27 or more cuts a minute, no hold over about 3 s without action. Cut by changing shot size.
- Never put a key, token or password in a file. No em or en dashes anywhere.
- Before replying, run a script (do not judge by eye) to check: every shot id has an export and an edit entry, every cue word is spoken, narration.txt matches the script text with spacing ignored, every number is in science.
'''
LOOK_T = r'''
## LOOK (required: this episode must NOT look like the example)
This episode's look is "@@LOOK@@". Use exactly these values. Never copy the example's colours, costumes, set mix or shot compositions.
- At the top of shots.tsx define once:
  const HERO = { ...LOOKS.pip, skin: '@@SKIN@@', skinShade: '@@SKINSHADE@@', hand: '@@SKIN@@', jacket: '@@JACKET@@', jacketShade: '@@JACKETSHADE@@', accent: '@@ACCENT@@', shoe: '@@SHOE@@', hair: '@@HAIR@@' };
  const FRIEND = { ...LOOKS.mo, jacket: '@@FJACKET@@', jacketShade: '@@FJACKETSHADE@@', accent: '@@FACCENT@@' };
  Pass look={HERO} (or look={FRIEND}) to EVERY <Hero>. Never use the default look or LOOKS.pipHood.
- index.tsx: defineEpisode('<Id>', { timeline, shots, bg: '@@BG@@', grain: @@GRAIN@@, vignette: @@VIG@@ }).
- Hand-drawn scenes: backgrounds from tones of @@BG@@, highlights in @@ACCENT@@ and @@JACKET@@, otherwise only neutral greys and white.
- Variety: at most a quarter of the shots in the same kit set; use at least 3 different kit sets or hand-drawn scenes; vary shot size and camera angle; open on a shot the example does not use.
'''
T += LOOK_T
if STYLE_TXT: T += '\n## STYLE (required): ' + style + '\nFollow this visual language in every shot. Where it conflicts with the example, this wins. Pace and hold rules still apply.\n' + STYLE_TXT.replace('@@', '') + '\n'
for k, v in {**PH, '@@TOPIC@@': topic, '@@PACK@@': pack, '@@STATUS@@': status, '@@SHAPE@@': shape, '@@SECS@@': str(secs), '@@WORDS@@': str(words), '@@CTA@@': cta, '@@MAXSHOTS@@': str(maxshots)}.items(): T = T.replace(k, v)
out = [T]
R = SK / 'references'
for n in (['formula'] if pack == 'what-if' else []) + ['look', 'kit', 'sound', 'traps']:
    out.append('\n----- BEGIN REFERENCE: %s.md -----\n%s\n----- END -----\n' % (n, rd(R / (n + '.md'))))
if ENG:
    sets = sorted(p.stem for p in (ENG / 'sets').glob('*.tsx')) if (ENG / 'sets').exists() else []
    out.append('\n----- BEGIN KIT: sets available: %s ; engine exports (src/engine/index.ts) -----\n%s\n----- END -----\n' % (', '.join(sets), rd(ENG / 'index.ts')))
if exd:
    try:
        d = json.loads(rd(exd / 'episode.json')); n = {}
        for k in ('shots', 'edit', 'fx'):
            if isinstance(d.get(k), list): n[k] = len(d[k]); d[k] = d[k][:6]
        if isinstance(d.get('sound'), dict) and isinstance(d['sound'].get('events'), list): n['sound.events'] = len(d['sound']['events']); d['sound']['events'] = d['sound']['events'][:6]
        if isinstance(d.get('science'), list): d['science'] = d['science'][:2]
        ej = json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '\n(shortened for this brief; the real file has %s)' % n
    except Exception: ej = rd(exd / 'episode.json')[:6000]
    out.append('\n----- BEGIN EXAMPLE (%s): episode.json -----\n%s\n----- END -----\n' % (exd.name, ej))
    out.append('\n----- BEGIN EXAMPLE: index.tsx -----\n%s\n----- END -----\n' % rd(exd / 'index.tsx'))
    out.append('\n----- BEGIN EXAMPLE: shots.tsx (first 45 lines: API pattern only, do NOT copy its colours, costumes or composition) -----\n%s\n----- END -----\n' % '\n'.join(rd(exd / 'shots.tsx').splitlines()[:45]))
cat = ST / 'library' / 'sfx' / 'catalog.json'
if cat.exists():
    try:
        cl = [e for e in json.loads(cat.read_text(encoding='utf-8')) if e.get('cached')]
        cl.sort(key=lambda e: -len(e.get('used_in', [])))
        if cl:
            out.append('\n----- BEGIN SFX LIBRARY (reuse before inventing) -----\nA cached clip costs no credits and no wait. To reuse one, copy its name, prompt and seconds into sound.clips CHARACTER FOR CHARACTER. Add a new clip only when none fits, with a generic name.\nname | seconds | prompt | LUFS\n' + '\n'.join('%s | %s | %s | %s' % (e['name'], e['secs'], e['prompt'], e.get('lufs')) for e in cl[:24]) + '\n----- END -----\n')
    except Exception: pass
body = ''.join(out); sys.stdout.write(body)
sys.stderr.write('brief: %d characters, about %d tokens\n' % (len(body), len(body) // 4))
