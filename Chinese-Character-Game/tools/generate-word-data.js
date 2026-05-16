const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const COMMON_PATH = path.join(PROJECT_ROOT, "3500-common.txt");
const PINYIN_PATH = path.join(PROJECT_ROOT, "hanzi-pinyin-table.json");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "word-data.js");

const LEVEL_COUNT = 125;
const CHARACTERS_PER_LEVEL = 20;
const TOTAL_CHARACTERS = LEVEL_COUNT * CHARACTERS_PER_LEVEL;

const chapterNames = [
  "启蒙字", "家庭字", "自然字", "校园字", "身体字",
  "动作字", "时间字", "颜色字", "动物字", "食物字",
  "情绪字", "方向字", "交通字", "天气字", "节日字",
  "阅读字", "表达字", "故事字", "探索字", "写作字",
  "进阶字", "应用字", "理解字", "综合字", "毕业字"
];

const levelNames = Array.from({ length: LEVEL_COUNT }, (_, index) => {
  const chapter = chapterNames[Math.floor(index / 5)] || "综合字";
  return `${chapter} ${index % 5 + 1}`;
});

const customLessons = {
  "一": ["yī", 1, "一个", "表示数字 1。", "从左到右写一横。", "找一找身边的一个东西。"],
  "二": ["èr", 2, "二月", "表示数字 2。", "两横平平地写，上短下长。", "伸出两根手指读一读。"],
  "三": ["sān", 3, "三天", "表示数字 3。", "三横要排整齐，中间最短。", "数一数三个你喜欢的东西。"],
  "人": ["rén", 2, "大人", "表示人类。", "先撇，再捺。", "想想家里有哪些人。"],
  "口": ["kǒu", 3, "口水", "像张开的嘴巴。", "先竖，再横折，最后横。", "试着说一个带口的词。"],
  "手": ["shǒu", 4, "小手", "表示手和动作。", "先撇，再横，再横，最后竖钩。", "用手做个动作帮助记忆。"],
  "山": ["shān", 3, "高山", "像山峰的样子。", "中间竖最长。", "想一座高高的山。"],
  "水": ["shuǐ", 4, "水果", "表示水流。", "先中间竖钩，再左右点。", "说说每天为什么要喝水。"],
  "火": ["huǒ", 4, "火苗", "表示火焰。", "先点，再撇，再点，最后捺。", "联想温暖的火光。"],
  "日": ["rì", 4, "日出", "表示太阳。", "先写外框，再写中间一横。", "想一想早晨的太阳。"],
  "月": ["yuè", 4, "月亮", "表示月亮。", "先竖撇，再横折钩。", "晚上你见过月亮吗。"],
  "木": ["mù", 4, "木头", "表示树木。", "先横后竖，再撇捺。", "把它想成一棵树。"],
  "田": ["tián", 5, "田地", "像分开的田格。", "先外框，再写里面的十字。", "想想农田里种了什么。"],
  "上": ["shàng", 3, "上面", "表示位置在高处。", "先竖，再短横，最后长横。", "把手举到上面读一读。"],
  "下": ["xià", 3, "下面", "表示位置在低处。", "先横，再竖，最后点。", "看看桌子下面有什么。"],
  "大": ["dà", 3, "大树", "表示很大。", "先横，再撇，最后捺。", "张开手臂，做一个大大的动作。"],
  "小": ["xiǎo", 3, "小猫", "表示很小。", "先中间竖钩，再两边点。", "找一个小小的东西。"],
  "中": ["zhōng", 4, "中国", "表示中间。", "先写口，再写中间一竖。", "指一指纸的中间。"],
  "天": ["tiān", 4, "天空", "表示天空或日子。", "先两横，再写大。", "抬头看看天空。"],
  "地": ["dì", 6, "土地", "表示地面。", "左边土要写稳，右边也要站好。", "脚踩着的地方就是地。"],
  "子": ["zǐ", 3, "孩子", "表示小孩或儿女。", "先横撇，再弯钩，最后横。", "想想自己的名字里有没有这个音。"],
  "女": ["nǚ", 3, "女孩", "表示女性。", "先撇点，再撇，最后横。", "说一个带女字旁的字。"],
  "好": ["hǎo", 6, "好人", "表示好、喜欢。", "左边女，右边子，左右靠近。", "说一句今天的好事情。"],
  "学": ["xué", 8, "学习", "表示学习本领。", "上面别写太挤，下面子要站稳。", "想想今天学会了什么。"],
  "字": ["zì", 6, "汉字", "表示文字。", "上面宝盖要盖住下面的子。", "每个汉字都有自己的样子。"],
  "书": ["shū", 4, "书本", "表示书。", "注意横折钩和点的位置。", "找一本喜欢的书。"],
  "家": ["jiā", 10, "家人", "表示家。", "上面宝盖像屋顶，下面慢慢写。", "想想家里温暖的地方。"],
  "门": ["mén", 3, "大门", "表示门。", "先点，再竖，最后横折钩。", "想象推开一扇门。"],
  "心": ["xīn", 4, "开心", "表示心情和心脏。", "卧钩要写弯，三点分开。", "说一个让你开心的事。"],
  "爱": ["ài", 10, "爱心", "表示喜欢和关心。", "上中下分清楚，慢慢写。", "想一个你爱的人。"],
  "爸": ["bà", 8, "爸爸", "表示爸爸。", "上面父，下面巴。", "读一读爸爸这个词。"],
  "妈": ["mā", 6, "妈妈", "表示妈妈。", "左边女，右边马。", "读一读妈妈这个词。"],
  "爷": ["yé", 6, "爷爷", "表示爷爷。", "上面父，下面节。", "想想爷爷的样子。"],
  "奶": ["nǎi", 5, "奶奶", "表示奶奶或牛奶。", "左边女，右边乃。", "读一读奶奶这个词。"],
  "目": ["mù", 5, "目光", "表示眼睛。", "像一个竖起来的眼睛。", "用眼睛看一看这个字。"],
  "耳": ["ěr", 6, "耳朵", "表示耳朵。", "横竖要排整齐。", "摸摸自己的耳朵。"],
  "足": ["zú", 7, "足球", "表示脚和足够。", "上面口小，下面脚要站稳。", "跺跺脚读一读。"],
  "车": ["chē", 4, "汽车", "表示车。", "最后一竖要写直。", "说一种你见过的车。"],
  "云": ["yún", 4, "白云", "表示云。", "两横加撇折点。", "看看天上有没有云。"],
  "雨": ["yǔ", 8, "下雨", "表示雨。", "四个点像雨滴。", "想想下雨的声音。"],
  "风": ["fēng", 4, "大风", "表示风。", "外框写稳，里面撇点像风在动。", "做一个吹风的动作。"],
  "花": ["huā", 7, "花朵", "表示花。", "上面草字头，下面化。", "想一种你喜欢的花。"],
  "草": ["cǎo", 9, "小草", "表示草。", "上面草字头，下面早。", "想一片绿色的小草。"],
  "米": ["mǐ", 6, "大米", "表示米粒。", "先点撇，再横竖，最后撇捺。", "想一碗米饭。"],
  "鱼": ["yú", 8, "小鱼", "表示鱼。", "上中下看清楚，底横托住。", "想一条游来游去的小鱼。"],
  "鸟": ["niǎo", 5, "小鸟", "表示鸟。", "点像小鸟的眼睛。", "想一只会唱歌的小鸟。"]
};

