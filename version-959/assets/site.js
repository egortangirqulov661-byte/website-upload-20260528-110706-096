(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var sliders = document.querySelectorAll('.hero-slider');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  function bindFilter(scope) {
    var input = scope.querySelector('.js-search');
    var year = scope.querySelector('.js-year');
    var type = scope.querySelector('.js-type');
    var region = scope.querySelector('.js-region');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('.filter-empty');

    function value(el) {
      return el ? el.value.trim() : '';
    }

    function apply() {
      var keyword = value(input).toLowerCase();
      var yearValue = value(year);
      var typeValue = value(type);
      var regionValue = value(region);
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var pass = true;

        if (keyword && text.indexOf(keyword) === -1) {
          pass = false;
        }

        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          pass = false;
        }

        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          pass = false;
        }

        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          pass = false;
        }

        card.classList.toggle('hidden', !pass);

        if (pass) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, year, type, region].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(bindFilter);

  window.initMoviePlayer = function (streamUrl) {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var ready = false;
    var player = null;

    function attach() {
      if (ready || !video || !streamUrl) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(streamUrl);
        player.attachMedia(video);
        player.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            player.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            player.recoverMediaError();
          } else {
            player.destroy();
          }
        });
      } else {
        video.src = streamUrl;
      }

      ready = true;
    }

    function start() {
      attach();
      shell.classList.add('is-playing');
      video.controls = true;
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  };
})();
