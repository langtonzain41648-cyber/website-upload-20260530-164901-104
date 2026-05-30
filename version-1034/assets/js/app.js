(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startCarousel() {
    if (slideTimer || slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const target = Number(dot.getAttribute('data-target') || '0');
      showSlide(target);
      window.clearInterval(slideTimer);
      slideTimer = null;
      startCarousel();
    });
  });

  showSlide(0);
  startCarousel();

  const searchInput = document.getElementById('siteSearchInput');
  const searchCards = Array.from(document.querySelectorAll('.search-card'));
  const resultCount = document.getElementById('searchResultCount');

  function getQueryFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function applySearch(value) {
    const query = value.trim().toLowerCase();
    let visible = 0;

    searchCards.forEach(function (card) {
      const data = (card.getAttribute('data-search') || '').toLowerCase();
      const matched = !query || data.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = query ? '匹配结果 ' + visible + ' 条' : '显示全部影片';
    }
  }

  if (searchInput) {
    const initialQuery = getQueryFromUrl();
    searchInput.value = initialQuery;
    applySearch(initialQuery);
    searchInput.addEventListener('input', function () {
      applySearch(searchInput.value);
    });
  }

  const players = Array.from(document.querySelectorAll('video.hls-player'));

  players.forEach(function (video) {
    const source = video.getAttribute('data-hls-src');
    const overlay = video.parentElement ? video.parentElement.querySelector('.play-overlay') : null;

    function preparePlayer() {
      if (!source || video.dataset.ready === '1') {
        return;
      }

      video.dataset.ready = '1';

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    video.addEventListener('click', preparePlayer, { once: true });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        preparePlayer();
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
        overlay.classList.add('is-hidden');
      });
    }
  });
})();
