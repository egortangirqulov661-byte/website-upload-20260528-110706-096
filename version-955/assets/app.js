(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      var open = mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startHero();
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      showSlide(index);
      resetHero();
    });
  });

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function() {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function() {
      showSlide(current + 1);
      resetHero();
    });
  }

  showSlide(0);
  startHero();

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

  filterInputs.forEach(function(input) {
    var targetSelector = input.getAttribute('data-filter-input');
    var scope = targetSelector ? document.querySelector(targetSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-card]')) : [];
    var empty = scope ? scope.parentElement.querySelector('[data-empty-note]') : null;

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input.hasAttribute('data-query-sync')) {
      input.value = query;
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  });
})();
