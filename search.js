const surahs = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

const $ = (id) => document.getElementById(id);
const surahSelect = $("surahSelect");
const searchBox = $("searchBox");
const resultsEl = $("results");
const suggestionsEl = $("suggestions");
const loadingEl = $("loading");
const introCardEl = $("introCard");
const surahMetaEl = $("surahMeta");
const metaSurahNameEl = $("metaSurahName");
const metaAyahCountEl = $("metaAyahCount");

let allData = null; // cached Quran
let tokenSet = null; // normalized vocabulary set

const BISMILLAH_NORMALIZED = "بسم الله الرحمن الرحيم";

const BISMILLAH_NORM = "بسم الله الرحمن الرحيم";

function normalizeArabic(str) {
  if (!str) return "";
  return str
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u0640]/g, "") // Diacritics
    .replace(/[إأآٱ]/g, "ا") // Alefs
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0621-\u064A\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBasmala(text, surahNumber, ayahNumber) {
  if (!text || surahNumber === 1 || ayahNumber !== 1 || surahNumber === 9) return text;

  const nt = normalizeArabic(text);
  if (nt.startsWith(BISMILLAH_NORM)) {
      // Split by space and check the first 4 words
      const words = text.trim().split(/\s+/);
      if (words.length >= 4) {
          const firstFourNorm = normalizeArabic(words.slice(0, 4).join(" "));
          if (firstFourNorm === BISMILLAH_NORM) {
              const stripped = words.slice(4).join(" ").trim();
              return stripped.length > 0 ? stripped : text;
          }
      }
      
      // Fallback: character-based search if split is tricky
      let nIdx = 0, tIdx = 0;
      while (tIdx < text.length && nIdx < BISMILLAH_NORM.length) {
          const cn = normalizeArabic(text[tIdx]);
          if (cn.length > 0) nIdx += cn.length;
          tIdx++;
      }
      while (tIdx < text.length && normalizeArabic(text[tIdx]).length === 0) tIdx++;
      const result = text.substring(tIdx).trim();
      return result.length > 0 ? result : text;
  }
  return text;
}

const surahNamesNormalized = surahs.map(normalizeArabic);

function stripAl(word) {
  return word.startsWith("ال") ? word.slice(2) : word;
}

function highlight(text, q) {
  const nQ = normalizeArabic(q);
  const nText = normalizeArabic(text);
  const idx = nText.indexOf(nQ);
  if (idx === -1) return text;
  // approximate highlight by slicing original text using lengths
  let count = 0, start = -1, end = -1;
  for (let i = 0; i < text.length; i++) {
    const c = normalizeArabic(text[i]);
    if (c.length === 0) continue;
    if (count === idx) start = i;
    if (count === idx + nQ.length - 1) { end = i; break; }
    count += c.length;
  }
  if (start === -1) return text;
  if (end === -1) end = text.length - 1;
  return text.slice(0, start) + '<mark class="bg-yellow-200 px-1 rounded">' + text.slice(start, end + 1) + "</mark>" + text.slice(end + 1);
}

function levenshtein(a, b) {
  const an = a.length, bn = b.length;
  if (an === 0) return bn; if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => new Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

function buildVocabulary() {
  const set = new Map(); // token -> freq
  allData.data.surahs.forEach(s => {
    s.ayahs.forEach(a => {
      const tokens = normalizeArabic(a.text).split(/[^\p{L}]+/u).filter(Boolean);
      tokens.forEach(t => set.set(t, (set.get(t) || 0) + 1));
    });
  });
  tokenSet = set;
}

function toArabicDigits(n) {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

function suggest(query) {
  if (!tokenSet) return [];
  const nq = stripAl(normalizeArabic(query));
  const candidates = [];
  for (const [tok, freq] of tokenSet.entries()) {
    const d = levenshtein(nq, tok);
    if (d <= 2) candidates.push({ tok, freq, d });
  }
  candidates.sort((a, b) => a.d - b.d || b.freq - a.freq);
  return candidates.slice(0, 5).map(x => x.tok);
}

function ensureSurahOptions() {
  if (surahSelect.options.length > 1) return;
  surahs.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = String(i + 1);
    opt.textContent = `سورة ${name}`;
    surahSelect.appendChild(opt);
  });
}

