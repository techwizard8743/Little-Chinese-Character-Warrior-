const STORAGE_KEY = "hanzi-hero-progress-v5";
const LEGACY_STORAGE_KEY = "hanzi-hero-progress-v4";
const levels = window.CHINESE_GAME_DATA;
const CHARACTERS_PER_LEVEL = 20;
const TOTAL_CHARACTERS = levels.reduce((total, level) => total + level.characters.length, 0);
const SNAKE_GRID_SIZE = 10;
const SNAKE_TARGET_COUNT = 6;
const SNAKE_LIVES = 3;
const BUBBLE_TARGET_COUNT = 6;
const BUBBLE_LIVES = 3;
const BUBBLE_ROUND_MS = 6200;
const CATCH_TARGET_COUNT = 6;
const CATCH_LIVES = 3;
const CATCH_LANES = 5;
const CATCH_END_ROW = 7;
const CATCH_TICK_MS = 420;
const MAX_REWARD_PLAYS = 3;
const SNAKE_TICK_MS = 520;
const SNAKE_DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};
const STICKERS = [
  { id: "rocket", emoji: "🚀", name: "火箭贴纸" },
  { id: "lion", emoji: "🦁", name: "狮子贴纸" },
  { id: "crown", emoji: "👑", name: "皇冠贴纸" },
  { id: "rainbow", emoji: "🌈", name: "彩虹贴纸" },
  { id: "robot", emoji: "🤖", name: "机器人贴纸" },
  { id: "star", emoji: "⭐", name: "闪亮贴纸" },
  { id: "castle", emoji: "🏰", name: "城堡贴纸" },
  { id: "dragon", emoji: "🐉", name: "小龙贴纸" }
];

const state = {
  progress: loadProgress(),
  selectedLevelId: 1,
  focusCharacterIndex: 0,
  quizQueue: [],
  quizStarted: false,
  currentAnswered: false,
  mode: "level",
  activeRewardGame: "bubble",
  rewardGameStarted: false,
  treasureRound: 0,
  treasureTargetId: null,
  treasureOptions: [],
  treasureReward: null,
  snake: [],
  snakeDirection: "right",
  snakeNextDirection: "right",
  snakeLives: SNAKE_LIVES,
  snakeTargets: [],
  snakeMessage: "",
  snakeHardMode: true,
  snakeTimerId: null,
  bubbleLives: BUBBLE_LIVES,
  bubbleTargets: [],
  bubbleMessage: "",
  bubbleTimerId: null,
  catchLives: CATCH_LIVES,
  catchTargets: [],
  catchBasketLane: Math.floor(CATCH_LANES / 2),
  catchMessage: "",
  catchTimerId: null
};

const elements = {
  currentLevelLabel: document.getElementById("current-level-label"),
  masteredCount: document.getElementById("mastered-count"),
  rewardStars: document.getElementById("reward-stars"),
  reviewCount: document.getElementById("review-count"),
  stickerCount: document.getElementById("sticker-count"),
  levelGrid: document.getElementById("level-grid"),
  lessonTitle: document.getElementById("lesson-title"),
  lessonSubtitle: document.getElementById("lesson-subtitle"),
  stageOverviewTitle: document.getElementById("stage-overview-title"),
  stageOverviewProgress: document.getElementById("stage-overview-progress"),
  levelProgressFill: document.getElementById("level-progress-fill"),
  stageOverviewGrid: document.getElementById("stage-overview-grid"),
  focusCharacter: document.getElementById("focus-character"),
  focusPinyin: document.getElementById("focus-pinyin"),
  focusStrokes: document.getElementById("focus-strokes"),
  focusWord: document.getElementById("focus-word"),
  meaningText: document.getElementById("meaning-text"),
  writingTip: document.getElementById("writing-tip"),
  memoryTip: document.getElementById("memory-tip"),
  questionType: document.getElementById("question-type"),
  questionPrompt: document.getElementById("question-prompt"),
  questionOptions: document.getElementById("question-options"),
  quizStartPanel: document.getElementById("quiz-start-panel"),
  startQuiz: document.getElementById("start-quiz"),
  questionCard: document.getElementById("question-card"),
  quizProgress: document.getElementById("quiz-progress"),
  quizScore: document.getElementById("quiz-score"),
  feedbackText: document.getElementById("feedback-text"),
  nextQuestion: document.getElementById("next-question"),
  quizActions: document.getElementById("quiz-actions"),
  shuffleLevel: document.getElementById("shuffle-level"),
  resetProgress: document.getElementById("reset-progress"),
  poolSummary: document.getElementById("pool-summary"),
  phasePill: document.getElementById("phase-pill"),
  reviewBookTotal: document.getElementById("review-book-total"),
  reviewPriority: document.getElementById("review-priority"),
  reviewBookList: document.getElementById("review-book-list"),
  practiceReview: document.getElementById("practice-review"),
  printReview: document.getElementById("print-review"),
  printSummary: document.getElementById("print-summary"),
  printGrid: document.getElementById("print-grid"),
  miniGameChoice: document.getElementById("mini-game-choice"),
  startBubble: document.getElementById("start-bubble"),
  startCatch: document.getElementById("start-catch"),
  startReward: document.getElementById("start-reward"),
  rewardStatus: document.getElementById("reward-status"),
  rewardStrip: document.getElementById("reward-strip"),
  treasureIntro: document.getElementById("treasure-intro"),
  treasureTarget: document.getElementById("treasure-target"),
  treasureProgress: document.getElementById("treasure-progress"),
  snakeLives: document.getElementById("snake-lives"),
  treasureGrid: document.getElementById("treasure-grid"),
  treasureFeedback: document.getElementById("treasure-feedback"),
  snakeHardModeWrap: document.getElementById("snake-hard-mode-wrap"),
  snakeHardMode: document.getElementById("snake-hard-mode"),
  snakeControls: document.getElementById("snake-controls"),
  snakeUp: document.getElementById("snake-up"),
  snakeDown: document.getElementById("snake-down"),
  snakeLeft: document.getElementById("snake-left"),
  snakeRight: document.getElementById("snake-right"),
  stickerList: document.getElementById("sticker-list")
};

initialize();

function initialize() {
  attachEvents();
  elements.snakeHardMode.checked = state.snakeHardMode;
  selectLevel(Math.min(state.progress.unlockedLevel, levels.length));
  updateHeaderStats();
  renderStickerBook();
}

