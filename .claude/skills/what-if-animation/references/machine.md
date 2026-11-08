# The machine contract (YOU write the scripts that implement this, into the zip)

Everything runs from the STUDIO folder (the one with src/episodes). Scripts go in scripts/ beside wi.py and plan.py and use
`from wi import ...` (sources are in this brief; never edit them, never put them in the zip). Never print an API key.
Env (or .env, read with wi.read_env): ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, optional ELEVENLABS_MODEL (default eleven_multilingual_v2).

## voice.py <slug> [--dry]
- Reads src/episodes/<slug>/episode.json. One ElevenLabs call per script[].text (strip *stars*). Cache each line in public/<slug>/vo/ keyed by
  a hash of voice+model+text, so a rerun costs nothing.
- API: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128, header xi-api-key,
  JSON body {"text","model_id"}. The reply has audio_base64 and alignment{characters, character_start_times_seconds,
  character_end_times_seconds}. Use wi.api for the call.
- Trim silence at each line's ends (keep about 30 ms before, 70 ms after), join with a pause: 0.30 s after . ? ! else 0.12 s
  (episode.json "gap" overrides), start with 0.2 s of silence.
- Write public/<slug>/voice.wav (wi.write_wav, peak 0.9) and src/episodes/<slug>/words.json = [{"w","s","e"}], seconds on the FINAL
  joined timeline, one entry per spoken word (split on whitespace). plan.py reads exactly this.
- --dry prints the line count and characters to record, and exits without a call. Log credits with wi.spent_since and wi.log_cost.

## sfx.py <slug> [--dry]   (runs after voice.py and plan.py; reads timeline.json and words.json)
- For each sound.clips entry name: [prompt, seconds], generate once with POST /v1/sound-generation (JSON {"text","duration_seconds",
  "prompt_influence"}; the reply is audio bytes). Verify the request shape against the current ElevenLabs docs if you can browse.
  Cache with wi.clip_path(name, prompt, secs). Peak-level every clip before gain.
- Cue to frame: wi.resolve(cue, words, fps, timeline["segments"], shot_ids).
- events [cue, clip, gain, mode?, untilCue?]: mode "onset" (default) puts the first audible moment on the cue, "peak" puts the loudest
  moment on it. With untilCue the clip is a bed: loop it (crossfade) and fade it out to fill cue..untilCue.
- repeats [{at, clip, n, every (frames), gain [from,to], pitch [from,to] (optional)}]: n copies every N frames, gain and pitch ramped.
- music {clip, from?, until?} and music_alt {clip, from, until}: a looped bed, 0.4 s fade in, 0.5 s fade out.
- Write public/<slug>/sfx.wav and music.wav (mono 44.1 kHz). Set timeline.json audio: {voice, sfx, music: "<slug>/<file>", voiceVol,
  sfxVol, musicVol}. plan.py keeps keys ending in Vol. Volumes: measure with wi.loudness so the sfx stem sits sound.levels.sfx_lu LU
  and music sits sound.levels.music_lu LU against the voice (default voiceVol 0.8).
- --dry lists which clips are not yet cached.

## master.py <slug>
- Mix voice, sfx, music at the timeline.json volumes (ffmpeg amix normalize=0), master to -14 LUFS, true peak -1 dBTP (loudnorm), write
  out/<slug>/mix.wav. If out/<slug>/video.mp4 (a SILENT render) exists, mux out/<slug>/final.mp4 (copy video, aac 320k, -shortest).

## RUN.sh (bash, set -e, slug fixed inside)
1. cd to its own folder. Make scripts/ if needed; copy wi.py, plan.py and check_episode.py from the skill scripts folder given in this
   brief if they are not in scripts/ yet. [ -f package.json ] || cp package.json.new package.json. [ -d node_modules ] || npm install.
2. Stop with a clear message if ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not set (environment or .env). Never print them.
3. python3 scripts/check_episode.py <slug>, then voice.py <slug> --dry, then (unless "bash RUN.sh dry") voice.py, plan.py, sfx.py,
   npx remotion render src/index.ts <Id> out/<slug>/video.mp4 --muted, master.py. Print the path of final.mp4.
