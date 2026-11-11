import os
s=open('/home/claude/racer/game.html').read().replace('/*WORDS*/',open('/home/claude/racer/words.js').read())
os.makedirs('/home/claude/family-hub/games/racer',exist_ok=True)
open('/home/claude/family-hub/games/racer/index.html','w').write(s)
open('/home/claude/racer/spell-racer.html','w').write(s.replace('<script src="../_kid.js"></script>\n',''))
print(len(s))
