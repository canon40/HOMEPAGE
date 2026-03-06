/* 나라별 상징/선호 색상 테마 (언어 선택 시 적용) */
var themeByLang = {
    ko: { accent: "#c41e3a", accentHover: "#e63950", gradientPrimary: "linear-gradient(135deg, #c41e3a 0%, #8b1538 100%)", gradientText: "linear-gradient(to right, #e63950, #ff6b6b)", r: 196, g: 30, b: 58 },
    en: { accent: "#2563eb", accentHover: "#3b82f6", gradientPrimary: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", gradientText: "linear-gradient(to right, #3b82f6, #60a5fa)", r: 37, g: 99, b: 235 },
    ja: { accent: "#bc002d", accentHover: "#e60033", gradientPrimary: "linear-gradient(135deg, #bc002d 0%, #8b0020 100%)", gradientText: "linear-gradient(to right, #e60033, #ff4d6a)", r: 188, g: 0, b: 45 },
    vi: { accent: "#DA251D", accentHover: "#ed3d35", gradientPrimary: "linear-gradient(135deg, #DA251D 0%, #b81e18 100%)", gradientText: "linear-gradient(to right, #ed3d35, #ff6b63)", r: 218, g: 37, b: 29 },
    zh: { accent: "#de2910", accentHover: "#f04d30", gradientPrimary: "linear-gradient(135deg, #de2910 0%, #c41e0e 100%)", gradientText: "linear-gradient(to right, #f04d30, #ff7b5c)", r: 222, g: 41, b: 16 },
    it: { accent: "#009246", accentHover: "#00b359", gradientPrimary: "linear-gradient(135deg, #009246 0%, #007a3a 100%)", gradientText: "linear-gradient(to right, #00b359, #34d97b)", r: 0, g: 146, b: 70 },
    fr: { accent: "#002395", accentHover: "#0030c4", gradientPrimary: "linear-gradient(135deg, #002395 0%, #001a6e 100%)", gradientText: "linear-gradient(to right, #0030c4, #4169e1)", r: 0, g: 35, b: 149 },
    de: { accent: "#ffcc00", accentHover: "#ffdb4d", gradientPrimary: "linear-gradient(135deg, #ffcc00 0%, #e6b800 100%)", gradientText: "linear-gradient(to right, #ffdb4d, #ffe066)", r: 255, g: 204, b: 0 },
    am: { accent: "#078930", accentHover: "#0aad3d", gradientPrimary: "linear-gradient(135deg, #078930 0%, #056b26 100%)", gradientText: "linear-gradient(to right, #0aad3d, #34c759)", r: 7, g: 137, b: 48 },
    ar: { accent: "#006C35", accentHover: "#008844", gradientPrimary: "linear-gradient(135deg, #006C35 0%, #005528 100%)", gradientText: "linear-gradient(to right, #008844, #00a854)", r: 0, g: 108, b: 53 }
};

// 언어별 국기/상징 동물·꽃 (이모지)
var countryMetaByLang = {
    ko: { flag: "🇰🇷", symbol: "🌺" }, // 무궁화
    en: { flag: "🇺🇸", symbol: "🦅" },
    ja: { flag: "🇯🇵", symbol: "🌸" },
    vi: { flag: "🇻🇳", symbol: "🌼" },
    zh: { flag: "🇨🇳", symbol: "🐉" },
    it: { flag: "🇮🇹", symbol: "🐺" },
    fr: { flag: "🇫🇷", symbol: "🐓" },
    de: { flag: "🇩🇪", symbol: "🦅" },
    am: { flag: "🇪🇹", symbol: "🦁" },
    ar: { flag: "🇸🇦", symbol: "🌴" }
};

function applyTheme(lang) {
    var theme = themeByLang[lang];
    if (!theme) theme = themeByLang.ko;
    var r = theme.r, g = theme.g, b = theme.b;
    var root = document.documentElement.style;
    root.setProperty("--accent-color", theme.accent);
    root.setProperty("--accent-hover", theme.accentHover);
    root.setProperty("--gradient-primary", theme.gradientPrimary);
    root.setProperty("--gradient-text", theme.gradientText);
    root.setProperty("--accent-glow", "rgba(" + r + "," + g + "," + b + ",0.4)");
    root.setProperty("--accent-glow-strong", "rgba(" + r + "," + g + "," + b + ",0.6)");
    root.setProperty("--accent-glow-soft", "rgba(" + r + "," + g + "," + b + ",0.08)");
    root.setProperty("--accent-border", "rgba(" + r + "," + g + "," + b + ",0.6)");
}

function initPage() {
    const langSelect = document.getElementById("language-select");

    // 기본 언어: 한국어 (저장된 값이 없으면 항상 한국어로 시작)
    const savedLang = localStorage.getItem("siteLang") || "ko";
    if (langSelect) {
        langSelect.value = savedLang;
    }
    setLanguage(savedLang);
    window._currentLang = savedLang;
    // DOM 준비 후 한 번 더 적용 (다국어·나라별 색상 확실 반영)
    setTimeout(function () {
        var cur = window._currentLang || localStorage.getItem("siteLang") || "ko";
        applyTheme(cur);
        setLanguage(cur);
    }, 0);
    if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(function () {
            var cur = window._currentLang || savedLang;
            setLanguage(cur);
        });
    }

    // Event Listener for select
    if (langSelect) {
        langSelect.addEventListener("change", (e) => {
            const lang = e.target.value;
            setLanguage(lang);
            localStorage.setItem("siteLang", lang);
            window._currentLang = lang;
        });
    }
}

function runOnReady(fn) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn);
    } else {
        fn();
    }
}

