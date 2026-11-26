/**
 * Wallet news carousel + listing (original aFinanceCalculator editorial).
 * UX inspired by public “news that impacts your wallet” patterns — original copy only.
 */
(function (global) {
  'use strict';

  var DATA_URL = '/data/wallet-news.json';
  var state = { items: [], index: 0, timer: null, reduced: false };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function prefersReduced() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso + 'T12:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function articleHref(item) {
    return item.href || ('/news/' + item.slug + '/');
  }

  function renderSlide(item, i, total) {
    return (
      '<article class="afc-wallet-news-slide" data-index="' +
      i +
      '" aria-roledescription="slide" aria-label="' +
      (i + 1) +
      ' of ' +
      total +
      '">' +
      '<a class="afc-wallet-news-card" href="' +
      articleHref(item) +
      '">' +
      '<span class="afc-wallet-news-tone afc-wallet-news-tone--' +
      (item.imageTone || 'home') +
      '" aria-hidden="true"></span>' +
      '<div class="afc-wallet-news-copy">' +
      '<div class="afc-wallet-news-meta">' +
      '<span class="afc-wallet-news-cat">' +
      (item.category || 'News') +
      '</span>' +
      '<time datetime="' +
      item.date +
      '">' +
      formatDate(item.date) +
      '</time>' +
      '</div>' +
      '<h3 class="afc-wallet-news-headline">' +
      item.title +
      '</h3>' +
      '<p class="afc-wallet-news-dek">' +
      item.dek +
      '</p>' +
      '<span class="afc-wallet-news-read">Read article</span>' +
      '</div></a></article>'
    );
  }

  function updateChrome() {
    var total = state.items.length;
    var status = $('.afc-wallet-news-status');
    if (status) {
      status.textContent = 'Showing article ' + (state.index + 1) + ' of ' + total;
    }
    var track = $('.afc-wallet-news-track');
    if (track) {
      track.style.transform = 'translateX(-' + state.index * 100 + '%)';
    }
    var dots = document.querySelectorAll('.afc-wallet-news-dot');
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === state.index);
      dot.setAttribute('aria-current', i === state.index ? 'true' : 'false');
    });
  }

  function goTo(i) {
    if (!state.items.length) return;
    state.index = ((i % state.items.length) + state.items.length) % state.items.length;
    updateChrome();
  }

  function next() {
    goTo(state.index + 1);
  }

  function prev() {
    goTo(state.index - 1);
  }

  function stopAuto() {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  }

  function startAuto() {
    stopAuto();
    if (state.reduced || state.items.length < 2) return;
    state.timer = setInterval(next, 7000);
  }

  function mountCarousel(data) {
    var root = $('#afc-wallet-news');
    if (!root) return;
    state.items = data.items || [];
    state.reduced = prefersReduced();

    var title = $('.afc-wallet-news-title', root);
    if (title && data.sectionTitle) title.textContent = data.sectionTitle;

    var viewAll = $('.afc-wallet-news-all', root);
    if (viewAll && data.viewAllHref) viewAll.setAttribute('href', data.viewAllHref);

    var track = $('.afc-wallet-news-track', root);
    var dotsWrap = $('.afc-wallet-news-dots', root);
    if (!track) return;

    track.innerHTML = state.items
      .map(function (item, i) {
        return renderSlide(item, i, state.items.length);
      })
      .join('');

    if (dotsWrap) {
      dotsWrap.innerHTML = state.items
        .map(function (_, i) {
          return (
            '<button type="button" class="afc-wallet-news-dot' +
            (i === 0 ? ' is-active' : '') +
            '" aria-label="Go to article ' +
            (i + 1) +
            '" data-index="' +
            i +
            '"></button>'
          );
        })
        .join('');
    }

    var prevBtn = $('.afc-wallet-news-prev', root);
    var nextBtn = $('.afc-wallet-news-next', root);
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAuto(); });
    if (dotsWrap) {
      dotsWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('.afc-wallet-news-dot');
        if (!btn) return;
        goTo(parseInt(btn.getAttribute('data-index'), 10) || 0);
        startAuto();
      });
    }

    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
    root.addEventListener('focusin', stopAuto);
    root.addEventListener('focusout', startAuto);

    goTo(0);
    startAuto();
  }

  function mountListing(data) {
    var list = $('#afc-wallet-news-list');
    if (!list) return;
    var items = data.items || [];
    list.innerHTML = items
      .map(function (item) {
        return (
          '<li class="afc-wallet-news-list-item">' +
          '<a href="' +
          articleHref(item) +
          '">' +
          '<span class="afc-wallet-news-cat">' +
          (item.category || 'News') +
          '</span>' +
          '<strong>' +
          item.title +
          '</strong>' +
          '<span class="afc-wallet-news-dek">' +
          item.dek +
          '</span>' +
          '<time datetime="' +
          item.date +
          '">' +
          formatDate(item.date) +
          '</time>' +
          '</a></li>'
        );
      })
      .join('');
  }

  function mountArticle(data) {
    var root = $('#afc-wallet-news-article');
    if (!root) return;
    var slug = root.getAttribute('data-slug');
    var item = (data.items || []).find(function (x) {
      return x.slug === slug;
    });
    if (!item) {
      root.innerHTML = '<p>Article not found. <a href="/news/">Back to news</a>.</p>';
      return;
    }
    document.title = item.title + ' | aFinanceCalculator';
    var bodyHtml = (item.body || [])
      .map(function (p) {
        return '<p>' + p + '</p>';
      })
      .join('');
    var cta =
      item.ctaHref
        ? '<p class="afc-wallet-news-cta-wrap"><a class="afc-wallet-news-cta" href="' +
          item.ctaHref +
          '">' +
          (item.ctaLabel || 'Open calculator') +
          '</a></p>'
        : '';
    root.innerHTML =
      '<p class="afc-wallet-news-cat">' +
      (item.category || 'News') +
      '</p>' +
      '<h1>' +
      item.title +
      '</h1>' +
      '<p class="afc-wallet-news-byline"><time datetime="' +
      item.date +
      '">' +
      formatDate(item.date) +
      '</time> · ' +
      (item.author || 'Editorial') +
      '</p>' +
      '<p class="afc-wallet-news-dek afc-wallet-news-dek--lead">' +
      item.dek +
      '</p>' +
      '<div class="afc-wallet-news-body">' +
      bodyHtml +
      '</div>' +
      cta +
      '<p class="afc-wallet-news-back"><a href="/news/">← All wallet news</a></p>';
  }

  function init(data) {
    mountCarousel(data);
    mountListing(data);
    mountArticle(data);
  }

  function load() {
    fetch(DATA_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('news fetch failed');
        return r.json();
      })
      .then(init)
      .catch(function () {
        var root = $('#afc-wallet-news');
        if (root) root.hidden = true;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

  global.AFC_WALLET_NEWS = {
    next: next,
    prev: prev,
    goTo: goTo
  };
})(typeof window !== 'undefined' ? window : this);