function attachEvents() {
  elements.nextQuestion.addEventListener("click", () => {
    if (state.mode === "treasure-ready") {
      focusMiniGameChoices();
      return;
    }

    if (state.mode === "review" && state.quizQueue.length === 0) {
      state.mode = "level";
      state.quizStarted = false;
      buildQuizQueue("level");
      renderCurrentLevel();
      return;
    }

    if (
      state.quizQueue.length === 0
      && state.progress.treasureClearedLevels.includes(state.selectedLevelId)
      && state.selectedLevelId < state.progress.unlockedLevel
    ) {
      selectLevel(state.selectedLevelId + 1);
      return;
    }

    state.currentAnswered = false;
    renderCurrentLevel();
  });

  elements.startQuiz.addEventListener("click", () => {
    state.quizStarted = true;
    buildQuizQueue(state.mode);
    renderCurrentLevel();
  });

  elements.shuffleLevel.addEventListener("click", () => {
    goToNextCharacterOrLevel();
  });

  elements.resetProgress.addEventListener("click", () => {
    const confirmed = window.confirm("确定要重置所有进度吗？会清空已会汉字、星星、贴纸和错题本。");
    if (!confirmed) {
      return;
    }

    state.progress = defaultProgress();
    saveProgress();
    selectLevel(1);
    updateHeaderStats();
    renderReviewBook();
    renderStickerBook();
  });

  elements.practiceReview.addEventListener("click", () => {
    state.mode = "review";
    state.quizStarted = true;
    buildQuizQueue("review");
    renderCurrentLevel();
  });

  elements.printReview.addEventListener("click", () => {
    renderPrintSheet();
    document.body.classList.add("printing-review");
    window.print();
  });

  elements.startBubble.addEventListener("click", () => {
    startTreasureStage("bubble");
  });

  elements.startCatch.addEventListener("click", () => {
    startTreasureStage("catch");
  });

  elements.startReward.addEventListener("click", () => {
    startTreasureStage("snake");
  });

  [
    ["up", elements.snakeUp],
    ["down", elements.snakeDown],
    ["left", elements.snakeLeft],
    ["right", elements.snakeRight]
  ].forEach(([direction, button]) => {
    button.addEventListener("click", () => {
      if (state.mode === "treasure" && state.activeRewardGame === "catch") {
        moveCatchBasket(direction);
        return;
      }
      setSnakeDirection(direction);
    });
  });

  elements.snakeHardMode.addEventListener("change", () => {
    state.snakeHardMode = elements.snakeHardMode.checked;
    state.snakeMessage = state.snakeHardMode
      ? "困难模式：撞墙会少一颗心。"
      : "轻松模式：穿墙会从另一边出来。";
    renderTreasurePanel();
  });

  window.addEventListener("keydown", (event) => {
    const keyDirections = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right"
    };
    const direction = keyDirections[event.key];
    if (direction && state.mode === "treasure" && state.activeRewardGame === "snake") {
      event.preventDefault();
      setSnakeDirection(direction);
    }
    if (
      direction
      && state.mode === "treasure"
      && state.activeRewardGame === "catch"
      && (direction === "left" || direction === "right")
    ) {
      event.preventDefault();
      moveCatchBasket(direction);
    }
  });

  window.addEventListener("afterprint", () => {
    document.body.classList.remove("printing-review");
  });
}

function focusMiniGameChoices() {
  if (elements.miniGameChoice.scrollIntoView) {
    elements.miniGameChoice.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (elements.startBubble.focus) {
    elements.startBubble.focus();
  }
}

function defaultProgress() {
  return {
    unlockedLevel: 1,
    masteredCharacters: [],
    reviewBook: {},
    completedLevels: [],
    treasureClearedLevels: [],
    snakePlayCounts: {},
    bubblePlayCounts: {},
    catchPlayCounts: {},
    rewardStars: 0,
    stickers: [],
    pendingRewardLevel: null
  };
}

function loadProgress() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
    || window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) {
    return defaultProgress();
  }

  try {
    const parsed = { ...defaultProgress(), ...JSON.parse(saved) };
    parsed.unlockedLevel = Math.max(1, Math.min(Number(parsed.unlockedLevel || 1), levels.length));
    parsed.masteredCharacters = Array.isArray(parsed.masteredCharacters) ? parsed.masteredCharacters : [];
    parsed.completedLevels = Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [];
    parsed.treasureClearedLevels = Array.isArray(parsed.treasureClearedLevels) ? parsed.treasureClearedLevels : [];
    parsed.stickers = Array.isArray(parsed.stickers) ? parsed.stickers : [];
    parsed.reviewBook = parsed.reviewBook && typeof parsed.reviewBook === "object" ? parsed.reviewBook : {};
    parsed.snakePlayCounts = normalizePlayCounts(parsed.snakePlayCounts);
    parsed.bubblePlayCounts = normalizePlayCounts(parsed.bubblePlayCounts);
    parsed.catchPlayCounts = normalizePlayCounts(parsed.catchPlayCounts);
    parsed.treasureClearedLevels.forEach((levelId) => {
      const key = String(levelId);
      if (!parsed.snakePlayCounts[key] && !parsed.bubblePlayCounts[key] && !parsed.catchPlayCounts[key]) {
        parsed.snakePlayCounts[key] = 1;
      }
    });
    return parsed;
  } catch (error) {
    return defaultProgress();
  }
}

function normalizePlayCounts(counts) {
  const normalized = counts && typeof counts === "object" && !Array.isArray(counts) ? counts : {};
  Object.keys(normalized).forEach((levelId) => {
    const playCount = Number(normalized[levelId]);
    if (Number.isFinite(playCount) && playCount > 0) {
      normalized[levelId] = Math.min(MAX_REWARD_PLAYS, Math.floor(playCount));
    } else {
      delete normalized[levelId];
    }
  });
  return normalized;
}

function saveProgress() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function getMiniGameName(gameType) {
  if (gameType === "snake") {
    return "贪食蛇";
  }
  if (gameType === "catch") {
    return "接宝箱";
  }
  return "汉字泡泡";
}

function getPlayCountMap(gameType) {
  const key = gameType === "snake"
    ? "snakePlayCounts"
    : gameType === "catch"
      ? "catchPlayCounts"
      : "bubblePlayCounts";
  state.progress[key] = state.progress[key] || {};
  return state.progress[key];
}

function getMiniGamePlayCount(gameType, levelId = state.selectedLevelId) {
  const savedCount = Number(getPlayCountMap(gameType)[levelId] || 0);
  const safeCount = Number.isFinite(savedCount) ? Math.floor(savedCount) : 0;
  return Math.min(MAX_REWARD_PLAYS, Math.max(0, safeCount));
}

function getTotalRewardPlayCount(levelId = state.selectedLevelId) {
  return Math.min(
    MAX_REWARD_PLAYS,
    getMiniGamePlayCount("bubble", levelId)
      + getMiniGamePlayCount("catch", levelId)
      + getMiniGamePlayCount("snake", levelId)
  );
}

function getRewardPlaysLeft(levelId = state.selectedLevelId) {
  return Math.max(MAX_REWARD_PLAYS - getTotalRewardPlayCount(levelId), 0);
}

function getRewardTargetCount() {
  if (state.activeRewardGame === "bubble") {
    return BUBBLE_TARGET_COUNT;
  }
  if (state.activeRewardGame === "catch") {
    return CATCH_TARGET_COUNT;
  }
  return SNAKE_TARGET_COUNT;
}

function recordMiniGameClear(gameType, levelId) {
  const countMap = getPlayCountMap(gameType);
  if (getRewardPlaysLeft(levelId) <= 0) {
    return getMiniGamePlayCount(gameType, levelId);
  }

  const nextCount = getMiniGamePlayCount(gameType, levelId) + 1;
  countMap[levelId] = nextCount;
  return nextCount;
}

function getCurrentLevel() {
  return levels.find((level) => level.id === state.selectedLevelId) || levels[0];
}

function getPreviousLevels(levelId = state.selectedLevelId) {
  return levels.filter((level) => level.id < levelId);
}

function getCurrentLevelCharacters() {
  return getCurrentLevel().characters;
}

function getUnlockedCharacters() {
  return levels
    .filter((level) => level.id <= state.progress.unlockedLevel)
    .flatMap((level) => level.characters);
}

function getQuestionPool() {
  return uniqueCharacters([
    ...getCurrentLevelCharacters(),
    ...getPreviousLevels().flatMap((level) => level.characters).slice(-40),
    ...levels.flatMap((level) => level.characters).slice(0, 120)
  ]);
}

function getReviewEntries() {
  const unlockedIds = new Set(getUnlockedCharacters().map((character) => character.id));
  return Object.entries(state.progress.reviewBook)
    .filter(([characterId, score]) => unlockedIds.has(Number(characterId)) && score > 0)
    .map(([characterId, score]) => ({
      character: findCharacterById(Number(characterId)),
      mistakes: score
    }))
    .filter((entry) => entry.character)
    .sort((a, b) => b.mistakes - a.mistakes || a.character.id - b.character.id);
}

function findCharacterById(id) {
  for (const level of levels) {
    const hit = level.characters.find((character) => character.id === id);
    if (hit) {
      return hit;
    }
  }
  return null;
}

function getKnownCount(level = getCurrentLevel()) {
  return level.characters.filter((character) => state.progress.masteredCharacters.includes(character.id)).length;
}

