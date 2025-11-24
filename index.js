// main.js

// Sticky Navbar Functionality
function initializeStickyNavbar() {
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Enhanced Search with Auto-complete
function initializeSearchFeatures() {
  const searchInput = document.getElementById("searchInput");
  const suggestions = [
    "BMW X5",
    "Audi A4",
    "Mercedes C-Class",
    "Toyota Corolla",
    "Honda Civic",
    "BMW 3 Series",
    "Audi Q5",
    "Mercedes E-Class",
    "Toyota Camry",
    "Honda Accord",
    "SUV",
    "Sedan",
    "Hatchback",
    "Luxury Cars",
    "Electric Cars",
  ];

  if (searchInput) {
    // Create suggestions dropdown
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.className = "search-suggestions";
    searchInput.parentNode.appendChild(suggestionsContainer);

    searchInput.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value)
      );

      if (value && filtered.length > 0) {
        suggestionsContainer.innerHTML = filtered
          .slice(0, 5)
          .map(
            (suggestion) => `<div class="suggestion-item">${suggestion}</div>`
          )
          .join("");
        suggestionsContainer.style.display = "block";
      } else {
        suggestionsContainer.style.display = "none";
      }
    });

    // Handle suggestion clicks
    suggestionsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        searchInput.value = e.target.textContent;
        suggestionsContainer.style.display = "none";
      }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !suggestionsContainer.contains(e.target)
      ) {
        suggestionsContainer.style.display = "none";
      }
    });
  }
}

// Hero Slider Functionality
function initializeHeroSlider() {
  const heroSlider = document.createElement("div");
  heroSlider.className = "hero-slider";

  const slides = [
    "https://static.vecteezy.com/system/resources/previews/023/977/549/non_2x/front-view-dark-silhouette-of-a-modern-luxury-black-car-isolated-on-black-background-ai-generated-free-photo.jpg",
    "https://images.unsplash.com/photo-1724391114112-c83ad59f1d5f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://cdn.wallpapersafari.com/23/31/eBJ6Dl.jpg",
    "https://i.ytimg.com/vi/1xcmpmHmbD0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBiX9zzRTzCNv30D7_c8ykr8wRH6g",
  ];

  slides.forEach((slide, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.className = `hero-slide ${index === 0 ? "active" : ""}`;
    slideDiv.style.backgroundImage = `url(${slide})`;
    heroSlider.appendChild(slideDiv);
  });
  const backgroundImageDiv = document.querySelector(".background-image");
  const heroSection = document.querySelector(".hero-section");
  if (backgroundImageDiv && backgroundImageDiv.parentNode) {
    backgroundImageDiv.parentNode.replaceChild(heroSlider, backgroundImageDiv);
  } else if (heroSection) {
    // Insert as the first child so it sits behind the hero content
    heroSection.insertBefore(heroSlider, heroSection.firstChild);
  } else {
    // As a last resort append to body
    document.body.appendChild(heroSlider);
  }

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "slider-dots";

  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `slider-dot ${index === 0 ? "active" : ""}`;
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  document.querySelector(".hero-section").appendChild(dotsContainer);

  const slidesElements = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  let currentSlide = 0;

  function showSlide(index) {
    slidesElements.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    slidesElements[index].classList.add("active");
    dots[index].classList.add("active");
    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  let slideInterval = setInterval(nextSlide, 2000);

  heroSlider.addEventListener("mouseenter", () => {
    clearInterval(slideInterval);
  });

  heroSlider.addEventListener("mouseleave", () => {
    slideInterval = setInterval(nextSlide, 5000);
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      showSlide(parseInt(dot.dataset.index));
      slideInterval = setInterval(nextSlide, 5000);
    });
  });
}

// Mobile Menu Functionality
function initializeMobileMenu() {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "mobile-menu-toggle";
  toggleBtn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
  toggleBtn.setAttribute("aria-label", "Toggle mobile menu");

  const navbar = document.querySelector(".navbar");
  navbar.appendChild(toggleBtn);

  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.innerHTML = `
    <button class="close-btn" aria-label="Close mobile menu">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <ul class="nav-links">
      <li>
        <a href="https://www.alfamotorworld.com/"  aria-current="page">
          <span data-translate="Home">Home</span>
        </a>
      </li>
      <li>
        <a href="https://www.alfamotorworld.com/inventory.html">
          <span data-translate="Vehicles for Sale">Vehicles for Sale</span>
        </a>
      </li>
      <li>
        <a href="https://www.alfamotorworld.com/sell.html">
          <span data-translate="Sell Your Vehicle">Sell Your Vehicle</span>
        </a>
      </li>
       <li>
        <a href="https://www.alfamotorworld.com/happy-customers.html">
          <span data-translate="Happy Customers">Happy Customers</span>
        </a>
      </li>
       <li>
        <a href="financing.html">
          <span data-translate="Financing">Financing</span>
        </a>
      </li>
      <li>
        <a href="https://www.alfamotorworld.com/about.html">
          <span data-translate="About Us">About Us</span>
        </a>
      </li>
      <li>
        <a href="https://www.alfamotorworld.com/contact.html">
          <span data-translate="Contact">Contact</span>
        </a>
      </li>
    </ul>
    <div class="login-btn">
      <a href="https://www.alfamotorworld.com/getquote.html">
        <button aria-label="Get a quote for your Car" data-translate="Get the Quote">
          Get the Quote
        </button>
      </a>
    </div>
  `;

  // Insert mobileMenu adjacent to navbar for consistent DOM structure
  const navbarEl = document.querySelector(".navbar") || document.body;
  if (navbarEl.parentNode)
    navbarEl.parentNode.insertBefore(mobileMenu, navbarEl.nextSibling);

  // Keep aria attributes in sync
  toggleBtn.setAttribute("aria-controls", "mobileMenu");
  toggleBtn.setAttribute("aria-expanded", "false");
  mobileMenu.id = "mobileMenu";
  mobileMenu.setAttribute("aria-hidden", "true");

  // Toggle open/close with proper ARIA updates
  toggleBtn.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.toggle("active");
    mobileMenu.setAttribute("aria-hidden", (!isOpen).toString());
    toggleBtn.setAttribute("aria-expanded", isOpen.toString());
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) {
      // focus first focusable element inside menu
      const first = mobileMenu.querySelector("a, button");
      if (first) first.focus();
    } else {
      // return focus to toggle
      toggleBtn.focus();
    }
  });

  mobileMenu.querySelector(".close-btn").addEventListener("click", function () {
    mobileMenu.classList.remove("active");
    mobileMenu.setAttribute("aria-hidden", "true");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "auto";
    toggleBtn.focus();
  });
}

