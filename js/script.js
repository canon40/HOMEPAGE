document.addEventListener("DOMContentLoaded", () => {
    const langSelect = document.getElementById("language-select");
    const allLangSelects = document.querySelectorAll("#language-select, .language-select-sync");

    // Initialize Language
    const savedLang = localStorage.getItem("siteLang") || "ko";
    allLangSelects.forEach((el) => {
        el.value = savedLang;
    });
    setLanguage(savedLang);

    function syncLangToAll(lang) {
        setLanguage(lang);
        localStorage.setItem("siteLang", lang);
        allLangSelects.forEach((el) => {
            if (el.value !== lang) el.value = lang;
        });
    }

    // Event Listener: navbar + all modal language selects
    if (langSelect) {
        langSelect.addEventListener("change", (e) => syncLangToAll(e.target.value));
    }
    document.querySelectorAll(".language-select-sync").forEach((sel) => {
        sel.addEventListener("change", (e) => syncLangToAll(e.target.value));
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

    // Series summary modal
    const seriesModal = document.getElementById('series-modal');
    const seriesModalOpen = document.getElementById('series-modal-open');
    const seriesModalClose = seriesModal ? seriesModal.querySelector('.series-modal-close') : null;

    if (seriesModal && (seriesModalOpen || seriesModalClose)) {
        if (seriesModalOpen) {
            seriesModalOpen.addEventListener('click', (e) => {
                e.preventDefault();
                seriesModal.classList.add('open');
            });
        }
        if (seriesModalClose) {
            seriesModalClose.addEventListener('click', () => seriesModal.classList.remove('open'));
        }
        seriesModal.addEventListener('click', (e) => {
            if (e.target === seriesModal) {
                seriesModal.classList.remove('open');
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

    // Blog: simple local blog + auto generator + folders (3 categories) + per-folder keyword memory
    const BLOG_STORAGE_KEY = 'permacoatBlogPosts';
    const BLOG_MAX_ITEMS = 200;
    const BLOG_FOLDER_KEY = 'permacoatBlogFolder';
    const BLOG_AUTO_LAST_FOLDER_KEY = 'permacoatBlogAutoLastFolder';
    const BLOG_KEYWORD_STORE_PREFIX = 'permacoatKeywords_';
    const BLOG_API_CONFIG_KEY = 'permacoatBlogApiConfig';

    const BLOG_FOLDERS = {
        living: { id: 'living', label: '듀라코트 리빙코트' },
        car: { id: 'car', label: '듀라코트 퍼마코트 자동차' },
        bike: { id: 'bike', label: '듀라코트 퍼마코트 바이크' },
    };

    const blogForm = document.getElementById('blog-form');
    const blogTitleInput = document.getElementById('blog-title');
    const blogTopicSelect = document.getElementById('blog-topic');
    const blogBodyInput = document.getElementById('blog-body');
    const blogTagsInput = document.getElementById('blog-tags');
    const blogKeywordsInput = document.getElementById('blog-keywords');
    const blogPostsList = document.getElementById('blog-posts');
    const blogStatus = document.getElementById('blog-status');
    const blogClearBtn = document.getElementById('blog-clear');

    const blogAutoCountInput = document.getElementById('blog-auto-count');
    const blogAutoGenerateBtn = document.getElementById('blog-auto-generate');
    const blogAutoTargetInput = document.getElementById('blog-auto-target');
    const blogAutoToggle = document.getElementById('blog-auto-toggle');

    const blogFolderTabs = document.querySelectorAll('.blog-folder-tab');
    const blogCurrentFolderEditor = document.getElementById('blog-current-folder-editor');
    const blogCurrentFolderList = document.getElementById('blog-current-folder-list');

    // Settings modal & API status
    const blogSettingsModal = document.getElementById('blog-settings-modal');
    const blogSettingsOpenBtn = document.getElementById('blog-settings-open');
    const blogSettingsCloseBtn = document.getElementById('blog-settings-close');
    const blogSettingsSaveBtn = document.getElementById('blog-settings-save');
    const blogSettingsStatus = document.getElementById('blog-settings-status');
    const blogApiUrlInput = document.getElementById('blog-api-url');
    const blogApiStatusDot = document.getElementById('blog-api-status-indicator');
    const blogApiStatusLabel = document.getElementById('blog-api-status-label');
    const kwLivingTextarea = document.getElementById('blog-keywords-living');
    const kwCarTextarea = document.getElementById('blog-keywords-car');
    const kwBikeTextarea = document.getElementById('blog-keywords-bike');
    const blogApiTextKeyInput = document.getElementById('blog-api-text-key');
    const blogApiImageKeyInput = document.getElementById('blog-api-image-key');

    function loadBlogPosts() {
        try {
            const raw = localStorage.getItem(BLOG_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveBlogPosts(posts) {
        const trimmed = posts.slice(0, BLOG_MAX_ITEMS);
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(trimmed));
    }

    let blogPosts = loadBlogPosts();
    let currentFolder = (() => {
        const saved = localStorage.getItem(BLOG_FOLDER_KEY);
        if (saved && BLOG_FOLDERS[saved]) return saved;
        return 'living';
    })();
    let editingPostId = null;

    function getFolderLabel(id) {
        return BLOG_FOLDERS[id]?.label || BLOG_FOLDERS.living.label;
    }

    function loadFolderKeywords(folderId) {
        const stored = localStorage.getItem(`${BLOG_KEYWORD_STORE_PREFIX}${folderId}`);
        if (!stored) return [];
        try {
            const arr = JSON.parse(stored);
            return Array.isArray(arr) ? arr : [];
        } catch {
            return [];
        }
    }

    function saveFolderKeywords(folderId, keywords) {
        const clean = Array.isArray(keywords)
            ? keywords
                  .map((k) => (typeof k === 'string' ? k.trim() : ''))
                  .filter(Boolean)
            : [];
        localStorage.setItem(`${BLOG_KEYWORD_STORE_PREFIX}${folderId}`, JSON.stringify(clean));
    }

    function loadApiConfig() {
        try {
            const raw = localStorage.getItem(BLOG_API_CONFIG_KEY);
            if (!raw) return {};
            const obj = JSON.parse(raw);
            return obj && typeof obj === 'object' ? obj : {};
        } catch {
            return {};
        }
    }

    function saveApiConfig(config) {
        localStorage.setItem(BLOG_API_CONFIG_KEY, JSON.stringify(config || {}));
    }

    function setApiStatus(state) {
        if (!blogApiStatusDot || !blogApiStatusLabel) return;
        blogApiStatusDot.classList.remove('idle', 'ok', 'error');
        if (state === 'ok') {
            blogApiStatusDot.classList.add('ok');
            blogApiStatusLabel.textContent = 'API 연결 정상';
        } else if (state === 'error') {
            blogApiStatusDot.classList.add('error');
            blogApiStatusLabel.textContent = 'API 오류';
        } else {
            blogApiStatusDot.classList.add('idle');
            blogApiStatusLabel.textContent = 'API 미설정';
        }
    }

    // 단순 표시용: URL 이 있으면 "설정됨", 없으면 "미설정"만 보여줌 (실제 호출 없음)
    function checkApiStatus() {
        const config = loadApiConfig();
        if (!config.url) {
            setApiStatus('idle');
            return;
        }
        setApiStatus('ok');
    }

    function setCurrentFolder(folderId) {
        if (!BLOG_FOLDERS[folderId]) folderId = 'living';
        currentFolder = folderId;
        localStorage.setItem(BLOG_FOLDER_KEY, currentFolder);

        blogFolderTabs.forEach((tab) => {
            const f = tab.getAttribute('data-folder');
            if (f === currentFolder) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        if (blogCurrentFolderEditor) {
            blogCurrentFolderEditor.textContent = getFolderLabel(currentFolder);
        }
        if (blogCurrentFolderList) {
            blogCurrentFolderList.textContent = getFolderLabel(currentFolder);
        }

        // 폴더 전환 시 해당 폴더에 저장된 키워드 불러오기
        if (blogKeywordsInput) {
            const storedKeywords = loadFolderKeywords(currentFolder);
            blogKeywordsInput.value = storedKeywords.join(', ');
        }

        // 폴더 전환 시 에디팅 모드 초기화
        editingPostId = null;
        if (blogForm && blogForm.reset) {
            blogForm.reset();
        }

        renderBlogPosts();
    }

    // 자동 글쓰기 시 사용할 다음 폴더 선택 (living → car → bike 순환)
    function getNextAutoFolder() {
        const order = ['living', 'car', 'bike'];
        const last = localStorage.getItem(BLOG_AUTO_LAST_FOLDER_KEY);
        let idx = order.indexOf(last);
        if (idx === -1) {
            // 저장된 값이 없으면 현재 폴더 기준으로 시작
            idx = order.indexOf(currentFolder);
            if (idx === -1) idx = 0;
        }
        const nextIdx = (idx + 1) % order.length;
        const nextFolder = order[nextIdx];
        localStorage.setItem(BLOG_AUTO_LAST_FOLDER_KEY, nextFolder);
        // UI 상에서도 폴더를 맞춰 보여주기
        setCurrentFolder(nextFolder);
        return nextFolder;
    }

    // 설정 모달 열기 공통 함수 (버튼 클릭 + 전역 호출 둘 다 사용)
    function openBlogSettingsModal() {
        if (!blogSettingsModal) return;
        const config = loadApiConfig();
        if (blogApiUrlInput) {
            blogApiUrlInput.value = config.url || '';
        }
        if (blogApiTextKeyInput) {
            blogApiTextKeyInput.value = config.textKey || '';
        }
        if (blogApiImageKeyInput) {
            blogApiImageKeyInput.value = config.imageKey || '';
        }
        if (kwLivingTextarea) {
            const arr = loadFolderKeywords('living');
            kwLivingTextarea.value = arr.join('\n');
        }
        if (kwCarTextarea) {
            const arr = loadFolderKeywords('car');
            kwCarTextarea.value = arr.join('\n');
        }
        if (kwBikeTextarea) {
            const arr = loadFolderKeywords('bike');
            kwBikeTextarea.value = arr.join('\n');
        }
        if (blogSettingsStatus) blogSettingsStatus.textContent = '';
        blogSettingsModal.classList.add('open');
    }

    if (blogSettingsOpenBtn && blogSettingsModal) {
        blogSettingsOpenBtn.addEventListener('click', openBlogSettingsModal);
    }

    if (blogSettingsCloseBtn && blogSettingsModal) {
        blogSettingsCloseBtn.addEventListener('click', () => {
            blogSettingsModal.classList.remove('open');
        });
        blogSettingsModal.addEventListener('click', (e) => {
            if (e.target === blogSettingsModal) {
                blogSettingsModal.classList.remove('open');
            }
        });
    }

    function handleBlogSettingsSave() {
        const url = blogApiUrlInput ? blogApiUrlInput.value.trim() : '';
        const textKey = blogApiTextKeyInput ? blogApiTextKeyInput.value.trim() : '';
        const imageKey = blogApiImageKeyInput ? blogApiImageKeyInput.value.trim() : '';

        const parseLines = (val) =>
            val
                // 줄바꿈 + 쉼표 모두를 구분자로 사용해서 "한 줄에 한 개"로 정리
                .split(/[\r\n,]+/)
                .map((v) => v.trim())
                .filter(Boolean);

        if (kwLivingTextarea) {
            const list = parseLines(kwLivingTextarea.value || '');
            saveFolderKeywords('living', list);
            kwLivingTextarea.value = list.join('\n');
        }
        if (kwCarTextarea) {
            const list = parseLines(kwCarTextarea.value || '');
            saveFolderKeywords('car', list);
            kwCarTextarea.value = list.join('\n');
        }
        if (kwBikeTextarea) {
            const list = parseLines(kwBikeTextarea.value || '');
            saveFolderKeywords('bike', list);
            kwBikeTextarea.value = list.join('\n');
        }

        saveApiConfig({ url, textKey, imageKey });

        // 현재 폴더가 설정된 폴더라면 키워드 입력칸도 즉시 반영
        if (blogKeywordsInput) {
            const storedKeywords = loadFolderKeywords(currentFolder);
            blogKeywordsInput.value = storedKeywords.join(', ');
        }

        if (blogSettingsStatus) {
            blogSettingsStatus.textContent = '설정을 저장했습니다.';
        }

        checkApiStatus();

        // 사용자에게 확실히 보이도록 알림
        if (typeof window !== 'undefined') {
            window.alert('자동 글쓰기 설정을 저장했습니다.');
        }
    }

    // 전역에서도 호출할 수 있게 노출 (blog.html 의 onclick 에서 사용)
    window.__saveBlogSettings = handleBlogSettingsSave;
    window.__openBlogSettings = openBlogSettingsModal;

    if (blogSettingsSaveBtn) {
        blogSettingsSaveBtn.addEventListener('click', handleBlogSettingsSave);
    }

    function renderBlogPosts() {
        if (!blogPostsList) return;
        blogPostsList.innerHTML = '';

        const visiblePosts = blogPosts.filter((post) => {
            const folder = post.folder || 'living';
            return folder === currentFolder;
        });

        if (!visiblePosts.length) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'blog-post-empty';
            emptyItem.textContent = '아직 이 폴더에 저장된 블로그 글이 없습니다. 왼쪽에서 첫 글을 작성해 보세요.';
            blogPostsList.appendChild(emptyItem);
            return;
        }

        visiblePosts.forEach((post) => {
            const li = document.createElement('li');
            li.className = 'blog-post-item';
            li.dataset.id = post.id;

            const header = document.createElement('div');
            header.className = 'blog-post-header';

            const title = document.createElement('h4');
            title.className = 'blog-post-title';
            title.textContent = post.title || '(제목 없음)';

            const meta = document.createElement('div');
            meta.className = 'blog-post-meta';
            const date = new Date(post.createdAt);
            const locale = document.documentElement.lang || 'ko-KR';
            const timeText = isNaN(date.getTime()) ? '' : date.toLocaleString(locale === 'ko' ? 'ko-KR' : undefined);
            meta.textContent = [
                post.topicLabel || '',
                timeText,
                post.autoGenerated ? '자동 생성' : '직접 작성',
            ]
                .filter(Boolean)
                .join(' · ');

            header.appendChild(title);
            header.appendChild(meta);

            const body = document.createElement('p');
            body.className = 'blog-post-body';
            body.textContent = post.preview || '';

            const actions = document.createElement('div');
            actions.className = 'blog-post-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'blog-post-btn blog-post-edit';
            editBtn.textContent = '수정';
            editBtn.dataset.id = post.id;

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'blog-post-btn blog-post-delete';
            deleteBtn.textContent = '삭제';
            deleteBtn.dataset.id = post.id;

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(header);
            li.appendChild(body);
            li.appendChild(actions);

            blogPostsList.appendChild(li);
        });
    }

    function addBlogPost({ title, body, topic, tags, autoGenerated, folder }) {
        const topicLabelMap = {
            quick: '퍼마코트 퀵',
            titan: '퍼마코트 티탄',
            resin: '퍼마코트 레진',
            living: '듀라코트 리빙코트',
            story: '시공 스토리',
        };

        const now = new Date().toISOString();
        const preview = body.length > 160 ? `${body.slice(0, 160)}…` : body;

        const targetFolder = BLOG_FOLDERS[folder]?.id || currentFolder || 'living';

        const base = {
            title: title || '(제목 없음)',
            body,
            topic,
            topicLabel: topicLabelMap[topic] || '',
            tags,
            autoGenerated: Boolean(autoGenerated),
            createdAt: now,
            preview,
            folder: targetFolder,
        };

        if (editingPostId) {
            blogPosts = blogPosts.map((p) =>
                p.id === editingPostId
                    ? {
                          ...p,
                          ...base,
                          createdAt: p.createdAt || now,
                          updatedAt: now,
                      }
                    : p,
            );
            editingPostId = null;
        } else {
            const post = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                ...base,
            };
            blogPosts = [post, ...blogPosts];
        }

        saveBlogPosts(blogPosts);
        renderBlogPosts();
    }

    function setBlogStatus(message) {
        if (!blogStatus) return;
        blogStatus.textContent = message;
        if (message) {
            setTimeout(() => {
                if (blogStatus.textContent === message) {
                    blogStatus.textContent = '';
                }
            }, 3000);
        }
    }

    function pickRandom(list) {
        if (!Array.isArray(list) || !list.length) return '';
        return list[Math.floor(Math.random() * list.length)];
    }

    function generateAutoPost(topic, index, keywords, folderId) {
        const kwArray = Array.isArray(keywords) ? keywords : [];
        // 키워드 배열에서 랜덤 선택. 없으면 폴더별 기본 키워드 사용
        const defaultKeywordsByFolder = {
            living: ['듀라코트 리빙코트', '홈케어 코팅', '주방 상판 코팅', '욕실 물때 방지'],
            car: ['퍼마코트 자동차 코팅', '자동차 유리막 코팅', '셀프 세차 코팅제'],
            bike: ['퍼마코트 바이크 코팅', '바이크 발열 보호', '모터사이클 코팅'],
        };
        const folderKeywords = defaultKeywordsByFolder[folderId] || [];
        const sourceKeywords = kwArray.length ? kwArray : folderKeywords;

        const mainKeyword = pickRandom(sourceKeywords) || (topic === 'living' ? '생활 관리' : '코팅 관리');
        const mainHead = mainKeyword.split(/\s+/)[0]; // 맨 앞 글자(단어) 항상 노출용
        const baseTitle = {
            titan: `${mainHead} – 퍼마코트 티탄으로 ${mainKeyword} 잡는 방법 #${index + 1}`,
            quick: `${mainHead} – 퍼마코트 퀵으로 ${mainKeyword}까지 간편 관리 #${index + 1}`,
            resin: `${mainHead} – 퍼마코트 레진 장기 테스트, ${mainKeyword} 중심 리뷰 #${index + 1}`,
            living: `${mainHead} – 듀라코트 리빙코트로 ${mainKeyword} 줄이는 집안 관리 팁 #${index + 1}`,
            story: `${mainHead} – ${mainKeyword} 때문에 시작한 실제 시공 스토리 #${index + 1}`,
        };

        const baseBody = {
            titan:
                `${mainKeyword}에 가장 민감한 오너를 기준으로, 이번 글에서는 퍼마코트 티탄을 실제로 사용하면서 어떤 변화가 있었는지 정리해 봅니다. ` +
                `세차 전후의 상태, 워터 스팟 발생 빈도, 일상 주행 후 도장면 컨디션을 단계별로 정리해서 처음 보는 사람도 쉽게 따라 할 수 있도록 구성했습니다. ` +
                `글 중간중간에는 TIP 형식으로 사용자가 바로 적용할 수 있는 관리 루틴을 넣어, 사람이 직접 경험을 적어 내려간 것처럼 자연스럽게 읽히도록 했습니다.`,
            quick:
                `${mainKeyword} 때문에 세차를 자주 미루게 되는 분들을 위해, 퍼마코트 퀵을 활용한 현실적인 관리 루틴을 정리해 봤습니다. ` +
                `이 글에서는 주말 셀프 세차 기준으로 준비물, 사용량, 분사 위치, 닦아내는 패턴까지 순서대로 정리하고, ` +
                `실제 사용 후 느낀 장단점을 솔직하게 정리해 사람 후기처럼 자연스럽게 읽히도록 구성했습니다.`,
            resin:
                `${mainKeyword}를 오래 유지하고 싶은 하이엔드 오너라면 퍼마코트 레진이 어떤 느낌인지 궁금할 수밖에 없습니다. ` +
                `${mainKeyword}와 관련된 고민을 기준으로, 시공 직후·3개월·6개월·1년 경과 시점에 어떤 변화가 있었는지 일기처럼 기록하듯 정리했습니다. ` +
                `광택 변화, 세정 난이도, 스월 마크 발생 정도를 비교해보면 레진 특유의 무게감 있는 피막 느낌이 훨씬 잘 전달됩니다.`,
            living:
                `${mainKeyword}라는 키워드를 떠올리면, 대부분 “청소가 너무 힘들다”는 말을 먼저 하곤 합니다. 듀라코트 리빙코트는 이런 고민을 줄이기 위해 태어난 솔루션입니다. ` +
                `이번 글에서는 특히 ${mainKeyword}라는 키워드를 중심으로, 시공 전과 후에 청소 루틴이 어떻게 바뀌었는지 생활 동선을 따라가며 설명합니다. ` +
                `“아침에 일어나서”, “주말 대청소를 할 때”처럼 시간 순서로 나누어 서술하면 실제 사용자가 느끼는 장점이 더 현실적으로 전달됩니다.`,
            story:
                `${mainKeyword} 때문에 도저히 방치할 수 없었던 실제 사례를 바탕으로, 이번 글에서는 한 오너의 시공 스토리를 정리해 봅니다. ` +
                `초기 상태 사진, 준비 과정, 시공 포인트, 2주/한 달 뒤 피드백을 순서대로 풀어가는 구조로 작성하면 자연스러운 스토리텔링이 됩니다. ` +
                `중간중간에 대화체 문장을 섞어 주면 블로그 특유의 말투가 살아나 읽는 사람이 부담 없이 끝까지 읽을 수 있습니다.`,
        };

        // CANON/카메라 관련 해시태그 30개 생성
        const hashtagBase = [
            'canon',
            '캐논',
            'canoncamera',
            '캐논카메라',
            'dslr',
            '미러리스',
            'mirrorless',
            'canonphoto',
            'photography',
            '사진',
            '사진찍기',
            '카메라추천',
            '렌즈추천',
            '출사',
            '야경',
            '인물사진',
            '풍경사진',
            '캠핑사진',
            '브이로그',
            'canonr',
            'canonrf',
            'canonlens',
            'camera',
            'photooftheday',
            'dailyphoto',
            'travelphoto',
            'streetphoto',
            '컬러그레이딩',
            'raw현상',
        ];

        kwArray.forEach((k) => {
            const cleaned = k.replace(/\s+/g, '');
            if (cleaned && hashtagBase.length < 50) {
                hashtagBase.push(cleaned.toLowerCase());
            }
        });

        const uniqueTags = Array.from(new Set(hashtagBase));
        const hashtags = uniqueTags
            .slice(0, 30)
            .map((t) => (t.startsWith('#') ? t : `#${t}`))
            .join(' ');

        const topics = ['titan', 'quick', 'resin', 'living', 'story'];
        const chosenTopic = topic && baseTitle[topic] ? topic : topics[index % topics.length];

        return {
            title: baseTitle[chosenTopic],
            body: baseBody[chosenTopic],
            topic: chosenTopic,
            tags: hashtags,
            autoGenerated: true,
        };
    }

    if (blogPostsList) {
        renderBlogPosts();
    }

    if (blogFolderTabs.length) {
        blogFolderTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const folderId = tab.getAttribute('data-folder') || 'living';
                setCurrentFolder(folderId);
            });
        });
        // 초기 폴더 상태 반영
        setCurrentFolder(currentFolder);
    } else {
        // 탭이 없는 경우에도 최소한 렌더링
        renderBlogPosts();
    }

    // 초기 API 상태 체크
    checkApiStatus();

    if (blogForm && blogTitleInput && blogBodyInput && blogTopicSelect) {
        blogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = blogTitleInput.value.trim();
            const body = blogBodyInput.value.trim();
            const topic = blogTopicSelect.value || 'story';
            const tags = (blogTagsInput && blogTagsInput.value) || '';

            if (!body) {
                setBlogStatus('본문을 입력해 주세요.');
                return;
            }

            addBlogPost({ title, body, topic, tags, autoGenerated: false, folder: currentFolder });
            setBlogStatus('블로그 글이 저장되었습니다.');

            blogBodyInput.value = '';
            if (blogTitleInput.value) blogTitleInput.value = '';
            if (blogTagsInput) blogTagsInput.value = '';
        });
    }

    if (blogClearBtn) {
        blogClearBtn.addEventListener('click', () => {
            if (!confirm('현재 선택된 폴더의 블로그 글을 모두 삭제할까요? (브라우저 로컬 저장소에만 적용됩니다)')) return;
            blogPosts = blogPosts.filter((post) => (post.folder || 'living') !== currentFolder);
            saveBlogPosts(blogPosts);
            renderBlogPosts();
            setBlogStatus('현재 폴더의 블로그 글을 모두 삭제했습니다.');
        });
    }

    if (blogPostsList) {
        blogPostsList.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;

            if (target.classList.contains('blog-post-edit')) {
                const id = target.dataset.id;
                if (!id) return;
                const post = blogPosts.find((p) => p.id === id);
                if (!post) return;

                editingPostId = id;
                if (blogTitleInput) blogTitleInput.value = post.title || '';
                if (blogBodyInput) blogBodyInput.value = post.body || '';
                if (blogTopicSelect && post.topic) blogTopicSelect.value = post.topic;
                if (blogTagsInput && post.tags) blogTagsInput.value = post.tags;

                setBlogStatus('수정 모드: 내용을 변경한 뒤 다시 저장하면 업데이트됩니다.');
            }

            if (target.classList.contains('blog-post-delete')) {
                const id = target.dataset.id;
                if (!id) return;
                if (!confirm('이 블로그 글을 삭제할까요?')) return;

                blogPosts = blogPosts.filter((p) => p.id !== id);
                if (editingPostId === id) {
                    editingPostId = null;
                    if (blogForm && blogForm.reset) blogForm.reset();
                }
                saveBlogPosts(blogPosts);
                renderBlogPosts();
                setBlogStatus('블로그 글을 삭제했습니다.');
            }
        });
    }

    if (blogAutoGenerateBtn) {
        blogAutoGenerateBtn.addEventListener('click', () => {
            // 개수는 일단 10개 고정(심플하게)
            let count = blogAutoCountInput ? parseInt(blogAutoCountInput.value, 10) : NaN;
            if (isNaN(count) || count <= 0) count = 10;
            if (count > 100) count = 100;

            const topic = blogTopicSelect ? blogTopicSelect.value : 'story';
            // 폴더를 자동으로 순환 선택 (living → car → bike)
            const autoFolder = getNextAutoFolder();
            const storedKeywords = loadFolderKeywords(autoFolder);

            for (let i = 0; i < count; i++) {
                const post = generateAutoPost(topic, i, storedKeywords, autoFolder);
                addBlogPost({ ...post, folder: autoFolder });
            }

            const msg = `${getFolderLabel(autoFolder)} 폴더에 브라우저 내부용 글 ${count}개를 생성했습니다.`;
            setBlogStatus(msg);
            if (typeof window !== 'undefined') {
                window.alert(msg);
            }
        });
    }

    let autoIntervalId = null;

    function stopAutoMode() {
        if (autoIntervalId) {
            clearInterval(autoIntervalId);
            autoIntervalId = null;
        }
        if (blogAutoToggle) {
            blogAutoToggle.checked = false;
        }
    }

    function startAutoMode() {
        if (!blogAutoTargetInput) return;

        let target = parseInt(blogAutoTargetInput.value, 10);
        if (isNaN(target)) target = 10;
        if (target < 10) target = 10;
        if (target > 100) target = 100;

        const topic = blogTopicSelect ? blogTopicSelect.value : 'story';

        stopAutoMode();

        autoIntervalId = setInterval(() => {
            const autoCount = blogPosts.filter((p) => p.autoGenerated && (p.folder || 'living') === currentFolder).length;
            if (autoCount >= target) {
                setBlogStatus(`오늘 목표한 자동 포스트 ${target}개 생성이 완료되었습니다. (현재 페이지 기준)`);
                stopAutoMode();
                return;
            }

            const post = generateAutoPost(topic, autoCount);
            addBlogPost({ ...post, folder: currentFolder });
        }, 30000);

        setBlogStatus('자동 블로그 모드를 시작했습니다. (페이지가 열려 있는 동안에만 동작)');
    }

    if (blogAutoToggle) {
        blogAutoToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                startAutoMode();
            } else {
                stopAutoMode();
                setBlogStatus('자동 블로그 모드를 종료했습니다.');
            }
        });
    }
});

function setLanguage(lang) {
    if (!translations[lang]) return;

    const dic = translations[lang];
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;

        // 1차: 현재 언어, 2차: 한국어(ko) fallback
        const value = dic[key] ?? (translations.ko ? translations.ko[key] : undefined);
        if (value !== undefined) {
            if (key === "series_modal_body") {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        }
    });

    // Update document lang attribute
    document.documentElement.lang = lang;

    // Finder 결과 텍스트도 현재 언어에 맞게 다시 계산
    if (typeof updateFinderResult === 'function') {
        updateFinderResult();
    }
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
