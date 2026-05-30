(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-stream") || "";
      var hlsInstance = null;

      function load() {
        if (video.getAttribute("data-loaded") === "1") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        video.setAttribute("data-loaded", "1");
        video.setAttribute("controls", "controls");
      }

      function play() {
        load();

        if (cover) {
          cover.classList.add("is-hidden");
        }

        var result = video.play();

        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