const starterOrder = Object.keys(customLessons);
const pinyinOverrides = {
  "地": "dì",
  "子": "zǐ",
  "啰": "luō"
};

function readCommonCharacters() {
  const text = fs.readFileSync(COMMON_PATH, "utf8");
  return Array.from(text.replace(/\s+/g, ""));
}

function readPinyinTable() {
  return JSON.parse(fs.readFileSync(PINYIN_PATH, "utf8"));
}

function getPinyin(character, pinyinTable) {
  if (pinyinOverrides[character]) {
    return pinyinOverrides[character];
  }

  const entry = pinyinTable[character];
  if (Array.isArray(entry) && entry.length > 0) {
    return entry[0];
  }

  return "";
}

function createGeneratedLesson(character, pinyinTable) {
  const custom = customLessons[character];
  if (custom) {
    const [pinyin, strokes, word, meaning, writingTip, memoryTip] = custom;
    return [character, pinyin, strokes, word, meaning, writingTip, memoryTip, "curated"];
  }

  return [
    character,
    getPinyin(character, pinyinTable),
    null,
    `${character}字`,
    `常用汉字“${character}”。先会认，再慢慢会写。`,
    "看清字形，一笔一笔慢慢写。",
    `试着用“${character}”说一句话。`,
    "generated"
  ];
}

