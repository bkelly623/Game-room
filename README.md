# Game Room

A family learning site. Each kid taps their name and sees the games a grown-up picked for them.

- `index.html` — "Who's playing?", each kid's game shelf, and the PIN-locked grown-up page (assign games, rename kids, see progress, start a game over).
- `play.html` — opens one game for one kid, with a back button, and logs play time.
- `games/<id>/` — each game. `games/_kid.js` gives every kid their own saves.
- `games/catalog.js` — the game list.

Progress is stored in the browser on each device. Static site: no build step.
