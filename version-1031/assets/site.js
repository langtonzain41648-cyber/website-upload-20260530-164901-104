
document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupSearchPage();
});

function setupMobileMenu() {
  var button = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

  if (slides.length <= 1) {
    return;
  }

  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
      startTimer();
    });
  });

  startTimer();
}

function setupSearchPage() {
  var panel = document.querySelector("[data-search-panel]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var title = document.querySelector("[data-search-title]");

  if (!panel || !input || !results || !Array.isArray(window.__MOVIE_SEARCH_INDEX)) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";
  input.value = initialQuery;

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card compact-card">',
      '  <a class="poster-link" href="./' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="meta-line">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '    <h3><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.description) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function runSearch(query) {
    var q = normalize(query);

    if (!q) {
      title.textContent = "最新整理";
      return;
    }

    var keywords = q.split(/\s+/).filter(Boolean);
    var matched = window.__MOVIE_SEARCH_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.description
      ].join(" "));

      return keywords.every(function (keyword) {
        return haystack.indexOf(keyword) !== -1;
      });
    }).slice(0, 120);

    title.textContent = '关键词 “' + query + '” 的搜索结果：' + matched.length + ' 条';

    if (!matched.length) {
      results.innerHTML = '<article class="text-card"><h2>没有找到匹配内容</h2><p>可以尝试输入片名、年份、地区、类型或标签关键词。</p></article>';
      return;
    }

    results.innerHTML = matched.map(renderCard).join("");
  }

  if (initialQuery) {
    runSearch(initialQuery);
  }

  input.addEventListener("input", function () {
    runSearch(input.value);
  });
}
