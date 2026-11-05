import os
D='/home/claude/blocks/'
head=open(D+'head.html').read()
js='\n'.join(open(D+f).read() for f in ['0_core.js','1_world.js','2_ents.js','3_ui.js'])
skel=open('/home/claude/family-hub/games/glorp/index.html').read()
skel=skel[:skel.index('<body>')+6]
art=head+"\n<script>(()=>{'use strict';\n"+js+"\nboot();})();</script>\n"
open(D+'block-party.html','w').write(art)
page=skel+'\n'+art
i=page.index('<head>')+6
page=page if '_kid.js' in page else page[:i]+'<script src="../_kid.js"></script>'+page[i:]
os.makedirs('/home/claude/family-hub/games/blocks',exist_ok=True)
open('/home/claude/family-hub/games/blocks/index.html','w').write(page)
print(len(page))