let simpleQuran = null; // cached simple text for better search

async function ensureQuranLoaded() {
  if (allData && simpleQuran) return;
  
  loadingEl.classList.remove('hidden');
  
  try {
    if (!allData) {
        const res = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
        const json = await res.json();
        if (json && json.data) allData = json;
    }
    
    if (!simpleQuran) {
        const resSimple = await fetch('https://api.alquran.cloud/v1/quran/quran-simple');
        const jsonSimple = await resSimple.json();
        if (jsonSimple && jsonSimple.data) {
            simpleQuran = jsonSimple;
            // Pre-process for faster search
            simpleQuran.data.surahs.forEach(s => {
                s.ayahs.forEach(a => {
                    const textView = stripBasmala(a.text, s.number, a.numberInSurah);
                    a.searchable = normalizeArabic(textView);
                });
            });
        }
    }
  } catch (e) {
    console.error("Quran load failed", e);
  } finally {
    loadingEl.classList.add('hidden');
  }
}

function updateSurahMeta() {
  if (!allData || surahSelect.value === 'all') {
    surahMetaEl.classList.add('hidden');
    return;
  }
  const sNum = Number(surahSelect.value);
  const s = allData.data.surahs.find(x => x.number === sNum);
  if (!s) { surahMetaEl.classList.add('hidden'); return; }
  metaSurahNameEl.textContent = s.name;
  metaAyahCountEl.textContent = toArabicDigits(s.ayahs.length);
  surahMetaEl.classList.remove('hidden');
}

function searchInAyahs(sNum, sName, query) {
  const normalizedQuery = query.trim();
  const isNumber = /^\d+$/.test(normalizedQuery);
  const searchNumber = isNumber ? parseInt(normalizedQuery) : null;
  
  const nq = normalizeArabic(normalizedQuery);
  const words = nq.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0 && !isNumber) return [];

  // Fallback to allData if simpleQuran didn't load
  const sourceQuran = simpleQuran || allData;
  if (!sourceQuran || !sourceQuran.data) return [];
  
  const s = sourceQuran.data.surahs.find(x => x.number === sNum);
  if (!s) return [];

  const results = [];
  s.ayahs.forEach((a, idx) => {
    const ayNum = a.numberInSurah || (idx + 1);
    const ayTextStripped = stripBasmala(a.text, sNum, ayNum);
    
    if (isNumber) {
        if (ayNum === searchNumber) {
            const uthmaniS = allData?.data?.surahs?.find(x => x.number === sNum);
            results.push({ ayah: uthmaniS?.ayahs[idx] || a, surah: { number: sNum, name: sName } });
        }
        return;
    }

    // Use the dynamic stripped text for searching to avoid cache issues or partial matches
    const nt = normalizeArabic(ayTextStripped);
    
    // Check if ALL words exist in the text in any order
    const isMatch = words.every(word => {
        if (nt.includes(word)) return true;
        const noAl = stripAl(word);
        return (noAl.length > 2 && nt.includes(noAl)) || (word.length > 2 && nt.includes(word));
    });

    if (isMatch) {
      const uthmaniS = allData?.data?.surahs?.find(x => x.number === sNum);
      const uthmaniA = uthmaniS?.ayahs[idx];
      results.push({ 
        ayah: uthmaniA || a, 
        surah: { number: sNum, name: sName } 
      });
    }
  });
  return results;
}