// Lazy Loading Images
function initializeLazyLoading() {
  if ("IntersectionObserver" in window) {
    const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    let lazyImageObserver = new IntersectionObserver(function (
      entries,
      observer
    ) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }

  const preconnectUrls = [
    "https://cdnjs.cloudflare.com",
    "https://randomuser.me",
    "https://imgd.aeplcdn.com",
  ];

  preconnectUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = url;
    document.head.appendChild(link);
  });
}

// Statistics Animation
function animateStats() {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-count"));
    let current = 0;
    const increment = target / 50;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target + "+";
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 30);
  });
}

function initializeStatsObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(document.querySelector(".stats-section"));
}

// Car Slider Functionality
function initializeCarSlider() {
  const CarSlider = document.querySelector(".Car-slider");
  const prevBtn = document.querySelector(".slider-nav.prev");
  const nextBtn = document.querySelector(".slider-nav.next");

  fetchFeaturedCars();
  // Adjust card widths after featured cars are rendered
  function adjustVisibleCards() {
    if (!CarSlider) return;
    const gap = 20; // should match CSS gap
    const containerWidth = CarSlider.clientWidth;

    function getVisibleCount(width) {
      if (width >= 1600) return 7;
      if (width >= 1400) return 6;
      if (width >= 1200) return 5;
      if (width >= 992) return 4;
      if (width >= 768) return 3;
      if (width >= 480) return 2;
      return 1;
    }

    const visibleCount = getVisibleCount(containerWidth);
    const totalGaps = Math.max(0, visibleCount - 1) * gap;
    const cardWidth = Math.floor((containerWidth - totalGaps) / visibleCount);

    const cards = CarSlider.querySelectorAll(".Car-card");
    cards.forEach((card) => {
      // set exact pixel width so the number of visible cards fits the container
      card.style.flex = `0 0 ${cardWidth}px`;
      card.style.maxWidth = `${cardWidth}px`;
    });
  }

  // Listen for the custom event dispatched after cars are rendered
  if (CarSlider) {
    CarSlider.addEventListener("featuredCarsRendered", () => {
      adjustVisibleCards();
    });
  }

  // Also adjust on resize with debounce
  let resizeTimeout = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      adjustVisibleCards();
    }, 120);
  });

  prevBtn.addEventListener("click", () => {
    CarSlider.scrollBy({ left: -300, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    CarSlider.scrollBy({ left: 300, behavior: "smooth" });
  });

  CarSlider.addEventListener("scroll", () => {
    prevBtn.disabled = CarSlider.scrollLeft <= 10;
    nextBtn.disabled =
      CarSlider.scrollLeft >=
      CarSlider.scrollWidth - CarSlider.clientWidth - 10;
  });
}

// Simple API/image base for development: always use localhost:2500 unless overridden
const API_BASE_URL =  "https://alfa-motors-5yfh.vercel.app";
const IMAGE_BASE = `${API_BASE_URL}/carimages`;

// Debug helpers (exposed to window for quick inspection in DevTools)
try {
  console.debug(
    "[config] API_BASE_URL=",
    API_BASE_URL,
    "IMAGE_BASE=",
    IMAGE_BASE
  );
  window.__API_BASE_URL = API_BASE_URL;
  window.__IMAGE_BASE = IMAGE_BASE;
} catch (e) {}

// Helper to normalize image paths (used by featured cars)
function getImageUrl(imagePath) {
  if (Array.isArray(imagePath) && imagePath.length > 0)
    imagePath = imagePath[0];

  // If it's a JSON-encoded array string, try to parse
  if (typeof imagePath === "string") {
    const raw = imagePath.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) imagePath = parsed[0];
      } catch (e) {}
    }
  }

  if (typeof imagePath !== "string") return "assets/placeholder.png";
  const p = imagePath.trim();

  // Prefer absolute URLs (Cloudinary / CDN) or data URIs
  if (
    p.startsWith("http://") ||
    p.startsWith("https://") ||
    p.startsWith("data:")
  )
    return p;

  // Remove any leading slashes
  const cleaned = p.replace(/^\/+/, "");

  // If it's an assets path, return as-is
  if (cleaned.startsWith("assets/")) return cleaned;

  // If already contains carimages/, strip it and construct URL
  const filename = cleaned.startsWith("carimages/")
    ? cleaned.replace(/^carimages\//, "")
    : cleaned;

  // Fallback to IMAGE_BASE for legacy/local filenames
  return `${IMAGE_BASE}/${filename}`;
}
function normalizePhotos(photosField) {
  if (!photosField) return [];
  if (Array.isArray(photosField)) return photosField;
  if (typeof photosField === "string") {
    const raw = photosField.trim();
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (raw.includes(","))
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return [raw];
  }
  return [];
}

// Abbreviate kilometers display for small cards (e.g., 68000 -> 68K, 150000 -> 1.5L)
function abbreviateKm(km) {
  const n = Number(km) || 0;
  if (n === 0) return "0";
  if (n >= 100000) {
    return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  }
  return n.toString();
}

function formatAge(days) {
  const d = Number(days) || 0;
  if (d <= 0) return "Fresh";
  if (d < 30) return `${d}d old`;
  if (d < 365) return `${Math.round(d / 30)}m old`;
  return `${Math.round(d / 365)}y old`;
}

// More robust ownership formatter (matches inventory page)
function formatOwnership(owner) {
  if (!owner) return "1st Own";
  const s = owner.toString().toLowerCase();
  if (s === "1" || s.includes("1st")) return "1st Own";
  if (s === "2" || s.includes("2nd")) return "2nd Own";
  if (s === "3" || s.includes("3+") || s.includes("3rd")) return "3rd Own";
  return owner;
}

