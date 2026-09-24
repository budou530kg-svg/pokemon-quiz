// 画面の制御

const $ = (id) => document.getElementById(id);

const state = {
  difficulty: 'easy',
  questions: [],
  index: 0,
  score: 0,
  answered: false,
};

// ---- ハイスコア（ブラウザに保存。使えない環境でも動くようにする） ----
function loadHighScore(difficulty) {
  try {
    const v = localStorage.getItem('highscore-' + difficulty);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

function saveHighScore(difficulty, score) {
  try {
    localStorage.setItem('highscore-' + difficulty, String(score));
  } catch {
    // 保存できなくてもゲームは続ける
  }
}

// ---- 画面切り替え ----
function showScreen(name) {
  for (const s of document.querySelectorAll('.screen')) s.hidden = s.id !== 'screen-' + name;
  window.scrollTo(0, 0);
}

function showTitle() {
  for (const d of ['easy', 'normal']) {
    const hs = loadHighScore(d);
    $('hs-' + d).textContent = hs === null ? '-' : `${hs} / ${CONFIG.questionsPerGame}`;
  }
  showScreen('title');
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
  state.questions = buildGame();
  state.index = 0;
  state.score = 0;
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  const p = q.pokemon;
  state.answered = false;

  $('progress').textContent = `${state.index + 1} / ${state.questions.length}`;
  $('score').textContent = `正解 ${state.score}`;

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

function answer(choiceIndex) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.index];
  const correct = choiceIndex === q.correctIndex;
  if (correct) state.score++;
  $('score').textContent = `正解 ${state.score}`;

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

  $('next-button').textContent = state.index + 1 < state.questions.length ? '次へ' : '結果を見る';
  $('feedback').hidden = false;
}

function next() {
  state.index++;
  if (state.index < state.questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const prev = loadHighScore(state.difficulty);
  const isBest = prev === null || state.score > prev;
  if (isBest) saveHighScore(state.difficulty, state.score);

  $('result-score').textContent = state.score;
  $('result-total').textContent = state.questions.length;
  $('result-best').textContent = isBest
    ? 'ハイスコア更新！'
    : `ハイスコア：${prev} / ${CONFIG.questionsPerGame}`;
  showScreen('result');
}

// ---- イベント ----
for (const btn of document.querySelectorAll('[data-difficulty]')) {
  btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
}
$('next-button').addEventListener('click', next);
$('retry-button').addEventListener('click', () => startGame(state.difficulty));
$('title-button').addEventListener('click', showTitle);

showTitle();
