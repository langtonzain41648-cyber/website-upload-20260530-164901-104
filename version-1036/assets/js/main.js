(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero-carousel");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    Array.prototype.slice.call(document.querySelectorAll(".local-filter")).forEach(function (input) {
      var section = input.closest("main") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
      var empty = section.querySelector(".empty-state");

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });

    var searchResults = document.getElementById("searchResults");
    var searchInput = document.getElementById("searchInput");
    var searchTitle = document.getElementById("searchTitle");
    var searchEmpty = document.getElementById("searchEmpty");

    if (searchResults && searchInput && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      searchInput.value = initialQuery;

      function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
          "<a class=\"poster-wrap\" href=\"" + movie.href + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>" +
          "<span class=\"poster-play\">▶</span>" +
          "</a>" +
          "<div class=\"card-body\">" +
          "<div class=\"meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
          "<h3><a href=\"" + movie.href + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function render(query) {
        var normalized = query.trim().toLowerCase();
        var results = window.SEARCH_MOVIES.filter(function (movie) {
          if (!normalized) {
            return movie.featured;
          }

          return movie.search.indexOf(normalized) !== -1;
        }).slice(0, normalized ? 240 : 72);

        searchResults.innerHTML = results.map(card).join("");

        if (searchTitle) {
          searchTitle.textContent = normalized ? "搜索结果" : "推荐片单";
        }

        if (searchEmpty) {
          searchEmpty.hidden = results.length !== 0;
        }
      }

      searchInput.addEventListener("input", function () {
        render(searchInput.value);
      });

      render(initialQuery);
    }
  });
})();