// Create a featured car card similar to inventory page, adapted for index slider
function createCarCard(car) {
  const carCard = document.createElement("div");
  // add both class names so styles from inventory and index match
  carCard.className = "Car-card car-card";

  // Set data attributes for potential filtering
  carCard.dataset.brand = car.make || "";
  carCard.dataset.sellingPrice = car.sellingPrice || 0;
  carCard.dataset.year = car.modelYear || new Date().getFullYear();
  carCard.dataset.km = car.kmDriven || 0;
  carCard.dataset.owner = car.ownership || "1";
  carCard.dataset.fuel = car.fuelType || "Petrol";

  const statusClass =
    car.status === "Available"
      ? "status-available"
      : car.status === "Sold Out"
      ? "status-sold"
      : car.status === "Coming Soon"
      ? "status-coming-soon"
      : "status-available";

  // Build image HTML
  let imageHTML = "";
  if (Array.isArray(car.photos) && car.photos.length > 0) {
    if (car.photos.length > 1) {
      imageHTML = `
        <div class="car-slider">
          <div class="slider-images">
            ${car.photos
              .map(
                (img) => `
              <img src="${getImageUrl(img)}" 
                   alt="${car.make || car.brand || ""} ${car.model || ""}"
                   onerror="this.onerror=null;this.src='assets/placeholder.png'">
            `
              )
              .join("")}
          </div>
          <div class="slider-dots">
            ${car.photos
              .map((_, index) => `
              <span class="dot" data-index="${index}"></span>
            `)
              .join("")}
          </div>
          <button class="slider-prev">&lt;</button>
          <button class="slider-next">&gt;</button>
        </div>
      `;
    } else {
      imageHTML = `
  <img src="${getImageUrl(car.photos[0])}" 
    alt="${car.make || car.brand || ""} ${car.model || ""}" 
    onerror="this.onerror=null;this.src='assets/placeholder.png'">
  `;
    }
  }

  carCard.dataset.CarData = JSON.stringify(car);

  carCard.innerHTML = `
    <div class="image-container">
      ${imageHTML}
      <div class="status-badge ${statusClass}" data-translate="${car.status || "Available"}">${car.status || "Available"}</div>
    </div>
    <div class="card-content">
      <div class="title">
        <h3>${car.modelYear || ''} ${car.make || "Unknown Brand"} ${car.model || "Unknown Model"}</h3>
      </div>
      <div class="details">
        <div class="detail-item">
          <span><i class="fas fa-tachometer-alt" aria-hidden="true"></i></span>
          <div>${abbreviateKm(car.kmDriven || 0)}</div>
        </div>
        <div class="detail-item">
          <span><i class="fas fa-user" aria-hidden="true"></i></span>
          <div>${formatOwnership(car.ownership || "1")}</div>
        </div>
        <div class="detail-item">
          <span><i class="fas fa-gas-pump" aria-hidden="true"></i></span>
          <div>${car.fuelType || "Petrol"}</div>
        </div>
        <div class="detail-item">
          <span><i class="fas fa-calendar-alt" aria-hidden="true"></i></span>
          <div>${formatAge(car.daysOld || 0)}</div>
        </div>
      </div>
      <div class="price-container">
        <div class="price">₹${(car.sellingPrice || 0).toLocaleString("en-IN")}</div>
        <div>
          <button class="view-details-btn" data-translate="View Details" ${car.status !== "Available" ? "disabled" : ""}>View Details</button>
        </div>
      </div>
    </div>
  `;

  return carCard;
}

function fetchFeaturedCars() {
  fetch(`${API_BASE_URL}/api/cars?limit=10`)
    .then((response) => response.json())
    .then((payload) => displayFeaturedCars(payload))
    .catch((error) => {
      console.error("Error fetching featured Cars:", error);
      showFeaturedCarsError();
    });
}

function displayFeaturedCars(Cars) {
  const CarSlider = document.querySelector(".Car-slider");
  CarSlider.innerHTML = "";

  // Normalize response: accept direct array or API response object
  let items = [];
  if (Array.isArray(Cars)) {
    items = Cars;
  } else if (Cars && Array.isArray(Cars.data)) {
    items = Cars.data;
  } else if (Cars && Cars.success && Array.isArray(Cars.data?.data)) {
    items = Cars.data.data;
  }

  if (!items || items.length === 0) {
    CarSlider.innerHTML = `
      <div class="no-Cars" style="width: 100%; text-align: center; padding: 40px;">
        <i class="fas fa-motorcycle" style="font-size: 3rem; color: #ccc;"></i>
        <p style="margin-top: 15px; color: #666;">No featured Cars available at the moment</p>
      </div>
    `;
    return;
  }

  items.forEach((Car) => {
    // Ensure photos normalized so createCarCard can render sliders
    Car.photos = normalizePhotos(Car.photos || Car.photos || Car.images || []);

    const card = createCarCard(Car);
    CarSlider.appendChild(card);

    // Wire up view details button to inventory page anchor
    try {
      const viewBtn = card.querySelector('.view-details-btn');
      if (viewBtn && !viewBtn.disabled) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            const q = encodeURIComponent(JSON.stringify(Car));
            window.location.href = `vehicledetail.html?car=${q}`;
          } catch (err) {
            // fallback to inventory anchor if encoding fails
            window.location.href = `https://www.alfamotorworld.com/inventory.html#${Car._id || ''}`;
          }
        });
      }
      // Make the whole card clickable (but preserve button and slider behavior)
      try {
        card.tabIndex = 0; // make focusable for keyboard users
        card.setAttribute('role', 'link');

        function goToDetailsFromCard(e) {
          if (e && e.stopPropagation) e.stopPropagation();
          try {
            const CarData = JSON.parse(card.dataset.CarData || "{}");
            const q = encodeURIComponent(JSON.stringify(CarData));
            window.location.href = `vehicledetail.html?car=${q}`;
          } catch (err) {
            console.error('Failed to open details', err);
          }
        }

        card.addEventListener('click', (e) => {
          const target = e.target;
          // allow image clicks to navigate — but ignore clicks on explicit controls
          if (
            !target ||
            target.closest('.contact-btn') ||
            target.closest('.view-details-btn') ||
            target.closest('.slider-prev') ||
            target.closest('.slider-next') ||
            target.closest('.dot')
          )
            return;
          goToDetailsFromCard(e);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToDetailsFromCard(e);
          }
        });
      } catch (e) {}
    } catch (e) {}
  });
  // Notify slider that cards have been rendered so it can compute widths
  const event = new Event("featuredCarsRendered");
  CarSlider.dispatchEvent(event);
}

function showFeaturedCarsError() {
  const CarSlider = document.querySelector(".Car-slider");
  CarSlider.innerHTML = `
    <div class="error-message" style="width: 100%; text-align: center; padding: 40px;">
      <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b00;"></i>
      <p style="margin-top: 15px; color: #666;">Failed to load featured Cars. Please try again later.</p>
      <button onclick="fetchFeaturedCars()" style="margin-top: 10px; padding: 8px 15px; background: #ff6b00; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Retry
      </button>
    </div>
  `;
}

function formatOwnership(owner) {
  if (owner === "1") return "1st Own";
  if (owner === "2") return "2nd Own";
  if (owner === "3") return "3rd Own";
  return owner;
}

