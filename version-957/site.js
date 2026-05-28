(function () {
  var header = document.querySelector('[data-site-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-filter-search]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) return;
    var q = normalize(searchInput && searchInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type')
      ].join(' '));
      var ok = true;
      if (q && haystack.indexOf(q) === -1) ok = false;
      if (year && normalize(card.getAttribute('data-year')) !== year) ok = false;
      if (region && normalize(card.getAttribute('data-region')) !== region) ok = false;
      card.hidden = !ok;
      if (ok) visible += 1;
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, yearSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  window.preparePlayer = function (source, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var instance = null;

    if (!video || !source) return;

    function play() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    function bind() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.MANIFEST_PARSED, play);
        return;
      }
      video.src = source;
      play();
    }

    function start() {
      if (started) {
        play();
        return;
      }
      started = true;
      if (button) button.classList.add('is-hidden');
      bind();
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) start();
    });

    window.addEventListener('beforeunload', function () {
      if (instance) instance.destroy();
    });
  };
})();