function isLevelComplete(level = getCurrentLevel()) {
  return getKnownCount(level) >= level.characters.length;
}

function renderLevelGrid() {
  elements.levelGrid.innerHTML = "";

  levels.forEach((level) => {
    const button = document.createElement("button");
    const isUnlocked = level.id <= state.progress.unlockedLevel;
    const treasureDone = state.progress.treasureClearedLevels.includes(level.id);
    const knownCount = getKnownCount(level);
    button.className = `level-button${level.id === state.selectedLevelId ? " active" : ""}${isUnlocked ? "" : " locked"}`;
    button.disabled = !isUnlocked;
    button.innerHTML = `
      <strong>第 ${level.id} 关${treasureDone ? " ★" : ""}</strong>
      <small>${knownCount} / ${level.characters.length} 字</small>
    `;
    button.addEventListener("click", () => selectLevel(level.id));
    elements.levelGrid.appendChild(button);
  });
}

function selectLevel(levelId) {
  stopRewardTimers();
  state.selectedLevelId = Math.max(1, Math.min(levelId, levels.length));
  state.focusCharacterIndex = 0;
  state.treasureRound = 0;
  state.treasureReward = null;
  state.activeRewardGame = "bubble";
  state.rewardGameStarted = false;

  if (state.progress.pendingRewardLevel === state.selectedLevelId) {
    state.mode = "treasure-ready";
  } else {
    state.mode = "level";
  }

  state.quizStarted = state.mode !== "level" || isLevelComplete(getCurrentLevel());
  buildQuizQueue(state.mode);
  renderLevelGrid();
  renderCurrentLevel();
  renderReviewBook();
  renderTreasurePanel();
}

function renderCurrentLevel() {
  const level = getCurrentLevel();
  const levelCharacters = getCurrentLevelCharacters();
  const focus = levelCharacters[state.focusCharacterIndex % Math.max(levelCharacters.length, 1)] || levelCharacters[0];
  const knownCount = getKnownCount(level);
  const remainingCount = Math.max(levelCharacters.length - knownCount, 0);

  elements.currentLevelLabel.textContent = `第 ${level.id} 关`;
  elements.lessonTitle.textContent = level.title;
  elements.lessonSubtitle.textContent = `本关 ${levelCharacters.length} 个字。全部会认后，选择泡泡、宝箱或贪食蛇。`;
  elements.focusCharacter.textContent = focus.hanzi;
  elements.focusPinyin.textContent = formatPinyin(focus.pinyin);
  elements.focusStrokes.textContent = focus.strokes ? `${focus.strokes} 画` : "待补";
  elements.focusWord.textContent = focus.word;
  elements.meaningText.textContent = focus.meaning;
  elements.writingTip.textContent = focus.writingTip;
  elements.memoryTip.textContent = focus.memoryTip;
  elements.poolSummary.textContent = "每个字都要答对一次。答错会回到队伍里，等一下再练。";
  elements.shuffleLevel.textContent = isLevelComplete(level) && level.id < state.progress.unlockedLevel
    ? "去下一关"
    : "换一个字";
  elements.quizScore.textContent = String(remainingCount);

  renderStageOverview(levelCharacters);
  updatePhaseUI();
  renderRewardPanel();
  renderQuizQuestion();
}

function renderStageOverview(levelCharacters) {
  const activeIndex = levelCharacters.length
    ? state.focusCharacterIndex % levelCharacters.length
    : -1;
  const knownCount = getKnownCount();
  const percentKnown = levelCharacters.length
    ? Math.round((knownCount / levelCharacters.length) * 100)
    : 0;

  elements.stageOverviewTitle.textContent = `本关 ${levelCharacters.length} 字`;
  elements.stageOverviewProgress.textContent = `已会 ${knownCount} / ${levelCharacters.length}`;
  elements.levelProgressFill.style.width = `${percentKnown}%`;
  elements.stageOverviewGrid.innerHTML = "";

  levelCharacters.forEach((character, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "stage-character-tile";
    button.textContent = character.hanzi;
    button.title = `${character.hanzi} ${formatPinyin(character.pinyin)}`;
    button.setAttribute("aria-label", `${character.hanzi} ${formatPinyin(character.pinyin)}`);
    button.classList.toggle("active", index === activeIndex);
    button.classList.toggle("mastered", state.progress.masteredCharacters.includes(character.id));
    button.classList.toggle("needs-review", Boolean(state.progress.reviewBook[character.id]));
    button.addEventListener("click", () => {
      state.focusCharacterIndex = index;
      renderCurrentLevel();
    });
    elements.stageOverviewGrid.appendChild(button);
  });
}

function updatePhaseUI() {
  const labels = {
    level: "认字关",
    review: "错题练习",
    treasure: getMiniGameName(state.activeRewardGame),
    "treasure-ready": "准备游戏"
  };
  elements.phasePill.textContent = labels[state.mode] || "认字关";
}

function buildQuizQueue(mode = state.mode) {
  if (mode === "review") {
    state.quizQueue = getReviewEntries().map((entry) => entry.character);
  } else if (mode === "treasure-ready" || mode === "treasure") {
    state.quizQueue = [];
  } else {
    state.quizQueue = getCurrentLevelCharacters().filter(
      (character) => !state.progress.masteredCharacters.includes(character.id)
    );
  }

  state.quizQueue = shuffleArray(uniqueCharacters(state.quizQueue));
  state.currentAnswered = false;
}

function createQuestion(answer) {
  const distractors = shuffleArray(
    uniqueValues(
      getQuestionPool()
        .filter((item) => item.id !== answer.id)
        .map((item) => item.pinyin)
    )
  ).slice(0, 3);

  return {
    answer,
    prompt: answer.hanzi,
    type: "选正确拼音",
    options: shuffleArray(uniqueValues([answer.pinyin, ...distractors]).slice(0, 4)).map((option) => ({
      raw: option,
      display: formatPinyin(option)
    }))
  };
}

function renderQuizQuestion() {
  const levelComplete = isLevelComplete();
  if (state.mode === "level" && !state.quizStarted && !levelComplete) {
    const levelCharacters = getCurrentLevelCharacters();
    elements.quizStartPanel.classList.remove("is-hidden");
    elements.questionCard.classList.add("is-hidden");
    elements.quizActions.classList.add("is-hidden");
    elements.quizProgress.textContent = `已会 ${getKnownCount()} / ${levelCharacters.length}`;
    elements.quizScore.textContent = String(Math.max(levelCharacters.length - getKnownCount(), 0));
    elements.feedbackText.textContent = "准备好了再开始。";
    return;
  }

  elements.quizStartPanel.classList.add("is-hidden");
  elements.questionCard.classList.remove("is-hidden");
  elements.quizActions.classList.remove("is-hidden");

  if (state.mode === "treasure-ready") {
    elements.questionType.textContent = "本关完成";
    elements.questionPrompt.textContent = "选游戏";
    elements.quizProgress.textContent = "20 个字都会了";
    elements.feedbackText.textContent = "可以选择汉字泡泡、接宝箱或贪食蛇。";
    elements.feedbackText.className = "feedback-text success-text";
    elements.questionOptions.innerHTML = "";
    elements.nextQuestion.textContent = "去选游戏";
    elements.nextQuestion.disabled = false;
    return;
  }

  const current = state.quizQueue[0];
  if (!current) {
    if (state.mode === "treasure") {
      const gameName = getMiniGameName(state.activeRewardGame);
      elements.questionType.textContent = gameName;
      elements.questionPrompt.textContent = state.rewardGameStarted
        ? state.activeRewardGame === "bubble"
          ? "点泡泡"
          : state.activeRewardGame === "catch"
            ? "接宝箱"
            : "吃字"
        : "准备";
      elements.quizProgress.textContent = `${gameName} ${state.treasureRound} / ${getRewardTargetCount()}`;
      elements.feedbackText.textContent = state.rewardGameStarted
        ? state.activeRewardGame === "bubble"
          ? "看下面的游戏区，点掉目标汉字泡泡。"
          : state.activeRewardGame === "catch"
            ? "看下面的游戏区，移动篮子接住目标汉字。"
            : "看下面的游戏区，吃掉目标汉字。"
        : "看清游戏框里的拼音，准备好后再点开始游戏。";
      elements.feedbackText.className = "feedback-text";
      elements.questionOptions.innerHTML = "";
      elements.nextQuestion.textContent = state.rewardGameStarted ? "游戏进行中" : "等待开始";
      elements.nextQuestion.disabled = true;
      return;
    }

    const treasureDone = state.progress.treasureClearedLevels.includes(state.selectedLevelId);
    elements.questionType.textContent = state.mode === "review" ? "错题练完了" : "本关完成";
    elements.questionPrompt.textContent = treasureDone || state.mode === "review" ? "完成" : "选游戏";
    elements.quizProgress.textContent = state.mode === "review" ? "错题本暂时清空" : "20 个字都会了";
    elements.feedbackText.textContent = state.mode === "review"
      ? "回到认字关继续前进。"
      : treasureDone
        ? "小游戏已经过关，可以去下一关。"
        : "可以选择汉字泡泡、接宝箱或贪食蛇。";
    elements.feedbackText.className = "feedback-text success-text";
    elements.questionOptions.innerHTML = "";
    elements.nextQuestion.textContent = state.mode === "review"
      ? "回到认字关"
      : treasureDone
        ? "去下一关"
        : "去选游戏";
    elements.nextQuestion.disabled = state.mode !== "review"
      && (treasureDone
        ? state.selectedLevelId >= state.progress.unlockedLevel
        : !isLevelComplete());
    return;
  }

  const question = createQuestion(current);
  const knownCount = state.mode === "review"
    ? Math.max(getReviewEntries().length - state.quizQueue.length, 0)
    : getKnownCount();
  const totalCount = state.mode === "review" ? getReviewEntries().length : getCurrentLevelCharacters().length;

  elements.questionType.textContent = question.type;
  elements.questionPrompt.textContent = question.prompt;
  elements.quizProgress.textContent = state.mode === "review"
    ? `错题 ${Math.min(knownCount + 1, totalCount)} / ${Math.max(totalCount, 1)}`
    : `已会 ${knownCount} / ${totalCount}`;
  elements.feedbackText.textContent = getModeHint();
  elements.feedbackText.className = "feedback-text";
  elements.nextQuestion.textContent = "下一题";
  elements.nextQuestion.disabled = true;
  elements.questionOptions.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = option.display;
    button.dataset.rawPinyin = option.raw;
    button.addEventListener("click", () => handleAnswer(button, option.raw, question.answer));
    elements.questionOptions.appendChild(button);
  });
}

function getModeHint() {
  if (state.mode === "review") {
    return "这次先练错题本里的字。";
  }
  if (state.mode === "treasure") {
    return state.activeRewardGame === "bubble"
      ? "看拼音，点掉正确的汉字泡泡。"
      : state.activeRewardGame === "catch"
        ? "看拼音，移动篮子接住正确汉字。"
        : "控制小蛇，吃掉目标汉字。";
  }
  return "每个字答对一次，就会变成绿色。";
}

function handleAnswer(button, option, answer) {
  if (state.currentAnswered) {
    return;
  }

  state.currentAnswered = true;
  const buttons = Array.from(elements.questionOptions.querySelectorAll("button"));
  buttons.forEach((item) => {
    item.disabled = true;
    if (item.dataset.rawPinyin === answer.pinyin) {
      item.classList.add("correct");
    }
  });

  state.quizQueue.shift();
  state.focusCharacterIndex = getCurrentLevelCharacters().findIndex((character) => character.id === answer.id);
  if (state.focusCharacterIndex < 0) {
    state.focusCharacterIndex = 0;
  }

  if (option === answer.pinyin) {
    button.classList.add("correct");
    addMasteredCharacter(answer.id);
    weakenReviewCharacter(answer.id);
    elements.feedbackText.textContent = `答对了，“${answer.hanzi}”读作 ${formatPinyin(answer.pinyin)}。`;
    elements.feedbackText.className = "feedback-text success-text";
  } else {
    button.classList.add("incorrect");
    addReviewCharacter(answer.id);
    state.quizQueue.push(answer);
    elements.feedbackText.textContent = `这题正确答案是 ${formatPinyin(answer.pinyin)}，等一下再练一次。`;
    elements.feedbackText.className = "feedback-text error-text";
  }

  updateHeaderStats();
  renderLevelGrid();
  renderStageOverview(getCurrentLevelCharacters());
  renderReviewBook();
  elements.quizScore.textContent = String(Math.max(getCurrentLevelCharacters().length - getKnownCount(), 0));

  if (state.mode === "level" && isLevelComplete()) {
    completeCurrentLevel();
    return;
  }

  elements.nextQuestion.disabled = false;
}

function addMasteredCharacter(characterId) {
  if (!state.progress.masteredCharacters.includes(characterId)) {
    state.progress.masteredCharacters.push(characterId);
    saveProgress();
  }
}

function addReviewCharacter(characterId) {
  state.progress.reviewBook[characterId] = (state.progress.reviewBook[characterId] || 0) + 1;
  saveProgress();
}

function weakenReviewCharacter(characterId) {
  const currentValue = state.progress.reviewBook[characterId] || 0;
  if (currentValue <= 1) {
    delete state.progress.reviewBook[characterId];
  } else {
    state.progress.reviewBook[characterId] = currentValue - 1;
  }
  saveProgress();
}

function completeCurrentLevel() {
  const levelId = state.selectedLevelId;
  if (!state.progress.completedLevels.includes(levelId)) {
    state.progress.completedLevels.push(levelId);
  }
  if (!state.progress.treasureClearedLevels.includes(levelId)) {
    state.progress.pendingRewardLevel = levelId;
    state.mode = "treasure-ready";
  }

  state.quizStarted = true;
  saveProgress();
  buildQuizQueue(state.mode);
  renderLevelGrid();
  updateHeaderStats();
  renderReviewBook();
  renderRewardPanel();
  renderTreasurePanel();
  updatePhaseUI();
  renderQuizQuestion();
}

function startTreasureStage(gameType = "bubble") {
  const levelId = state.selectedLevelId;
  const playsLeft = getRewardPlaysLeft(levelId);
  const gameName = getMiniGameName(gameType);
  if (!isLevelComplete() || playsLeft <= 0) {
    state.mode = "level";
    state.activeRewardGame = gameType;
    const message = playsLeft <= 0
      ? `本关小游戏已经玩满 ${MAX_REWARD_PLAYS} 次，可以去下一关。`
      : "本关 20 个字都会了，才能开始小游戏。";
    state.snakeMessage = message;
    state.bubbleMessage = message;
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  stopRewardTimers();
  state.mode = "treasure";
  state.activeRewardGame = gameType;
  state.rewardGameStarted = false;
  state.quizStarted = true;
  state.treasureRound = 0;
  state.treasureReward = null;
  const playNumber = getTotalRewardPlayCount(levelId) + 1;

  if (gameType === "bubble") {
    state.bubbleLives = BUBBLE_LIVES;
    state.bubbleTargets = shuffleArray(getCurrentLevelCharacters()).slice(0, BUBBLE_TARGET_COUNT);
    state.bubbleMessage = `第 ${playNumber} / ${MAX_REWARD_PLAYS} 次：看拼音，点正确的汉字泡泡。`;
    prepareBubbleRound();
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  if (gameType === "catch") {
    state.catchLives = CATCH_LIVES;
    state.catchTargets = shuffleArray(getCurrentLevelCharacters()).slice(0, CATCH_TARGET_COUNT);
    state.catchBasketLane = Math.floor(CATCH_LANES / 2);
    state.catchMessage = `第 ${playNumber} / ${MAX_REWARD_PLAYS} 次：左右移动篮子，接正确汉字，躲开炸弹。`;
    prepareCatchRound();
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  state.snake = createStartingSnake();
  state.snakeDirection = "right";
  state.snakeNextDirection = "right";
  state.snakeLives = SNAKE_LIVES;
  state.snakeTargets = shuffleArray(getCurrentLevelCharacters()).slice(0, SNAKE_TARGET_COUNT);
  state.snakeMessage = state.snakeHardMode
    ? `第 ${playNumber} / ${MAX_REWARD_PLAYS} 次：困难模式，撞墙会少一颗心。`
    : `第 ${playNumber} / ${MAX_REWARD_PLAYS} 次：轻松模式，穿墙会从另一边出来。`;
  prepareTreasureRound();
  updatePhaseUI();
  renderRewardPanel();
  renderTreasurePanel();
  renderQuizQuestion();
}

function prepareTreasureRound() {
  const target = state.snakeTargets[state.treasureRound] || shuffleArray(getCurrentLevelCharacters())[0];
  const distractors = shuffleArray(getCurrentLevelCharacters().filter((character) => character.id !== target.id)).slice(0, 3);
  const foods = shuffleArray([target, ...distractors]);
  const occupied = new Set(state.snake.map(cellKey));
  const placedFoods = foods.map((character) => {
    const position = getRandomOpenCell(occupied);
    occupied.add(cellKey(position));
    return { character, position };
  });

  state.treasureTargetId = target.id;
  state.treasureOptions = placedFoods;
}

function prepareBubbleRound() {
  const target = state.bubbleTargets[state.treasureRound] || shuffleArray(getCurrentLevelCharacters())[0];
  const distractors = shuffleArray(getCurrentLevelCharacters().filter((character) => character.id !== target.id)).slice(0, 4);
  const characters = shuffleArray([target, ...distractors]);
  const lanes = shuffleArray([12, 30, 48, 66, 84]);

  state.treasureTargetId = target.id;
  state.treasureOptions = characters.map((character, index) => ({
    character,
    left: lanes[index] || 50,
    bottom: 8 + Math.floor(Math.random() * 12),
    size: 66 + Math.floor(Math.random() * 16),
    delay: index * 0.12
  }));
}

function prepareCatchRound() {
  const target = state.catchTargets[state.treasureRound] || shuffleArray(getCurrentLevelCharacters())[0];
  const distractors = shuffleArray(getCurrentLevelCharacters().filter((character) => character.id !== target.id)).slice(0, 2);
  const lanes = shuffleArray([...Array(CATCH_LANES).keys()]);
  const items = [
    { kind: "word", character: target, lane: lanes[0], row: -1 },
    ...distractors.map((character, index) => ({
      kind: "word",
      character,
      lane: lanes[index + 1],
      row: -2 - index
    })),
    { kind: "bomb", lane: lanes[3] ?? 1, row: -3 },
    { kind: "bomb", lane: lanes[4] ?? 3, row: -5 }
  ];

  state.treasureTargetId = target.id;
  state.treasureOptions = shuffleArray(items).map((item, index) => ({
    ...item,
    row: item.row - (index % 2)
  }));
}

function createStartingSnake() {
  const middle = Math.floor(SNAKE_GRID_SIZE / 2);
  return [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle }
  ];
}

function startSnakeTimer() {
  stopSnakeTimer();
  state.snakeTimerId = window.setInterval(moveSnake, SNAKE_TICK_MS);
}

function beginRewardGame() {
  if (state.mode !== "treasure" || state.rewardGameStarted) {
    return;
  }

  state.rewardGameStarted = true;
  if (state.activeRewardGame === "bubble") {
    state.bubbleMessage = "开始！在泡泡飞走前点正确的汉字。";
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    startBubbleTimer();
    return;
  }

  if (state.activeRewardGame === "catch") {
    state.catchMessage = "开始！左右移动篮子，接正确汉字。";
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    startCatchTimer();
    return;
  }

  state.snakeMessage = state.snakeHardMode
    ? "开始！困难模式：撞墙会少一颗心。"
    : "开始！轻松模式：穿墙会从另一边出来。";
  renderRewardPanel();
  renderTreasurePanel();
  renderQuizQuestion();
  startSnakeTimer();
}

function startBubbleTimer() {
  stopBubbleTimer();
  state.bubbleTimerId = window.setTimeout(handleBubbleTimeout, BUBBLE_ROUND_MS);
}

function startCatchTimer() {
  stopCatchTimer();
  state.catchTimerId = window.setInterval(moveCatchItems, CATCH_TICK_MS);
}

function stopRewardTimers() {
  stopSnakeTimer();
  stopBubbleTimer();
  stopCatchTimer();
}

function stopSnakeTimer() {
  if (state.snakeTimerId) {
    window.clearInterval(state.snakeTimerId);
    state.snakeTimerId = null;
  }
}

function stopBubbleTimer() {
  if (state.bubbleTimerId) {
    window.clearTimeout(state.bubbleTimerId);
    state.bubbleTimerId = null;
  }
}

function stopCatchTimer() {
  if (state.catchTimerId) {
    window.clearInterval(state.catchTimerId);
    state.catchTimerId = null;
  }
}

function setSnakeDirection(direction) {
  if (!SNAKE_DIRECTIONS[direction]) {
    return;
  }
  if (OPPOSITE_DIRECTIONS[direction] === state.snakeDirection) {
    return;
  }
  state.snakeNextDirection = direction;
}

function moveSnake() {
  if (state.mode !== "treasure" || state.activeRewardGame !== "snake" || !state.rewardGameStarted) {
    return;
  }

  state.snakeDirection = state.snakeNextDirection;
  const vector = SNAKE_DIRECTIONS[state.snakeDirection];
  const head = state.snake[0];
  const rawHead = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  if (state.snakeHardMode && isOutOfBounds(rawHead)) {
    handleSnakeMiss("撞到墙了，少一颗心。");
    return;
  }

  const nextHead = state.snakeHardMode
    ? rawHead
    : {
      x: (rawHead.x + SNAKE_GRID_SIZE) % SNAKE_GRID_SIZE,
      y: (rawHead.y + SNAKE_GRID_SIZE) % SNAKE_GRID_SIZE
    };

  if (state.snake.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y)) {
    handleSnakeMiss("撞到自己了，少一颗心。");
    return;
  }

  const food = state.treasureOptions.find((item) => sameCell(item.position, nextHead));
  state.snake.unshift(nextHead);

  if (!food) {
    state.snake.pop();
    renderTreasurePanel();
    return;
  }

  if (food.character.id === state.treasureTargetId) {
    state.treasureRound += 1;
    state.snakeMessage = "吃对了，小蛇长大一点。";

    if (state.treasureRound >= SNAKE_TARGET_COUNT) {
      completeTreasureStage();
      return;
    }

    prepareTreasureRound();
    renderTreasurePanel();
    return;
  }

  state.snake.pop();
  handleSnakeMiss(`吃到“${food.character.hanzi}”了，目标不是这个字。`);
}

function handleSnakeMiss(message) {
  state.snakeLives -= 1;
  state.snake = createStartingSnake();
  state.snakeDirection = "right";
  state.snakeNextDirection = "right";

  if (state.snakeLives <= 0) {
    stopSnakeTimer();
    state.mode = "treasure-ready";
    state.rewardGameStarted = false;
    state.snakeMessage = "小蛇休息一下，再点“开始贪食蛇”重新挑战。";
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  prepareTreasureRound();
  state.snakeMessage = `${message} 还剩 ${state.snakeLives} 颗心。`;
  renderTreasurePanel();
}

function handleBubblePick(character) {
  if (state.mode !== "treasure" || state.activeRewardGame !== "bubble" || !state.rewardGameStarted) {
    return;
  }

  stopBubbleTimer();
  if (character.id === state.treasureTargetId) {
    state.treasureRound += 1;
    state.bubbleMessage = "点对了，泡泡变成星星了。";

    if (state.treasureRound >= BUBBLE_TARGET_COUNT) {
      completeTreasureStage();
      return;
    }

    prepareBubbleRound();
    renderTreasurePanel();
    startBubbleTimer();
    return;
  }

  handleBubbleMiss(`点到“${character.hanzi}”了，目标不是这个字。`);
}

function handleBubbleTimeout() {
  if (state.mode !== "treasure" || state.activeRewardGame !== "bubble" || !state.rewardGameStarted) {
    return;
  }
  handleBubbleMiss("泡泡飘走了，少一颗心。");
}

function handleBubbleMiss(message) {
  state.bubbleLives -= 1;

  if (state.bubbleLives <= 0) {
    stopBubbleTimer();
    state.mode = "treasure-ready";
    state.rewardGameStarted = false;
    state.bubbleMessage = "泡泡飞走了，再点“汉字泡泡”重新挑战。";
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  prepareBubbleRound();
  state.bubbleMessage = `${message} 还剩 ${state.bubbleLives} 颗心。`;
  renderTreasurePanel();
  startBubbleTimer();
}

function moveCatchBasket(direction) {
  if (state.mode !== "treasure" || state.activeRewardGame !== "catch" || !state.rewardGameStarted) {
    return;
  }

  if (direction === "left") {
    state.catchBasketLane = Math.max(0, state.catchBasketLane - 1);
  } else if (direction === "right") {
    state.catchBasketLane = Math.min(CATCH_LANES - 1, state.catchBasketLane + 1);
  } else {
    return;
  }

  renderTreasurePanel();
}

function moveCatchItems() {
  if (state.mode !== "treasure" || state.activeRewardGame !== "catch" || !state.rewardGameStarted) {
    return;
  }

  state.treasureOptions = state.treasureOptions.map((item) => ({
    ...item,
    row: item.row + 1
  }));

  const landedItems = state.treasureOptions.filter((item) => item.row >= CATCH_END_ROW);
  const caughtItem = landedItems.find((item) => item.lane === state.catchBasketLane);
  if (caughtItem) {
    handleCaughtItem(caughtItem);
    return;
  }

  const missedTarget = landedItems.some((item) => item.kind === "word" && item.character.id === state.treasureTargetId);
  if (missedTarget) {
    state.catchMessage = "宝箱掉到地上了，再试一次。";
    prepareCatchRound();
    renderTreasurePanel();
    return;
  }

  state.treasureOptions = state.treasureOptions.filter((item) => item.row < CATCH_END_ROW);
  if (state.treasureOptions.length === 0) {
    state.catchMessage = "这一波没接到，下一波来了。";
    prepareCatchRound();
  }

  renderTreasurePanel();
}

function handleCaughtItem(item) {
  if (item.kind === "bomb") {
    handleCatchMiss("接到炸弹了，少一颗心。");
    return;
  }

  if (item.character.id !== state.treasureTargetId) {
    handleCatchMiss(`接到“${item.character.hanzi}”了，目标不是这个字。`);
    return;
  }

  state.treasureRound += 1;
  state.catchMessage = "接对了，宝箱打开了。";
  if (state.treasureRound >= CATCH_TARGET_COUNT) {
    completeTreasureStage();
    return;
  }

  prepareCatchRound();
  renderTreasurePanel();
}

function handleCatchMiss(message) {
  state.catchLives -= 1;

  if (state.catchLives <= 0) {
    stopCatchTimer();
    state.mode = "treasure-ready";
    state.rewardGameStarted = false;
    state.catchMessage = "篮子休息一下，再点“接宝箱”重新挑战。";
    updatePhaseUI();
    renderRewardPanel();
    renderTreasurePanel();
    renderQuizQuestion();
    return;
  }

  prepareCatchRound();
  state.catchMessage = `${message} 还剩 ${state.catchLives} 颗心。`;
  renderTreasurePanel();
}

function completeTreasureStage() {
  stopRewardTimers();
  const levelId = state.selectedLevelId;
  const gameType = state.activeRewardGame || "bubble";
  const gameName = getMiniGameName(gameType);
  const wasAlreadyCleared = state.progress.treasureClearedLevels.includes(levelId);
  const rewardSticker = wasAlreadyCleared ? null : pickStickerReward();
  recordMiniGameClear(gameType, levelId);
  const playCount = getTotalRewardPlayCount(levelId);
  const playsLeft = getRewardPlaysLeft(levelId);

  if (!wasAlreadyCleared) {
    state.progress.treasureClearedLevels.push(levelId);
    state.progress.rewardStars += 3;
  }
  if (rewardSticker && !state.progress.stickers.includes(rewardSticker.id)) {
    state.progress.stickers.push(rewardSticker.id);
  }

  state.progress.pendingRewardLevel = null;
  if (levelId < levels.length) {
    state.progress.unlockedLevel = Math.max(state.progress.unlockedLevel, levelId + 1);
  }

  state.mode = "level";
  state.rewardGameStarted = false;
  state.quizStarted = true;
  state.treasureReward = rewardSticker;
  saveProgress();
  buildQuizQueue("level");
  updateHeaderStats();
  renderLevelGrid();
  renderStickerBook();
  renderRewardPanel();
  renderTreasurePanel();
  updatePhaseUI();
  renderQuizQuestion();
  const replayText = playsLeft > 0
    ? `还可以再玩 ${playsLeft} 次。`
    : `本关小游戏已玩满 ${MAX_REWARD_PLAYS} 次。`;
  if (wasAlreadyCleared) {
    elements.feedbackText.textContent = `${gameName}再玩一次完成了！已玩 ${playCount} / ${MAX_REWARD_PLAYS} 次。${replayText}`;
  } else {
    elements.feedbackText.textContent = levelId < levels.length
      ? `${gameName}过关了，获得 3 颗星星和 ${rewardSticker.name}。下一关已解锁。${replayText}`
      : `${gameName}过关了，获得 3 颗星星和 ${rewardSticker.name}。全部关卡完成。${replayText}`;
  }
  elements.feedbackText.className = "feedback-text success-text";
}

function pickStickerReward() {
  const missing = STICKERS.filter((sticker) => !state.progress.stickers.includes(sticker.id));
  if (missing.length > 0) {
    return missing[Math.floor(Math.random() * missing.length)];
  }
  return STICKERS[Math.floor(Math.random() * STICKERS.length)];
}

function renderRewardPanel() {
  const levelId = state.selectedLevelId;
  const levelComplete = isLevelComplete();
  const treasureReady = state.progress.pendingRewardLevel === levelId || state.mode === "treasure";
  const treasureDone = state.progress.treasureClearedLevels.includes(levelId);
  const playCount = getTotalRewardPlayCount(levelId);
  const playsLeft = getRewardPlaysLeft(levelId);
  const activeGameName = getMiniGameName(state.activeRewardGame);

  if (state.mode === "treasure") {
    elements.rewardStatus.textContent = state.rewardGameStarted
      ? `第 ${playCount + 1} / ${MAX_REWARD_PLAYS} 次：${activeGameName}进行中。`
      : `已选择${activeGameName}，在游戏框里点“开始游戏”。`;
    setMiniGameButton("bubble", true);
    setMiniGameButton("catch", true);
    setMiniGameButton("snake", true);
  } else if (treasureDone && playsLeft > 0) {
    elements.rewardStatus.textContent = `小游戏过关啦。要再玩一次吗？还可以玩 ${playsLeft} 次。`;
    setMiniGameButton("bubble", false);
    setMiniGameButton("catch", false);
    setMiniGameButton("snake", false);
  } else if (treasureDone) {
    elements.rewardStatus.textContent = `本关小游戏已玩满 ${MAX_REWARD_PLAYS} 次，可以去下一关。`;
    setMiniGameButton("bubble", true);
    setMiniGameButton("catch", true);
    setMiniGameButton("snake", true);
  } else if (treasureReady || levelComplete) {
    elements.rewardStatus.textContent = "本关 20 个字都会了，选择一个小游戏过关。";
    setMiniGameButton("bubble", false);
    setMiniGameButton("catch", false);
    setMiniGameButton("snake", false);
  } else {
    elements.rewardStatus.textContent = "本关 20 个字都会了，就能选择小游戏。";
    setMiniGameButton("bubble", true);
    setMiniGameButton("catch", true);
    setMiniGameButton("snake", true);
  }

  function setMiniGameButton(gameType, forceDisabled) {
    const button = gameType === "bubble"
      ? elements.startBubble
      : gameType === "catch"
        ? elements.startCatch
        : elements.startReward;
    const gameName = getMiniGameName(gameType);
    const disabled = forceDisabled || !levelComplete || playsLeft <= 0;
    const actionText = state.mode === "treasure" && state.activeRewardGame === gameType
      ? state.rewardGameStarted
        ? "游戏进行中"
        : `准备${gameName}`
      : treasureDone
        ? `再玩${gameName}`
        : `玩${gameName}`;
    button.disabled = disabled;
    button.innerHTML = `
      <strong>${actionText}</strong>
      <span>${playCount} / ${MAX_REWARD_PLAYS}</span>
    `;
  }

  Array.from(elements.rewardStrip.children).forEach((badge, index) => {
    badge.classList.toggle(
      "earned",
      treasureDone || (state.mode === "treasure" && state.treasureRound >= (index + 1) * 2)
    );
  });
}

function renderTreasurePanel() {
  const levelId = state.selectedLevelId;
  const treasureDone = state.progress.treasureClearedLevels.includes(levelId);
  const playCount = getTotalRewardPlayCount(levelId);
  const playsLeft = getRewardPlaysLeft(levelId);
  const isBubble = state.mode === "treasure" && state.activeRewardGame === "bubble";
  const isCatch = state.mode === "treasure" && state.activeRewardGame === "catch";
  const isSnake = state.mode === "treasure" && state.activeRewardGame === "snake";
  elements.treasureGrid.classList.toggle("bubble-grid", isBubble);
  elements.treasureGrid.classList.toggle("catch-grid", isCatch);
  elements.treasureGrid.classList.toggle("snake-grid", isSnake);
  elements.snakeControls.classList.toggle("is-hidden", !state.rewardGameStarted || (!isSnake && !isCatch));
  elements.snakeControls.classList.toggle("catch-controls", isCatch);
  elements.snakeHardModeWrap.classList.toggle("is-hidden", !isSnake);
  elements.treasureProgress.textContent = `${state.treasureRound} / ${getRewardTargetCount()}`;
  elements.snakeLives.textContent = String(
    isBubble
      ? state.bubbleLives || BUBBLE_LIVES
      : isCatch
        ? state.catchLives || CATCH_LIVES
        : state.snakeLives || SNAKE_LIVES
  );

  if (state.mode !== "treasure") {
    elements.treasureIntro.textContent = "小游戏规则：看大拼音，选择对应汉字。泡泡用点击，宝箱用左右键，贪食蛇用方向键。";
    elements.treasureTarget.textContent = treasureDone && playsLeft > 0
      ? "再玩一次？"
      : treasureDone
        ? "完成"
        : "选择游戏";
    elements.treasureGrid.innerHTML = "";
    if (treasureDone) {
      const rewardText = state.treasureReward ? `刚得到 ${state.treasureReward.name}。` : "";
      elements.treasureFeedback.textContent = playsLeft > 0
        ? `${rewardText}已玩 ${playCount} / ${MAX_REWARD_PLAYS} 次。可以选择泡泡、宝箱或贪食蛇再玩一次。`
        : `${rewardText}已玩满 ${MAX_REWARD_PLAYS} 次，可以去下一关。`;
    } else {
      elements.treasureFeedback.textContent = state.bubbleMessage || state.catchMessage || state.snakeMessage || "过关后会获得星星和贴纸。";
    }
    return;
  }

  if (!state.rewardGameStarted) {
    renderRewardGameReadyPanel();
    return;
  }

  if (isBubble) {
    renderBubblePanel();
    return;
  }

  if (isCatch) {
    renderCatchPanel();
    return;
  }

  renderSnakePanel();
}

function renderRewardGameReadyPanel() {
  const target = findCharacterById(state.treasureTargetId);
  const gameName = getMiniGameName(state.activeRewardGame);
  const instructions = state.activeRewardGame === "bubble"
    ? "看清拼音，准备好后开始点泡泡。"
    : state.activeRewardGame === "catch"
      ? "看清拼音，手放在左右键或 A/D 上，再开始接宝箱。"
      : "看清拼音，手放在方向键或 WASD 上，再开始贪食蛇。";

  elements.treasureIntro.textContent = `${gameName}：准备好再开始，计时和移动会在开始后启动。`;
  elements.treasureTarget.textContent = target ? formatPinyin(target.pinyin) : "准备开始";
  elements.treasureGrid.innerHTML = "";
  elements.treasureFeedback.textContent = "准备好后，按游戏框里的“开始游戏”。";

  const readyCard = document.createElement("div");
  readyCard.className = "game-ready-card";

  const title = document.createElement("strong");
  title.textContent = gameName;

  const copy = document.createElement("p");
  copy.textContent = instructions;

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.className = "primary-button game-frame-start";
  startButton.textContent = "开始游戏";
  startButton.addEventListener("click", beginRewardGame);

  readyCard.appendChild(title);
  readyCard.appendChild(copy);
  readyCard.appendChild(startButton);
  elements.treasureGrid.appendChild(readyCard);
}

function renderBubblePanel() {
  const target = findCharacterById(state.treasureTargetId);
  elements.treasureIntro.textContent = "汉字泡泡：看拼音，点掉对应汉字。泡泡飘走或点错会少一颗心。";
  elements.treasureTarget.textContent = target
    ? formatPinyin(target.pinyin)
    : "看拼音";
  elements.treasureGrid.innerHTML = "";
  elements.treasureFeedback.textContent = state.bubbleMessage || "在泡泡飞走前点正确的汉字。";

  state.treasureOptions.forEach((option) => {
    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "bubble-button";
    bubble.textContent = option.character.hanzi;
    bubble.style.left = `${option.left}%`;
    bubble.style.bottom = `${option.bottom}%`;
    bubble.style.width = `${option.size}px`;
    bubble.style.height = `${option.size}px`;
    bubble.style.animationDelay = `${option.delay}s`;
    bubble.style.animationDuration = `${BUBBLE_ROUND_MS}ms`;
    bubble.addEventListener("click", () => handleBubblePick(option.character));
    elements.treasureGrid.appendChild(bubble);
  });
}

function renderCatchPanel() {
  const target = findCharacterById(state.treasureTargetId);
  elements.treasureIntro.textContent = "接宝箱：看拼音，左右移动篮子接正确汉字。接错字或炸弹会少一颗心。";
  elements.treasureTarget.textContent = target
    ? formatPinyin(target.pinyin)
    : "看拼音";
  elements.treasureGrid.innerHTML = "";
  elements.treasureFeedback.textContent = state.catchMessage || "用左右键、A/D，或下面按钮移动篮子。";

  for (let lane = 0; lane < CATCH_LANES; lane += 1) {
    const laneGuide = document.createElement("div");
    laneGuide.className = "catch-lane";
    laneGuide.style.left = `${(lane / CATCH_LANES) * 100}%`;
    elements.treasureGrid.appendChild(laneGuide);
  }

  state.treasureOptions.forEach((item) => {
    const fallingItem = document.createElement("div");
    fallingItem.className = item.kind === "bomb" ? "catch-item catch-bomb" : "catch-item catch-word";
    fallingItem.textContent = item.kind === "bomb" ? "炸" : item.character.hanzi;
    fallingItem.style.left = `${getCatchLaneLeft(item.lane)}%`;
    fallingItem.style.top = `${getCatchRowTop(item.row)}%`;
    elements.treasureGrid.appendChild(fallingItem);
  });

  const basket = document.createElement("div");
  basket.className = "catch-basket";
  basket.textContent = "篮子";
  basket.style.left = `${getCatchLaneLeft(state.catchBasketLane)}%`;
  elements.treasureGrid.appendChild(basket);
}

function renderSnakePanel() {
  const target = findCharacterById(state.treasureTargetId);
  elements.treasureIntro.textContent = "贪食蛇：看拼音，控制小蛇吃掉对应汉字。吃对 6 个就过关。";
  elements.treasureTarget.textContent = target
    ? formatPinyin(target.pinyin)
    : "看拼音";
  elements.treasureGrid.innerHTML = "";
  elements.treasureFeedback.textContent = state.snakeMessage || "用方向键、WASD，或下面按钮控制小蛇。";

  const snakeKeys = new Map(state.snake.map((cell, index) => [cellKey(cell), index]));
  const foodByCell = new Map(state.treasureOptions.map((food) => [cellKey(food.position), food]));

  for (let y = 0; y < SNAKE_GRID_SIZE; y += 1) {
    for (let x = 0; x < SNAKE_GRID_SIZE; x += 1) {
      const cell = document.createElement("div");
      const position = { x, y };
      const key = cellKey(position);
      const snakeIndex = snakeKeys.get(key);
      const food = foodByCell.get(key);
      cell.className = "snake-cell";

      if (snakeIndex === 0) {
        cell.classList.add("snake-head");
      } else if (snakeIndex > 0) {
        cell.classList.add("snake-body");
      }

      if (food) {
        cell.classList.add("snake-food");
        cell.textContent = food.character.hanzi;
      }

      elements.treasureGrid.appendChild(cell);
    }
  }
}

function sameCell(first, second) {
  return first.x === second.x && first.y === second.y;
}

function isOutOfBounds(cell) {
  return cell.x < 0
    || cell.x >= SNAKE_GRID_SIZE
    || cell.y < 0
    || cell.y >= SNAKE_GRID_SIZE;
}

function getCatchLaneLeft(lane) {
  return ((lane + 0.5) / CATCH_LANES) * 100;
}

function getCatchRowTop(row) {
  return Math.max(-12, Math.min(86, ((row + 1) / (CATCH_END_ROW + 1)) * 100));
}

function cellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function getRandomOpenCell(occupied) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const cell = {
      x: Math.floor(Math.random() * SNAKE_GRID_SIZE),
      y: Math.floor(Math.random() * SNAKE_GRID_SIZE)
    };
    if (!occupied.has(cellKey(cell))) {
      return cell;
    }
  }

  for (let y = 0; y < SNAKE_GRID_SIZE; y += 1) {
    for (let x = 0; x < SNAKE_GRID_SIZE; x += 1) {
      const cell = { x, y };
      if (!occupied.has(cellKey(cell))) {
        return cell;
      }
    }
  }

  return { x: 0, y: 0 };
}

function renderReviewBook() {
  const reviewEntries = getReviewEntries();
  elements.reviewBookTotal.textContent = `${reviewEntries.length} 个字`;
  elements.reviewPriority.textContent = reviewEntries[0]
    ? `${reviewEntries[0].character.hanzi} (${reviewEntries[0].mistakes} 次)`
    : "暂无";
  elements.reviewBookList.innerHTML = "";

  if (reviewEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "错题本是空的，继续闯关吧。";
    elements.reviewBookList.appendChild(empty);
    return;
  }

  reviewEntries.slice(0, 12).forEach((entry) => {
    const card = document.createElement("article");
    card.className = "review-item";
    card.innerHTML = `
      <div class="review-hanzi">${entry.character.hanzi}</div>
      <div>
        <strong>${formatPinyin(entry.character.pinyin)}</strong>
        <p>${entry.character.word}</p>
      </div>
      <div class="mistake-pill">${entry.mistakes} 次</div>
    `;
    elements.reviewBookList.appendChild(card);
  });
}

function renderStickerBook() {
  elements.stickerList.innerHTML = "";

  if (state.progress.stickers.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "还没有贴纸，先完成第一个小游戏吧。";
    elements.stickerList.appendChild(empty);
    return;
  }

  state.progress.stickers
    .map((id) => STICKERS.find((sticker) => sticker.id === id))
    .filter(Boolean)
    .forEach((sticker) => {
      const card = document.createElement("article");
      card.className = "sticker-card";
      card.innerHTML = `
        <div class="sticker-emoji">${sticker.emoji}</div>
        <div class="sticker-name">${sticker.name}</div>
      `;
      elements.stickerList.appendChild(card);
    });
}

function renderPrintSheet() {
  const reviewEntries = getReviewEntries();
  elements.printSummary.textContent = `打印时间：${new Date().toLocaleDateString("zh-CN")} · 当前共有 ${reviewEntries.length} 个复习字。`;
  elements.printGrid.innerHTML = "";

  const printableEntries = reviewEntries.slice(0, 30);
  printableEntries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "print-card";
    card.innerHTML = `
      <h2>${entry.character.hanzi}</h2>
      <p>${formatPinyin(entry.character.pinyin)}</p>
      <p>${entry.character.word}</p>
      <div class="trace-row">
        <span></span><span></span><span></span>
      </div>
    `;
    elements.printGrid.appendChild(card);
  });

  if (printableEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "当前错题本为空，没有需要打印的汉字。";
    elements.printGrid.appendChild(empty);
  }
}

