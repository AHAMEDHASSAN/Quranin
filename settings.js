/**
 * settings.js
 * Handles the Settings Sidebar, Theme Toggling, Font Size, and Line Height adjustments.
 * Injects the sidebar HTML into the page automatically.
 */

(function() {
    // 1. Inject CSS for the Sidebar
    const style = document.createElement('style');
    style.textContent = `
        /* Sidebar Overlay */
        .settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s;
        }
        .settings-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        /* Sidebar Container */
        .settings-sidebar {
            position: fixed;
            top: 0;
            right: -320px; /* Hidden */
            width: 320px;
            height: 100%;
            background: #fff;
            z-index: 9999;
            box-shadow: -4px 0 20px rgba(0,0,0,0.1);
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            direction: rtl; /* Ensure Arabic Layout inside */
        }
        
        .settings-sidebar.open {
            right: 0;
        }

        /* Dark Mode for Sidebar */
        .dark .settings-sidebar {
            background: #0f291e;
            color: #fff;
        }

        /* Header */
        .settings-header {
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .dark .settings-header {
            border-bottom-color: rgba(255,255,255,0.1);
        }

        .settings-title {
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
            color: #1B4332;
        }
        .dark .settings-title {
            color: #fff;
        }

        .close-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #64748b;
            transition: color 0.2s;
        }
        .close-btn:hover {
            color: #ef4444;
        }

        /* Content */
        .settings-content {
            padding: 1.5rem;
            flex-grow: 1;
            overflow-y: auto;
        }

        /* Section */
        .settings-section {
            margin-bottom: 2rem;
        }
        
        .settings-label {
            font-family: 'Cairo', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.8rem;
            display: block;
            color: #334155;
        }
        .dark .settings-label {
            color: #cbd5e1;
        }

        /* Option Grid */
        .options-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        .options-grid.four-cols {
            grid-template-columns: repeat(4, 1fr);
        }

        /* Option Button */
        .option-btn {
            padding: 0.6rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #fff;
            color: #64748b;
            font-family: 'Cairo', sans-serif;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }
        
        .dark .option-btn {
            background: #1B4332;
            border-color: #2D5A46;
            color: #94a3b8;
        }

        .option-btn:hover {
            border-color: #1B4332;
            color: #1B4332;
        }
        .dark .option-btn:hover {
             border-color: #D4AF37;
             color: #D4AF37;
        }

        .option-btn.active {
            background: #1B4332;
            color: #fff;
            border-color: #1B4332;
        }
        .dark .option-btn.active {
            background: #D4AF37;
            color: #1B4332;
            border-color: #D4AF37;
        }
        
        .option-btn svg {
            width: 20px;
            height: 20px;
        }

        /* Global Theme Variables when changed */
        :root {
            --ayah-font-size: 1.8rem;
            --ayah-line-height: 2.4;
        }
        
        .ayah-text, .ayah-large {
            font-size: var(--ayah-font-size) !important;
            line-height: var(--ayah-line-height) !important;
        }

        /* Dark Mode Global Overrides */
        body.dark {
            background-color: #0f291e !important;
            color: #e2e8f0 !important;
        }
        
        body.dark .ayah-text, body.dark .ayah-large {
            color: #fff !important;
        }
        
        body.dark .ayah-row:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
        }
        
        body.dark .main-card {
            background: #163326 !important;
            border-color: #2D5A46 !important;
        }
        
        body.dark nav {
            background-color: #0f291e !important;
            border-bottom-color: #2D5A46 !important;
        }
        
        body.dark .nav-btn {
             background: #163326 !important;
             color: #cbd5e1 !important;
             border-color: #2D5A46 !important;
        }
        
        body.dark .settings-header {
             color: white !important;
        }
    `;
    document.head.appendChild(style);


    // 2. Inject HTML for Sidebar
    const sidebarHTML = `
        <div class="settings-overlay" id="settingsOverlay"></div>
        <div class="settings-sidebar" id="settingsSidebar">
            <div class="settings-header">
                <h2 class="settings-title">الإعدادات</h2>
                <button class="close-btn" id="closeSettings">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="settings-content">
                <!-- Appearance -->
                <div class="settings-section">
                    <label class="settings-label">المظهر</label>
                    <div class="options-grid">
                        <button class="option-btn" data-theme="light">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            فاتح
                        </button>
                        <button class="option-btn" data-theme="dark">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            داكن
                        </button>
                        <button class="option-btn" data-theme="auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            تلقائي
                        </button>
                    </div>
                </div>

                <!-- Font Size -->
                <div class="settings-section">
                    <label class="settings-label">حجم الخط</label>
                    <div class="options-grid four-cols">
                        <button class="option-btn" data-size="1.5rem">صغير</button>
                        <button class="option-btn" data-size="1.8rem">متوسط</button>
                        <button class="option-btn" data-size="2.2rem">كبير</button>
                        <button class="option-btn" data-size="2.8rem">أكبر</button>
                    </div>
                </div>

                <!-- Line Height -->
                <div class="settings-section">
                    <label class="settings-label">تباعد الأسطر</label>
                    <div class="options-grid">
                        <button class="option-btn" data-height="2.0">عادي</button>
                        <button class="option-btn" data-height="2.4">مريح</button>
                        <button class="option-btn" data-height="3.0">واسع</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const div = document.createElement('div');
    div.innerHTML = sidebarHTML;
    document.body.appendChild(div);

    // 3. Logic & Event Listeners
    const overlay = document.getElementById('settingsOverlay');
    const sidebar = document.getElementById('settingsSidebar');
    const closeBtn = document.getElementById('closeSettings');
    
    // Toggle Function
    window.toggleSettings = function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    };

    // Close Events
    closeBtn.onclick = window.toggleSettings;
    overlay.onclick = window.toggleSettings;

    // --- State Management ---
    
    // Theme
    const themeBtns = document.querySelectorAll('[data-theme]');
    function setTheme(theme) {
        localStorage.setItem('kran_theme', theme);
        document.body.classList.remove('dark', 'light');
        document.documentElement.classList.remove('dark', 'light');
        
        if (theme === 'dark') {
            document.body.classList.add('dark');
            document.documentElement.classList.add('dark');
        } else if (theme === 'auto') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark');
                document.documentElement.classList.add('dark');
            }
        }
        
        // Update Buttons
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // Font Size
    const sizeBtns = document.querySelectorAll('[data-size]');
    function setFontSize(size) {
        localStorage.setItem('kran_font_size', size);
        document.documentElement.style.setProperty('--ayah-font-size', size);
        
        sizeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === size);
        });
    }

    // Line Height
    const heightBtns = document.querySelectorAll('[data-height]');
    function setLineHeight(height) {
        localStorage.setItem('kran_line_height', height);
        document.documentElement.style.setProperty('--ayah-line-height', height);
        
        heightBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.height === height);
        });
    }

    // Init Logic
    function initSettings() {
        // Theme
        const storedTheme = localStorage.getItem('kran_theme') || 'light';
        setTheme(storedTheme);

        // Size
        const storedSize = localStorage.getItem('kran_font_size') || '1.8rem';
        setFontSize(storedSize);

        // Height
        const storedHeight = localStorage.getItem('kran_line_height') || '2.4';
        setLineHeight(storedHeight);
    }
    
    // Listeners for Buttons
    themeBtns.forEach(btn => btn.onclick = () => setTheme(btn.dataset.theme));
    sizeBtns.forEach(btn => btn.onclick = () => setFontSize(btn.dataset.size));
    heightBtns.forEach(btn => btn.onclick = () => setLineHeight(btn.dataset.height));

    // Run Init
    initSettings();

})();
