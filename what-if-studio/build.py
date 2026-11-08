import json,glob,os
e=json.load(open('ep_head.json'))
S=[];E=[];F=[]
for p in sorted(glob.glob('shots_*.jsonl')):
    for l in open(p):
        l=l.strip()
        if not l: continue
        s=json.loads(l)
        a=s.pop('at'); k=s.pop('look',None); x=s.pop('fx',None)
        S.append(s)
        d={'shot':s['id'],'at':a}
        if k: d['look']=k
        E.append(d)
        if x: F.append({'at':s['id']+'+2','kind':x})
e['shots']=S;e['edit']=E;e['fx']=F
os.makedirs('src/episodes/gravity',exist_ok=True)
json.dump(e,open('src/episodes/gravity/episode.json','w'),indent=2)
print(len(S),'shots',sum(len(b['text'].split()) for b in e['script']),'words')
