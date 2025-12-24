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

const grid = document.getElementById('surahGrid');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F]/g, '') // Tashkeel
        .replace(/[إأآا]/g, 'ا') // Normalize Alef
        .replace(/ة/g, 'ه') // Teh Marbuta -> Heh
        .replace(/ى/g, 'ي'); // Alef Maqsura -> Ya
}

function renderSurahs(filterText = '') {
    grid.innerHTML = '';
    const normalizedFilter = filterText.trim();
    const toWestern = (s) => s.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 1632);
    const westernFilter = toWestern(normalizedFilter);
    const isNumber = /^[0-9\u0660-\u0669]+$/.test(normalizedFilter);
    const searchNumber = isNumber ? parseInt(westernFilter) : null;
    const query = normalizeArabic(normalizedFilter);

    const filtered = surahs.filter((name, index) => {
        const surahNumber = index + 1;
        if (isNumber) {
            return surahNumber === searchNumber;
        }
        return normalizeArabic(name).includes(query);
    });

    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach((name, index) => {
           const btn = document.createElement('button');
           const surahIndex = surahs.indexOf(name);
           const surahNumber = surahIndex + 1;

           const isFiltered = !!filterText;
           const nameColor = isFiltered ? 'text-brand' : 'text-gray-700';
           const indicatorDisplay = isFiltered ? 'flex' : 'hidden';

           btn.className = `
                surah-card 
                group
                border 
                font-medium md:font-bold font-serif text-lg
                py-3 px-4 rounded-xl
                transition-all duration-300
                flex items-center justify-center
                relative overflow-hidden
                bg-white border-gray-200 ${nameColor} hover:border-brand-gold hover:text-brand-DEFAULT hover:shadow-md
           `;
           
           btn.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <span class="w-7 h-7 bg-brand/10 text-brand rounded-full ${indicatorDisplay} items-center justify-center text-xs font-bold font-sans">
                        ${surahNumber.toLocaleString('ar-EG')}
                    </span>
                    <span class="relative z-10 flex-1 text-center">سورة ${name}</span>
                </div>
           `;
           
           btn.onclick = (e) => {
               // Sticky Hover Logic for Mobile
               // Check if this card is already active (selected)
               if (btn.classList.contains('active-surah')) {
                   // If already active, navigate
                   window.location.href = `ayahs.html?surah=${surahNumber}&name=${encodeURIComponent(name)}`;
               } else {
                   // If not active, activate this one and deactivate others
                   // Remove active class from all other cards
                   document.querySelectorAll('.surah-card').forEach(card => {
                       card.classList.remove('active-surah', 'border-brand-gold', 'text-brand-DEFAULT', 'shadow-md');
                       card.classList.add('border-gray-200', 'text-gray-700');
                   });
                   
                   // Add active class to clicked card
                   btn.classList.add('active-surah', 'border-brand-gold', 'text-brand-DEFAULT', 'shadow-md');
                   btn.classList.remove('border-gray-200', 'text-gray-700');
               }
           };

           grid.appendChild(btn);
        });
    }
}

// Initial Render
renderSurahs();

// Search Listener
searchInput.addEventListener('input', (e) => {
    renderSurahs(e.target.value);
});

// ====== Verse Tracking ======
function loadLastReadVerse() {
    let savedSurah = localStorage.getItem('lastReadSurah');
    let savedAyah = localStorage.getItem('lastReadAyah');

    const trackerCard = document.getElementById('verseTrackerCard');
    const trackerText = document.getElementById('verseTrackerText');

    if (!savedSurah || !savedAyah) {
        // Default to Surah 1, Ayah 1 (Al-Fatiha) if no saved history
        savedSurah = "1";
        savedAyah = "1";
    }

    const surahNum = parseInt(savedSurah);
    const ayahNum = parseInt(savedAyah);
    const surahName = surahs[surahNum - 1];

    // Update tracker card text
    if (trackerText) {
        trackerText.textContent = `سورة ${surahName} - الآية ${ayahNum.toLocaleString('ar-EG')}`;
    }

    // Make tracker card clickable
    if (trackerCard) {
        trackerCard.style.display = 'block'; // Always show the tracker
        trackerCard.onclick = () => {
            window.location.href = `ayah_detail.html?surah=${surahNum}&ayah=${ayahNum}`;
        };
    }

    // Update reading progress
    updateReadingProgress();
}

function updateReadingProgress() {
    const totalVerses = 6236;
    const readAyahs = JSON.parse(localStorage.getItem('quran_read_ayahs') || '{}');
    const versesRead = Object.keys(readAyahs).length;

    const percentage = ((versesRead / totalVerses) * 100).toFixed(1);

    // Update progress bar
    const progressBar = document.querySelector('.bg-emerald-600.h-2.rounded-full');
    const progressPercent = document.querySelector('.text-2xl.font-bold.text-gray-700');
    const versesReadText = document.querySelectorAll('.text-xs.text-gray-500 span')[0];

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressPercent) {
        progressPercent.textContent = `${parseFloat(percentage).toLocaleString('ar-EG')}٪`;
    }

    if (versesReadText) {
        versesReadText.textContent = `تم قراءة ${versesRead.toLocaleString('ar-EG')} آية`;
    }
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadLastReadVerse();
});