// Translation Functionality
const translations = {
  en: {
    "Alfa Motors World | Premium Pre-Owned Motorcycles in India":
      "Alfa Motors World | Premium Pre-Owned Motorcycles in India",
    Home: "Home",
    "Vehicles for Sale": "Vehicles for Sale",
    "Sell Your Vehicle": "Sell Your Vehicle",
    "About Us": "About Us",
    Financing: "Financing",
    "Happy Customers": "Happy Customers",
    Contact: "Contact",
    "Explore Vehicles": "Explore Vehicles",
    "Sell Your Car": "Sell Your Car",
    "Get the Quote": "Get the Quote",
    "View Details": "View Details",
    "Choose your preferred language": "Choose your preferred language",
    "Ride Into Freedom with the Car You've Always Wanted":
      "Ride Into Freedom with the Car You've Always Wanted",
    "Get Your": "Get Your",
    "Dream Car Today": "Dream Car Today",
    Car: "Car",
    "Buy Car": "Buy Car",
    "Best Cars": "Best Cars",
    "Sell Car": "Sell Car",
    "Car Service": "Car Service",
    "Price Calculator": "Price Calculator",
    "Cars Sold": "Cars Sold",
    "Cars Available": "Cars Available",
    "Happy Customers": "Happy Customers",
    "Years Experience": "Years Experience",
    "Our Services": "Our Services",
    "Get Your Car Evaluated": "Get Your Car Evaluated",
    "Prepare Your Car for Sale": "Prepare Your Car for Sale",
    "Market Your Car Effectively": "Market Your Car Effectively",
    "Negotiate the Best Price": "Negotiate the Best Price",
    "Best Second hand car in Bengaluru": "Best Second hand car in Bengaluru",
    "Find your perfect pre-owned Car from our certified collection with warranty.":
      "Find your perfect pre-owned Car from our certified collection with warranty.",
    Explore: "Explore",
    "Get the best price for your Car with our free valuation and quick payment.":
      "Get the best price for your Car with our free valuation and quick payment.",
    "Get Valuation": "Get Valuation",
    "Professional servicing and maintenance by certified technicians.":
      "Professional servicing and maintenance by certified technicians.",
    "Book Service": "Book Service",
    "Estimate your Car's value instantly based on model, year and condition.":
      "Estimate your Car's value instantly based on model, year and condition.",
    "Calculate Now": "Calculate Now",
    "Choose Your Style": "Choose Your Style",
    Hatchback: "Hatchback",
    "Compact, good for city driving": "Compact, good for city driving",
    "View Hatchbacks": "View Hatchbacks",
    Sedan: "Sedan",
    "Comfortable for families, longer body":
      "Comfortable for families, longer body",
    "View Sedans": "View Sedans",
    SUV: "SUV",
    "Spacious and powerful for all terrains":
      "Spacious and powerful for all terrains",
    "View SUVs": "View SUVs",
    Coupe: "Coupe",
    "Sporty 2-door car for stylish drives":
      "Sporty 2-door car for stylish drives",
    "View Coupes": "View Coupes",
    Convertible: "Convertible",
    "Roof can be folded, great for open-air drives":
      "Roof can be folded, great for open-air drives",
    "View Convertibles": "View Convertibles",
    MUV: "MUV",
    "Multi-purpose vehicle ideal for big families":
      "Multi-purpose vehicle ideal for big families",
    "View MUVs": "View MUVs",
    Luxury: "Luxury",
    "High-end premium segment vehicles": "High-end premium segment vehicles",
    "View Luxury Cars": "View Luxury Cars",
    "Featured Cars": "Featured Cars",
    "View All": "View All",
    "1st Owner": "1st Own",
    Petrol: "Petrol",
    "6 months old": "6 months old",
    "2 months old": "2 months old",
    "View Details": "View Details",
    "EMI: ₹8,999/month": "EMI: ₹8,999/month",
    "Other Brands": "Other Brands",
    "Ather Energy": "Ather Energy",
    Bajaj: "Bajaj",
    BMW: "BMW",
    "Harley-Davidson": "Harley-Davidson",
    Hero: "Hero",
    Honda: "Honda",
    Jawa: "Jawa",
    Kawasaki: "Kawasaki",
    KTM: "KTM",
    "Mahindra Two Wheelers": "Mahindra Two Wheelers",
    "Royal Enfield": "Royal Enfield",
    Suzuki: "Suzuki",
    "TVS Motor": "TVS Motor",
    Yamaha: "Yamaha",
    "HOW TO BUY YOUR Dream Car": "HOW TO BUY YOUR Dream Car",
    "At Alfa Motors World, we make buying your perfect Car simple and transparent. Our certified pre-owned Cars come with a comprehensive inspection report and warranty for complete peace of mind.":
      "At Alfa Motors World, we make buying your perfect Car simple and transparent. Our certified pre-owned Cars come with a comprehensive inspection report and warranty for complete peace of mind.",
    "BROWSE INVENTORY": "BROWSE INVENTORY",
    "BOOK TEST RIDE": "BOOK TEST RIDE",
    "GET TO KNOW YOUR RIDE": "GET TO KNOW YOUR RIDE",
    "PAY & BOOK ONLINE OR VISIT SHOWROOM":
      "PAY & BOOK ONLINE OR VISIT SHOWROOM",
    "COMPLETE PURCHASE": "COMPLETE PURCHASE",
    "HOW TO SELL YOUR USED Car": "HOW TO SELL YOUR USED Car",
    "At Alfa Motors World, we provide the quickest and most hassle-free Car selling service. Getting a great deal on your Car can be tricky, which is why we value your Car based on its condition and current market value.":
      "At Alfa Motors World, we provide the quickest and most hassle-free Car selling service. Getting a great deal on your Car can be tricky, which is why we value your Car based on its condition and current market value.",
    "INSTANT VALUATION": "INSTANT VALUATION",
    "BOOK INSPECTION": "BOOK INSPECTION",
    "SELL YOUR Car": "SELL YOUR Car",
    "What Our Riders Say": "What Our Riders Say",
    "Mumbai, Maharashtra": "Mumbai, Maharashtra",
    "Bangalore, Karnataka": "Bangalore, Karnataka",
    "Delhi, NCR": "Delhi, NCR",
    "Purchased: 3 months ago": "Purchased: 3 months ago",
    "Verified Owner": "Verified Owner",
    "Purchased: 6 months ago": "Purchased: 6 months ago",
    "Sold: 1 month ago": "Sold: 1 month ago",
    "Verified Seller": "Verified Seller",
    "The buying process was completely transparent. I got a certified KTM Duke 390 at 15% below market price. The 150-point inspection report gave me complete confidence in my purchase.":
      "The buying process was completely transparent. I got a certified KTM Duke 390 at 15% below market price. The 150-point inspection report gave me complete confidence in my purchase.",
    "Excellent customer service and the Car quality is outstanding. The warranty coverage gave me peace of mind. Worth every rupee I spent!":
      "Excellent customer service and the Car quality is outstanding. The warranty coverage gave me peace of mind. Worth every rupee I spent!",
    "I sold my old Car through them and got ₹15,000 more than other dealers offered. The process was smooth and payment was instant. Highly recommended!":
      "I sold my old Car through them and got ₹15,000 more than other dealers offered. The process was smooth and payment was instant. Highly recommended!",
    "The best second-hand car showroom in Bangalore for luxury and premium cars.":
      "The best second-hand car showroom in Bangalore for luxury and premium cars.",
    "Quick Links": "Quick Links",
    "Contact Us": "Contact Us",
    "All rights reserved.": "All rights reserved.",
    "Designed By Pixelate Nest": "Designed By Pixelate Nest",
  },
  ka: {
    "Alfa Motors World | Premium Pre-Owned Motorcycles in India":
      "ಅಲ್ಫಾ ಮೊಟರ್ಸ್ ವರ್ಲ್ಡ್ | ಭಾರತದಲ್ಲಿ ಪ್ರೀಮಿಯಂ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರುಗಳು",
    Home: "ಮನೆ",
    "Vehicles for Sale": "ವಾಹನಗಳು ಮಾರಾಟಕ್ಕೆ",
    "Sell Your Vehicle": "ನಿಮ್ಮ ವಾಹನ ಮಾರಾಟ ಮಾಡಿ",
    "About Us": "ನಮ್ಮ ಬಗ್ಗೆ",
    Financing: "ಫೈನಾನ್ಸಿಂಗ್",
    "Happy Customers": "ಸಂತೋಷದ ಗ್ರಾಹಕರು",
    Contact: "ಸಂಪರ್ಕಿಸಿ",
    "Explore Vehicles": "ವಾಹನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    "Get the Quote": "ಕೋಟ್ ಪಡೆಯಿರಿ",
    "View Details": "ವಿವರ ನೋಡಿ",
    "Contact Seller": "ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    Available: "ಲಭ್ಯವಿದೆ",
    "Sold Out": "ಮಾರಾಟವಾಗಿದೆ",
    "Coming Soon": "ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತದೆ",
    "Choose your preferred language": "ನಿಮಗೆ ಇಷ್ಟವಾದ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    "Best Second hand car in Bengaluru":
      "ಬೆಂಗಳೂರುದಲ್ಲಿ ಉತ್ತಮ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರುಗಳು",
    "Ride Into Freedom with the Vehicle You've Always Wanted":
      "ನೀವು ಯಾವಾಗಲೂ ಬಯಸುವ ವಾಹನದೊಂದಿಗೆ ಸ್ವಾತಂತ್ರ್ಯದತ್ತ ಸವಾರಿ ಮಾಡಿ",
    "Get Your": "ನಿಮ್ಮ",
    "Dream Car Today": "ಕನಸಿನ ಕಾರ್ ಇಂದು",
    Car: "ಕಾರ್",
    "Buy Cars": "ಕಾರ್‌ಗಳನ್ನು ಖರೀದಿಸಿ",
    "Sell Your Car": "ನಿಮ್ಮ ಕಾರ್ ಮಾರಾಟ ಮಾಡಿ",
    "Best Cars": "ಉತ್ತಮ ಕಾರ್‌ಗಳು",
    "Sell Car": "ಕಾರ್ ಮಾರಾಟ ಮಾಡಿ",
    "Car Service": "ಕಾರ್ ಸರ್ವೀಸ್",
    "Price Calculator": "ಬೆಲೆ ಲೆಕ್ಕಾಚಾರ",
    "Cars Sold": "ಮಾರಾಟವಾದ ಕಾರ್‌ಗಳು",
    "Cars Available": "ಲಭ್ಯವಿರುವ ಕಾರ್‌ಗಳು",
    "Happy Customers": "ಸಂತೋಷದ ಗ್ರಾಹಕರು",
    "Years Experience": "ಅನುಭವದ ವರ್ಷಗಳು",
    "Our Services": "ನಮ್ಮ ಸೇವೆಗಳು",
    "Find your perfect pre-owned Car from our certified collection with warranty.":
      "ವಾರೆಂಟಿ ಜೊತೆಗೆ ನಮ್ಮ ಪ್ರಮಾಣಿತ ಸಂಗ್ರಹದಿಂದ ನಿಮಗೆ ಸೂಕ್ತವಾದ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರ್ ಆಯ್ಕೆಮಾಡಿ.",
    Explore: "ಎಕ್ಸ್‌ಪ್ಲೋರ್ ಮಾಡಿ",
    "Get the best price for your Car with our free valuation and quick payment.":
      "ನಿಮ್ಮ ಕಾರ್‌ಗೆ ಉಚಿತ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ತಕ್ಷಣ ಪಾವತಿಯೊಂದಿಗೆ ಉತ್ತಮ ಬೆಲೆ ಪಡೆಯಿರಿ.",
    "Get Valuation": "ಮೌಲ್ಯಮಾಪನ ಪಡೆಯಿರಿ",
    "Professional servicing and maintenance by certified technicians.":
      "ಪ್ರಮಾಣಿತ ತಾಂತ್ರಿಕರಿಂದ ಪ್ರೊಫೆಷನಲ್ ಸರ್ವೀಸ್ ಮತ್ತು ಮೆಂಟನನ್ಸ್.",
    "Book Service": "ಸರ್ವೀಸ್ ಬುಕ್ ಮಾಡಿ",
    "Estimate your Car's value instantly based on model, year and condition.":
      "ಮಾಡೆಲ್, ವರ್ಷ ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ಆಧರಿಸಿ ನಿಮ್ಮ ಕಾರ್ ಮೌಲ್ಯವನ್ನು ತಕ್ಷಣ ಲೆಕ್ಕ ಹಾಕಿ.",
    "Get Your Car Evaluated": "ನಿಮ್ಮ ಕಾರ್ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿಸಿ",
    "Prepare Your Car for Sale": "ನಿಮ್ಮ ಕಾರ್ ಮಾರಾಟಕ್ಕೆ ತಯಾರಿಸಿ",
    "Market Your Car Effectively":
      "ನಿಮ್ಮ ಕಾರ್ ಅನ್ನು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ಮಾರುಕಟ್ಟೆ ಮಾಡಿ",
    "Negotiate the Best Price": "ಉತ್ತಮ ಬೆಲೆಗೆ ಒಪ್ಪಂದ ಮಾಡಿ",
    "Calculate Now": "ಈಗ ಲೆಕ್ಕ ಹಾಕಿ",
    "Choose Your Style": "ನಿಮ್ಮ ಸ್ಟೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    Hatchback: "ಹ್ಯಾಚ್‌ಬ್ಯಾಕ್",
    "Compact, good for city driving": "ಸಿಟಿ ಓಟಕ್ಕೆ ಸೂಕ್ತವಾದ ಚಿಕ್ಕ ಕಾರು",
    "View Hatchbacks": "ಹ್ಯಾಚ್‌ಬ್ಯಾಕ್‌ಗಳು ನೋಡಿ",
    Sedan: "ಸೆಡಾನ್",
    "Comfortable for families, longer body": "ಕೂಟುಂಭದವರಿಗೆ ಕಂಫರ್ಟಾಬಲ್ ಕಾರು",
    "View Sedans": "ಸೆಡಾನ್‌ಗಳು ನೋಡಿ",
    SUV: "ಎಸ್ಯೂವಿ",
    "Spacious and powerful for all terrains":
      "ಡ್ರೈವಿಂಗ್‌ಗೆ ಪವರ್ ಜಾಸ್ತಿ, ಜಾಗವೂ ಹೆಚ್ಚಿರುತ್ತೆ",
    "View SUVs": "ಎಸ್ಯೂವಿಗಳು ನೋಡಿ",
    Coupe: "ಕೂಪ್",
    "Sporty 2-door car for stylish drives":
      "2-ಡೋರ್ ಸ್ಪೋರ್ಟಿ ಕಾರು, ಸ್ಟೈಲ್ ಕಷ್ಟಪಡುವವರಿಗೆ",
    "View Coupes": "ಕೂಪ್‌ಗಳು ನೋಡಿ",
    Convertible: "ಕನ್ವರ್ಟಿಬಲ್",
    "Roof can be folded, great for open-air drives":
      "ರೂಫ್ ಫೋಲ್ಡ್ ಆಗುತ್ತೆ, ಓಪನ್ ಏರ್ ಡ್ರೈವ್‌ಗೆ ಚಂದ",
    "View Convertibles": "ಕನ್ವರ್ಟಿಬಲ್‌ಗಳು ನೋಡಿ",
    MUV: "ಎಂಯುವಿ",
    "Multi-purpose vehicle ideal for big families":
      "ಹೆಚ್ಚು ಜನ ಇದ್ದ ಮನೆಗಳಿಗೆ ಸೂಕ್ತ ಕಾರು",
    "View MUVs": "ಎಂಯುವಿಗಳು ನೋಡಿ",
    Luxury: "ಲಕ್ಸುರಿ ಕಾರು",
    "High-end premium segment vehicles": "ಪ್ರೀಮಿಯಂ ಕ್ಲಾಸ್‌ನ ಲಕ್ಸುರಿ ಕಾರುಗಳು",
    "View Luxury Cars": "ಲಕ್ಸುರಿ ಕಾರುಗಳು ನೋಡಿ",
    Electric: "ಎಲೆಕ್ಟ್ರಿಕ್ ಕಾರು",
    "Eco-friendly and battery powered": "ಪರಿಸರ ಸ್ನೇಹಿ ಬ್ಯಾಟರಿ ಕಾರು",
    "View Electric Cars": "ಎಲೆಕ್ಟ್ರಿಕ್ ಕಾರುಗಳು ನೋಡಿ",
    "Featured Cars": "ಫೀಚರ್ಡ್ ಕಾರ್‌ಗಳು",
    "View All": "ಎಲ್ಲಾ ನೋಡಿ",
    "1st Owner": "ಮೊದಲ ಮಾಲೀಕ",
    Petrol: "ಪೆಟ್ರೋಲ್",
    "6 months old": "6 ತಿಂಗಳು ಹಳೆಯದು",
    "2 months old": "2 ತಿಂಗಳು ಹಳೆಯದು",
    "View Details": "ವಿವರ ನೋಡಿ",
    "EMI: ₹8,999/month": "EMI: ₹8,999/ತಿಂಗಳು",
    "Other Brands": "ಇತರೆ ಬ್ರಾಂಡ್‌ಗಳು",
    "Ather Energy": "ಅಥರ್ ಎನರ್ಜಿ",
    Bajaj: "ಬಜಾಜ್",
    BMW: "ಬಿಎಂಡಬ್ಲ್ಯು",
    "Harley-Davidson": "ಹಾರ್ಲಿ-ಡೇವಿಡ್‌ಸನ್",
    Hero: "ಹೀರೋ",
    Honda: "ಹೋಂಡಾ",
    Jawa: "ಜಾವಾ",
    Kawasaki: "ಕವಾಸಾಕಿ",
    KTM: "ಕೆಟಿಎಂ",
    "Mahindra Two Wheelers": "ಮಹೀಂದ್ರಾ ಟು ವೀಲರ್ಸ್",
    "Royal Enfield": "ರಾಯಲ್ ಎನ್‌ಫೀಲ್ಡ್",
    Suzuki: "ಸುಜುಕಿ",
    "TVS Motor": "ಟಿವಿಎಸ್",
    Yamaha: "ಯಮಹಾ",
    "HOW TO BUY YOUR Dream Car": "ನಿಮ್ಮ ಕನಸಿನ ಕಾರ್ ಹೇಗೆ ಖರೀದಿಸಬಹುದು",
    "At Alfa Motors World, we make buying your perfect Car simple and transparent. Our certified pre-owned Cars come with a comprehensive inspection report and warranty for complete peace of mind.":
      "ಅಲ್ಫಾ ಮೊಟರ್ಸ್ ವರ್ಲ್ಡ್‌ನಲ್ಲಿ ನಾವು ಕಾರ್ ಖರೀದಿಯನ್ನು ಸುಲಭ ಮತ್ತು ಸ್ಪಷ್ಟವಾಗಿಸುತ್ತೇವೆ. ನಮ್ಮ ಪ್ರಮಾಣಿತ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರ್‌ಗಳಿಗೆ ಸಂಪೂರ್ಣ ಇನ್ಸ್‌ಪೆಕ್ಷನ್ ರಿಪೋರ್ಟ್ ಮತ್ತು ವಾರೆಂಟಿ ಇರುತ್ತದೆ.",
    "BROWSE INVENTORY": "ಇನ್‌ವೆಂಟರಿ ನೋಡಿ",
    "BOOK TEST RIDE": "ಟೆಸ್ಟ್ ರೈಡ್ ಬುಕ್ ಮಾಡಿ",
    "GET TO KNOW YOUR RIDE": "ನಿಮ್ಮ ಕಾರ್‌ ಬಗ್ಗೆ ತಿಳಿದುಕೊಳ್ಳಿ",
    "PAY & BOOK ONLINE OR VISIT SHOWROOM":
      "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪೇ ಮಾಡಿ ಮತ್ತು ಬುಕ್ ಮಾಡಿ ಅಥವಾ ಶೋರೂಮ್‌ಗೆ ಬನ್ನಿ",
    "COMPLETE PURCHASE": "ಪರ್ಚೇಸ್ ಪೂರ್ಣಗೊಳಿಸಿ",
    "HOW TO SELL YOUR USED Car":
      "ನಿಮ್ಮ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರ್ ಹೇಗೆ ಮಾರಾಟ ಮಾಡಬಹುದು",
    "At Alfa Motors World, we provide the quickest and most hassle-free Car selling service. Getting a great deal on your Car can be tricky, which is why we value your Car based on its condition and current market value.":
      "ಅಲ್ಫಾ ಮೊಟರ್ಸ್ ವರ್ಲ್ಡ್‌ನಲ್ಲಿ, ನಾವು ತಕ್ಷಣ ಪಾವತಿ ಮತ್ತು ಟೆನ್ಷನ್ ಇಲ್ಲದ ಮಾರಾಟ ಸೇವೆ ಕೊಡುತ್ತೇವೆ. ನಿಮ್ಮ ಕಾರ್ ಸ್ಥಿತಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯದ ಆಧಾರದಲ್ಲಿ ಸರಿಯಾದ ದರ ನೀಡಲಾಗುತ್ತದೆ.",
    "INSTANT VALUATION": "ತಕ್ಷಣದ ಮೌಲ್ಯಮಾಪನ",
    "BOOK INSPECTION": "ಇನ್ಸ್‌ಪೆಕ್ಷನ್ ಬುಕ್ ಮಾಡಿ",
    "SELL YOUR Car": "ನಿಮ್ಮ ಕಾರ್ ಮಾರಾಟ ಮಾಡಿ",
    "What Our Riders Say": "ನಮ್ಮ ರೈಡರ್‌ಗಳು ಏನು ಹೇಳ್ತಾರೆ",
    "Mumbai, Maharashtra": "ಮುಂಬೈ, ಮಹಾರಾಷ್ಟ್ರ",
    "Bangalore, Karnataka": "ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ",
    "Delhi, NCR": "ಡೆಲ್ಲಿ, NCR",
    "Purchased: 3 months ago": "ಖರೀದಿ: 3 ತಿಂಗಳು ಹಿಂದಿನದು",
    "Verified Owner": "ಪ್ರಮಾಣಿತ ಮಾಲೀಕ",
    "Purchased: 6 months ago": "ಖರೀದಿ: 6 ತಿಂಗಳು ಹಿಂದಿನದು",
    "Sold: 1 month ago": "ಮಾರಾಟ: 1 ತಿಂಗಳು ಹಿಂದಿನದು",
    "Verified Seller": "ಪ್ರಮಾಣಿತ ಮಾರಾಟಗಾರ",
    "The buying process was completely transparent. I got a certified KTM Duke 390 at 15% below market price. The 150-point inspection report gave me complete confidence in my purchase.":
      "ಖರೀದಿ ಪ್ರಕ್ರಿಯೆ ತುಂಬಾ ಕ್ಲೀರ್ ಆಗಿತ್ತು. ನಾನು ಕೆಟಿಎಂ ಡ್ಯೂಕ್ 390 ಅನ್ನು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗೆ 15% ಕಡಿಮೆ ದರದಲ್ಲಿ ಪಡೆಯ್ದೆ. 150 ಪಾಯಿಂಟ್ ಇನ್ಸ್‌ಪೆಕ್ಷನ್ ರಿಪೋರ್ಟ್ ನನಗೆ ಭರವಸೆ ಕೊಟ್ಟಿತು.",
    "Excellent customer service and the Car quality is outstanding. The warranty coverage gave me peace of mind. Worth every rupee I spent!":
      "ಗ್ರಾಹಕ ಸೇವೆ ತುಮ್ಮ ಚೆನ್ನಾಗಿದೆ ಮತ್ತು ಕಾರ್‌ನ ಗುಣಮಟ್ಟ ಕೂಡಾ ಎಕ್ಸ್‌ಲೆಂಟ್. ವಾರೆಂಟಿ ಒಳಗೊಂಡಿರೋದು ನನಗೆ ಶಾಂತಿ ಕೊಟ್ಟಿತು. ನಾನು ಹಾಕಿದ ಹಣ ಸಾರ್ಥಕವಾಯ್ತು!",
    "I sold my old Car through them and got ₹15,000 more than other dealers offered. The process was smooth and payment was instant. Highly recommended!":
      "ನಾನು ನನ್ನ ಹಳೆಯ ಕಾರ್‌ ಇವರು ಮೂಲಕ ಮಾರಾಟ ಮಾಡ್ದೆ. ಬೇರೆ ಡೀಲರ್‌ಗಿಂತ ₹15,000 ಹೆಚ್ಚಾಗಿ ದೊರಕಿತು. ಪ್ರಕ್ರಿಯೆ ಸ್ಮೂತ್ ಆಗಿತ್ತು ಮತ್ತು ಪಾವತಿ ತಕ್ಷಣ. ಖಂಡಿತಾ ಶಿಫಾರಸು ಮಾಡ್ತೀನಿ!",
    "The best second-hand car showroom in Bangalore for luxury and premium cars.":
      "ಬೆಂಗಳೂರುದಲ್ಲಿ ಐಷಾರಾಮಿ ಮತ್ತು ಪ್ರೀಮಿಯಂ ಕಾರುಗಳ ಉತ್ತಮ ಎರಡನೇ ಕೈ ಶೋರೂಮ್.",
    "Quick Links": "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
    "Contact Us": "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    "All rights reserved.": "ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    "Designed By Pixelate Nest": "ಡಿಸೈನ್ ಮಾಡಿದ್ದು ಪಿಕ್ಸಲೇಟ್ ನೆಸ್ಟ್",
  },
};

