# Competitor Ads Scraping Playbook

Гайд як зібрати ТОП-N креативів конкурентів з FB Ads Library: завантажити, перейменувати, видалити дублікати.

Працювали з цим на 4 бренди: AyahPath, Liven, Rino, Relatio (червень 2026).

---

## 0. Що ти отримуєш на виході

В кожній папці бренду:
- `image_N_Brand.jpg` — статичний креатив (image ad), N = позиція по reach
- `thumbnail_N_Brand.jpg` — постер відео-реклами (перший кадр)
- `video_N_Brand.mp4` — повне відео-креатив
- `_manifest.json` — метадані (libId, startDate, URLs)

Номер `N` = позиція у FB-видачі за `total_impressions DESC` (1 = найвищий reach).

---

## 1. Як знайти pageId конкурента

З FB Ads Library URL береш параметр `view_all_page_id`:

```
https://www.facebook.com/ads/library/?...&view_all_page_id=601024163104573
                                                            ^^^^^^^^^^^^^^^
                                                            це pageId
```

Приклади з попередньої роботи:
| Бренд | pageId |
|---|---|
| AyahPath | 601024163104573 |
| Liven | 103537499312980 |
| Rino | 1115905991598438 |
| Relatio | 314199355102814 |

---

## 2. Setup (один раз)

```bash
mkdir -p /tmp/fb-scraper && cd /tmp/fb-scraper
npm init -y
npm install playwright
npx playwright install chromium
pip3 install imagehash  # для perceptual-дедупу
```

---

## 3. Скрипти

Усе у `/tmp/fb-scraper/`. Створи 3 файли.

### `scrape.js` — основний скрейпер

```javascript
// Usage: [ACTIVE_STATUS=all] node scrape.js <Brand> <pageId> <outDir> <imageOnly:0|1> <maxN> <startDateMin>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

const [, , BRAND, PAGE_ID, OUT_DIR, IMG_ONLY, MAX_N_STR, START_DATE_MIN] = process.argv;
const IMAGE_ONLY = IMG_ONLY === '1';
const MAX_N = parseInt(MAX_N_STR || '50', 10);

function buildUrl() {
  const mediaType = IMAGE_ONLY ? 'image' : 'all';
  const activeStatus = process.env.ACTIVE_STATUS || 'active';
  let u = `https://www.facebook.com/ads/library/?active_status=${activeStatus}&ad_type=all&country=ALL&is_targeted_country=false&media_type=${mediaType}&search_type=page&sort_data[direction]=desc&sort_data[mode]=total_impressions`;
  if (START_DATE_MIN) u += `&start_date[min]=${START_DATE_MIN}`;
  u += `&view_all_page_id=${PAGE_ID}`;
  return u;
}

function fetchToFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close(); fs.unlinkSync(dest);
        return fetchToFile(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (e) => { try { fs.unlinkSync(dest); } catch {} reject(e); });
  });
}

async function extractCards(page) {
  return await page.evaluate(() => {
    const out = [];
    const libSpans = Array.from(document.querySelectorAll('*')).filter(el =>
      Array.from(el.childNodes).some(n => n.nodeType === 3 && /Library ID/.test(n.textContent))
    );
    const seen = new Set();
    for (const libNode of libSpans) {
      const libId = (libNode.textContent.match(/Library ID:\s*(\d+)/) || [])[1];
      if (!libId || seen.has(libId)) continue;
      seen.add(libId);
      let cur = libNode; let depth = 0; let cardRoot = null;
      while (cur && depth < 15) {
        if (cur.querySelectorAll('img').length > 1 || cur.querySelectorAll('video').length > 0) { cardRoot = cur; break; }
        cur = cur.parentElement; depth++;
      }
      if (!cardRoot) continue;
      const text = cardRoot.innerText || '';
      const startDate = (text.match(/Started running on ([^\n]+)/) || [])[1] || null;
      const imgs = Array.from(cardRoot.querySelectorAll('img'))
        .map(i => ({ src: i.src, w: i.naturalWidth || i.width, h: i.naturalHeight || i.height }))
        .filter(i => i.src && !i.src.includes('s60x60'));  // skip 60x60 profile icons
      const videos = Array.from(cardRoot.querySelectorAll('video'))
        .map(v => ({ src: v.src || (v.querySelector('source')?.src) || null, poster: v.poster || null }))
        .filter(v => v.src);
      let creative = null;
      if (imgs.length) { imgs.sort((a,b)=>b.w*b.h - a.w*a.h); creative = imgs[0].src; }
      out.push({
        libId, startDate,
        videoSrc: videos[0]?.src || null,
        thumbSrc: creative || videos[0]?.poster || null,
      });
    }
    return out;
  });
}

