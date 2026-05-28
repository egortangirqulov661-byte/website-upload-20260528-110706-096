(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      var existing = document.querySelector('script[data-hls-library="true"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.dataset.hlsLibrary = 'true';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function playVideo(card) {
    var video = card.querySelector('video');
    var button = card.querySelector('.player-start');
    var status = card.querySelector('.player-status');
    var source = card.getAttribute('data-video-src');

    if (!video || !source) {
      if (status) {
        status.textContent = '未找到播放源。';
      }
      return;
    }

    if (button) {
      button.classList.add('hidden');
    }
    if (status) {
      status.textContent = '正在初始化 HLS 播放器…';
    }

    function startNativePlayback() {
      video.src = source;
      video.play().catch(function () {
        if (status) {
          status.textContent = '播放器已载入，请点击视频控件开始播放。';
        }
      });
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      startNativePlayback();
      if (status) {
        status.textContent = '已使用浏览器原生 HLS 播放。';
      }
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
      .then(function () {
        if (!window.Hls || !window.Hls.isSupported()) {
          startNativePlayback();
          return;
        }

        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }

        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (status) {
            status.textContent = '播放源已载入，正在播放。';
          }
          video.play().catch(function () {
            if (status) {
              status.textContent = '播放源已载入，请点击视频控件开始播放。';
            }
          });
        });

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            if (status) {
              status.textContent = '网络加载异常，正在重试播放源。';
            }
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            if (status) {
              status.textContent = '媒体解码异常，正在尝试恢复。';
            }
            hls.recoverMediaError();
          } else {
            if (status) {
              status.textContent = '播放器初始化失败，请刷新页面后重试。';
            }
            hls.destroy();
          }
        });
      })
      .catch(function () {
        if (status) {
          status.textContent = 'HLS 播放库加载失败，已尝试使用浏览器原生播放能力。';
        }
        startNativePlayback();
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.video-player-card').forEach(function (card) {
      var button = card.querySelector('.player-start');
      if (button) {
        button.addEventListener('click', function () {
          playVideo(card);
        });
      }
    });
  });
})();
