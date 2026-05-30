
import { H as Hls } from "./hls-vendor.js";

document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector(".player-shell");
  var video = document.querySelector("video[data-hls-player]");
  var playButton = document.querySelector("[data-play]");
  var status = document.querySelector("[data-player-status]");

  if (!shell || !video || !playButton) {
    return;
  }

  var source = video.getAttribute("data-src");
  var hls = null;
  var prepared = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function prepareVideo() {
    if (prepared || !source) {
      return;
    }

    prepared = true;
    setStatus("正在加载播放源...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function () {
        setStatus("播放源已就绪");
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已就绪");
      });
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus("播放加载异常，请刷新页面后重试");
        }
      });
      return;
    }

    setStatus("当前浏览器暂不支持 HLS 播放");
  }

  function startPlayback() {
    prepareVideo();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        setStatus("请点击视频控制栏开始播放");
      });
    }
  }

  playButton.addEventListener("click", startPlayback);

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
    setStatus("正在播放");
  });

  video.addEventListener("pause", function () {
    shell.classList.remove("is-playing");
    setStatus("已暂停");
  });

  video.addEventListener("ended", function () {
    shell.classList.remove("is-playing");
    setStatus("播放结束");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
