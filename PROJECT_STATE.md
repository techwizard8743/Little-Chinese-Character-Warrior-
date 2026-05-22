# Project State: Little Chinese Character Warrior

Last updated: 2026-05-22

## Source Of Truth

Use this folder:

```text
C:\Users\leene\Documents\GitHub\Little-Chinese-Character-Warrior-
```

Do not use the old folder:

```text
C:\Users\leene\Documents\Chinese-Character-Game
```

The old folder was deleted. The GitHub folder is the active project.

Live GitHub Pages site:

```text
https://techwizard8743.github.io/Little-Chinese-Character-Warrior-/
```

## Project Summary

This is a zero-dependency static web game for kids learning Chinese characters.

Core files:

- `index.html`: page structure
- `styles.css`: layout and visual design
- `app.js`: app logic, progress, quiz flow, mini-games
- `word-data.js`: generated level/character data
- `manifest.webmanifest`: PWA install metadata
- `service-worker.js`: offline cache behavior
- `icons/`: install/home-screen icons
- `tools/generate-word-data.js`: source generator for `word-data.js`
- `3500-common.txt`: common character source list
- `hanzi-pinyin-table.json`: pinyin source table

The app can run by opening `index.html` directly, or by serving the folder locally.
PWA install/offline support requires the GitHub Pages site or a local HTTP server, not direct `file://` opening.

Useful local preview URL if a static server is running:

```text
http://127.0.0.1:51665/index.html
```

## Current App Behavior

- 125 levels.
- 20 characters per level.
- 2,500 total characters.
- Each level shows a 20-character overview grid.
- The main learning card is simplified to a large character, large pinyin, and large `组词`.
- The large character card uses a writing-practice grid with diagonal guidelines.
- The quiz tests all 20 characters in the level until every character is answered correctly once.
- Wrong answers are added to the review book and reappear later in the quiz queue.
- After a level is mastered, the child chooses one mini-game:
  - 汉字泡泡
  - 接宝箱
  - 贪食蛇
- Mini-games use large pinyin prompts and ask the child to identify the matching character.
- Reward mini-games can be played at most 3 times per level.
- Reset progress asks for confirmation before clearing saved progress.
- Progress is stored in browser `localStorage`, so closing the browser preserves progress on the same browser/device.
- The app can be installed to a phone or desktop home screen as a PWA, and the core game files are cached for offline reopening after the first online visit.

## Recent Changes

The old top block was removed and the GUI was simplified for a cleaner kids-focused layout.

The middle learning card was simplified:

- Removed extra panels like `认一认`, `写一写`, `想一想`.
- Removed stroke-count display from the visible card.
- Enlarged pinyin and `组词`.
- Kept the character writing grid.

The fake group-word issue was addressed:

