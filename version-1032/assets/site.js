import { H as Hls } from './hls-vendor-dru42stk.js';

const SELECTORS = {
    mobileButton: '[data-mobile-menu-button]',
    mobileNav: '[data-mobile-nav]',
    carousel: '[data-hero-carousel]',
    slide: '[data-hero-slide]',
    dot: '[data-hero-dot]',
    player: '[data-player]',
    filterInput: '[data-filter-input]',
    filterGrid: '[data-filter-grid]',
    sortSelect: '[data-sort-select]'
};

function initMobileNavigation() {
    const button = document.querySelector(SELECTORS.mobileButton);
    const nav = document.querySelector(SELECTORS.mobileNav);

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector(SELECTORS.carousel);

    if (!carousel) {
        return;
    }

    const slides = [...carousel.querySelectorAll(SELECTORS.slide)];
    const dots = [...carousel.querySelectorAll(SELECTORS.dot)];
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const activate = (index) => {
        activeIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => activate(activeIndex + 1), 5600);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            activate(index);
            restart();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            activate(activeIndex - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            activate(activeIndex + 1);
            restart();
        });
    }

    restart();
}

function initHorizontalScroll() {
    const scroller = document.querySelector('[data-horizontal-scroll]');
    const left = document.querySelector('[data-scroll-left]');
    const right = document.querySelector('[data-scroll-right]');

    if (!scroller) {
        return;
    }

    const scrollByCard = (direction) => {
        const amount = Math.max(260, scroller.clientWidth * 0.82);
        scroller.scrollBy({ left: amount * direction, behavior: 'smooth' });
    };

    if (left) {
        left.addEventListener('click', () => scrollByCard(-1));
    }

    if (right) {
        right.addEventListener('click', () => scrollByCard(1));
    }
}

function cardMatches(card, keyword, year) {
    const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.category,
        card.dataset.tags,
        card.dataset.year
    ].join(' ').toLowerCase();

    const keywordMatched = !keyword || haystack.includes(keyword);
    const yearMatched = !year || card.dataset.year === year;

    return keywordMatched && yearMatched;
}

function initLocalFilters() {
    const grid = document.querySelector(SELECTORS.filterGrid);

    if (!grid) {
        return;
    }

    const cards = [...grid.querySelectorAll('.filter-card')];
    const input = document.querySelector(SELECTORS.filterInput);
    const yearSelect = document.querySelector('[data-filter-select="year"]');
    const sortSelect = document.querySelector(SELECTORS.sortSelect);

    const apply = () => {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const year = yearSelect ? yearSelect.value : '';

        cards.forEach((card) => {
            card.classList.toggle('is-hidden', !cardMatches(card, keyword, year));
        });
    };

    if (input) {
        input.addEventListener('input', apply);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', apply);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const mode = sortSelect.value;
            const sorted = [...cards].sort((a, b) => {
                if (mode === 'year') {
                    return (Number(b.dataset.year) || 0) - (Number(a.dataset.year) || 0);
                }

                if (mode === 'title') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }

                return 0;
            });

            sorted.forEach((card) => grid.appendChild(card));
            apply();
        });
    }
}

function initPlayers() {
    const playerNodes = [...document.querySelectorAll(SELECTORS.player)];

    playerNodes.forEach((shell) => {
        const video = shell.querySelector('video');
        const button = shell.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        const source = video.dataset.src;
        let hlsInstance = null;
        let hasLoaded = false;

        const showMessage = (message) => {
            button.querySelector('strong').textContent = message;
            button.disabled = false;
            shell.classList.remove('is-playing');
        };

        const loadAndPlay = () => {
            if (!source) {
                showMessage('暂无播放源');
                return;
            }

            button.disabled = true;
            button.querySelector('strong').textContent = '正在加载';

            if (!hasLoaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    showMessage('当前浏览器不支持 HLS');
                    return;
                }

                hasLoaded = true;
            }

            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => showMessage('点击重试播放'));
            }
        };

        button.addEventListener('click', loadAndPlay);

        video.addEventListener('play', () => {
            shell.classList.add('is-playing');
            button.disabled = false;
        });

        video.addEventListener('pause', () => {
            if (!video.ended) {
                shell.classList.remove('is-playing');
                button.querySelector('strong').textContent = '继续播放';
                button.disabled = false;
            }
        });

        video.addEventListener('error', () => {
            showMessage('播放源加载失败');
        });

        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function createSearchCard(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

    return `
        <article class="movie-card">
            <a class="movie-poster" href="${movie.rootUrl}" aria-label="观看${escapeHtml(movie.title)}">
                <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="poster-shade"></span>
                <span class="poster-play">播放</span>
            </a>
            <div class="movie-card-body">
                <div class="movie-meta-line">
                    <span>${escapeHtml(movie.year)}</span>
                    <span>${escapeHtml(movie.region)}</span>
                    <span>${escapeHtml(movie.type)}</span>
                </div>
                <h3><a href="${movie.rootUrl}">${escapeHtml(movie.title)}</a></h3>
                <p>${escapeHtml(movie.description)}</p>
                <div class="tag-row">${tags}</div>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function initSearchPage() {
    const results = document.querySelector('#searchResults');
    const summary = document.querySelector('#searchSummary');
    const input = document.querySelector('#searchInput');

    if (!results || !summary || !input) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const module = await import('./search-data.js');
    const movies = module.movies || [];

    const render = () => {
        const keyword = input.value.trim().toLowerCase();
        const matched = keyword
            ? movies.filter((movie) => {
                const haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.year,
                    movie.tags.join(' '),
                    movie.description
                ].join(' ').toLowerCase();
                return haystack.includes(keyword);
            })
            : movies.slice(0, 36);

        summary.textContent = keyword
            ? `关键词 “${input.value.trim()}” 的匹配结果` 
            : '推荐浏览内容';
        results.innerHTML = matched.slice(0, 120).map(createSearchCard).join('');
    };

    input.addEventListener('input', render);
    render();
}

window.addEventListener('DOMContentLoaded', () => {
    initMobileNavigation();
    initHeroCarousel();
    initHorizontalScroll();
    initLocalFilters();
    initPlayers();
    initSearchPage();
});