function renderResults(matches, prefixHtml = '') {
  resultsEl.innerHTML = prefixHtml;
  if (matches.length === 0) {
    if (!prefixHtml) {
        resultsEl.innerHTML = '<div class="text-center bg-white border border-gray-200 rounded-xl p-6 text-gray-600">لا توجد نتائج مطابقة</div>';
    }
    return;
  }
  // Header with count
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-4 md:mb-6';
  header.innerHTML = `
    <h2 class="font-amiri font-bold text-lg md:text-xl text-foreground">نتائج البحث</h2>
    <span class="bg-primary/10 text-primary px-3 md:px-4 py-1 md:py-1.5 rounded-full text-sm font-arabic">${toArabicDigits(matches.length)} نتيجة</span>
  `;
  resultsEl.appendChild(header);

    matches.slice(0, 150).forEach(m => {
    const sNum = m.surah.number;
    const sName = m.surah.name;
    const ayNum = m.ayah.numberInSurah;
    let ayText = stripBasmala(m.ayah.text, sNum, ayNum);

    const surahObj = allData?.data?.surahs?.find(x => x.number === sNum);
    const sCount = surahObj ? surahObj.ayahs.length : undefined;
    const card = document.createElement('div');
    card.className = 'group border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300';
    card.innerHTML = `
      <div class="flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 bg-secondary/30 border-b border-border">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary font-arabic font-bold text-sm md:text-base">${toArabicDigits(ayNum)}</div>
          <div class="flex flex-col md:flex-row md:items-center md:gap-2">
            <span class="font-amiri font-semibold text-primary text-sm md:text-base">${sName}</span>
            <span class="text-muted-foreground text-xs md:text-sm font-arabic"><span class="hidden md:inline mx-1">·</span>الآية ${toArabicDigits(ayNum)}${sCount ? ` <span class=\"hidden md:inline mx-1\">·</span>عدد الآيات ${toArabicDigits(sCount)}` : ''}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-xs font-arabic hidden md:inline-block bg-blue-500/10 text-blue-600">تطابق عبارة</span>
      </div>
      <div class="p-4 md:p-5">
        <p class="font-serif text-lg md:text-xl leading-loose text-foreground">${highlight(ayText, searchBox.value)}</p>
      </div>
      <div class="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 bg-secondary/20 border-t border-border">
        <a class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-arabic text-xs md:text-sm" href="ayah_detail.html?surah=${sNum}&ayah=${ayNum}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 md:h-4 md:w-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
          <span>صفحة الآية والتفسير</span>
        </a>
        <a class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-arabic text-xs md:text-sm" href="ayahs.html?surah=${sNum}&name=${encodeURIComponent(sName)}#ayah-${ayNum}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 md:h-4 md:w-4"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
          <span>موضعها في السورة</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5 md:h-3 md:w-3"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        </a>
      </div>
    `;
    resultsEl.appendChild(card);
  });
}

async function performSearch() {
  const q = searchBox.value.trim();
  ensureSurahOptions();
  
  if (q) {
    introCardEl?.classList.add('hidden');
  } else {
    introCardEl?.classList.remove('hidden');
    resultsEl.innerHTML = '';
    suggestionsEl.classList.add('hidden');
    return;
  }

  await ensureQuranLoaded();

  let matches = [];
  const nq = normalizeArabic(q);
  
  // 1. Check if it's a Surah name or Surah number
  let surahMatchIdx = -1;
  const isNumericQuery = /^\d+$/.test(nq);
  
  if (isNumericQuery) {
    const sNum = parseInt(nq);
    if (sNum >= 1 && sNum <= 114) surahMatchIdx = sNum - 1;
  } else {
    const cleanQ = nq.replace(/^(سوره|سورة|سورت)\s+/, "");
    surahMatchIdx = surahNamesNormalized.findIndex(s => s === cleanQ);
  }

  let surahCardHtml = '';
  if (surahMatchIdx !== -1) {
    const s = allData.data.surahs[surahMatchIdx];
    // Special result for Surah
    surahCardHtml = `
      <div class="mb-6 p-4 md:p-6 bg-brand text-white rounded-2xl shadow-xl flex items-center justify-between group">
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/10 flex items-center justify-center font-serif text-xl md:text-2xl border border-white/20">
                ${toArabicDigits(s.number)}
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-serif font-bold mb-1">سورة ${s.name}</h2>
              <p class="text-brand-goldLight/80 text-xs md:text-sm">عدد آياتها: ${toArabicDigits(s.ayahs.length)} · نزولها: ${s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
            </div>
        </div>
        <a href="ayahs.html?surah=${s.number}&name=${encodeURIComponent(s.name)}" 
           class="px-4 md:px-6 py-2 bg-brand-gold text-brand-dark rounded-xl font-bold hover:bg-white transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
           <span>فتح السورة</span>
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </a>
      </div>
    `;
  }

  // 2. Check for reference pattern like "2:255" or "البقرة 255"
  const refPattern = /^(.+?)[\s:]+(\d+)$/;
  const refMatch = q.match(refPattern);
  if (refMatch) {
    const sNamePart = normalizeArabic(refMatch[1]).replace(/^(سوره|سورة|سورت)\s+/, "");
    const aNum = parseInt(refMatch[2]);
    let sIdx = -1;
    if (/^\d+$/.test(sNamePart)) {
      sIdx = parseInt(sNamePart) - 1;
    } else {
      sIdx = surahNamesNormalized.findIndex(s => s === sNamePart);
    }
    
    if (sIdx >= 0 && sIdx < 114) {
      const s = allData.data.surahs[sIdx];
      const ay = s.ayahs.find(a => a.numberInSurah === aNum);
      if (ay) {
        matches.push({ ayah: ay, surah: { number: s.number, name: s.name } });
      }
    }
  }

  // 3. Regular text search
  if (surahSelect.value === 'all') {
    // If it's a simple numeric query (searching Surah 1-114), prioritize the Surah card (shown above)
    // and don't show the 1st ayah of every single surah to avoid clutter.
    if (!isNumericQuery) {
        allData.data.surahs.forEach(s => {
            const m = searchInAyahs(s.number, s.name, q);
            matches = matches.concat(m);
        });
    }
  } else {
    // Specific Surah selected: Allow searching within it (including by number)
    const sIdxSelected = Number(surahSelect.value);
    const sSelected = allData.data.surahs.find(x => x.number === sIdxSelected);
    if (sSelected) {
      matches = matches.concat(searchInAyahs(sSelected.number, sSelected.name, q));
    }
  }

  // Remove duplicate if it was added by reference search
  const uniqueMatches = [];
  const seen = new Set();
  matches.forEach(m => {
    const id = `${m.surah.number}:${m.ayah.numberInSurah}`;
    if (!seen.has(id)) {
      seen.add(id);
      uniqueMatches.push(m);
    }
  });

  renderResults(uniqueMatches, surahCardHtml);

  // suggestions
  const sug = uniqueMatches.length === 0 ? suggest(q) : [];
  if (sug.length) {
    suggestionsEl.innerHTML = '<div class="mb-2 text-gray-600">هل تقصد:</div>' +
      sug.map(w => `<button class="m-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200" data-sug="${w}">${w}</button>`).join('');
    suggestionsEl.classList.remove('hidden');
    suggestionsEl.querySelectorAll('button[data-sug]').forEach(btn => {
      btn.addEventListener('click', () => { searchBox.value = btn.dataset.sug; performSearch(); });
    });
  } else {
    suggestionsEl.classList.add('hidden');
  }
}

// init
ensureSurahOptions();
searchBox.addEventListener('input', () => { performSearch(); });
searchBox.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
surahSelect.addEventListener('change', async () => { await ensureQuranLoaded(); updateSurahMeta(); if (searchBox.value.trim()) performSearch(); else resultsEl.innerHTML = ''; });
// initialize meta if a surah is preselected
(async () => { await ensureQuranLoaded(); updateSurahMeta(); })();
