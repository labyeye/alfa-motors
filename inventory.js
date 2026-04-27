




(function () {
  function setAttr(selector, key) {
    try {
      const el = document.querySelector(selector);
      if (el && !el.hasAttribute("data-translate"))
        el.setAttribute("data-translate", key);
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    
    setAttr(".login-btn button", "Get the Quote");
    setAttr('.nav-links a[href="https://www.alfamotorworld.com/"]', "Home");
    setAttr(
      '.nav-links a[href="https://www.alfamotorworld.com/inventory.html"]',
      "Buy used cars",
    );
    setAttr(
      '.nav-links a[href="https://www.alfamotorworld.com/sell.html"]',
      "Sell car",
    );
    setAttr(
      '.nav-links a[href="https://www.alfamotorworld.com/about.html"]',
      "About Us",
    );
    setAttr(
      '.nav-links a[href="https://www.alfamotorworld.com/contact.html"]',
      "Contact",
    );
    setAttr(
      '.nav-links a[href="https://www.alfamotorworld.com/happy-customers.html"]',
      "Happy Customers",
    );
    setAttr('.nav-links a[href="financing.html"]', "Financing");

    
    setAttr(".filters-container h3", "Filters");
    setAttr('.filter-btn[data-filter="all"]', "All Cars");
    setAttr('.filter-btn[data-filter="price"]', "Price");
    setAttr('.filter-btn[data-filter="brand"]', "Brand");

    
    
    setAttr(".car-grid .view-details-btn", "View Details");
    setAttr(".car-grid .contact-btn", "Contact Seller");

    
    try {
      if (window.i18n && typeof window.i18n.applyPreferred === "function") {
        window.i18n.applyPreferred();
      } else {
        const preferred = localStorage.getItem("preferredLanguage");
        if (typeof translatePage === "function") translatePage(preferred);
      }
    } catch (e) {}
  });
})();
