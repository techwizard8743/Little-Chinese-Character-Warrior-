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
- Real group words have been curated through all 125 levels / character id 2500.
- Latest curated batches filled levels 49-125 and added pinyin corrections for `帖 -> tiè`, `幢 -> zhuàng`, `弹 -> tán`, `拧 -> nǐng`, `掺 -> chān`, `沈 -> shěn`, `爪 -> zhuǎ`, `甚 -> shèn`, `甸 -> diàn`, `瞭 -> liào`, `绩 -> jì`, `绷 -> bēng`, and `罗 -> luó`.
- A child-friendliness vocabulary pass softened several serious or adult examples while preserving the target character, such as `死亡 -> 死角`, `毒药 -> 消毒`, `焚烧 -> 焚香`, `硝烟 -> 硝石`, `罢工 -> 罢手`, and `犯罪 -> 罪过`.
- All `组词` entries currently include the target character.
- There are no remaining placeholder entries.

```text
0 remaining 待补词语 entries
0 remaining X字-style placeholder entries
```

## Current Uncommitted Work

As of this note, these files have local modifications:

```text
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
node -e "global.window={}; require('./word-data.js'); const rows=window.CHINESE_GAME_DATA.flatMap(level=>level.characters.map(c=>({level:level.id,id:c.id,hanzi:c.hanzi,pinyin:c.pinyin,word:c.word}))); const pending=rows.filter(c=>c.word==='待补词语'||c.word===c.hanzi+'字'); const noSelf=rows.filter(c=>c.word&&!c.word.includes(c.hanzi)); console.log(JSON.stringify({levels:window.CHINESE_GAME_DATA.length,total:rows.length,pendingStyle:pending.length,firstPendingStyle:pending[0]||null,noSelf:noSelf.length,firstNoSelf:noSelf[0]||null}, null, 2));"
```

Git is not available in the normal PATH on this machine. If needed, use GitHub Desktop's bundled Git:

```powershell
& 'C:\Users\leene\AppData\Local\GitHubDesktop\app-3.5.8\resources\app\git\cmd\git.exe' status --short
```

## Recommended Next Steps

1. Commit and push the completed `组词` curation and child-friendliness batch.
2. Playtest several late levels to make sure the quiz and three mini-games still feel smooth with the newly curated data.
3. Consider adding a small review/edit workflow later if the user wants to fine-tune vocabulary by age group.

## Fresh Session Prompt

Use this if starting a new thread or switching OpenAI accounts:

```text
Open this project:
C:\Users\leene\Documents\GitHub\Little-Chinese-Character-Warrior-

Read PROJECT_STATE.md first. Then inspect git status and continue from the current local files. The 组词 curation is complete for all 2,500 characters. The next task is probably a child-friendliness vocabulary pass, playtesting, or publishing the latest batch, unless I ask for something else.
```