function mergeCard(existing, fresh) {
  return {
    libId: fresh.libId,
    startDate: existing.startDate || fresh.startDate,
    videoSrc: existing.videoSrc || fresh.videoSrc,
    thumbSrc: existing.thumbSrc || fresh.thumbSrc,
    order: existing.order,
  };
}

async function scrollAndCollect(page, targetCount) {
  const seen = new Map();
  let stagnant = 0;
  for (let i = 0; i < 80 && (seen.size < targetCount || stagnant < 3); i++) {
    const cards = await extractCards(page);
    for (const c of cards) {
      if (!seen.has(c.libId)) seen.set(c.libId, { ...c, order: seen.size });
      else seen.set(c.libId, mergeCard(seen.get(c.libId), c));
    }
    process.stdout.write(`  scroll ${i+1}: ${seen.size} cards\r`);
    const before = seen.size;
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
    await page.waitForTimeout(1200);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    if (seen.size === before) stagnant++; else stagnant = 0;
    if (seen.size >= targetCount + 5 && stagnant >= 1) break;
  }
  console.log(`\n  Discovered ${seen.size} cards. Re-scanning for lazy videos...`);

  // Hover each video to trigger lazy src load
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  const videoHandles = await page.$$('video');
  for (let i = 0; i < videoHandles.length; i++) {
    try {
      await videoHandles[i].scrollIntoViewIfNeeded({ timeout: 3000 });
      await videoHandles[i].hover({ timeout: 2000 });
      await page.waitForTimeout(400);
    } catch {}
  }
  await page.waitForTimeout(2000);
  const finalCards = await extractCards(page);
  for (const c of finalCards) if (seen.has(c.libId)) seen.set(c.libId, mergeCard(seen.get(c.libId), c));
  const withVid = Array.from(seen.values()).filter(c => c.videoSrc).length;
  console.log(`  Total: ${seen.size} cards, ${withVid} with video src`);
  return Array.from(seen.values()).sort((a, b) => a.order - b.order);
}

