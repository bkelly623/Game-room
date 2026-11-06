import os
D='/home/claude/kingswall/'
head=open(D+'a_head.html').read()
js=''.join(open(D+f).read()+'\n' for f in ['b_q.js','c_game.js','d_draw.js','e_ui.js'])
lv=open('/home/claude/family-hub/games/kingswall/levels.js').read()
# Game Room copy: shared levels file + kid shim
hub='<!doctype html><html lang="en"><head><script src="../_kid.js"></script><script src="levels.js"></script>\n'+head.replace('<body>','</head><body>',1)+'<script>\n'+js+'</script>\n</body></html>\n'
open('/home/claude/family-hub/games/kingswall/index.html','w').write(hub)
# standalone (artifact)
alone='<!doctype html><html lang="en"><head>\n'+head.replace('<body>','</head><body>',1)+'<script>\n'+lv+'\n'+js+'</script>\n</body></html>\n'
open(D+'kings-wall.html','w').write(alone)
os.makedirs('/tmp/claude-0/kwtest',exist_ok=True)
print(len(hub),len(alone))
