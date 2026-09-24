# こうかばつぐんクイズ

ポケモンチャンピオンズに登場するポケモンに対して、一番通りがいい技を 4 択で選ぶブラウザゲーム。
個人・友人向けの非公式ファンメイド。

## 遊び方（ローカル）

`index.html` をブラウザで開くだけで動く（ビルド不要）。

## ファイル構成

| パス | 内容 |
|---|---|
| `data/roster.txt` | 出題対象のポケモン一覧（手で編集する） |
| `data/pokemon.js` | `roster.txt` から生成したデータ（手で編集しない） |
| `js/types.js` | タイプ名・色・相性表 |
| `js/moves.js` | 出題に使う技 |
| `js/abilities.js` | 受けるダメージを変える特性の効果 |
| `js/calc.js` | 倍率計算 |
| `js/quiz.js` | 出題ルール（1 ゲームの問題数、特性の出題確率など） |
| `js/app.js` | 画面の制御 |
| `tests/test.html` | 倍率計算と出題のテスト（ブラウザで開くと結果が出る） |

## ポケモン一覧を更新する

1. `data/roster.txt` を編集する（PokeAPI のポケモン名で 1 行 1 匹）。
2. PowerShell で次を実行する。

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\build-data.ps1
   ```

3. `scripts/abilities-review.tsv` に全特性の一覧と効果（英語）が出るので、
   新しくダメージ倍率に関わる特性が増えていたら `js/abilities.js` に追加する。

## GitHub Pages で公開する

1. GitHub で新しいリポジトリを作る（例: `pokemon-quiz`）。
2. このフォルダの中身をすべてアップロードする
   （リポジトリ画面の「Add file → Upload files」にドラッグ＆ドロップでも可。`scripts/.cache` は不要）。
3. リポジトリの Settings → Pages → Branch を `main` / `(root)` にして Save。
4. 数分後に `https://<ユーザー名>.github.io/pokemon-quiz/` で開けるようになる。
