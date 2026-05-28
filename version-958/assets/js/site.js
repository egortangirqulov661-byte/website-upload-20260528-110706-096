
(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        if (menuButton) {
            menuButton.addEventListener('click', function () {
                document.body.classList.toggle('menu-open');
            });
        }

        document.querySelectorAll('.mobile-link').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
            });
        });

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var next = hero.querySelector('.hero-next');
            var prev = hero.querySelector('.hero-prev');
            var index = 0;
            var timer = null;

            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            function run() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    run();
                });
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    run();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    run();
                });
            });

            show(0);
            run();
        }

        var input = document.querySelector('[data-search-input]');
        var select = document.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        var empty = document.querySelector('[data-empty-state]');

        function applySearch() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var type = select ? select.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-card-type') || '';
                var matchText = !term || text.indexOf(term) !== -1;
                var matchType = !type || cardType.indexOf(type) !== -1;
                var showCard = matchText && matchType;
                card.classList.toggle('is-hidden', !showCard);
                if (showCard) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applySearch);
        }

        if (select) {
            select.addEventListener('change', applySearch);
        }
    });
})();
