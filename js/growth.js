/**
 * Homepage growth helpers — discovery, sticky dock, native share.
 * Does not touch calculator engines or mechanics.js.
 */
(function initNoirGrowth() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function openEngine(engineId, workspace) {
    if (typeof setPersonaWorkspace === 'function' && workspace) {
      setPersonaWorkspace(workspace);
    }
    if (typeof switchEngine === 'function' && engineId) {
      switchEngine(engineId);
    }
    var target = document.getElementById('calculators');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function focusEngineSearch(query) {
    var input = document.getElementById('engine-search');
    openEngine(null, null);
    if (!input) return;
    window.setTimeout(function () {
      input.focus();
      if (typeof query === 'string' && query) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 280);
  }

  function sharePage() {
    var url = window.location.href.split('#')[0];
    var title = 'aFinanceCalculator — free mortgage, paycheck & loan tools';
    var text = 'Private, no signup. Numbers stay in your browser.';
    if (typeof openShareModal === 'function' && document.getElementById('share-scenario-modal')) {
      if (navigator.share) {
        navigator.share({ title: title, text: text, url: url }).catch(function () {
          openShareModal();
        });
        return;
      }
      openShareModal();
      return;
    }
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        if (typeof showToast === 'function') showToast('Link copied — share it anywhere');
      });
    }
  }

  ready(function () {
    if (document.documentElement.classList.contains('in-frame')) return;
    if (document.documentElement.classList.contains('calculator-landing')) return;

    document.querySelectorAll('[data-noir-intent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openEngine(btn.getAttribute('data-engine'), btn.getAttribute('data-workspace'));
      });
    });

    var findForm = document.getElementById('noir-cinematic-find');
    if (findForm) {
      findForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var field = findForm.querySelector('input');
        focusEngineSearch(field ? field.value.trim() : '');
      });
    }

    document.querySelectorAll('[data-noir-share]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        sharePage();
      });
    });

    var dock = document.getElementById('noir-cinematic-dock');
    var hero = document.querySelector('.noir-hero');
    if (dock && hero && window.matchMedia('(max-width: 900px)').matches) {
      function syncDock() {
        var past = hero.getBoundingClientRect().bottom < 48;
        dock.classList.toggle('is-visible', past);
        if (past) dock.removeAttribute('hidden');
        else dock.setAttribute('hidden', '');
      }
      syncDock();
      window.addEventListener('scroll', syncDock, { passive: true });
      window.addEventListener('resize', syncDock);
    }

    // Returning visitors: restore last intent chip highlight only (no calc change)
    try {
      var last = localStorage.getItem('afc-last-intent');
      if (last) {
        var chip = document.querySelector('[data-noir-intent="' + last + '"]');
        if (chip) chip.classList.add('is-recent');
      }
      document.querySelectorAll('[data-noir-intent]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          localStorage.setItem('afc-last-intent', btn.getAttribute('data-noir-intent') || '');
        });
      });
    } catch (e) { /* private mode */ }
  });
})();
