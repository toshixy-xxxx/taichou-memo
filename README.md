# 体調メモ（無料版）

体温・薬・体重・血圧の4項目だけを、日付ごとに記録する軽量メモアプリです。  
**医療アドバイスではありません。** 記録用のメモ帳です。

## できること（無料版）

- 1画面で4項目を入力（体温 / 薬・飲んだ＋名前 / 体重 / 血圧の上下）
- 前回の値を自動で入れておき、変えたところだけ直して保存
- 同じ日に保存し直すと上書き
- これまでの記録一覧から日付を開いて編集
- データは端末のブラウザ内（localStorage）のみ。ログイン・サーバーなし
- ホーム画面に追加できる PWA（オフラインでもシェル表示）

## 入れていないもの

リマインダー / グラフ / CSV / PDF / 課金

## ローカルで開く

HTTPS または localhost が必要です（PWA と Service Worker のため）。

```bash
cd taichou-memo
python3 -m http.server 5173
# または
npx --yes serve -l 5173
```

ブラウザで http://localhost:5173 を開きます。  
スマホ実機でホーム画面追加する場合は、HTTPS の公開 URL が必要です（GitHub Pages など）。

## ファイル構成

- `index.html` … 画面
- `styles.css` … 見た目
- `app.js` … 保存・一覧ロジック
- `manifest.webmanifest` / `sw.js` / `icons/` … PWA
- `CLAUDE_PROMPT.md` … Claude Code 用の再構築指示

## 免責

これは記録用のメモ帳です。医療アドバイスではありません。体調の判断や薬の飲み方は医師・薬剤師に相談してください。

## 公開（任意）

GitHub に載せるとスマホから HTTPS で開け、ホーム画面追加もしやすくなります。

```bash
# gh ログイン後
cd taichou-memo
git init
git add .
git commit -m "feat: 体調メモ無料版 PWA"
gh repo create taichou-memo --public --source=. --remote=origin --push
# Settings → Pages → Deploy from branch main /
```

公開後の URL 例: `https://<user>.github.io/taichou-memo/`
