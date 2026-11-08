"""python scripts/master.py <slug>
Step 8. Mixes voice, sfx and music at the timeline.json volumes, masters to -14 LUFS with true peak -1 dBTP (two-pass
loudnorm) into out/<slug>/mix.wav, and, if out/<slug>/video.mp4 (a silent render) exists, muxes out/<slug>/final.mp4.
Also writes out/<slug>/report.json."""
import json, re, subprocess, sys
import wi


def run(args):
    r = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    if r.returncode:
        sys.exit('ffmpeg failed:\n' + r.stderr[-1500:])
    return r.stderr


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    slug = sys.argv[1]
    tl = wi.load_json(wi.ep_dir(slug) / 'timeline.json')
    if not tl:
        sys.exit('No timeline.json: run plan.py first.')
    A, pub, out = tl.get('audio', {}), wi.STUDIO / 'public', wi.out_dir(slug)
    dur = tl['total'] / tl['fps']
    ins, chains = [], []
    for k, i in (('voice', 'voiceVol'), ('sfx', 'sfxVol'), ('music', 'musicVol')):
        if A.get(k) and (pub / A[k]).exists():
            ins += ['-i', str(pub / A[k])]
            chains.append(f'[{len(chains)}]volume={A.get(i, 1.0)}[a{len(chains)}]')
    if not chains:
        sys.exit('No audio stems found in timeline.json audio.')
    mix = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(len(chains))) + f'amix=inputs={len(chains)}:normalize=0:duration=longest,apad=whole_dur={dur:.3f},atrim=0:{dur:.3f}'
    LN = 'loudnorm=I=-14:TP=-1.5:LRA=11'
    err = run(['ffmpeg', '-hide_banner', '-nostats', *ins, '-filter_complex', mix + f',{LN}:print_format=json', '-f', 'null', '-'])
    m = json.loads(err[err.rfind('{'):err.rfind('}') + 1])
    ln2 = f'{LN}:measured_I={m["input_i"]}:measured_TP={m["input_tp"]}:measured_LRA={m["input_lra"]}:measured_thresh={m["input_thresh"]}:offset={m["target_offset"]}:linear=true'
    mixwav = out / 'mix.wav'
    run(['ffmpeg', '-y', '-hide_banner', '-nostats', *ins, '-filter_complex', mix + ',' + ln2, '-ar', '44100', '-ac', '2', str(mixwav)])
    lufs, tp = wi.loudness(mixwav)
    print(f'mix.wav {dur:.1f} s, {lufs:.1f} LUFS, true peak {tp:.1f} dBFS')
    if tp > -1.0:
        print('  ! true peak is above -1 dBTP: lower sfx_lu or music_lu and re-run sfx.py')
    final = None
    video = out / 'video.mp4'
    if video.exists():
        final = out / 'final.mp4'
        run(['ffmpeg', '-y', '-hide_banner', '-nostats', '-i', str(video), '-i', str(mixwav), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-shortest', str(final)])
        print('final:', final)
    cuts = len(tl['segments']) - 1
    costs = wi.load_json(out / 'costs.json', [])
    wi.save_json(out / 'report.json', {
        'slug': slug, 'seconds': round(dur, 2), 'lufs': lufs, 'true_peak_dbfs': tp, 'cuts_per_min': round(cuts / dur * 60, 1),
        'credits': sum(c['credits'] for c in costs), 'final': str(final) if final else None,
    })
    if not final:
        print('No out/%s/video.mp4 yet: mix only.' % slug)


main()
