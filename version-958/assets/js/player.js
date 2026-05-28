
(function () {
    window.initPlayer = function (videoUrl) {
        var video = document.querySelector('.movie-video');
        var overlay = document.querySelector('.player-overlay');
        var started = false;
        var hlsInstance = null;

        function prepare() {
            if (!video || started) {
                return;
            }
            started = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                }
            });
            video.addEventListener('ended', function () {
                if (hlsInstance && hlsInstance.stopLoad) {
                    hlsInstance.stopLoad();
                }
            });
        }
    };
})();