(async () => {
  console.log(`\n=== ${BRAND} (pageId=${PAGE_ID}, imageOnly=${IMAGE_ONLY}, max=${MAX_N}) ===`);
  const url = buildUrl();
  console.log('URL:', url);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);
  const totalText = await page.evaluate(() => {
    const m = document.body.innerText.match(/~?\s*(\d[\d,]*)\s+result/i);
    return m ? m[0] : 'unknown';
  });
  console.log(`Total results: ${totalText}`);

  const allCards = await scrollAndCollect(page, MAX_N);
  await browser.close();

  const top = allCards.slice(0, MAX_N);
  console.log(`Selected top ${top.length}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(top, null, 2));

  const jpgPrefix = IMAGE_ONLY ? 'image_' : '';
  const tasks = [];
  for (let i = 0; i < top.length; i++) {
    const pos = i + 1, c = top[i];
    if (c.thumbSrc) tasks.push(fetchToFile(c.thumbSrc, path.join(OUT_DIR, `${jpgPrefix}${pos}_${BRAND}.jpg`))
      .then(()=>process.stdout.write('.')).catch(e=>console.log(`\n! ${pos}.jpg: ${e.message}`)));
    if (!IMAGE_ONLY && c.videoSrc) tasks.push(fetchToFile(c.videoSrc, path.join(OUT_DIR, `${pos}_${BRAND}.mp4`))
      .then(()=>process.stdout.write('v')).catch(e=>console.log(`\n! ${pos}.mp4: ${e.message}`)));
  }
  await Promise.all(tasks);
  console.log(`\nDone: ${OUT_DIR}`);
})();
```

### `rename.js` — перейменування mixed-scrape файлів (image/thumbnail/video)

Тільки потрібен якщо запускав `scrape.js` без `IMAGE_ONLY=1` (тоді файли просто `N_Brand.jpg`/`.mp4` без префікса типу).

```javascript
const fs = require('fs');
const path = require('path');
const HOME = process.env.HOME;
const BRANDS = [
  { name: 'AyahPath', dir: `${HOME}/Downloads/AyahPath`, imageOnly: false },
  { name: 'Liven',    dir: `${HOME}/Downloads/Liven`,    imageOnly: false },
  { name: 'Rino',     dir: `${HOME}/Downloads/Rino`,     imageOnly: false },
  { name: 'Relatio',  dir: `${HOME}/Downloads/Relatio`,  imageOnly: true  },
];

function classify(card, imageOnly) {
  if (imageOnly) return 'image';
  if (card.videoSrc) return 'thumbnail';
  // /t0.49642-6/ in URL = full static image creative; otherwise video poster
  return /\/t0\.49642-6\//.test(card.thumbSrc || '') ? 'image' : 'thumbnail';
}

for (const b of BRANDS) {
  const manifest = JSON.parse(fs.readFileSync(path.join(b.dir, '_manifest.json'), 'utf8'));
  manifest.forEach((card, i) => {
    const pos = i + 1;
    const oldJpg = path.join(b.dir, `${pos}_${b.name}.jpg`);
    const oldMp4 = path.join(b.dir, `${pos}_${b.name}.mp4`);
    const kind = classify(card, b.imageOnly);
    if (fs.existsSync(oldJpg)) fs.renameSync(oldJpg, path.join(b.dir, `${kind}_${pos}_${b.name}.jpg`));
    if (fs.existsSync(oldMp4)) fs.renameSync(oldMp4, path.join(b.dir, `video_${pos}_${b.name}.mp4`));
  });
  console.log(`${b.name}: renamed`);
}
```

### `dedup.js` — MD5 дедуп (байтово-однакові файли)

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const HOME = process.env.HOME;
const BRANDS = ['AyahPath', 'Liven', 'Rino', 'Relatio'];
const TRASH_DIR = path.join(HOME, '.Trash');

function getPos(filename) { const m = filename.match(/_(\d+)_/); return m ? parseInt(m[1],10) : Infinity; }
function md5(p) { return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex'); }
function moveToTrash(filePath) {
  const base = path.basename(filePath);
  let dest = path.join(TRASH_DIR, base);
  if (fs.existsSync(dest)) {
    const ext = path.extname(base), stem = base.slice(0, -ext.length);
    let i = 1;
    while (fs.existsSync(path.join(TRASH_DIR, `${stem}_${i}${ext}`))) i++;
    dest = path.join(TRASH_DIR, `${stem}_${i}${ext}`);
  }
  fs.renameSync(filePath, dest);
}

for (const brand of BRANDS) {
  const dir = path.join(HOME, 'Downloads', brand);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.mp4'));
  const byType = { image: [], thumbnail: [], video: [] };
  for (const f of files) for (const t of Object.keys(byType)) if (f.startsWith(`${t}_`)) byType[t].push(f);

  console.log(`\n=== ${brand} ===`);
  for (const type of Object.keys(byType)) {
    const list = byType[type];
    if (!list.length) continue;
    const groups = new Map();
    for (const f of list) {
      const h = md5(path.join(dir, f));
      if (!groups.has(h)) groups.set(h, []);
      groups.get(h).push(f);
    }
    let removed = 0;
    for (const group of [...groups.values()].filter(g => g.length > 1)) {
      group.sort((a, b) => getPos(a) - getPos(b));
      console.log(`  ${type}: keeping ${group[0]}, removing ${group.slice(1)}`);
      for (const drop of group.slice(1)) { moveToTrash(path.join(dir, drop)); removed++; }
    }
    console.log(`  ${type}: ${list.length} → ${list.length - removed} (-${removed})`);
  }
}
```

### `pdedup.py` — perceptual hash дедуп (візуально-схожі)

```python
#!/usr/bin/env python3
"""Perceptual-hash dedup. Hamming distance <= 5 = duplicate.
Run AFTER dedup.js to catch visually-similar images that differ in encoding/crop."""
import re
from pathlib import Path
from PIL import Image
import imagehash

HOME = Path.home()
TRASH = HOME / '.Trash'
BRANDS = ['AyahPath', 'Liven', 'Rino', 'Relatio']
THRESHOLD = 5  # raise for looser matching, lower for stricter

def pos_of(name):
    m = re.search(r'_(\d+)_', name)
    return int(m.group(1)) if m else 999999

def move_to_trash(src):
    dest = TRASH / src.name
    if dest.exists():
        i = 1
        while (TRASH / f"{src.stem}_{i}{src.suffix}").exists(): i += 1
        dest = TRASH / f"{src.stem}_{i}{src.suffix}"
    src.rename(dest)

for brand in BRANDS:
    folder = HOME / 'Downloads' / brand
    if not folder.is_dir(): continue
    print(f"\n=== {brand} ===")
    by_type = {'image': [], 'thumbnail': []}
    for f in folder.iterdir():
        if f.suffix != '.jpg': continue
        for t in by_type:
            if f.name.startswith(f'{t}_'): by_type[t].append(f)
    for t, files in by_type.items():
        if len(files) < 2: continue
        hashes = []
        for f in files:
            try:
                with Image.open(f) as im:
                    hashes.append((f, imagehash.phash(im, hash_size=16)))
            except Exception as e: print(f"  ! {f.name}: {e}")
        hashes.sort(key=lambda x: pos_of(x[0].name))
        clusters = []
        for f, h in hashes:
            for c in clusters:
                if (h - c['anchor_hash']) <= THRESHOLD:
                    c['dups'].append(f); break
            else:
                clusters.append({'anchor': f, 'anchor_hash': h, 'dups': []})
        removed = 0
        for c in clusters:
            if not c['dups']: continue
            print(f"  {t}: keeping {c['anchor'].name}, removing {[d.name for d in c['dups']]}")
            for d in c['dups']: move_to_trash(d); removed += 1
        print(f"  {t}: {len(files)} → {len(files) - removed} (-{removed})")
```

---

## 4. Як це запускати

Припустимо новий конкурент `BrandX` з `pageId=12345678`. Хочемо top-50 images за останні 6 місяців.

### A) Лише images (рекомендовано — найчистіший формат):

```bash
mkdir -p ~/Downloads/BrandX
cd /tmp/fb-scraper
# IMAGE_ONLY=1, ACTIVE_STATUS=all (інакше у багатьох брендів буде 0 image-ads),
# 6mo назад від сьогодні — заміни дату
ACTIVE_STATUS=all node scrape.js BrandX 12345678 ~/Downloads/BrandX 1 50 2025-12-11
node dedup.js  # додай BrandX у масив BRANDS зверху скрипта
python3 pdedup.py  # додай BrandX у масив BRANDS зверху скрипта
```

### B) Mixed (image + thumbnail + video) — повний пакет:

```bash
mkdir -p ~/Downloads/BrandX
cd /tmp/fb-scraper
node scrape.js BrandX 12345678 ~/Downloads/BrandX 0 50 2025-12-11
node rename.js  # додай BrandX у масив BRANDS
node dedup.js
python3 pdedup.py
```

---

## 5. Параметри і логіка

### 5.1 URL параметри FB Ads Library

| Param | Значення | Чому |
|---|---|---|
| `country=ALL` | всі країни | глобальний пул креативів |
| `is_targeted_country=false` | будь-які таргети | не обмежуємо |
| `media_type=image` або `all` | тип медіа | image-only для статичних, all для відео + image |
| `active_status=active` або `all` | активність | див. нижче |
| `sort_data[mode]=total_impressions` | ранжування | FB-внутрішня оцінка reach (точні цифри не показуються) |
| `start_date[min]=YYYY-MM-DD` | дата | "Impressions by date" фільтр (не start date реклами!) |

### 5.2 `active=active` vs `active=all` — критичне рішення

- `active=active` — тільки крутяться зараз. Для деяких брендів (наприклад AyahPath, Rino) image-ads тут просто **0**.
- `active=all` — включає inactive (вже не крутяться). Дає історичні топ-креативи за заданий період. Як правило більше і репрезентативніше для аналізу "що працювало".

**За замовчуванням:** `ACTIVE_STATUS=all` коли збираєш images.

### 5.3 Reach data

**FB не показує цифри reach публічно** для комерційних реклам у US. Сортування `total_impressions` все одно працює — FB знає reach внутрішньо і ранжує. Тому **порядок у видачі = порядок по reach**, і ми довіряємо першим N карткам.

Не намагайся клікати "See ad details" для точних цифр reach — це сповільнить у 10× і ризик анти-бот блоку.

### 5.4 Класифікація типу креативу

Скрипт `rename.js` визначає тип по структурі URL:
- Файл містить `/t0.49642-6/` у `thumbSrc` → **image** (статичний креатив)
- Є `videoSrc` → **thumbnail** (постер відео-реклами)
- Решта (немає videoSrc, але і не `t0.49642-6`) → **thumbnail** (постер відео де src не завантажилось)

### 5.5 Lazy-loading відео

FB вантажить `<video src>` тільки коли елемент в viewport + hover. Тому:
- Для одних брендів (Liven) спрацьовує добре — ~80% video src ловимо
- Для інших (Rino) — погано, ~5%. FB чи throttle, чи різний lazy-load.

Постери (thumbnails) ловимо завжди, бо вони inline в DOM.

### 5.6 Дедуп — 2 проходи

1. **MD5** (`dedup.js`) — байтова ідентичність. Ловить однакові креативи у різних ad-варіантах (різна аудиторія/копірайт, той самий креатив). Зазвичай **20-50%** від файлів.
2. **Perceptual hash** (`pdedup.py`) — pHash 256-bit, Hamming distance ≤ 5. Ловить візуально однакові з мікро-різницями кодування/crop. Зазвичай **2-7 файлів** додатково.

Обидва зберігають файл з найменшим номером (= найвищий reach).

Видалене у `~/.Trash`, recovery через Bin у Finder.

---

## 6. Типові пастки

1. **`media_type=image` повертає 0** — нормально для багатьох брендів якщо `active_status=active`. Перейди на `active_status=all`.
2. **Date filter** — параметр `start_date[min]` у FB означає **"Impressions by date"** (коли реклама показувалась), а не дата запуску. Для нашої мети це норм.
3. **Дата = сьогодні мінус N місяців.** Для 6мо назад: `date -v-6m +%Y-%m-%d` (macOS).
4. **Окремі бренди мають дуже мало image-ads.** AyahPath у 6мо мав 5 штук — і це весь пул. Не помилка скрипта.
5. **EU country** не дає reach numbers у DOM. Залишай `country=ALL`.
6. **Аватарки сторінок** автоматично відфільтровуються через `s60x60` патерн.

---

## 7. Запис попередньої сесії (червень 2026)

**Вхідні**: 4 бренди з FB Ads Library URLs. ТЗ: top-50 image-креативів по reach за 6 місяців.

**Підсумок**:

| Бренд | pageId | image | thumbnail | video |
|---|---|---|---|---|
| AyahPath | 601024163104573 | 5 | 33 | 13 |
| Liven | 103537499312980 | 25 | 37 | 38 |
| Rino | 1115905991598438 | 35 | 33 | 2 |
| Relatio | 314199355102814 | 25 | — | — |

**Розмір**: ~345 MB сумарно. **Дублікатів видалено**: 102 (95 MD5 + 7 perceptual).

Папки у `~/Downloads/{Brand}/`. Маніфести у `_manifest.json` кожної.
