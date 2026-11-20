/**
 * Lightweight homepage cinematic helpers.
 * First paint stays CSS-only (transform/opacity). No Lenis on this page.
 * Optional GSAP may be added later deferred after idle — not on critical path.
 * Does not touch calculator engines or mechanics.js.
 */
(function initNoirCinematic() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    if (document.documentElement.classList.contains('in-frame')) return;

    var section = document.querySelector('.noir-cinematic-section');
    if (!section) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      section.classList.add('is-active');
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              section.classList.add('is-active');
              io.disconnect();
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.2 }
      );
      io.observe(section);
    }

    // Optional: lazy-load a video only when a non-empty data-src is present
    var video = section.querySelector('video[data-src]');
    if (!video) return;
    var srcAttr = (video.getAttribute('data-src') || '').trim();
    if (!srcAttr) return;

    var mediaWrap = section.querySelector('.noir-cinematic-media');
    if (mediaWrap) mediaWrap.classList.add('has-source');

    function loadVideo() {
      if (video.getAttribute('src')) return;
      video.setAttribute('preload', 'none');
      video.setAttribute('src', srcAttr);
      video.load();
    }

    if (!('IntersectionObserver' in window)) {
      loadVideo();
      return;
    }

    var vio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadVideo();
            vio.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    vio.observe(video);
  });
})();
