(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardTemplate(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
      '  <div class="movie-thumb">',
      '    <div class="poster-shell poster-ratio">',
      '      <span class="poster-fallback-title">' + escapeHtml(item.title) + '</span>',
      '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    </div>',
      '    <span class="play-dot">▶</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <div class="meta-line"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '    <h3>' + escapeHtml(item.title) + '</h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var data = window.MOVIE_SEARCH_DATA || [];
    var queryInput = document.getElementById('search-query');
    var typeSelect = document.getElementById('search-type');
    var regionSelect = document.getElementById('search-region');
    var genreSelect = document.getElementById('search-genre');
    var yearSelect = document.getElementById('search-year');
    var resetButton = document.getElementById('search-reset');
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');

    if (!queryInput || !results) {
      return;
    }

    queryInput.value = getQueryParam('q');

    function render() {
      var query = queryInput.value.trim().toLowerCase();
      var type = typeSelect.value;
      var region = regionSelect.value;
      var genre = genreSelect.value;
      var year = yearSelect.value;

      var matched = data.filter(function (item) {
        var haystack = [
          item.title,
          item.type,
          item.region,
          item.regionBucket,
          item.year,
          item.genre.join(' '),
          item.tags.join(' '),
          item.oneLine
        ].join(' ').toLowerCase();

        return (!query || haystack.indexOf(query) >= 0)
          && (!type || item.type === type)
          && (!region || item.regionBucket === region)
          && (!genre || item.genre.indexOf(genre) >= 0 || item.tags.indexOf(genre) >= 0)
          && (!year || item.year === year);
      });

      var visible = matched.slice(0, 80);
      results.innerHTML = visible.map(cardTemplate).join('');
      summary.textContent = '共找到 ' + matched.length + ' 部影片，当前显示前 ' + visible.length + ' 部。';

      results.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('image-missing');
          image.removeAttribute('src');
        }, { once: true });
      });
    }

    [queryInput, typeSelect, regionSelect, genreSelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    resetButton.addEventListener('click', function () {
      queryInput.value = '';
      typeSelect.value = '';
      regionSelect.value = '';
      genreSelect.value = '';
      yearSelect.value = '';
      render();
    });

    render();
  });
})();
