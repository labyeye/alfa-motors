// main.js

// Sticky Navbar Functionality
function initializeStickyNavbar() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Enhanced Search with Auto-complete
function initializeSearchFeatures() {
  const searchInput = document.getElementById('searchInput');
  const suggestions = [
    'BMW X5', 'Audi A4', 'Mercedes C-Class', 'Toyota Corolla', 'Honda Civic',
    'BMW 3 Series', 'Audi Q5', 'Mercedes E-Class', 'Toyota Camry', 'Honda Accord',
    'SUV', 'Sedan', 'Hatchback', 'Luxury Cars', 'Electric Cars'
  ];
  
  if (searchInput) {
    // Create suggestions dropdown
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    searchInput.parentNode.appendChild(suggestionsContainer);
    
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase();
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(value)
      );
      
      if (value && filtered.length > 0) {
        suggestionsContainer.innerHTML = filtered
          .slice(0, 5)
          .map(suggestion => `<div class="suggestion-item">${suggestion}</div>`)
          .join('');
        suggestionsContainer.style.display = 'block';
      } else {
        suggestionsContainer.style.display = 'none';
      }
    });
    
    // Handle suggestion clicks
    suggestionsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-item')) {
        searchInput.value = e.target.textContent;
        suggestionsContainer.style.display = 'none';
      }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
      }
    });
  }
}