function translatePage(language) {
  if (language === "ka") {
    document.body.classList.add("kannada-font");
  } else {
    document.body.classList.remove("kannada-font");
  }

  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  const mobileMenu = document.querySelector(".mobile-menu");
  if (mobileMenu) {
    const mobileElements = mobileMenu.querySelectorAll("[data-translate]");
    mobileElements.forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (translations[language] && translations[language][key]) {
        element.textContent = translations[language][key];
      }
    });
  }

  const CarCards = document.querySelectorAll(".Car-card");
  if (language === "hi") {
    CarCards.forEach((card) => {
      const CarName = card.querySelector("h3");
      if (CarName) {
        switch (CarName.textContent.trim()) {
          case "KTM Duke 390":
            CarName.textContent = "केटीएम ड्यूक 390";
            break;
          case "Suzuki Hayabusa":
            CarName.textContent = "सुजुकी हयाबुसा";
            break;
          case "Royal Enfield GT 650":
            CarName.textContent = "रॉयल एनफील्ड जीटी 650";
            break;
        }
      }
    });
  } else {
    CarCards.forEach((card) => {
      const CarName = card.querySelector("h3");
      if (CarName) {
        switch (CarName.textContent.trim()) {
          case "केटीएम ड्यूक 390":
            CarName.textContent = "KTM Duke 390";
            break;
          case "सुजुकी हयाबुसा":
            CarName.textContent = "Suzuki Hayabusa";
            break;
          case "रॉयल एनफील्ड जीटी 650":
            CarName.textContent = "Royal Enfield GT 650";
            break;
        }
      }
    });
  }

  const emiElements = document.querySelectorAll(".emi");
  emiElements.forEach((element) => {
    if (language === "hi") {
      element.textContent = element.textContent.replace("EMI:", "ईएमआई:");
    } else {
      element.textContent = element.textContent.replace("ईएमआई:", "EMI:");
    }
  });

  const brandCards = document.querySelectorAll(".make-card h3");
  brandCards.forEach((brand) => {
    const key = brand.textContent.trim();
    if (translations[language] && translations[language][key]) {
      brand.textContent = translations[language][key];
    }
  });
  try {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const nodesToUpdate = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue && node.nodeValue.trim();
      if (text && translations[language] && translations[language][text]) {
        nodesToUpdate.push({ node, key: text });
      }
    }
    nodesToUpdate.forEach(({ node, key }) => {
      node.nodeValue = node.nodeValue.replace(key, translations[language][key]);
    });
  } catch (e) {
    // ignore any unexpected walker issues
  }

  document.getElementById("languagePopup").style.display = "none";
  localStorage.setItem("preferredLanguage", language);
}

