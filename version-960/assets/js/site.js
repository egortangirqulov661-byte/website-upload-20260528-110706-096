(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        image.removeAttribute('src');
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();

    var filterInput = document.querySelector('[data-filter-input]');
    var filterGrid = document.querySelector('[data-filter-grid]');
    var filterEmpty = document.querySelector('[data-filter-empty]');

    if (filterInput && filterGrid) {
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
      filterInput.addEventListener('input', function () {
        var keyword = filterInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type')
          ].join(' ').toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) >= 0;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (filterEmpty) {
          filterEmpty.hidden = visible > 0;
        }
      });
    }
  });
})();
