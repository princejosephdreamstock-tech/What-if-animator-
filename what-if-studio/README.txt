promo_pack.zip: a 1 minute promo for the pipeline (slug: promo, composition: PromoPipeline, 1920x1080).

  cd <studio folder>            (the one with src/episodes and package.json)
  unzip -o promo_pack.zip
  bash RUN.sh dry               checks everything, counts voice characters, spends nothing
  bash RUN.sh                   voice, plan, sound, render, master -> out/promo/final.mp4

Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (environment or .env). Never printed, never bundled.
RUN.sh adds the episode to src/episodes/index.ts once. Shots S24-S27 are re-exported from src/episodes/glimpse60/shots.tsx,
so that folder must stay in the studio. Env REMOTION_CONCURRENCY (default 2) lowers memory use on a small VM.
