# 美麗的詞彙

```
index.html        寫卡片的頁面（HTML 結構）
book.html         翻頁收集簿（HTML 結構）
css/maker.css     寫卡片頁的樣式
css/book.css      收集簿的樣式
js/maker.js       寫卡片頁的程式：紙張、字體、文字排版、手寫、存檔
js/book.js        收集簿的程式：讀 entries.json、排頁、翻頁、放大
entries.json      收集簿收錄了哪些卡片
cards/            收錄的卡片圖片
papers/           玩家可以選的紙張（圖片＋papers.json）
```

想改什麼大概去哪裡找：

- 文字說明 → `index.html`
- 顏色、間距、字級 → `css/` 裡對應的檔案
- 字體、墨水顏色的選項 → `js/maker.js` 最上面的 `FONTS`、`INKS`
- 卡片上字的位置和大小 → `js/maker.js` 的 `drawText`
- 收集簿每面放幾張 → `js/book.js` 最上面的 `PER_PAGE`

## 第一次上線（GitHub Pages）

1. 在 GitHub 建一個新的公開 repo，把整個資料夾的檔案推上去。
2. repo 的 Settings → Pages → Source 選「Deploy from a branch」，分支選 `main`、資料夾選 `/ (root)`，儲存。
3. 等一兩分鐘，網址會是 `https://你的帳號.github.io/repo名稱/`。
   收集簿在同一個網址後面加 `book.html`。

## 收錄一張卡片

1. 把玩家貼在噗浪的圖片存下來，放進 `cards/`，檔名建議用英數字，例如 `001.png`。
2. 打開 `entries.json`，在 `entries` 裡加一行（照順序排，每面放 3 張）：

   ```json
   { "src": "cards/001.png", "name": "角色名", "word": "詞彙" }
   ```

   `name` 和 `word` 只是給讀屏軟體看的替代文字，可以省略，但建議留著。
   注意每一行之間要有逗號，最後一行後面不能有逗號。

3. commit、push，等一兩分鐘重新整理收集簿就會看到。

## 新增紙張

1. 做一張 **1200×700** 的圖（比例 600:350 也可以，會自動縮放）。
   想要撕破、不規則的邊緣，就用透明背景存成 PNG。
2. 放進 `papers/`，在 `papers/papers.json` 加一行：

   ```json
   { "id": "kraft", "label": "牛皮紙", "src": "papers/kraft.png", "left": 0 }
   ```

   - `id`：英數字，不要重複
   - `label`：按鈕上顯示的名稱
   - `left`：左邊要空出的寬度（以 600 寬計算），例如紙的左邊有裝飾或紅線，文字會往右邊挪；沒有就填 0

3. 設計時留意這幾個位置會放字：右上角（城鎮編號）、正中間（讀音、詞彙、辭義）、右下角（署名）。裝飾盡量避開。
4. 範例的 `pink-grid.png`、`torn-old.png` 是我用程式隨便做的，可以直接刪掉換成你的。
   刪掉時記得也把 `papers.json` 裡對應那一行拿掉。

「舊筆記本」是程式畫的，永遠會是第一個選項。

## 正式開放前

- 刪掉 `cards/sample-*.png`，並把 `entries.json` 的 `entries` 清成 `[]`。
- `entries.json` 的 `title`、`subtitle`、`intro` 可以改封面標題、副標，以及扉頁的文字（`intro` 裡用 `\n` 換行）。翻開封面後的第一個跨頁就是扉頁，`intro` 沒寫的話會是空白的。
- `index.html` 最上方的筆記本敘述，以及最下面「怎麼參加」的文字，都可以直接改。

## 小提醒

- 直接在電腦上雙擊打開 `book.html` 會讀不到 `entries.json`，這是瀏覽器的限制，要用 GitHub Pages 的網址看。
  本機想預覽的話，在資料夾裡執行 `python -m http.server`，再開 `http://localhost:8000/book.html`。
- 字體從 Google Fonts 載入；如果某種字體載不到，會自動改用系統字體。
