// 問題の作成

const CONFIG = {
  questionsPerGame: 10,
  // 相性を変える特性の候補があるとき、その特性で出題する確率
  relevantAbilityRate: 0.5,
};

const POKEMON = window.GENERATED_DATA.pokemon;

function abilityName(slug) {
  return window.GENERATED_DATA.abilityNames[slug] || ABILITY_NAME_FALLBACK[slug] || slug;
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickAbility(pokemon) {
  const relevant = pokemon.abilities.filter((a) => ABILITY_EFFECTS[a]);
  const others = pokemon.abilities.filter((a) => !ABILITY_EFFECTS[a]);
  if (relevant.length && others.length) {
    return randomItem(Math.random() < CONFIG.relevantAbilityRate ? relevant : others);
  }
  return randomItem(pokemon.abilities);
}

// 4 択を作る。タイプはすべて別々、一番倍率の高い技はちょうど 1 つ。
// 相性を変える特性のときは、なるべくその特性が効く技を混ぜる。
function buildChoices(pokemon, ability) {
  const wantAbilityMove = Boolean(ABILITY_EFFECTS[ability]);
  let fallback = null;
  for (let attempt = 0; attempt < 500; attempt++) {
    const picked = [];
    const usedTypes = new Set();
    for (const move of shuffle(MOVES)) {
      if (usedTypes.has(move.type)) continue;
      usedTypes.add(move.type);
      picked.push(move);
      if (picked.length === 4) break;
    }
    const results = picked.map((m) => evaluateMove(m, pokemon.types, ability));
    const max = Math.max(...results.map((r) => r.final));
    if (results.filter((r) => sameMultiplier(r.final, max)).length !== 1) continue;

    const choice = { results, correctIndex: results.findIndex((r) => sameMultiplier(r.final, max)) };
    if (!wantAbilityMove || results.some((r) => r.abilityNote)) return choice;
    fallback = fallback || choice;
  }
  return fallback;
}

function buildQuestion(pokemon) {
  const ability = pickAbility(pokemon);
  const choice = buildChoices(pokemon, ability);
  return choice && { pokemon, ability, ...choice };
}

// 1 ゲーム分の問題。同じポケモンは出さない。
function buildGame() {
  const questions = [];
  for (const pokemon of shuffle(POKEMON)) {
    const q = buildQuestion(pokemon);
    if (q) questions.push(q);
    if (questions.length === CONFIG.questionsPerGame) break;
  }
  return questions;
}
