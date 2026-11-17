import urllib.request,json,time,statistics,concurrent.futures,hashlib,subprocess
from pathlib import Path
paths=['/','/merge-pdf/','/photo/','/signature/','/pdf-to-jpg/','/guides/prepare-application-documents/','/download-help/','/pdf-app.js','/pdf-core.js','/vendor/pdf-lib.js']
def check(p):
 runs=[]
 for i in range(3):
  start=time.perf_counter()
  try:
   with urllib.request.urlopen('https://yourspdf.netlify.app'+p,timeout=35) as r:
    first=time.perf_counter();b=r.read();runs.append({'status':r.status,'ttfb_ms':round((first-start)*1000,2),'total_ms':round((time.perf_counter()-start)*1000,2),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'cache_control':r.headers.get('cache-control')})
  except Exception as e:runs.append({'error':str(e)})
 good=[r for r in runs if 'status' in r];return {'path':p,'runs':runs,'median_total_ms':statistics.median(r['total_ms'] for r in good) if good else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:rows=list(pool.map(check,paths))
x={'method':'HTTP-only urllib, three sequential fetches per URL; four concurrent URL groups; no browser rendering, device or CPU throttling. Environment latency is included. Not Core Web Vitals.','rows':rows};Path('audit/http-baseline.json').write_text(json.dumps(x,indent=2))
print([(r['path'],r['median_total_ms']) for r in rows])
