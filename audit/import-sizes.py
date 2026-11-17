import json,re,subprocess,posixpath
from pathlib import Path
BASE='5e1efaa3e12aa7526550518dd9687923e1a36ffe'
def graph(before):
 seen={}
 def visit(p):
  if p in seen:return
  b=subprocess.check_output(['git','show',BASE+':dist/'+p]) if before else Path('dist',p).read_bytes()
  seen[p]=len(b)
  for dep in re.findall(r'''(?:import|export)\s+[^;\n]*?\s+from\s*['"]([^'"]+)''',b.decode()):
   if dep.startswith('.'):visit(posixpath.normpath(posixpath.join(posixpath.dirname(p),dep)))
 visit('pdf-app.js');return {'raw_bytes':sum(seen.values()),'modules':seen}
x={'method':'Static ES module import closure; uncompressed source bytes, not wire bytes or loading duration. Dynamic imports excluded.','baseline_commit':BASE,'before':graph(True),'after':graph(False)}
Path('audit/import-sizes.json').write_text(json.dumps(x,indent=2));print(json.dumps(x,indent=2))
