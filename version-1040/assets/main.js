document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (toggle && mobilePanel) {
    toggle.addEventListener("click", function () {
      var opened = mobilePanel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterInput = document.querySelector("[data-card-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-list .movie-card"));

  function applyFilter(value) {
    var query = String(value || "").trim().toLowerCase();
    cards.forEach(function (card) {
      var target = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      card.classList.toggle("hidden", Boolean(query) && target.indexOf(query) === -1);
    });
  }

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      filterInput.value = initial;
      applyFilter(initial);
    }
    filterInput.addEventListener("input", function () {
      applyFilter(filterInput.value);
    });
  }
});
