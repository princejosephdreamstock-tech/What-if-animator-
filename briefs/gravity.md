You are writing a finished "What If" animated episode for a Remotion + SVG studio. Everything is code. Read this whole brief first, then work through it in order.

# THE EPISODE
Topic: What if gravity switched off for 10 seconds?
Slug: gravity
Format: short (1080x1920 (9:16))
Length: 1 min, about 170 words, about 30 shots
Style: same as glimpse60. Reuse shots from glimpse and glimpse60 only where they fit. A short (9:16) needs new vertical shots: safe zones top and bottom, bigger captions and labels, nothing important at the edges.
Must-have beats: follow the formula in references/formula.md, stretched to the length. Escalate the demos, put the real-science turn in the middle, and end on a question or cliffhanger.
Narration: write it yourself in the same voice as glimpse60, unless an existing episode.json is described at the end of this brief.

# WHAT YOU HAVE
Attached: wi_context.zip. It holds SKILL.md, references/ (formula, look, kit, sound, traps), the whole src/engine, the glimpse60 episode (episode.json, shots.tsx, index.tsx), src/episodes/index.ts, src/studio.config.ts and src/Root.tsx.
Read in this order: SKILL.md, references/formula.md, look.md, kit.md, sound.md, traps.md, then glimpse60's three files, then src/engine.
Use ONLY drawing, cast, set and animation functions that exist in src/engine. Never invent an API. If you need a new set or prop, build it with the room kit in a new file under src/engine/sets/, copy the style of the existing sets, and list it in README.txt.

# WHAT TO DELIVER
One zip named gravity_pack.zip with exactly this structure (paths from the studio root):
- src/episodes/gravity/episode.json
- src/episodes/gravity/shots.tsx
- src/episodes/gravity/index.tsx
- src/engine/sets/<new set>.tsx, only if you added sets
- README.txt: what is done, what is assumed, what is unverified
Do not touch any other file. Registration in src/episodes/index.ts is done by the machine.

episode.json must have: id (PascalCase), slug, format ("long" or "short"), minutes, topic, title (two lines), accent, power, script (one entry per beat, with the beat label), science, shots, edit, fx, sound.
- science: every number in the script gets claim, working and source. Real, checkable sources only. Mark anything you could not verify as "TO VERIFY" and soften that line in the script.
- shots: { id, size, set, key, note }. Vary size and angle every cut (wide, insert, medium, close-up, over the shoulder, high, low).
- edit: one cue per shot, cued on a word. A cue word that repeats in the narration needs the occurrence form that plan.py accepts (check wi.py and plan.py in the skill notes). Prefer unique words.
- sound: clips (prompt and length), one event per visible action cued to a shot, ambiences per location, music bed, levels starting at sfx_lu -6 and music_lu -12. A hit that illustrates a word lands just after the word, never on it. Reuse existing clips in library/sfx where you can, because new ones cost credits.

# PACE RULES
- Opening: 27+ cuts a minute. Overall about 30 shots per minute. No static shot over about 3 seconds.
- Every script line must be a picture. Read it aloud at pace.

# RENDER SAFETY (this machine has 913 MB of RAM and times out on heavy frames)
- No large blur or filter effects, no animated filters, no huge SVG paths, no hundreds of elements in one shot.
- Keep each shot light. Prefer simple shapes, gradients and transforms.

# RULES
- Original characters only (Pip, Mo and the existing cast). Nothing that resembles a famous cartoon character.
- Original story. Never claim any channel is made with Claude or any tool.
- Never print, paste or hardcode a key. Do not call ElevenLabs or spend any credits.

# HOW TO WORK
1. Work in batches of about 30 shots. After each batch, run `npx tsc --noEmit` if you have a shell. If you have no shell, say so, and copy the patterns in glimpse60/shots.tsx exactly.
2. Each shot is a pure function of its clock t and must be right at its key frame. Animation detail comes later.
3. Before delivering, check: every shot id in episode.json has a component in shots.tsx, every set used exists, every edit cue word appears in the narration, every science line has a source.
4. In your reply, list your assumptions and anything you could not verify. Keep it short.

# EXISTING EPISODE
src/episodes/gravity/episode.json is already written (see the attached gravity_pack.zip and its README.txt). Do NOT rewrite the script, shots, edit cues or fx unless a cue word fails or a science line is wrong. Your job is shots.tsx, index.tsx and any new sets. Resolve every item under "Known gaps" in the pack's README.txt, and verify or soften every science line marked TO VERIFY. If you change any script text, say exactly which lines.