// Hero Slider Functionality
function initializeHeroSlider() {
  const heroSlider = document.createElement("div");
  heroSlider.className = "hero-slider";

  const slides = [
    "https://c4.wallpaperflare.com/wallpaper/309/686/573/red-aston-martin-sports-car-wallpaper-preview.jpg",
    "https://spn-sta.spinny.com/blog/20240110142245/hyundai-Creta-facelift-2024-1160x653.webp?compress=true&quality=80&w=1200&dpr=2.6",
    "https://stimg.cardekho.com/images/carexteriorimages/930x620/Tata/Curvv/9578/1723033064164/front-left-side-47.jpg?impolicy=resize&imwidth=420",
    "https://www.shutterstock.com/image-photo/close-rear-old-black-car-600nw-723619777.jpg",
  ];

  slides.forEach((slide, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.className = `hero-slide ${index === 0 ? "active" : ""}`;
    slideDiv.style.backgroundImage = `url(${slide})`;
    heroSlider.appendChild(slideDiv);
  });

  // Place the hero slider into the DOM. Older markup used a
  // `.background-image` element which may have been removed —
  // guard against that to avoid throwing an error and stopping
  // script execution (which previously prevented the language
  // modal buttons from receiving their click handlers).
  const backgroundImageDiv = document.querySelector(".background-image");
  const heroSection = document.querySelector('.hero-section');
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
        <a href="index.html" class="active" aria-current="page">
          <i class="fas fa-home"></i> 
          <span data-translate="Home">Home</span>
        </a>
      </li>
      <li>
        <a href="inventory.html">
          <i class="fas fa-motorcycle"></i> 
          <span data-translate="Buy Car">Buy Car</span>
        </a>
      </li>
      <li>
        <a href="sell.html">
          <i class="fas fa-dollar-sign"></i>
          <span data-translate="Sell Your Car">Sell Your Car</span>
        </a>
      </li>
      <li>
        <a href="about.html">
          <i class="fas fa-info-circle"></i>
          <span data-translate="About Us">About Us</span>
        </a>
      </li>
      <li>
        <a href="#" class="updates-link">
          <i class="fas fa-bell"></i> 
          <span data-translate="Updates">Updates</span>
        </a>
      </li>
      <li>
        <a href="contact.html">
          <i class="fas fa-envelope"></i>
          <span data-translate="Contact">Contact</span>
        </a>
      </li>
    </ul>
    <div class="login-btn">
      <a href="/getquote.html">
        <button aria-label="Get a quote for your Car" data-translate="Get the Quote">
          Get the Quote
        </button>
      </a>
    </div>
  `;

  document.body.appendChild(mobileMenu);

  toggleBtn.addEventListener("click", function () {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  mobileMenu
    .querySelector(".close-btn")
    .addEventListener("click", function () {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    });
}

// Lazy Loading Images
function initializeLazyLoading() {
  if ("IntersectionObserver" in window) {
    const lazyImages = [].slice.call(
      document.querySelectorAll("img.lazy")
    );

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

function fetchFeaturedCars() {
  fetch("http://localhost:2500/api/Cars?limit=10")
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
    const CarCard = document.createElement("div");
    CarCard.className = "Car-card";

    let statusClass = "status-available";
    let statusText = "Available";
    let isDisabled = false;

    if (Car.status === "Sold Out") {
      statusClass = "status-sold";
      statusText = "Sold Out";
      isDisabled = true;
    } else if (Car.status === "Coming Soon") {
      statusClass = "status-coming-soon";
      statusText = "Coming Soon";
      isDisabled = true;
    }

    // Use car.photos[0] if available, normalize like inventory.html
    let imgSrc = "https://via.placeholder.com/300x200?text=No+Image";
    if (Array.isArray(Car.photos) && Car.photos.length > 0) {
      let filename = Car.photos[0];
      if (filename.startsWith("carimages/")) filename = filename.replace("carimages/", "");
      if (filename.startsWith("assets/")) {
        imgSrc = filename;
      } else {
        imgSrc = `http://localhost:2500/carimages/${filename}`;
      }
    } else if (Car.imageUrl) {
      imgSrc = Car.imageUrl;
    }

    CarCard.innerHTML = `
      <div class="image-container">
        <img src="${imgSrc}" 
            alt="${Car.make} ${Car.model}" 
            onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      <div class="card-content">
        <h3>${Car.make} ${Car.model}</h3>
        <span class="model">${Car.modelYear} Model</span>
        <div class="details">
          <div class="detail-item">
            <i class="fas fa-tachometer-alt"></i>
            <span>${(Car.kmDriven || 0).toLocaleString()} km</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-user"></i>
            <span title="${formatOwnership(Car.ownership || "1")}">${formatOwnership(Car.ownership || "1")}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-gas-pump"></i>
            <span>${Car.fuelType || "Petrol"}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>${Car.year || "N/A"}</span>
          </div>
        </div>
        <div class="price-container">
          <div class="price">₹${(Car.sellingPrice || 0).toLocaleString()}</div>
          <div class="emi">Down: ₹${(
            Car.downPayment || 0
          ).toLocaleString()} | EMI: ₹${Math.round(
      ((Car.sellingPrice || 0) - (Car.downPayment || 0)) / 36
    ).toLocaleString()}/month</div>
          <button class="view-details-btn" ${isDisabled ? "disabled" : ""}>
            ${isDisabled ? Car.status : "View Details"}
          </button>
        </div>
      </div>
    `;
    CarSlider.appendChild(CarCard);
    if (!isDisabled) {
      CarCard.querySelector(".view-details-btn").addEventListener(
        "click",
        () => {
          window.location.href = `inventory.html#${Car._id || ""}`;
        }
      );
    }
  });
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
  if (owner === "1") return "1st Owner";
  if (owner === "2") return "2nd Owner";
  if (owner === "3") return "3+ Owner";
  return owner;
}

