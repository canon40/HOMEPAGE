document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("language-select");

    // Initialize Language
    const savedLang = localStorage.getItem("siteLang") || "ko";
    langSelect.value = savedLang;
    setLanguage(savedLang);

    // Event Listener for select
    langSelect.addEventListener("change", (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        localStorage.setItem("siteLang", lang);
    });

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
});

function setLanguage(lang) {
    if (!translations[lang]) return;

    const dic = translations[lang];
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dic[key]) {
            el.textContent = dic[key];
        }
    });

    // Update document lang attribute
    document.documentElement.lang = lang;
}
