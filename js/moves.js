// 出題に使う技。
//   category: physical（物理）/ special（特殊）
//   contact: 接触技か  sound: 音技か  bullet: 弾・爆弾技か（ぼうだんで無効）
//   special: 通常のタイプ相性と違う判定をする技（calc.js で処理）
window.MOVES = [
  { name: 'すてみタックル', type: 'normal', category: 'physical', contact: true },
  { name: 'ハイパーボイス', type: 'normal', category: 'special', sound: true },

  { name: 'かえんほうしゃ', type: 'fire', category: 'special' },
  { name: 'フレアドライブ', type: 'fire', category: 'physical', contact: true },

  { name: 'なみのり', type: 'water', category: 'special' },
  { name: 'アクアテール', type: 'water', category: 'physical', contact: true },

  { name: '10まんボルト', type: 'electric', category: 'special' },
  { name: 'ワイルドボルト', type: 'electric', category: 'physical', contact: true },

  { name: 'エナジーボール', type: 'grass', category: 'special', bullet: true },
  { name: 'ウッドハンマー', type: 'grass', category: 'physical', contact: true },

  { name: 'れいとうビーム', type: 'ice', category: 'special' },
  { name: 'つららおとし', type: 'ice', category: 'physical' },
  { name: 'フリーズドライ', type: 'ice', category: 'special', special: 'freeze-dry' },

  { name: 'インファイト', type: 'fighting', category: 'physical', contact: true },
  { name: 'きあいだま', type: 'fighting', category: 'special', bullet: true },
  { name: 'フライングプレス', type: 'fighting', category: 'physical', contact: true, special: 'flying-press' },

  { name: 'ヘドロばくだん', type: 'poison', category: 'special', bullet: true },
  { name: 'どくづき', type: 'poison', category: 'physical', contact: true },

  { name: 'じしん', type: 'ground', category: 'physical' },
  { name: 'だいちのちから', type: 'ground', category: 'special' },
  { name: 'サウザンアロー', type: 'ground', category: 'physical', special: 'thousand-arrows' },

  { name: 'ブレイブバード', type: 'flying', category: 'physical', contact: true },
  { name: 'エアスラッシュ', type: 'flying', category: 'special' },

  { name: 'サイコキネシス', type: 'psychic', category: 'special' },
  { name: 'しねんのずつき', type: 'psychic', category: 'physical', contact: true },

  { name: 'むしのさざめき', type: 'bug', category: 'special', sound: true },
  { name: 'とんぼがえり', type: 'bug', category: 'physical', contact: true },

  { name: 'ストーンエッジ', type: 'rock', category: 'physical' },
  { name: 'パワージェム', type: 'rock', category: 'special' },

  { name: 'シャドーボール', type: 'ghost', category: 'special', bullet: true },
  { name: 'シャドークロー', type: 'ghost', category: 'physical', contact: true },

  { name: 'りゅうせいぐん', type: 'dragon', category: 'special' },
  { name: 'げきりん', type: 'dragon', category: 'physical', contact: true },

  { name: 'あくのはどう', type: 'dark', category: 'special' },
  { name: 'かみくだく', type: 'dark', category: 'physical', contact: true },

  { name: 'ラスターカノン', type: 'steel', category: 'special' },
  { name: 'アイアンヘッド', type: 'steel', category: 'physical', contact: true },

  { name: 'ムーンフォース', type: 'fairy', category: 'special' },
  { name: 'じゃれつく', type: 'fairy', category: 'physical', contact: true },
];
