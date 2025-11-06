/* happy-customers.js - page translation helpers for https://www.alfamotorworld.com/happy-customers.html */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    try {
      const map = [
        { s: '.nav-links a[href="https://www.alfamotorworld.com/"]', k: 'Home' },
        { s: '.nav-links a[href="https://www.alfamotorworld.com/inventory.html"]', k: 'Vehicles for Sale' },
        { s: '.login-btn button', k: 'Get the Quote' },
        { s: '.testimonials-title', k: 'Happy Customers' },
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
