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

function renderSurahs(filterText = '') {
    grid.innerHTML = '';
    const filtered = surahs.filter(name => name.includes(filterText));

    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach((name, index) => {
           const btn = document.createElement('button');
           // Check if it is Al-Baqarah (Index 1 in 0-indexed array if we follow standard order)
           // But in the array 'البقرة' is index 1.
           btn.className = `
                surah-card 
                group
                border 
                font-bold font-serif text-lg
                py-3 px-4 rounded-xl
                transition-all duration-300
                flex items-center justify-center
                relative overflow-hidden
                bg-white border-gray-200 text-gray-700 hover:border-brand-gold hover:text-brand-DEFAULT hover:shadow-md
           `;
           
           btn.innerHTML = `
                <span class="relative z-10">سورة ${name}</span>
           `;
           
           btn.onclick = () => {
               // Get surah number from the surahs array
               const surahIndex = surahs.indexOf(name);
               const surahNumber = surahIndex + 1; // Convert to 1-based index
               
               // Navigate to ayahs page
               window.location.href = `ayahs.html?surah=${surahNumber}&name=${encodeURIComponent(name)}`;
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