function initializeTranslation() {
  const languageButtons = document.querySelectorAll(".language-btn");
  languageButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // prevent any parent handlers or overlays from swallowing clicks
      e.stopPropagation();
      e.preventDefault();
      const lang = this.getAttribute("data-lang");
      translatePage(lang);
    });
  });

  // Close modal when clicking outside the popup content
  const languagePopup = document.getElementById("languagePopup");
  if (languagePopup) {
    languagePopup.addEventListener("click", function (e) {
      if (e.target === languagePopup) {
        languagePopup.style.display = "none";
      }
    });
  }

  const updateMobileMenu = () => {
    const mobileMenu = document.querySelector(".mobile-menu");
    if (mobileMenu) {
      const links = mobileMenu.querySelectorAll("a");
      links[0].setAttribute("data-translate", "Home");
      links[1].setAttribute("data-translate", "Vehicles for Sale");
      links[2].setAttribute("data-translate", "Sell Your Vehicle");
      links[3].setAttribute("data-translate", "About Us");
      links[5].setAttribute("data-translate", "Contact");

      const button = mobileMenu.querySelector(".login-btn button");
      if (button) button.setAttribute("data-translate", "Get the Quote");
    }
  };

  updateMobileMenu();
  setTimeout(updateMobileMenu, 500);
}