runOnReady(() => {
    initPage();

    // Mobile Hamburger (simple toggle)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.right = '5%';
                navLinks.style.background = 'rgba(26, 29, 36, 0.95)';
                navLinks.style.padding = '20px';
                navLinks.style.borderRadius = '10px';
                navLinks.style.border = '1px solid rgba(255,255,255,0.1)';
            }
        });
    }

    // Smooth Scrolling API
    const authLinks = document.querySelectorAll('a[href^="#"]');
    for (let link of authLinks) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // offset navbar
                    behavior: 'smooth'
                });
            }
            if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            }
        });
    }

    // Initialize AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            easing: 'ease-out-cubic'
        });
    }

    // Living detail modal
    const livingTrigger = document.getElementById('living-detail-trigger');
    const livingModal = document.getElementById('living-modal');
    const livingClose = livingModal ? livingModal.querySelector('.modal-close') : null;

    if (livingTrigger && livingModal) {
        const closeModal = () => {
            livingModal.classList.remove('open');
        };

        livingTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            var curLang = document.documentElement.lang || window._currentLang || 'ko';
            setLanguage(curLang);
            livingModal.classList.add('open');
        });

        if (livingClose) {
            livingClose.addEventListener('click', closeModal);
        }

        livingModal.addEventListener('click', (e) => {
            if (e.target === livingModal) {
                closeModal();
            }
        });
    }

    // Finder modal
    const finderModal = document.getElementById('finder-modal');
    const finderOpenBtn = document.getElementById('finder-open');
    const finderNavLink = document.getElementById('finder-nav-link');
    const finderCloseBtn = finderModal ? finderModal.querySelector('.finder-close') : null;

    if (finderModal && (finderOpenBtn || finderNavLink)) {
        const openFinder = (e) => {
            if (e) e.preventDefault();
            var curLang = document.documentElement.lang || window._currentLang || 'ko';
            setLanguage(curLang);
            finderModal.classList.add('open');
        };

        if (finderOpenBtn) {
            finderOpenBtn.addEventListener('click', openFinder);
        }
        if (finderNavLink) {
            finderNavLink.addEventListener('click', openFinder);
        }
        if (finderCloseBtn) {
            finderCloseBtn.addEventListener('click', () => finderModal.classList.remove('open'));
        }
        finderModal.addEventListener('click', (e) => {
            if (e.target === finderModal) {
                finderModal.classList.remove('open');
            }
        });
    }

    // Finder quiz
    const finderOptions = document.querySelectorAll('.finder-option');
    if (finderOptions.length) {
        finderOptions.forEach((btn) => {
            btn.addEventListener('click', () => {
                const question = btn.closest('.finder-question');
                if (!question) return;

                // 한 질문 내에서 하나만 선택
                question.querySelectorAll('.finder-option').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                updateFinderResult();
            });
        });

        // 초기 상태 문구 세팅
        updateFinderResult();
    }
});