- The generator no longer creates fake entries like `X字` or `X词`.
- Unknown group words show `待补词语` honestly instead of pretending to be real words.
- `严` now maps to `严格`.
- Real group words have been curated through all 125 levels / character id 2500.
- Latest curated batches filled levels 49-125 and added pinyin corrections for `帖 -> tiè`, `幢 -> zhuàng`, `弹 -> tán`, `拧 -> nǐng`, `掺 -> chān`, `沈 -> shěn`, `爪 -> zhuǎ`, `甚 -> shèn`, `甸 -> diàn`, `瞭 -> liào`, `绩 -> jì`, `绷 -> bēng`, and `罗 -> luó`.
- A child-friendliness vocabulary pass softened several serious or adult examples while preserving the target character, such as `死亡 -> 死角`, `毒药 -> 消毒`, `焚烧 -> 焚香`, `硝烟 -> 硝石`, `罢工 -> 罢手`, and `犯罪 -> 罪过`.
- A QA pass fixed stale mini-game feedback so 泡泡、接宝箱、贪食蛇 messages now follow the currently selected game instead of leaking from a previous game.
- A game-mechanics pass fixed 接宝箱 wrong/bomb catches so the whole falling wave does not abruptly refresh, and changed 贪食蛇 easy-mode wrong-character hits to shrink the snake by one segment before costing a life.
- 贪食蛇 now starts in easy mode by default; the child can still turn on 困难模式 with the toggle.
- 汉字泡泡 and 接宝箱 now show short visual feedback: thumbs-up for correct actions and an explosion burst for wrong characters, bombs, or misses.
- A hidden parent/developer test mode was added. Open the app with `?debug=1` to jump levels, unlock through a level, mark the current level as mastered, or clear the current level's mini-game play counts for retesting.
- `README.md` was refreshed for GitHub visitors with the live Pages link, current game behavior, progress-saving notes, and debug-mode instructions.
- An iPhone polish pass moved the lesson/game flow above the long level map on narrow screens, tightened the learning cards, enlarged touch targets, kept the game pinyin header compact/sticky, added tap/drag control for 接宝箱, and added tap/swipe control for 贪食蛇. On iPhone-sized screens, the small direction button row is hidden so the playing field itself is the control.
- PWA support was added with `manifest.webmanifest`, `service-worker.js`, SVG/PNG install icons, Apple home-screen metadata, and README install instructions.
- All `组词` entries currently include the target character.
- There are no remaining placeholder entries.

```text
0 remaining 待补词语 entries
0 remaining X字-style placeholder entries
```

## Current Working Set

As of this note, the expected local modifications for the current task are:

```text
app.js
icons/
index.html
manifest.webmanifest
PROJECT_STATE.md
README.md
service-worker.js
```

Before publishing, review these files in GitHub Desktop, commit, and push. After the commit, Git should be clean again.

## Verification Commands

Run from the project folder:

```powershell
node --check app.js
node --check service-worker.js
node --check tools\generate-word-data.js
node --check word-data.js
node tools\generate-word-data.js
```

Count remaining placeholder group words:

```powershell
node -e "global.window={}; require('./word-data.js'); const rows=window.CHINESE_GAME_DATA.flatMap(level=>level.characters.map(c=>({level:level.id,id:c.id,hanzi:c.hanzi,pinyin:c.pinyin,word:c.word}))); const pending=rows.filter(c=>c.word==='待补词语'||c.word===c.hanzi+'字'); const noSelf=rows.filter(c=>c.word&&!c.word.includes(c.hanzi)); console.log(JSON.stringify({levels:window.CHINESE_GAME_DATA.length,total:rows.length,pendingStyle:pending.length,firstPendingStyle:pending[0]||null,noSelf:noSelf.length,firstNoSelf:noSelf[0]||null}, null, 2));"
```

Git is not available in the normal PATH on this machine. If needed, use GitHub Desktop's bundled Git:

```powershell
& 'C:\Users\leene\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\cmd\git.exe' status --short
```

## Recommended Next Steps

1. Manually test the iPhone layout using the live site or local file with `?debug=1`.
2. On iPhone, verify 汉字泡泡 taps, 接宝箱 drag control, and 贪食蛇 swipe control.
3. Commit and push the iPhone polish update after the manual check feels right.
4. After PWA deployment, test iPhone Safari "Add to Home Screen" from the live GitHub Pages site and reopen once in airplane mode.
5. iPad-specific layout customization is intentionally postponed.

## Fresh Session Prompt

Use this if starting a new thread or switching OpenAI accounts:

```text
Open this project:
C:\Users\leene\Documents\GitHub\Little-Chinese-Character-Warrior-

Read PROJECT_STATE.md first. Then inspect git status and continue from the current local files. The 组词 curation is complete for all 2,500 characters. A hidden `?debug=1` test mode and refreshed README were added. The latest local work adds PWA install/offline support with a manifest, service worker, icons, and README install instructions. The next task is probably browser/iPhone PWA testing, committing/pushing the latest local changes, or adding the next learning feature, unless I ask for something else.
```
