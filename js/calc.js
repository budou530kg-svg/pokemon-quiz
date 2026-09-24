// 技 × 相手（タイプ・特性）の倍率計算

const EPS = 1e-9;

// 特性を反映する前のタイプ相性倍率
function typeMultiplier(move, defenderTypes) {
  let total = 1;
  for (const t of defenderTypes) {
    let m = TYPE_CHART[move.type][t] ?? 1;
    if (move.special === 'freeze-dry' && t === 'water') m = 2;
    if (move.special === 'thousand-arrows' && t === 'flying') m = 1;
    if (move.special === 'flying-press') m *= TYPE_CHART.flying[t] ?? 1;
    total *= m;
  }
  return total;
}

// 技そのものの特殊な相性の説明（効いた場合のみ）
function moveNote(move, defenderTypes, ability) {
  if (move.special === 'freeze-dry' && defenderTypes.includes('water')) {
    return 'フリーズドライはみずタイプに効果抜群';
  }
  if (move.special === 'thousand-arrows' &&
      (defenderTypes.includes('flying') || ability === 'levitate' || ability === 'eelevate')) {
    return 'サウザンアローはひこうタイプ・ふゆうのポケモンにも当たる';
  }
  if (move.special === 'flying-press') {
    return 'フライングプレスはかくとうとひこう両方の相性がかかる';
  }
  return null;
}

// 1 つの技の評価結果
function evaluateMove(move, defenderTypes, ability) {
  const typeMult = typeMultiplier(move, defenderTypes);
  const effect = ABILITY_EFFECTS[ability];
  const abilityMult = effect ? effect.apply(move, { typeMultiplier: typeMult }) : 1;
  return {
    move,
    typeMult,
    abilityMult,
    final: typeMult * abilityMult,
    abilityNote: abilityMult !== 1 ? effect.note : null,
    moveNote: moveNote(move, defenderTypes, ability),
  };
}

function sameMultiplier(a, b) {
  return Math.abs(a - b) < EPS;
}

function formatMultiplier(x) {
  return '×' + Number(x.toFixed(4));
}
