/* sell.js - translation helpers for sell.html */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    try {
      const map = [
        { s: '.nav-links a[href="index.html"]', k: 'Home' },
        { s: '.nav-links a[href="inventory.html"]', k: 'Vehicles for Sale' },
        { s: '.login-btn button', k: 'Get the Quote' },
        { s: '.sell-cta button', k: 'Get Valuation' },
      ];
      map.forEach(item => {
        const el = document.querySelector(item.s);
        if (el && !el.hasAttribute('data-translate')) el.setAttribute('data-translate', item.k);
      });
      if (window.i18n && typeof window.i18n.applyPreferred === 'function') {
        window.i18n.applyPreferred();
      } else {
        const preferred = localStorage.getItem('preferredLanguage') || 'en';
        if (typeof translatePage === 'function') translatePage(preferred);
      }
    } catch (e) {}
  });
})();
