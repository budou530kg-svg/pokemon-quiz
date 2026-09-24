// 受けるダメージの倍率を変える特性。ここに無い特性は倍率に影響しない（表示のみ）。
// apply(move, ctx) は倍率を返す（1 なら影響なし）。ctx.typeMultiplier は特性を反映する前の相性倍率。
// note はその特性が効いたときに答え合わせで表示する説明。
function immuneTo(type, label) {
  return {
    apply: (move) => (move.type === type ? 0 : 1),
    note: `${label}で${TYPES[type].name}技は無効`,
  };
}

window.ABILITY_EFFECTS = {
  'levitate':        { apply: (m) => (m.type === 'ground' && m.special !== 'thousand-arrows' ? 0 : 1), note: 'ふゆうでじめん技は無効' },
  'eelevate':        { apply: (m) => (m.type === 'ground' && m.special !== 'thousand-arrows' ? 0 : 1), note: 'うなぎのぼりでじめん技は無効' },
  'earth-eater':     immuneTo('ground', 'どしょく'),
  'flash-fire':      immuneTo('fire', 'もらいび'),
  'well-baked-body': immuneTo('fire', 'こんがりボディ'),
  'water-absorb':    immuneTo('water', 'ちょすい'),
  'storm-drain':     immuneTo('water', 'よびみず'),
  'volt-absorb':     immuneTo('electric', 'ちくでん'),
  'lightning-rod':   immuneTo('electric', 'ひらいしん'),
  'motor-drive':     immuneTo('electric', 'でんきエンジン'),
  'sap-sipper':      immuneTo('grass', 'そうしょく'),
  'dry-skin': {
    apply: (m) => (m.type === 'water' ? 0 : m.type === 'fire' ? 1.25 : 1),
    note: 'かんそうはだでみず技は無効、ほのお技は×1.25',
  },
  'thick-fat': {
    apply: (m) => (m.type === 'fire' || m.type === 'ice' ? 0.5 : 1),
    note: 'あついしぼうでほのお技・こおり技は×0.5',
  },
  'heatproof':      { apply: (m) => (m.type === 'fire' ? 0.5 : 1), note: 'たいねつでほのお技は×0.5' },
  'water-bubble':   { apply: (m) => (m.type === 'fire' ? 0.5 : 1), note: 'すいほうでほのお技は×0.5' },
  'purifying-salt': { apply: (m) => (m.type === 'ghost' ? 0.5 : 1), note: 'きよめのしおでゴースト技は×0.5' },
  'fluffy': {
    apply: (m) => (m.type === 'fire' ? 2 : 1) * (m.contact ? 0.5 : 1),
    note: 'もふもふでほのお技は×2、接触技は×0.5',
  },
  'aura-guard':  { apply: (m) => (m.contact ? 0.5 : 1), note: 'はどうのぼうごで接触技は×0.5' },
  'fur-coat':    { apply: (m) => (m.category === 'physical' ? 0.5 : 1), note: 'ファーコートで物理技は×0.5' },
  'filter':      { apply: (m, ctx) => (ctx.typeMultiplier > 1 ? 0.75 : 1), note: 'フィルターで効果抜群の技は×0.75' },
  'solid-rock':  { apply: (m, ctx) => (ctx.typeMultiplier > 1 ? 0.75 : 1), note: 'ハードロックで効果抜群の技は×0.75' },
  'prism-armor': { apply: (m, ctx) => (ctx.typeMultiplier > 1 ? 0.75 : 1), note: 'プリズムアーマーで効果抜群の技は×0.75' },
  'multiscale':  { apply: () => 0.5, note: 'マルチスケイル（HP満タン）ですべての技が×0.5' },
  'soundproof':  { apply: (m) => (m.sound ? 0 : 1), note: 'ぼうおんで音の技は無効' },
  'punk-rock':   { apply: (m) => (m.sound ? 0.5 : 1), note: 'パンクロックで音の技は×0.5' },
  'bulletproof': { apply: (m) => (m.bullet ? 0 : 1), note: 'ぼうだんで弾・爆弾の技は無効' },
};

// PokeAPI に日本語名が無い特性
window.ABILITY_NAME_FALLBACK = {
  'aura-guard': 'はどうのぼうご',
  'eelevate': 'うなぎのぼり',
  'fire-mane': 'ほのおのたてがみ',
};
