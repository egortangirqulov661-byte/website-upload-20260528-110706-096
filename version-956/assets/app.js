(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupPlayers();
    });

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!header) {
            return;
        }

        function syncHeader() {
            header.classList.toggle("is-scrolled", window.scrollY > 10);
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (button && menu) {
            button.addEventListener("click", function () {
                var visible = header.classList.toggle("menu-visible");
                document.body.classList.toggle("menu-open", visible);
            });

            menu.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", function () {
                    header.classList.remove("menu-visible");
                    document.body.classList.remove("menu-open");
                });
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        if (slides.length === 0) {
            return;
        }

        function show(target) {
            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
                dot.setAttribute("aria-pressed", itemIndex === index ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);

        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute("data-filter-scope");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            var input = panel.querySelector("[data-search-input]");
            var year = panel.querySelector("[data-year-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");
            var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-card]")) : [];

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedYear = !selectedYear || cardYear === selectedYear;
                    var matchedType = !selectedType || cardType === selectedType;
                    var matched = matchedKeyword && matchedYear && matchedType;

                    card.hidden = !matched;

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            if (year) {
                year.addEventListener("change", apply);
            }

            if (type) {
                type.addEventListener("change", apply);
            }

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play]"));
            var stream = video ? video.getAttribute("data-stream") : "";
            var hls = null;
            var loaded = false;

            if (!video || !stream) {
                return;
            }

            function attach() {
                if (loaded) {
                    return;
                }

                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                video.controls = true;
                video.play().catch(function () {});
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", play);
            });

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });

            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }
})();
