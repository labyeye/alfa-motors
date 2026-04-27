
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    try {
      const keys = [
        {
          sel: '.nav-links a[href="https://www.alfamotorworld.com/"]',
          key: "Home",
        },
        {
          sel: '.nav-links a[href="https://www.alfamotorworld.com/inventory.html"]',
          key: "Buy used cars",
        },
        { sel: ".login-btn button", key: "Get the Quote" },
        { sel: ".page-title", key: "About Us" },
      ];
      keys.forEach((k) => {
        const el = document.querySelector(k.sel);
        if (el && !el.hasAttribute("data-translate"))
          el.setAttribute("data-translate", k.key);
      });

      if (window.i18n && typeof window.i18n.applyPreferred === "function") {
        window.i18n.applyPreferred();
      } else {
        const preferred = localStorage.getItem("preferredLanguage") || "en";
        if (typeof translatePage === "function") translatePage(preferred);
      }
    } catch (e) {}
  });
})();
