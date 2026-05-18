# Project State: Little Chinese Character Warrior

Last updated: 2026-05-18

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
- `tools/generate-word-data.js`: source generator for `word-data.js`
- `3500-common.txt`: common character source list
- `hanzi-pinyin-table.json`: pinyin source table

The app can run by opening `index.html` directly, or by serving the folder locally.

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
- Real group words have been curated through level 96 / character id 1920.
- Latest curated batches filled levels 49-96 and added pinyin corrections for `帖 -> tiè`, `幢 -> zhuàng`, `弹 -> tán`, `拧 -> nǐng`, `掺 -> chān`, and `沈 -> shěn`.
- All non-placeholder `组词` entries currently include the target character.
- Current first remaining placeholder:

```text
Level 97, id 1921: 炕 / kàng / 待补词语
```

Current placeholder count:

```text
580 remaining 待补词语 entries
```

## Current Uncommitted Work

As of this note, these files have local modifications:

```text
app.js
index.html
styles.css
tools/generate-word-data.js
word-data.js
PROJECT_STATE.md
```

Before publishing, review in GitHub Desktop, commit, and push.

## Verification Commands

Run from the project folder:

```powershell
node --check app.js
node --check tools\generate-word-data.js
node --check word-data.js
node tools\generate-word-data.js
```

Count remaining placeholder group words:

```powershell
node -e "global.window={}; require('./word-data.js'); const pending=String.fromCharCode(0x5f85,0x8865,0x8bcd,0x8bed); const rows=window.CHINESE_GAME_DATA.flatMap(level=>level.characters.map(c=>({level:level.id,id:c.id,hanzi:c.hanzi,pinyin:c.pinyin,word:c.word}))); const first=rows.find(c=>c.word===pending); console.log(JSON.stringify({levels:window.CHINESE_GAME_DATA.length,total:rows.length,pending:rows.filter(c=>c.word===pending).length,firstPending:first}, null, 2));"
```

Git is not available in the normal PATH on this machine. If needed, use GitHub Desktop's bundled Git:

```powershell
& 'C:\Users\leene\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\cmd\git.exe' status --short
```

## Recommended Next Steps

1. Continue replacing `待补词语` from level 97 onward.
2. Do a child-friendliness pass on curated words and replace any examples that feel too adult, rare, or abstract.
3. Commit and push after each meaningful batch so GitHub Pages stays easy to recover.
4. Consider adding a small in-app label for `待补词语` entries later, or temporarily hiding the `组词` line when no real word is available.

## Fresh Session Prompt

Use this if starting a new thread or switching OpenAI accounts:

```text
Open this project:
C:\Users\leene\Documents\GitHub\Little-Chinese-Character-Warrior-

Read PROJECT_STATE.md first. Then inspect git status and continue from the current local files. The next task is probably to continue replacing 待补词语 from level 97 onward, unless I ask for something else.
```