function setLanguage(lang) {
    if (!lang) lang = "ko";
    applyTheme(lang);

    if (typeof translations === "undefined") return;
    if (!translations[lang]) lang = "ko";
    var dic = translations[lang];

    // 언어별 국기 및 상징 이모지 표시
    var meta = countryMetaByLang[lang] || {};
    var flagEl = document.getElementById("lang-flag");
    if (flagEl) flagEl.textContent = meta.flag || "";
    var symbolEl = document.getElementById("lang-symbol");
    if (symbolEl) symbolEl.textContent = meta.symbol || "";

    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;

        // 1차: 현재 언어, 2차: 한국어(ko) fallback
        const value = dic[key] ?? (translations.ko ? translations.ko[key] : undefined);
        if (value !== undefined) {
            el.textContent = value;
        }
    });

    // Update document lang attribute
    document.documentElement.lang = lang;
    var sel = document.getElementById("language-select");
    if (sel) sel.value = lang;

    // Finder 결과 텍스트도 현재 언어에 맞게 다시 계산
    if (typeof updateFinderResult === 'function') {
        updateFinderResult();
    }

    // 히어로 섹션이 항상 보이도록 유지 (언어/테마 변경 후에도)
    var hero = document.querySelector('.hero');
    var heroContent = document.querySelector('.hero-content');
    if (hero) {
        hero.style.display = '';
        hero.style.visibility = 'visible';
        hero.style.opacity = '1';
    }
    if (heroContent) {
        heroContent.style.display = '';
        heroContent.style.visibility = 'visible';
        heroContent.style.opacity = '1';
    }
    if (typeof AOS !== 'undefined' && AOS.refresh) AOS.refresh();
}

function updateFinderResult() {
    const questions = document.querySelectorAll('.finder-question');
    if (!questions.length) return;

    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    questions.forEach((q) => {
        const active = q.querySelector('.finder-option.active');
        if (!active) return;
        const val = active.getAttribute('data-value');
        if (val === '1') count1++;
        else if (val === '2') count2++;
        else if (val === '3') count3++;
    });

    const currentLang = document.documentElement.lang || 'ko';
    const dic = translations[currentLang] || translations.ko || {};

    const badgeEl = document.getElementById('finder-badge');
    const titleEl = document.getElementById('finder-title');
    const descEl = document.getElementById('finder-desc');
    if (!badgeEl || !titleEl || !descEl) return;

    // 아무것도 선택 안했으면 기본 안내만
    if (count1 === 0 && count2 === 0 && count3 === 0) {
        badgeEl.textContent = dic.finder_badge_default || 'PERMACOAT QUICK / TITAN / RESIN';
        titleEl.textContent = dic.finder_title_default || '';
        descEl.textContent =
            dic.finder_desc_default ||
            '왼쪽 질문에서 자신의 사용 패턴과 가장 가까운 선택지를 눌러 보세요. 선택이 쌓일수록, 당신에게 잘 맞는 퀵 / 티탄 / 레진 등급이 이곳에 표시됩니다.';
        return;
    }

    // 동점일 때는 상위 등급을 우선(3 > 2 > 1)
    let winner = '1';
    if (count3 >= count2 && count3 >= count1) {
        winner = '3';
    } else if (count2 >= count1) {
        winner = '2';
    } else {
        winner = '1';
    }

    if (winner === '1') {
        badgeEl.textContent = dic.finder_badge_quick || 'PERMACOAT QUICK';
        titleEl.textContent = dic.finder_title_quick || '';
        descEl.textContent =
            dic.finder_desc_quick ||
            '세차 시간을 최소화하면서도 즉각적인 광택과 슬릭감을 원하는 타입입니다. 세차 후 뿌리고 닦는 것만으로도 만족스러운 결과를 얻고 싶다면, 퍼마코트 퀵 (Quick)이 가장 잘 맞습니다.';
    } else if (winner === '2') {
        badgeEl.textContent = dic.finder_badge_titan || 'PERMACOAT TITAN';
        titleEl.textContent = dic.finder_title_titan || '';
        descEl.textContent =
            dic.finder_desc_titan ||
            '외부 오염 방어력과 유지 편의성 사이에서 균형을 가장 중요하게 생각하는 타입입니다. 7H 고경도와 1년 이상 유지되는 내구성을 가진 퍼마코트 티탄 (Titan)을 추천드립니다.';
    } else {
        badgeEl.textContent = dic.finder_badge_resin || 'PERMACOAT RESIN';
        titleEl.textContent = dic.finder_title_resin || '';
        descEl.textContent =
            dic.finder_desc_resin ||
            '한 번의 시공으로 오랫동안 강력한 보호를 기대하는 타입입니다. 9H+급 피막 두께와 뛰어난 내열·UV 차단 성능을 갖춘 퍼마코트 레진 (Resin)이 가장 잘 어울리는 선택입니다.';
    }
}
