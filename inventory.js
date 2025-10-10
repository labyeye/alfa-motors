/* inventory.js
   Page-specific translation helpers for inventory.html
   Adds data-translate attributes for common static elements and triggers
   translatePage(preferredLanguage) when present.
*/
(function () {
  function setAttr(selector, key) {
    try {
      const el = document.querySelector(selector);
      if (el && !el.hasAttribute('data-translate')) el.setAttribute('data-translate', key);
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Common header/footer
    setAttr('.login-btn button', 'Get the Quote');
    setAttr('.nav-links a[href="index.html"]', 'Home');
    setAttr('.nav-links a[href="inventory.html"]', 'Vehicles for Sale');
    setAttr('.nav-links a[href="sell.html"]', 'Sell Your Vehicle');
    setAttr('.nav-links a[href="about.html"]', 'About Us');
    setAttr('.nav-links a[href="contact.html"]', 'Contact');
    setAttr('.nav-links a[href="happy-customers.html"]', 'Happy Customers');
    setAttr('.nav-links a[href="financing.html"]', 'Financing');

    // Sidebar/filter labels
    setAttr('.filters-container h3', 'Filters');
    setAttr('.filter-btn[data-filter="all"]', 'All Cars');
    setAttr('.filter-btn[data-filter="price"]', 'Price');
    setAttr('.filter-btn[data-filter="brand"]', 'Brand');

    // Car list fallbacks (some buttons are set dynamically)
    // If present statically, ensure they have keys
    setAttr('.car-grid .view-details-btn', 'View Details');
    setAttr('.car-grid .contact-btn', 'Contact Seller');

    // Apply preferred language via i18n helper if present, else try translatePage
    try {
      if (window.i18n && typeof window.i18n.applyPreferred === 'function') {
        window.i18n.applyPreferred();
      } else {
        const preferred = localStorage.getItem('preferredLanguage');
        if (typeof translatePage === 'function') translatePage(preferred);
      }
    } catch (e) {}
  });
})();