function buildCharacterOrder(commonCharacters) {
  const commonSet = new Set(commonCharacters);
  const selected = [];
  const seen = new Set();

  for (const character of starterOrder) {
    if (commonSet.has(character) && !seen.has(character)) {
      selected.push(character);
      seen.add(character);
    }
  }

  for (const character of commonCharacters) {
    if (!seen.has(character)) {
      selected.push(character);
      seen.add(character);
    }
    if (selected.length >= TOTAL_CHARACTERS) {
      break;
    }
  }

  return selected.slice(0, TOTAL_CHARACTERS);
}

function buildOutput(rows) {
  return `// Generated by tools/generate-word-data.js.
// Source files: 3500-common.txt, hanzi-pinyin-table.json

const levelNames = ${JSON.stringify(levelNames, null, 2)};

const characterRows = ${JSON.stringify(rows, null, 2)};

function createCharacter(row, index) {
  return {
    id: index + 1,
    hanzi: row[0],
    pinyin: row[1],
    strokes: row[2],
    word: row[3],
    meaning: row[4],
    writingTip: row[5],
    memoryTip: row[6],
    status: row[7]
  };
}

window.CHINESE_GAME_DATA = Array.from({ length: ${LEVEL_COUNT} }, (_, levelIndex) => {
  const levelRows = characterRows.slice(
    levelIndex * ${CHARACTERS_PER_LEVEL},
    (levelIndex + 1) * ${CHARACTERS_PER_LEVEL}
  );

  return {
    id: levelIndex + 1,
    title: \`第 \${levelIndex + 1} 关 · \${levelNames[levelIndex]}\`,
    subtitle: "本关包含 20 个常用字，全部会认后就能开宝箱。",
    targetCount: ${CHARACTERS_PER_LEVEL},
    characters: levelRows.map((row, rowIndex) => createCharacter(
      row,
      levelIndex * ${CHARACTERS_PER_LEVEL} + rowIndex
    ))
  };
});
`;
}

function main() {
  const commonCharacters = readCommonCharacters();
  const pinyinTable = readPinyinTable();
  const selectedCharacters = buildCharacterOrder(commonCharacters);
  const rows = selectedCharacters.map((character) => createGeneratedLesson(character, pinyinTable));
  const missingPinyin = rows.filter((row) => !row[1]).map((row) => row[0]);

  if (selectedCharacters.length !== TOTAL_CHARACTERS) {
    throw new Error(`Expected ${TOTAL_CHARACTERS} characters, found ${selectedCharacters.length}.`);
  }

  if (missingPinyin.length > 0) {
    throw new Error(`Missing pinyin for: ${missingPinyin.join(", ")}`);
  }

  fs.writeFileSync(OUTPUT_PATH, buildOutput(rows), "utf8");
  console.log(`Generated ${rows.length} characters in ${OUTPUT_PATH}`);
}

main();