// Google Analytics
function initializeGoogleAnalytics() {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-N2NFEWQNVB");
}

// Initialize all functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeStickyNavbar();
  initializeSearchFeatures();
  initializeHeroSlider();
  initializeMobileMenu();
  initializeLazyLoading();
  initializeStatsObserver();
  initializeCarSlider();
  initializeTranslation();

  // Load Google Analytics script
  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-N2NFEWQNVB";
  document.head.appendChild(gaScript);

  initializeGoogleAnalytics();
});
// styles-carousel.js

function initializeStylesCarousel() {
  const styleContainer = document.querySelector(".styles-container");
  const containerWrapper = document.querySelector(".styles-container-wrapper");
  if (!styleContainer) return;

  // Prevent double initialization
  if (styleContainer.dataset.carouselInitialized) return;
  styleContainer.dataset.carouselInitialized = "true";

  // Helper to wait for images to load (resolve quickly if already loaded)
  function waitForImages(root) {
    const imgs = Array.from(root.querySelectorAll("img"));
    const promises = imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) =>
        img.addEventListener("load", res, { once: true })
      );
    });
    return Promise.all(promises);
  }

  // Clone content once for seamless loop
  const originalChildren = Array.from(styleContainer.children);
  if (originalChildren.length === 0) return;
  // Avoid duplicating multiple times
  if (styleContainer.children.length === originalChildren.length) {
    originalChildren.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      styleContainer.appendChild(clone);
    });
  }

  let keyframeStyleEl = document.getElementById("styles-carousel-keyframes");
  if (!keyframeStyleEl) {
    keyframeStyleEl = document.createElement("style");
    keyframeStyleEl.id = "styles-carousel-keyframes";
    document.head.appendChild(keyframeStyleEl);
  }

  let animationName = "styles-scroll";
  let animSpeed = 70; // px per second, tuneable

  function setupAnimation() {
    // Ensure layout has settled and images loaded
    waitForImages(styleContainer).then(() => {
      // Small timeout to allow any late layout
      setTimeout(() => {
        styleContainer.style.transition = "none";

        // Calculate the width of the original set of children (not including clones)
        const computedGap =
          parseFloat(getComputedStyle(styleContainer).gap) || 0;
        const origCount = originalChildren.length;
        let originalWidth = 0;
        for (let i = 0; i < origCount; i++) {
          const el = originalChildren[i];
          originalWidth += Math.round(el.getBoundingClientRect().width);
        }
        if (origCount > 1)
          originalWidth += Math.round(computedGap * (origCount - 1));

        const scrollDistance = Math.max(0, Math.round(originalWidth));
        if (scrollDistance <= 0) return;

        // duration in seconds -> distance(px) / speed(px per second)
        const duration = Math.max(6, Math.round(scrollDistance / animSpeed));

        // Create keyframes with exact pixel translation for smoothness
        keyframeStyleEl.textContent = `@keyframes ${animationName} { from { transform: translateX(0); } to { transform: translateX(-${scrollDistance}px); } }`;

        // Apply animation
        styleContainer.style.willChange = "transform";
        styleContainer.style.animation = `${animationName} ${duration}s linear infinite`;
        styleContainer.style.animationPlayState = "running";
      }, 80);
    });
  }

  // Pause on hover
  styleContainer.addEventListener("mouseenter", () => {
    styleContainer.style.animationPlayState = "paused";
  });
  styleContainer.addEventListener("mouseleave", () => {
    styleContainer.style.animationPlayState = "running";
  });

  // Recalculate on resize (debounced)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupAnimation();
    }, 150);
  });

  // Kick off
  setupAnimation();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeStylesCarousel);
