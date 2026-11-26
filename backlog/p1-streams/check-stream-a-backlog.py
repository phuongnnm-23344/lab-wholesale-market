import yaml,sys,collections
d=yaml.safe_load(open(sys.argv[1],encoding='utf-8'))
ids={i['id'] for i in d['issues']}; eps={e['id'] for e in d['epics']}|{'EP-CLAR'}
gapref={g['id'] for g in d['gaps']}; ps={x['id'] for k in ('spec_changes','assumptions','decisions') for x in d['premise'][k]}
err=[]
kids=collections.defaultdict(list)
for i in d['issues']:
  if i['epic'] not in eps: err.append(('epic',i['id']))
  if i['parent']:
    if i['parent'] not in ids: err.append(('parent',i['id']))
    kids[i['parent']].append(i)
  for x in i['depends_on']:
    if x not in ids: err.append(('dep',i['id'],x))
  if len(i['title'])>80: err.append(('title',i['id'],len(i['title'])))
for g in d['gaps']:
  if g['ref'] not in ids|ps: err.append(('gapref',g['id']))
for n in d['not_issued']:
  for x in n['covered_by']:
    if x not in ids: err.append(('cov',x))
for p in d['premise']['spec_changes']:
  for x in p['issues']:
    if x not in ids: err.append(('psiss',x))
leaves=[i for i in d['issues'] if i['id'] not in kids]
for i in leaves:
  h=i['hours_hint']
  if i['kind'] in('dev','test') and not 4<=h<=16: err.append(('hours',i['id'],h))
  if i['kind']=='clarify' and not 1<=h<=4: err.append(('hclr',i['id'],h))
for p,c in kids.items():
  par=next(i for i in d['issues'] if i['id']==p)
  s=sum(x['hours_hint'] for x in c)
  if par['hours_hint']!=s: err.append(('sum',p,par['hours_hint'],s))
print('ERR',err)
cnt=collections.Counter((i['epic'],'sub' if i['parent'] else 'top') for i in d['issues'])
for k in sorted(cnt): print(k,cnt[k])
kinds=collections.Counter(i['kind'] for i in leaves); print('leaf kinds',kinds)
tot=collections.defaultdict(int)
for i in leaves: tot[(i['epic'],i['kind'])]+=i['hours_hint']
for k in sorted(tot): print(k,tot[k])
print('leaf total',sum(i['hours_hint'] for i in leaves),'non-rough',sum(i['hours_hint'] for i in leaves if i['kind']!='rough'))
print('top',sum(1 for i in d['issues'] if not i['parent']),'sub',sum(1 for i in d['issues'] if i['parent']))