// Translation Functionality
const translations = {
  en: {
    "Alfa Motors World | Premium Pre-Owned Motorcycles in India":
      "Alfa Motors World | Premium Pre-Owned Motorcycles in India",
    Home: "Home",
    Updates: "Updates",
    "Buy Car": "Buy Car",
    "Sell Your Car": "Sell Your Car",
    "About Us": "About Us",
    Contact: "Contact",
    "Get the Quote": "Get the Quote",
    "Choose your preferred language": "Choose your preferred language",
    "Ride Into Freedom with the Car You've Always Wanted":
      "Ride Into Freedom with the Car You've Always Wanted",
    "Get Your": "Get Your",
    "Dream Car": "Dream Car",
    Car: "Car",
    "Best Cars": "Best Cars",
    "Sell Car": "Sell Car",
    "Car Service": "Car Service",
    "Price Calculator": "Price Calculator",
    "Cars Sold": "Cars Sold",
    "Cars Available": "Cars Available",
    "Happy Customers": "Happy Customers",
    "Years Experience": "Years Experience",
    "Our Services": "Our Services",
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
    "High-end premium segment vehicles":
      "High-end premium segment vehicles",
    "View Luxury Cars": "View Luxury Cars",
    "Featured Cars": "Featured Cars",
    "View All": "View All",
    "1st Owner": "1st Owner",
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
    "India's most trusted marketplace for premium pre-owned Cars since 2018.":
      "India's most trusted marketplace for premium pre-owned Cars since 2018.",
    "Quick Links": "Quick Links",
    "Contact Us": "Contact Us",
    "All rights reserved.": "All rights reserved.",
    "Designed By Pixelate Nest": "Designed By Pixelate Nest",
  },
  ka: {
    "Alfa Motors World | Premium Pre-Owned Motorcycles in India":
      "ಅಲ್ಫಾ ಮೊಟರ್ಸ್ ವರ್ಲ್ಡ್ | ಭಾರತದಲ್ಲಿ ಪ್ರೀಮಿಯಂ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರುಗಳು",
    Home: "ಮನೆ",
    Updates: "ನವೀಕರಣಗಳು",
    "Buy Car": "ಕಾರ್ ಖರೀದಿ",
    "Sell Your Car": "ನಿಮ್ಮ ಕಾರ್ ಮಾರಾಟ ಮಾಡಿ",
    "About Us": "ನಮ್ಮ ಬಗ್ಗೆ",
    Contact: "ಸಂಪರ್ಕಿಸಿ",
    "Get the Quote": "ಕೋಟ್ ಪಡೆಯಿರಿ",
    "Choose your preferred language": "ನಿಮಗೆ ಇಷ್ಟವಾದ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    "Ride Into Freedom with the Car You've Always Wanted":
      "ನೀವು ಯಾವಾಗಲೂ ಬಯಸುವ ಕಾರಿನೊಂದಿಗೆ ಸ್ವಾತಂತ್ರ್ಯದತ್ತ ಸವಾರಿ ಮಾಡಿ",
    "Get Your": "ನಿಮ್ಮ",
    "Dream Car": "ಕನಸಿನ ಕಾರ್",
    Car: "ಕಾರ್",
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
    "Calculate Now": "ಈಗ ಲೆಕ್ಕ ಹಾಕಿ",
    "Choose Your Style": "ನಿಮ್ಮ ಸ್ಟೈಲ್ ಆಯ್ಕೆಮಾಡಿ",
    Hatchback: "ಹ್ಯಾಚ್‌ಬ್ಯಾಕ್",
    "Compact, good for city driving": "ಸಿಟಿ ಓಟಕ್ಕೆ ಸೂಕ್ತವಾದ ಚಿಕ್ಕ ಕಾರು",
    "View Hatchbacks": "ಹ್ಯಾಚ್‌ಬ್ಯಾಕ್‌ಗಳು ನೋಡಿ",
    Sedan: "ಸೆಡಾನ್",
    "Comfortable for families, longer body":
      "ಕೂಟುಂಭದವರಿಗೆ ಕಂಫರ್ಟಾಬಲ್ ಕಾರು",
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
    "High-end premium segment vehicles":
      "ಪ್ರೀಮಿಯಂ ಕ್ಲಾಸ್‌ನ ಲಕ್ಸುರಿ ಕಾರುಗಳು",
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
    "India's most trusted marketplace for premium pre-owned Cars since 2018.":
      "2018 ರಿಂದ ಭಾರತದ ಅತ್ಯಂತ ನಂಬಿಕೆ ಇರುವ ಪ್ರೀಮಿಯಂ ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಕಾರ್ ಮಾರ್ಕೆಟ್‌ಪ್ಲೇಸ್.",
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
  const languagePopup = document.getElementById('languagePopup');
  if (languagePopup) {
    languagePopup.addEventListener('click', function (e) {
      if (e.target === languagePopup) {
        languagePopup.style.display = 'none';
      }
    });
  }

  const updateMobileMenu = () => {
    const mobileMenu = document.querySelector(".mobile-menu");
    if (mobileMenu) {
      const links = mobileMenu.querySelectorAll("a");
      links[0].setAttribute("data-translate", "Home");
      links[1].setAttribute("data-translate", "Buy Car");
      links[2].setAttribute("data-translate", "Sell Your Car");
      links[3].setAttribute("data-translate", "About Us");
      links[4].setAttribute("data-translate", "Updates");
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
  gtag("config", "G-ETL311CBE6");
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
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-ETL311CBE6";
  document.head.appendChild(gaScript);
  
  initializeGoogleAnalytics();
});
// styles-carousel.js

function initializeStylesCarousel() {
  const styleContainer = document.querySelector('.styles-container');
  const styleCards = document.querySelectorAll('.style-card');
  
  // Only proceed if the elements exist on the page
  if (!styleContainer || styleCards.length === 0) return;

  const prevBtn = document.querySelector('.style-nav.prev');
  const nextBtn = document.querySelector('.style-nav.next');
  const cardWidth = styleCards[0].offsetWidth + 15; // width + gap
  let currentPosition = 0;
  let autoSlideInterval;
  const visibleCards = Math.min(7, Math.floor(window.innerWidth / cardWidth));
  const containerWidth = visibleCards * cardWidth;
  
  // Set container width
  const containerWrapper = document.querySelector('.styles-container-wrapper');
  if (containerWrapper) {
    containerWrapper.style.maxWidth = `${containerWidth}px`;
  }
  
  // Clone cards for infinite loop
  styleContainer.innerHTML += styleContainer.innerHTML;
  
  // Manual navigation
  function navigate(direction) {
    clearInterval(autoSlideInterval);
    currentPosition += direction * cardWidth * visibleCards;
    
    // Smooth transition
    styleContainer.style.transition = 'transform 0.5s ease-in-out';
    styleContainer.style.transform = `translateX(${currentPosition}px)`;
    
    // Reset position for infinite loop
    setTimeout(() => {
      if (direction === 1 && currentPosition >= styleContainer.scrollWidth / 2) {
        currentPosition = 0;
        styleContainer.style.transition = 'none';
        styleContainer.style.transform = `translateX(${currentPosition}px)`;
      }
      if (direction === -1 && currentPosition <= -styleContainer.scrollWidth / 2) {
        currentPosition = 0;
        styleContainer.style.transition = 'none';
        styleContainer.style.transform = `translateX(${currentPosition}px)`;
      }
      startAutoSlide();
    }, 500);
  }
  
  // Auto slide function
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      currentPosition -= cardWidth;
      styleContainer.style.transition = 'transform 0.5s ease-in-out';
      styleContainer.style.transform = `translateX(${currentPosition}px)`;
      
      // Reset position for infinite loop
      if (Math.abs(currentPosition) >= styleContainer.scrollWidth / 2) {
        setTimeout(() => {
          currentPosition = 0;
          styleContainer.style.transition = 'none';
          styleContainer.style.transform = `translateX(${currentPosition}px)`;
        }, 500);
      }
    }, 1000);
  }
  
  // Event listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => navigate(-1));
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => navigate(1));
  }
  
  // Pause on hover
  styleContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
  styleContainer.addEventListener('mouseleave', startAutoSlide);
  
  // Start auto slide
  startAutoSlide();
  
  // Responsive adjustments
  window.addEventListener('resize', function() {
    const newVisibleCards = Math.min(7, Math.floor(window.innerWidth / cardWidth));
    const newContainerWidth = newVisibleCards * cardWidth;
    if (containerWrapper) {
      containerWrapper.style.maxWidth = `${newContainerWidth}px`;
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeStylesCarousel);