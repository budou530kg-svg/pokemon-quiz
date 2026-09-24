// 画面の制御

const $ = (id) => document.getElementById(id);

const MODES = {
  ten: { desc: '10問で腕試し。最後にタイプ相性偏差値を表示！' },
  endless: { desc: '間違えるまで続く。何問連続で正解できる？' },
};

const state = {
  mode: 'ten',          // ten（10問）/ endless（間違えるまで）
  difficulty: 'easy',
  questions: [],
  nextEndless: null,    // エンドレスで次の問題を作る関数
  index: 0,
  score: 0,
  answered: false,
  lastCorrect: true,
};

// ---- ハイスコア（ブラウザに保存。使えない環境でも動くようにする） ----
function highScoreKey(mode, difficulty) {
  return (mode === 'endless' ? 'endless-' : 'highscore-') + difficulty;
}

function loadHighScore(mode, difficulty) {
  try {
    const v = localStorage.getItem(highScoreKey(mode, difficulty));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

function saveHighScore(mode, difficulty, score) {
  try {
    localStorage.setItem(highScoreKey(mode, difficulty), String(score));
  } catch {
    // 保存できなくてもゲームは続ける
  }
}

// ---- 画面切り替え ----
function showScreen(name) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== 'screen-' + name;
  window.scrollTo(0, 0);
}

// タイトルに並べるポケモン（開くたびにランダム）
function renderHero() {
  const hero = $('hero');
  hero.replaceChildren();
  for (const p of shuffle(POKEMON).slice(0, 5)) {
    const slot = document.createElement('div');
    slot.className = 'hero-slot';
    const img = document.createElement('img');
    img.src = p.image;
    img.alt = '';
    img.onerror = () => { img.style.visibility = 'hidden'; };
    slot.append(img);
    hero.append(slot);
  }
}

function setMode(mode) {
  state.mode = mode;
  for (const btn of document.querySelectorAll('[data-mode]')) {
    btn.setAttribute('aria-checked', String(btn.dataset.mode === mode));
  }
  $('mode-desc').textContent = MODES[mode].desc;
}

function showTitle() {
  renderHero();
  setMode(state.mode);
  for (const d of ['easy', 'normal']) {
    const ten = loadHighScore('ten', d);
    const endless = loadHighScore('endless', d);
    $('hs-ten-' + d).textContent = ten === null ? '-' : `${ten} / ${CONFIG.questionsPerGame}`;
    $('hs-endless-' + d).textContent = endless === null ? '-' : `${endless}連続`;
  }
  showScreen('title');
}

function renderSoundToggles() {
  for (const btn of document.querySelectorAll('.sound-toggle')) {
    btn.textContent = Sound.enabled ? '🔊 音あり' : '🔇 音なし';
    btn.setAttribute('aria-pressed', String(Sound.enabled));
  }
}

function typeTag(type) {
  const span = document.createElement('span');
  span.className = 'type-tag';
  span.style.background = TYPES[type].color;
  span.textContent = TYPES[type].name;
  return span;
}

function typeNames(types) {
  return types.map((t) => TYPES[t].name).join('・');
}

// ---- ゲーム ----
function startGame(difficulty) {
  state.difficulty = difficulty;
  state.index = 0;
  state.score = 0;
  state.lastCorrect = true;
  if (state.mode === 'endless') {
    state.nextEndless = createEndlessStream();
    state.questions = [state.nextEndless()];
  } else {
    state.questions = buildGame();
  }
  Sound.play('start');
  showScreen('quiz');
  renderQuestion();
}

function renderHeader() {
  if (state.mode === 'endless') {
    $('progress').textContent = `${state.index + 1}問目`;
    $('score').textContent = `連続 ${state.score}`;
  } else {
    $('progress').textContent = `${state.index + 1} / ${state.questions.length}`;
    $('score').textContent = `正解 ${state.score}`;
  }
}

function renderQuestion() {
  const q = state.questions[state.index];
  const p = q.pokemon;
  state.answered = false;
  renderHeader();

  $('enemy-name').textContent = p.name;
  $('enemy-mega').hidden = !p.mega;
  $('enemy-ability').textContent = abilityName(q.ability);

  const typesEl = $('enemy-types');
  typesEl.replaceChildren();
  if (state.difficulty === 'easy') {
    for (const t of p.types) typesEl.append(typeTag(t));
  } else {
    const hidden = document.createElement('span');
    hidden.className = 'type-hidden';
    hidden.textContent = 'タイプ：？？？';
    typesEl.append(hidden);
  }

  const img = $('enemy-image');
  img.hidden = false;
  img.onerror = () => { img.hidden = true; };
  img.src = p.image || '';
  img.alt = p.name;

  const movesEl = $('moves');
  movesEl.replaceChildren();
  q.results.forEach((r, i) => {
    const btn = document.createElement('button');
    btn.className = 'move';
    btn.style.setProperty('--type-color', TYPES[r.move.type].color);
    const name = document.createElement('span');
    name.className = 'move-name';
    name.textContent = r.move.name;
    const label = document.createElement('span');
    label.className = 'move-type';
    label.textContent = TYPES[r.move.type].name;
    btn.append(name, label);
    btn.addEventListener('click', () => answer(i));
    movesEl.append(btn);
  });

  $('feedback').hidden = true;
}

function isLastQuestion() {
  if (state.mode === 'endless') return !state.lastCorrect;
  return state.index + 1 >= state.questions.length;
}

function answer(choiceIndex) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.index];
  const correct = choiceIndex === q.correctIndex;
  state.lastCorrect = correct;
  if (correct) state.score++;
  Sound.play(correct ? 'correct' : 'wrong');
  renderHeader();

  const buttons = $('moves').children;
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
    if (i === q.correctIndex) buttons[i].classList.add('is-correct');
    else if (i === choiceIndex) buttons[i].classList.add('is-wrong');
  }

  $('feedback-title').textContent = correct ? 'せいかい！' : 'ざんねん…';
  $('feedback-title').className = 'feedback-title ' + (correct ? 'ok' : 'ng');
  $('feedback-types').textContent = `${q.pokemon.name}：${typeNames(q.pokemon.types)}／特性 ${abilityName(q.ability)}`;

  const list = $('feedback-list');
  list.replaceChildren();
  const order = q.results.map((r, i) => i).sort((a, b) => q.results[b].final - q.results[a].final);
  for (const i of order) {
    const r = q.results[i];
    const li = document.createElement('li');
    if (i === q.correctIndex) li.className = 'best';

    const head = document.createElement('div');
    head.className = 'feedback-move';
    const name = document.createElement('span');
    name.textContent = r.move.name;
    const mult = document.createElement('span');
    mult.className = 'mult';
    mult.textContent = r.abilityMult !== 1
      ? `${formatMultiplier(r.typeMult)} → ${formatMultiplier(r.final)}`
      : formatMultiplier(r.final);
    head.append(typeTag(r.move.type), name, mult);
    li.append(head);

    for (const note of [r.moveNote, r.abilityNote]) {
      if (!note) continue;
      const p = document.createElement('div');
      p.className = 'note';
      p.textContent = note;
      li.append(p);
    }
    list.append(li);
  }

  $('next-button').textContent = isLastQuestion() ? '結果を見る' : '次へ';
  $('feedback').hidden = false;
}

function next() {
  if (isLastQuestion()) {
    showResult();
    return;
  }
  Sound.play('tap');
  if (state.mode === 'endless') state.questions.push(state.nextEndless());
  state.index++;
  renderQuestion();
}

function showResult() {
  const { mode, difficulty, score } = state;
  const prev = loadHighScore(mode, difficulty);
  const isBest = score > 0 && (prev === null || score > prev);
  if (prev === null || score > prev) saveHighScore(mode, difficulty, score);

  if (mode === 'endless') {
    $('result-label').textContent = '連続正解';
    $('result-deviation').textContent = score;
    $('result-rank').hidden = true;
    $('result-score').textContent = `${score}問連続で正解！`;
    $('result-best').textContent = isBest ? 'ハイスコア更新！' : `ハイスコア：${prev ?? 0}連続`;
    $('result-caption').hidden = true;
  } else {
    const deviation = deviationScore(difficulty, score, state.questions.length);
    $('result-label').textContent = 'タイプ相性偏差値';
    $('result-deviation').textContent = deviation;
    $('result-rank').hidden = false;
    $('result-rank').textContent = deviationRank(deviation);
    $('result-score').textContent = `${score} / ${state.questions.length} 問正解`;
    $('result-best').textContent = isBest ? 'ハイスコア更新！' : `ハイスコア：${prev ?? 0} / ${CONFIG.questionsPerGame}`;
    $('result-caption').hidden = false;
  }
  Sound.play(isBest ? 'best' : 'result');
  showScreen('result');
}

// ---- 途中でやめる ----
function openQuitDialog() {
  Sound.play('tap');
  $('quit-dialog').hidden = false;
}

function closeQuitDialog() {
  $('quit-dialog').hidden = true;
}

// ---- イベント ----
for (const btn of document.querySelectorAll('[data-mode]')) {
  btn.addEventListener('click', () => {
    Sound.play('tap');
    setMode(btn.dataset.mode);
  });
}
for (const btn of document.querySelectorAll('[data-difficulty]')) {
  btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
}
for (const btn of document.querySelectorAll('.sound-toggle')) {
  btn.addEventListener('click', () => {
    Sound.setEnabled(!Sound.enabled);
    Sound.play('tap');
    renderSoundToggles();
  });
}
$('next-button').addEventListener('click', next);
$('retry-button').addEventListener('click', () => startGame(state.difficulty));
$('title-button').addEventListener('click', () => {
  Sound.play('tap');
  showTitle();
});
$('quit-button').addEventListener('click', openQuitDialog);
$('quit-cancel').addEventListener('click', () => {
  Sound.play('tap');
  closeQuitDialog();
});
$('quit-ok').addEventListener('click', () => {
  closeQuitDialog();
  Sound.play('tap');
  showTitle();
});
$('quit-dialog').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeQuitDialog();
});

renderSoundToggles();
showTitle();