function goToNextCharacterOrLevel() {
  const level = getCurrentLevel();
  if (isLevelComplete(level) && level.id < state.progress.unlockedLevel) {
    selectLevel(level.id + 1);
    return;
  }

  state.focusCharacterIndex = (state.focusCharacterIndex + 1) % Math.max(getCurrentLevelCharacters().length, 1);
  renderCurrentLevel();
}

function updateHeaderStats() {
  elements.masteredCount.textContent = `${state.progress.masteredCharacters.length} / ${TOTAL_CHARACTERS}`;
  elements.rewardStars.textContent = String(state.progress.rewardStars);
  elements.reviewCount.textContent = String(Object.keys(state.progress.reviewBook).length);
  elements.stickerCount.textContent = String(state.progress.stickers.length);
}

function uniqueCharacters(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))];
}

function formatPinyin(value) {
  if (!value) {
    return "";
  }

  const match = String(value).match(/^([a-züv:]+)([1-5])$/i);
  if (!match) {
    return value.replace(/v/g, "ü");
  }

  const syllable = match[1].replace(/u:/g, "ü").replace(/v/g, "ü");
  const tone = Number(match[2]);
  if (tone === 5) {
    return syllable;
  }

  const toneMap = {
    a: ["a", "ā", "á", "ǎ", "à"],
    e: ["e", "ē", "é", "ě", "è"],
    i: ["i", "ī", "í", "ǐ", "ì"],
    o: ["o", "ō", "ó", "ǒ", "ò"],
    u: ["u", "ū", "ú", "ǔ", "ù"],
    ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"]
  };

  const lower = syllable.toLowerCase();
  let targetIndex = -1;

  if (lower.includes("a")) {
    targetIndex = lower.indexOf("a");
  } else if (lower.includes("e")) {
    targetIndex = lower.indexOf("e");
  } else if (lower.includes("ou")) {
    targetIndex = lower.indexOf("o");
  } else {
    for (let index = lower.length - 1; index >= 0; index -= 1) {
      if ("aeiouü".includes(lower[index])) {
        targetIndex = index;
        break;
      }
    }
  }

  if (targetIndex === -1) {
    return syllable;
  }

  const chars = [...syllable];
  const target = chars[targetIndex].toLowerCase();
  const replacement = toneMap[target]?.[tone] || chars[targetIndex];
  chars[targetIndex] = chars[targetIndex] === chars[targetIndex].toUpperCase()
    ? replacement.toUpperCase()
    : replacement;
  return chars.join("");
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
