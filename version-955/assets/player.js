(function() {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('player-start');
  var loaded = false;
  var hlsInstance = null;

  if (!video || typeof playerVideoUrl !== 'string' || !playerVideoUrl) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playerVideoUrl;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(playerVideoUrl);
      hlsInstance.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = playerVideoUrl;
    loaded = true;
  }

  function playVideo() {
    attachSource();

    if (button) {
      button.classList.add('is-hidden');
    }

    var action = video.play();

    if (action && typeof action.catch === 'function') {
      action.catch(function() {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
