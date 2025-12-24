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
    const query = normalizeArabic(filterText.trim());
    const isNumber = /^\d+$/.test(filterText.trim());
    const searchNumber = isNumber ? parseInt(filterText.trim()) : null;

    const filtered = surahs.filter((name, index) => {
        const surahNumber = index + 1;
        if (isNumber) {
            return surahNumber === searchNumber || surahNumber.toString().includes(filterText.trim());
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

           btn.className = `
                surah-card 
                group
                border 
                font-medium md:font-bold font-serif text-lg
                py-3 px-4 rounded-xl
                transition-all duration-300
                flex items-center justify-center
                relative overflow-hidden
                bg-white border-gray-200 text-gray-700 hover:border-brand-gold hover:text-brand-DEFAULT hover:shadow-md
           `;
           
           btn.innerHTML = `
                <span class="relative z-10">سورة ${name}</span>
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
    updateReadingProgress(surahNum, ayahNum);
}

function updateReadingProgress(surah, ayah) {
    // Simple calculation: assuming we track verses sequentially
    // This is a simplified version - you could improve by tracking all read verses
    const totalVerses = 6236;
    const ayahCounts = [
        7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
        123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
        112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
        34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
        54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
        60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
        14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
        28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
        29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
        15, 21, 11, 8, 5, 19, 5, 8, 8, 11,
        11, 8, 3, 9, 5, 4, 6, 3, 6, 3,
        5, 4, 5, 6
    ];

    // Calculate total verses read up to current surah and ayah
    let versesRead = 0;
    for (let i = 0; i < surah - 1; i++) {
        versesRead += ayahCounts[i];
    }
    versesRead += ayah;

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


