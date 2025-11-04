/* i18n.js - small runtime helper to persist and apply preferred language across pages
   Usage: include this script on any page (before page-specific translation helpers)
   It will attempt to call window.translatePage(preferred) if that function exists.
*/
(function () {
  function getPreferred() {
    return localStorage.getItem('preferredLanguage');
  }

  function setPreferred(lang) {
    try {
      if (lang) localStorage.setItem('preferredLanguage', lang);
      if (typeof window.translatePage === 'function') window.translatePage(lang || getPreferred());
    } catch (e) {}
  }

  function applyPreferred() {
    try {
      const pref = getPreferred();
      if (!pref) return;

      // Prefer site-wide translatePage if available (index.js provides richer translations)
      if (typeof window.translatePage === 'function') {
        window.translatePage(pref);
        return;
      }

      // Fallback: use small built-in translations map to translate [data-translate] elements
      if (translations && translations[pref]) {
        applyLocalTranslations(pref);
      }
    } catch (e) {}
  }

  // Small built-in translations for lightweight pages (only critical keys)
  const translations = {
    ka: {
      // Navigation / common
      "Home": "ಮುಖ್ಯ ಪುಟ",
      "Vehicles for Sale": "ಮಾರಾಟಕ್ಕೆ ವಾಹನಗಳು",
  "Categories": "ವರ್ಗಗಳು",
      "Buy Car": "ಗಾಡಿ ಕೊಳ್ಳಿರಿ",
      "Sell Your Vehicle": "ನಿಮ್ಮ ವಾಹನ ಮಾರಾಟ ಮಾಡಿ",
      "Sell Your Car": "ನಿಮ್ಮ ಕಾರು ಮಾರಾಟ ಮಾಡಿ",
      "Happy Customers": "ಸಂತೋಷದ ಗ್ರಾಹಕರು",
      "About Us": "ನಮ್ಮ ಬಗ್ಗೆ",
      "Contact": "ಸಂಪರ್ಕಿಸಿ",
      "Financing": "ಫೈನಾನ್ಸಿಂಗ್",

      // Buttons / CTAs
      "Get the Quote": "ಕೊಟ್ ಪಡೆಯಿರಿ",
      "Get Started Now": "ಈಗ ಪ್ರಾರಂಭಿಸಿ",
      "Explore Vehicles": "ವಾಹನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      "View All": "ಎಲ್ಲಾವನ್ನು ವೀಕ್ಷಿಸಿ",
      "Explore": "ಅನ್ವೇಷಿಸಿ",
      "Get Valuation": "ಮೌಲ್ಯಮಾಪನ ಪಡೆಯಿರಿ",
      "Book Service": "ಸೇವೆಗೆ ಬುಕ್ ಮಾಡಿ",
      "Calculate Now": "ಈಗ ಗಣನೆ ಮಾಡಿ",

      // Hero / marketing
      "Find Your": "ನಿಮ್ಮನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ",
      "Dream Car Today": "ಇಂದು ನಿಮ್ಮ ಕನಸಿನ ಕಾರು",
      "Premium Pre-Owned Vehicles with Complete Transparency": "ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆಯೊಂದಿಗೆ ಪ್ರೀಮಿಯಂ ಪೂರ್ವ-ಮಾಲೀಕ ವಾಹನಗಳು",

      // Sections / cards
      "Best Cars": "ಉತ್ತಮ ಕಾರುಗಳು",
      "Choose Your Style": "ನಿಮ್ಮ ಶೈಲಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
      "Hatchback": "ಹ್ಯಾಚ್ಬ್ಯಾಕ್",
      "Sedan": "ಸಿಡನ್",
      "SUV": "ಎಸ್ಯುವಿ",
      "Coupe": "ಕೋಪೆ",
      "Convertible": "ಕನ್ವರ್ಟಿಬಲ್",
      "MUV": "ಎಂಯುವಿ",
      "Luxury": "ಐಶ್ವರ್ಯ",
  // style descriptions
  "Compact, good for city driving": "ಸಣ್ಣದು, ನಗರ ಚಾಲನೆಗೆ ಉತ್ತಮ",
  "Comfortable for families, longer body": "ಕുടുംബಗಳಿಗೆ ಅನುಕೂಲಕರ, ದೀರ್ಘ ದೇಹ",
  "Spacious and powerful for all terrains": "ಎಲ್ಲಾ ಭೂಗೋಳಗಳಿಗೆ ಪ್ರಸಾರಶೀಲ ಮತ್ತು ಶಕ್ತಿಶಾಲಿ",
  "Sporty 2-door car for stylish drives": "ಶೈಲಿಯ conducir ಗೆ ಸ್ಪೋರ್ಟಿ 2-ಡೋರ್ ಕಾರು",
  "Roof can be folded, great for open-air drives": "ಛಾವಣಿಯನ್ನು ಮಡಚಬಹುದು, ತೆರೆದ ಪ್ರೇರಿತ ಚಾಲನೆಗಳಿಗೆ ಉತ್ತಮ",
  "Multi-Utility Vehicle, ideal for families/groups": "ಬಹು-ಉಪಯೋಗಿ ವಾಹನ, ಕುಟುಂಬ/ಗುಂಪುಗಳಿಗೆ ಬಲವಾದವರು",
  "High-end premium segment vehicles": "ಉನ್ನತ- ಮಟ್ಟದ ಪ್ರೀಮಿಯಂ ವಿಭಾಗದ ವಾಹನಗಳು",
      "View Hatchback": "ಹ್ಯಾಚ್ಬ್ಯಾಕ್ ವೀಕ್ಷಿಸಿ",
      "View Sedan": "ಸಿಡನ್ ವೀಕ್ಷಿಸಿ",
      "View SUV": "ಎಸ್ಯುವಿ ವೀಕ್ಷಿಸಿ",
      "View Coupe": "ಕೋಪೆ ವೀಕ್ಷಿಸಿ",
      "View Convertible": "ಕನ್ವರ್ಟಿಬಲ್ ವೀಕ್ಷಿಸಿ",
      "View MUV Cars": "ಎಂಯುವಿ ಕಾರುಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      "View Luxury": "ಐಶ್ವರ್ಯ ವೀಕ್ಷಿಸಿ",

      // Services and features
      "Our Services": "ನಮ್ಮ ಸೇವೆಗಳು",
      "Sell Car": "ಕಾರನ್ನು ಮಾರಾಟ ಮಾಡಿ",
      "Car Service": "ಕಾರ್ ಸೇವೆ",
      "Price Calculator": "ಬೆಲೆ ಗಣಕ",
      "How to Buy Your Dream Car": "ನಿಮ್ಮ ಕನಸಿನ ಕಾರನ್ನು ಹೇಗೆ ಖರೀದಿಸುವುದು",
  // service descriptions
  "Find your perfect pre-owned Car from our certified collection with warranty.": "ನಮ್ಮ ಪ್ರಮಾಣಿತ ಸಂಗ್ರಹದಿಂದ ವಾರಂಟಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಪರಮ ಪೂರ್ವ-ಮಾಲೀಕ ಕಾರನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ.",
  "Get the best price for your Car with our free valuation and quick payment.": "ನಮ್ಮ ಉಚಿತ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು_quick ಪಾವತಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಕಾರಿಗೆ ಉತ್ತಮ ಬೆಲೆಯನ್ನು ಪಡೆಯಿರಿ.",
  "Professional servicing and maintenance by certified technicians.": "ಪ್ರಮಾಣಿತ ತಂತ್ರಜ್ಞರಿಂದ ವೃತ್ತಿಪರ ಸೇವೆ ಮತ್ತು ನಿರ್ವಹಣೆ.",
  "Estimate your Car's value instantly based on model, year and condition.": "ಮಾಡೆಲ್, ವರ್ಷ ಮತ್ತು ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ ತಕ್ಷಣ ನಿಮ್ಮ ಕಾರಿನ ಮೌಲ್ಯವನ್ನು ಅಂದಾಜು ಮಾಡಿ.",

  // Filters / inventory
      "Filters": "ಫಿಲ್ಟರ್",
      "All Cars": "ಎಲ್ಲಾ ಕಾರುಗಳು",
      "Price": "ಬೆಲೆ",
      "Brand": "ಬ್ರ್ಯಾಂಡ್",
      "Year": "ವರ್ಷ",
      "KM Driven": "ಕಿಮೀ ಚಾಲಿತ",
      "Ownership": "ಮಾಲಿಕತ್ವ",
      "Fuel Type": "ಇಂಧನ ಪ್ರಕಾರ",
      "Sort: Default": "ಪದ排列: ಡಿಫಾಲ್ಟ್",
      "Default": "ಡಿಫಾಲ್ಟ್",
      "Price: Low to High": "ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚಿನದಕ್ಕೆ",
      "Price: High to Low": "ಬೆಲೆ: ಹೆಚ್ಚುದಿಂದ ಕಡಿಮೆಗೆ",
      "Year: Newest First": "ವರ್ಷ: ಹೊಸದರಿಂದ ಮೊದಲು",
      "Year: Oldest First": "ವರ್ಷ: ಹಳೆಯದರಿಂದ ಮೊದಲು",

  // Process / how-to text
  "At Alfa Motors World, we make buying your perfect Car simple and transparent. Our certified pre-owned Cars come with a comprehensive inspection report and warranty for complete peace of mind.": "Alfa Motors World ನಲ್ಲಿ, ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಕಾರನ್ನು ಖರೀದಿಸುವುದನ್ನು ನಾವು ಸರಳ ಮತ್ತು ಪಾರದರ್ಶಕಗೊಳಿಸುತ್ತೇವೆ. ನಮ್ಮ ಪ್ರಮಾಣಿತ ಪೂರ್ವ-ಮಾಲೀಕ ಕಾರುಗಳಿಗೆ ಸಂಪೂರ್ಣ ಪರಿಶೀಲನಾ ವರದಿ ಮತ್ತು ವಾರಂಟಿಯು ಬರುತ್ತದೆ.",
  "Search our certified inventory and filter by brand, year, price and more to find the perfect Car.": "ನಮ್ಮ ಪ್ರಮಾಣಿತ ಇನ್‌ವೆಂಟರಿಯನ್ನು ಹುಡುಕಿ ಮತ್ತು ಪರಿಪೂರ್ಣ ಕಾರು ಕಂಡುಹಿಡಿಯಲು ಬ್ರ್ಯಾಂಡ್, ವರ್ಷ, ಬೆಲೆ ಮತ್ತು ಇತರ ತಾಣಗಳಿಂದ ಫಿಲ್ಟರ್ ಮಾಡಿ.",
  "Check vehicle history, inspection report and ask questions to the seller before buying.": "ವಾಹನದ ಇತಿಹಾಸ, ಪರಿಶೀಲನಾ ವರದಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಖರೀದಿಸುವ ಮೊದಲು ಮಾರಾಟಗಾರನಿಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
  "Reserve the Car online or visit our showroom for a test drive and final checks.": "ಉಪಕರಣವನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಮೀಸಲಿಡಿ ಅಥವಾ ಟೆಸ್ಟ್ ಡ್ರೈವ್ ಮತ್ತು ಅಂತಿಮ ಪರಿಶೀಲನೆಗಾಗಿ ನಮ್ಮ ಶೋರೂಮನ್ನು ಭೇಟಿ ಮಾಡಿ.",
  "Complete paperwork, transfer ownership, and take delivery with peace of mind and warranty.": "ಪೇಪರ್‌ವರ್ಕ್ ಪೂರ್ಣಗೊಳಿಸಿ, ಮಾಲಿಕತ್ವವನ್ನು ವರ್ಗಾಯಿಸಿ ಮತ್ತು ವಾರ್‍ಂಟಿಯೊಂದಿಗೆ ಮನಸ್ಸಿನ ಶಾಂತಿಯಿಂದ ವಿತರಣೆಯನ್ನು ಸ್ವೀಕರಿಸಿ.",

  // Sell-process long form
  "At Alfa Motors World, we provide the quickest and most hassle-free Car selling service. Getting a great deal on your Car can be tricky, which is why we value your Car based on its condition and current market value.": "Alfa Motors World ನಲ್ಲಿ, ನಾವು ಅತ್ಯಂತ ವೇಗವಾದ ಮತ್ತು ತೊಂದರೆ ರಹಿತ ಕಾರ್ ಮಾರಾಟ ಸೇವೆಯನ್ನು ಒದಗಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಕಾರಿನ ಮೇಲೆ ಅತ್ಯುತ್ತಮ ಒಪ್ಪಂದವನ್ನು ಪಡೆದುವುದು ಕಠಿಣವಾಗಬಹುದು, ಆದ್ದರಿಂದ ನಾವು ನಿಮ್ಮ ಕಾರನ್ನು ಅದರ ಸ್ಥಿತಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ ಆಧಾರದಲ್ಲಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತೇವೆ.",
  "Schedule a professional evaluation to accurately assess your car's condition and market value.": "ನಿಮ್ಮ ಕಾರಿನ ಸ್ಥಿತಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯವನ್ನು ನಿಖರವಾಗಿ ಅಂದಾಜು ಮಾಡಲು ವೃತ್ತಿಪರ ಮೌಲ್ಯಮಾಪನವನ್ನು ನಿಯೋಜಿಸಿ.",
  "Clean and detail your car thoroughly, addressing any minor repairs or cosmetic": "ಏತಾದರೂ ಸಣ್ಣ ದುರಸ್ತಿ ಅಥವಾ ಹೊರಗಿನ ಸೌಂದರ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಸರಿ ಮಾಡುವುದು ಮತ್ತು ನಿಮ್ಮ ಕಾರನ್ನು ಪೂರ್ಣವಾಗಿ ಶುಚಿಗೊಳಿಸಿ.",
  "Take high-quality photos and write a detailed, honest description highlighting": "ಹೆಚ್ಚು ಗುಣಮಟ್ಟದ ಫೋಟೊಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ವಿವರವಾದ, ನೈಜ ವಿವರಣೆಯನ್ನು ಬರೆಯಿರಿ.",
  "Be prepared to negotiate with potential buyers and answer their questions promptly.": "ಸಂಭಾವ್ಯ ಖರೀದಿದಾರರೊಂದಿಗೆ ಚರ್ಚೆ ನಡೆಸಲು ಸಜ್ಜಾಗಿರಿ ಮತ್ತು ಅವರ ಪ್ರಶ್ನೆಗಳಿಗೆ ತ್ವರಿತವಾಗಿ ಉತ್ತರ ನೀಡಿ.",

      // Cards / actions
      "View Details": "ವಿವರಗಳನ್ನು ನೋಡಿ",
      "Contact Seller": "ಮಾರಾಟಗಾರನನ್ನು ಸಂಪರ್ಕಿಸಿ",
      "Get Instant Valuation": "ತಕ್ಷಣ ಮೌಲ್ಯಮಾಪನ ಪಡೆಯಿರಿ",

      // Sell page / form labels
      "Sell Your Car in 3 Easy Steps": "ಮೂರು ಸುಲಭ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಕಾರನ್ನು ಮಾರಾಟ ಮಾಡಿ",
      "We make selling your Car simple, fast, and transparent. Get an instant quote and complete the process in just a few clicks.": "ನಾವು ನಿಮ್ಮ ಕಾರ್ ಮಾರಾಟವನ್ನು ಸರಳ, ವೇಗವಾಗಿ ಮತ್ತು ಪಾರದರ್ಶಕವಾಗಿಸುವೆವು. ತಕ್ಷಣದ ಕೊಟ್ ಪಡೆಯಿರಿ ಮತ್ತು ಕೆಲವು ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣಗೊಳಿಸಿ.",
      "Enter Your Car Details": "ನಿಮ್ಮ ಕಾರಿನ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
      "Fill out the form with your Car's specifications and condition.": "ನಿಮ್ಮ ಕಾರಿನ ವೈಶಿಷ್ಟ್ಯಗಳು ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ಫಾರ್ಮ್‌ನಲ್ಲಿ ಭರ್ತಿ ಮಾಡಿ.",
      "Schedule Pickup & Get Paid": "ಪಿಕಪ್ ಅನ್ನು ಶೆಡ್ಯೂಲ್ ಮಾಡಿ ಮತ್ತು ಪಾವತಿ ಪಡೆಯಿರಿ",
      "We handle all the paperwork and payment on the spot.": "ನಾವು ಎಲ್ಲಾ ಕಾಗದಪತ್ರಗಳನ್ನು ಮತ್ತು ಪಾವತಿಯನ್ನು ತಕ್ಷಣ ನಿರ್ವಹಿಸುತ್ತೇವೆ.",
      "Car Details": "ಕಾರಿನ ವಿವರಗಳು",
      "Brand*": "ಬ್ರ್ಯಾಂಡ್*",
      "Model*": "ಮಾದರಿ*",
      "Year*": "ವರ್ಷ*",
      "Expected Price (₹)*": "ಎಚ್ಚರಿಸುವ ಬೆಲೆ (₹)*",
      "Upload Images (Max 5)*": "ಚಿತ್ರಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ (ಗರಿಷ್ಠ 5)*",
      "Click to upload images": "ಚಿತ್ರಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
      "Your Contact Information": "ನಿಮ್ಮ ಸಂಪರ್ಕ ಮಾಹಿತಿ",
      "Full Name*": "ಹೆಸರು ಸಂಪೂರ್ಣ*",
      "Email": "ಇಮೇಲ್",
      "Phone Number*": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ*",
      "I agree to the terms and conditions and privacy policy*": "ನಾನು ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ನಿಯಮಾವಳಿಯನ್ನು ಒಪ್ಪುತ್ತೇನೆ*",

      // Footer / misc
      "The best second-hand car showroom in Bangalore for luxury and premium cars.": "ಬೆಂಗಳೂರುದಲ್ಲಿ ಐಷಾರಾಮಿ ಮತ್ತು ಪ್ರೀಮಿಯಂ ಕಾರುಗಳ ಉತ್ತಮ ಎರಡನೇ ಕೈ ಶೋರೂಮ್.",
      "All rights reserved.": "ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.",
      "What Our Riders Say": "ನಮ್ಮ ಸವಾರಿ ತಿಳಿಸುವವರು ಏನು ಹೇಳುತ್ತಾರೆ",
      "BROWSE INVENTORY": "ಇನ್‌ವೆಂಟರಿ ಬ್ರೌಸ್ ಮಾಡಿ",
      "GET TO KNOW YOUR RIDE": "ನಿಮ್ಮ ಸವಾರಿ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ",

      // small helpers
      "Updates": "ಅಪ್‌ಡೇಟ್ಸ್",
  "Close": "ಮುಚ್ಚಿ",
    "Popular Brands": "ಜನಪ್ರಿಯ ಬ್ರ್ಯಾಂಡ್‌ಗಳು",
    "&copy; 2023 Alfa Motors World. All rights reserved.": "© 2023 ಅಲ್ಫಾ ಮೋಟಾರ್ಸ್ ವರ್ಲ್ಡ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.",
      "Cars Sold": "ವಿಕ್ರಯವಾದ ಕಾರುಗಳು",
      "Cars Available": "ಲಭ್ಯವಿರುವ ಕಾರುಗಳು",
      "Years Experience": "ಅಭಿವೃದ್ಧಿಯ ವರ್ಷಗಳು",
  // Contact page specific
  "Our Contact Channels": "ನಮ್ಮ ಸಂಪರ್ಕ ಚಾನಲ್‌ಗಳು",
  "Choose your preferred way to connect with us": "ನಮ್ಮ ಜೊತೆಗೆ ಸಂಪರ್ಕಿಸುವ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಮಾರ್ಗವನ್ನು ಆರಿಸಿ",
  "Visit Us": "ನೀರನ್ನು ಭೇಟಿಕೊಡಿ",
  "View on Map": "ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ",
  "Call Us": "ನಮ್ಮನ್ನು ಕರೆ ಮಾಡಿ",
  "Call Now": "ಇದೀಗ ಕರೆ ಮಾಡಿ",
  "Message Now": "ಈಗ ಸಂದೇಶ ಕಳುಹಿಸಿ",
  "WhatsApp": "ವಾಟ್‌ಸಾಪ್",
  "Chat with us instantly": "ತಕ್ಷಣ ನಮ್ಮೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
  "Business Hours": "ಕಾರ್ಯ ಸಮಯ",
  "Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 4:00 PM": "ಸೋಮವಾರ - ಶನಿವಾರ: ಬೆಳಿಗ್ಗೆ 9:00 - ಸಂಜೆ 8:00<br />ಭಾನುವಾರ: ಬೆಳಿಗ್ಗೆ 10:00 - ಮಧ್ಯಾಹ್ನ 4:00",
  "Current Status": "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
  "Open": "ತೆರೆದಿದೆ",
  "Social Media": "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ",
  "Connect with us on social platforms": "ಸಾಮಾಜಿಕ ವೇದಿಕೆಗಳಲ್ಲಿ ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",
  "Buy Car :- +91 9825944897": "ಕಾರು ಖರೀದಿಸಲು :- +91 9825944897",
  "Buy Car :- +91 9036818492": "ಕಾರು ಖರೀದಿಸಲು :- +91 9036818492",
  "No 97, 2, Bannerghatta Rd, opposite to D-Mart, Bohra Layout, Gottigere, Bengaluru, Karnataka 560083": "ನೋ 97, 2, ಬ್ಯಾನರ್‌ಘಟ್ಟ ರಸ್ತೆ, ಡಿ-ಮಾರ್ಟ್ ಎದುರಿಗೆ, ಬೋಹ್ರಾ ಲೇಔಟ್, ಗೊತ್ತಿಗೇರೆ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560083",
      // About page
      "About Alfa Motors World": "ಅಲ್ಫಾ ಮೋಟಾರ್ಸ್ ವರ್ಲ್ಡ್ ಬಗ್ಗೆ",
      "Your trusted partner in finding the perfect pre-owned vehicle. With over 12 years of experience and 1500+ satisfied customers.": "ಪರಿಪೂರ್ಣ ಪ್ರಯೋಜನ ಪೂರ್ವ-ಮಾಲೀಕ ವಾಹನವನ್ನು ಕಂಡುಹಿಡಿಯಲು ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಜೊತೆಗೆ. 12 ವರ್ಷಗಳ ಅನುಭವ ಮತ್ತು 1500+ ಸಂತುಷ್ಟ ಗ್ರಾಹಕರೊಂದಿಗೆ.",
      "Browse Our Cars": "ನಮ್ಮ ಕಾರುಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
      "Our Journey": "ನಮ್ಮ ಪ್ರಯಾಣ",
      "From humble beginnings to trusted dealership": "ಸರಳ ಆರಂಭದಿಂದ ವಿಶ್ವಾಸಾರ್ಹ ಡೀಲرشಿಪ್ ಆಗಿ ಬೆಳೆಯುವ ತನಕ",
      "Humble Beginnings": "ಸರಳ ಆರಂಭ",
      "Started as a small Car repair shop in Muzaffarpur with just 2 employees": "ಮುಜಫರ್ಗರ್ಪುರ್‌ನಲ್ಲಿ ಕೇವಲ 2 ಉದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಣ್ಣ ಕಾರು ದುರಸ್ತಿ ಅಂಗಡಿಯಾಗಿ ಪ್ರಾರಂಭಿಸಲಾಯಿತು",
      "First Showroom": "ಮೊದಲ ಶೋರೂಮ್",
      "Opened our first dedicated showroom at Kanhauli Naka": "ಕನ್ಹೊಳಿ ನಕಾ ನಲ್ಲಿ ನಮ್ಮ ಮೊದಲ ಶೋರೂಮ್ ಉದ್ಘಾಟಿಸಲಾಯಿತು",
      "Launched our online platform and expanded to neighboring cities": "ನಮ್ಮ ಆನ್‌ಲೈನ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಿ ಸಮೀಪದ ನಗರಗಳಿಗೆ ವಿಸ್ತರಿಸಲಾಗಿದೆ",
      "Premium Collection": "ಪ್ರೀಮಿಯಂ ಸಂಗ್ರಹ",
      "Introduced our premium segment with high-end Cars": "ಹೈ-ಎಂಡ್ ಕಾರುಗಳೊಂದಿಗೆ ನಮ್ಮ ಪ್ರೀಮಿಯಂ ವಿಭಾಗವನ್ನು ಪರಿಚಯಿಸಿದೇವೆ",
      "New Facility": "ಹೊಸ ಸೌಲಭ್ಯ",
      "Moved to our new 10,000 sq ft facility with state-of-the-art service center": "ಅತ್ಯಾಧುನಿಕ ಸೇವಾ ಕೇಂದ್ರವಿರುವ 10,000 ಚದರಅಡಿ ಹೊಸ ಸೌಲಭ್ಯಕ್ಕೆ ಸ್ಥಳಾಂತರಗೊಂಡಿದೆ",
      "Our Core Values": "ನಮ್ಮ ಮುಖ್ಯ ಮೌಲ್ಯಗಳು",
      "The principles that guide everything we do": "ನಾವು ಮಾಡುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸವನ್ನು ಮಾರ್ಗದರ್ಶನ ಮಾಡುವ ತತ್ವಗಳು",
      "We believe in complete transparency and honesty in all our dealings. No hidden costs, no surprises.": "ನಮ್ಮ ಎಲ್ಲಾ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ ಮತ್ತು ನೈತಿಕತೆಯನ್ನು ನಾವು ನಂಬುತ್ತೇವೆ. ಗೂಪ್ತ ವೆಚ್ಚಗಳಿಲ್ಲ, ಅಚ್ಚರಿಗಳಿಲ್ಲ.",
      "Every car undergoes a 150-point inspection to ensure it meets our high standards before being listed.": "ಪ್ರತಿ ಕಾರು ನಮೂದಿಸmeden ಮೊದಲು ನಮ್ಮ ಉನ್ನತ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸುವಂತೆ 150-ದ್ದು ಪರೀಕ್ಷೆಯನ್ನು ಅನುಭವಿಸುತ್ತದೆ.",
      "We're car enthusiasts first, business people second. Our love for cars drives everything we do.": "ನಾವು ಮೊದಲು ಕಾರು սիրುಗಾರರು, ನಂತರ ವ್ಯಾಪಾರಸ್ಥರು. ಕಾರುಗಳಿಗೂ ನಮ್ಮ ಪ್ರೀತಿ ನಮ್ಮ ಎಲ್ಲಾ ಕೆಲಸಗಳನ್ನೇ ಪ್ರೇರೇಪಿಸುತ್ತದೆ.",
      "From first contact to after-sales, we provide exceptional service that keeps customers coming back.": "ಮೊದಲ ಸಂಪರ್ಕದಿಂದ ನಂತರದ ಮಾರಾಟದವರೆಗೆ, ನಾವು ವಿಶಿಷ್ಟ ಸೇವೆ ಒದಗಿಸುತ್ತೇವೆ ಇದರಿಂದ ಗ್ರಾಹಕರು ಮತ್ತೆ ಬರುತ್ತಾರೆ.",
      "Happy Clients": "ಸಂತೋಷದ ಗ್ರಾಹಕರು",

      // Contact page
      "Our Contact Channels": "ನಮ್ಮ ಸಂಪರ್ಕ ಚಾನಲ್‌ಗಳು",
      "Choose your preferred way to connect with us": "ನಮ್ಮ ಜೊತೆಗೆ ಸಂಪರ್ಕಿಸುವ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಮಾರ್ಗವನ್ನು ಆರಿಸಿ",
      "No 97, 2, Bannerghatta Rd, opposite to D-Mart, Bohra Layout, Gottigere, Bengaluru, Karnataka 560083": "ನೋ 97, 2, ಬ್ಯಾನರ್‌ಘಟ್ಟ ರಸ್ತೆ, ಡಿ-ಮಾರ್ಟ್ ಎದುರಿಗೆ, ಬೋಹ್ರಾ ಲೇಔಟ್, ಗೊತ್ತಿಗೇರೆ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ 560083",
      "View on Map": "ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ",
      "Buy Car :- +91 9825944897": "ಕಾರು ಖರೀದಿಸಲು :- +91 9825944897",
      "Chat with us instantly": "ತಕ್ಷಣ ನಮ್ಮೊಂದಿಗೆ ಚಾಟ್ ಮಾಡಿ",
      "Message Now": "ಈಗ ಸಂದೇಶ ಕಳುಹಿಸಿ",
      "Business Hours": "ವೈವಸಾಯ ಸಮಯ",
      "Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 4:00 PM": "ಸೋಮವಾರ - ಶನಿವಾರ: ಬೆಳಗ್ಗೆ 9:00 - ಸಂಜೆ 8:00<br />ಭಾನುವಾರ: ಬೆಳಗ್ಗೆ 10:00 - ಮಧ್ಯಾಹ್ನ 4:00",
      "Current Status": "ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ",
      "Social Media": "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ",
      "Connect with us on social platforms": "ಸಾಮಾಜಿಕ ವೇದಿಕೆಗಳಲ್ಲಿ ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",

      // Get Quote / Quote page
      "Get Your Perfect Car Quote": "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಕಾರ್ ಕೊಟ್ ಪಡೆಯಿರಿ",
      "Tell us what you're looking for and we'll match you with the best options in your budget. Our experts will contact you with personalized recommendations.": "ನೀವು ಏನು ಹುಡುಕುತ್ತೀರಿ ಎಂಬುದನ್ನು ನಮಗೆ ತಿಳಿಸಿ; ನಾವು ನಿಮ್ಮ ಬಜೆಟ್‌ಗೆ ಅನುಗುಣವಾದ ಉತ್ತಮ ಆಯ್ಕೆಯನ್ನು ಹೊಂದಿಸುವೆವು. ನಮ್ಮ ತಜ್ಞರು ವೈಯಕ್ತಿಕ ಶಿಫಾರಸುಗಳೊಂದಿಗೆ ನಿಮಗೆ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.",
      "Fill the Quote Form": "ಕೊಟ್ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ",
      "Provide details about the Car you're interested in and your budget.": "ನೀವು ಆಸಕ್ತರಾಗಿರುವ ಕಾರಿನ ವಿವರಗಳು ಮತ್ತು ನಿಮ್ಮ ಬಜೆಟ್ ಅನ್ನು ನೀಡಿ.",
      "Get Expert Recommendations": "ತಜ್ಞರ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
      "Our team will analyze your requirements and find the best matches.": "ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲಿದೆ.",
      "Receive Your Quote": "ನಿಮ್ಮ ಕೊಟ್ ಸ್ವೀಕರಿಸಿ",
      "We'll contact you with detailed options and pricing information.": "ವಿವರವಾದ ಆಯ್ಕೆಗಳು ಮತ್ತು ಬೆಲೆ ಮಾಹಿತಿಯೊಂದಿಗೆ ನಾವು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸೋಣ.",
      "Get Your Quote Now": "ಈಗ ನಿಮ್ಮ ಕೊಟ್ ಪಡೆಯಿರಿ",
      "Quote Request": "ಕೊಟ್ ವಿನಂತಿ",
      "Preferred Brand*": "ಆರ್ದ್ರವಾದ ಬ್ರ್ಯಾಂಡ್*",
      "Preferred Model": "ಆರ್ದ್ರವಾದ ಮಾದರಿ",
      "Preferred Year*": "ಆರ್ದ್ರವಾದ ವರ್ಷ*",
      "Price Budget (₹)*": "ಬೆಲೆ ಬಜೆಟ್ (₹)*",
      "Additional Requirements": "ಯಾವುದಾದರೂ ಹೆಚ್ಚುವರಿ ಅಗತ್ಯಗಳು",
      "Request Quote": "ಕೊಟ್ ವಿನಂತಿಸಿ",
      "What Our Customers Say": "ನಮ್ಮ ಗ್ರಾಹಕರು ಏನು ಹೇಳುತ್ತಾರೆ",
      "Designed By Pixelate Nest": "ಡಿಸೈನ್: Pixelate Nest",
      "© 2023 Alfa Motors World. All rights reserved.": "© 2023 ಅಲ್ಫಾ ಮೋಟಾರ್ಸ್ ವರ್ಲ್ಡ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.",
    },
  };

  function applyLocalTranslations(lang) {
    try {
      const map = translations[lang] || {};
      if (!map) return;
      document.querySelectorAll('[data-translate]').forEach((el) => {
        const key = el.getAttribute('data-translate');
        if (!key) return;
        if (map[key]) el.textContent = map[key];
      });
      // Add a class for fonts if required
      if (lang !== 'en') document.body.classList.add('hindi-font');
    } catch (e) {}
  }

  // Page-specific translation helper. This is used by the runtime to translate
  // pages that don't use data-translate attributes. It stores original text in
  // data attributes so English can be restored when switching back.
  try {
    window.translatePage = function (lang) {
      try {
        if (!lang) lang = getPreferred() || 'en';
        const page = (location.pathname || '').split('/').pop() || 'index.html';

        // Finance page translations
        if (page === 'finance.html') {
          // helper to set text and preserve original
          function setText(sel, txt) {
            const el = document.querySelector(sel);
            if (!el) return;
            if (!el.dataset.origText) el.dataset.origText = el.textContent;
            el.textContent = txt;
          }

          function setHTML(sel, html) {
            const el = document.querySelector(sel);
            if (!el) return;
            if (!el.dataset.origHtml) el.dataset.origHtml = el.innerHTML;
            el.innerHTML = html;
          }

          function setAlt(img, alt) {
            if (!img) return;
            if (!img.dataset.origAlt) img.dataset.origAlt = img.getAttribute('alt') || '';
            img.setAttribute('alt', alt);
          }

          if (lang === 'ka') {
            setText('.finance-hero h1', 'ಫೈನಾನ್ಸಿಂಗ್ ಸುಲಭವಾಗಿದೆ');
            setText('.finance-hero p', 'ನಾವು ವಿಶ್ವಾಸಾರ್ಹ ಬ್ಯಾಂಕುಗಳು ಮತ್ತು NBFCಗಳೊಂದಿಗೆ ಕೆಲಸಮಾಡಿ, ಬೆಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕದಲ್ಲಿ ಪೂರ್ವ-ಮಾಲೀಕ ಕಾರುಗಳಿಗಾಗಿ ವೇಗವಾದ ಅನುಮತಿ, ಸ್ಪರ್ಧಾತ್ಮಕ EMI ಮತ್ತು ಕನಿಷ್ಠ ದಾಖಲೆಕಾರ್ಯವನ್ನು ಒದಗಿಸುತ್ತೇವೆ.');
            setText('.process h2', 'ಫೈನಾನ್ಸಿಂಗ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ');

            // Steps - use DOM traversal because description divs don't have a class
            for (let i = 1; i <= 5; i++) {
              const stepSel = '.process .step:nth-of-type(' + i + ')';
              const stepEl = document.querySelector(stepSel);
              if (!stepEl) continue;
              const strong = stepEl.querySelector('strong');
              const desc = strong && strong.parentElement ? strong.parentElement.querySelector('div') : null;
              if (i === 1) {
                if (strong) { if (!strong.dataset.origText) strong.dataset.origText = strong.textContent; strong.textContent = 'ವಾಹನನ್ನು ಆರಿಸಿ'; }
                if (desc) { if (!desc.dataset.origText) desc.dataset.origText = desc.textContent; desc.textContent = 'ನಿಮ್ಮ ಇಚ್ಛಿತ ಪೂರ್ವ-ಮಾಲೀಕ ಕಾರನ್ನು ನಮ್ಮ ಇನ್‌ವೆಂಟರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ.'; }
              }
              if (i === 2) {
                if (strong) { if (!strong.dataset.origText) strong.dataset.origText = strong.textContent; strong.textContent = 'ಕೊಟ್ ಪಡೆಯಿರಿ'; }
                if (desc) { if (!desc.dataset.origText) desc.dataset.origText = desc.textContent; desc.textContent = 'ಕೊಟ್ ಟೂಲನ್ನು ಬಳಸಿ ಅಥವಾ ಇನ್ವಾಯ್ಸ್ ಮತ್ತು ಸಾಲದ ಅಂದಾಜಿಗಾಗಿ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.'; }
              }
              if (i === 3) {
                if (strong) { if (!strong.dataset.origText) strong.dataset.origText = strong.textContent; strong.textContent = 'ದಾಖಲೆಗಳನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ'; }
                if (desc) { if (!desc.dataset.origText) desc.dataset.origText = desc.textContent; desc.textContent = 'KYC, ಆದಾಯದ ಪ್ರಮಾಣ ಮತ್ತು ವಾಹನದ ದಾಖಲೆಗಳನ್ನು ಸಾಲದಾತರಿಗೆ ಸಲ್ಲಿಸಿ.'; }
              }
              if (i === 4) {
                if (strong) { if (!strong.dataset.origText) strong.dataset.origText = strong.textContent; strong.textContent = 'ಸಾಲ ಮಂಜೂರು'; }
                if (desc) { if (!desc.dataset.origText) desc.dataset.origText = desc.textContent; desc.textContent = 'ಸಾಮಾನ್ಯವಾಗಿ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ಪಾಲುದಾರ ಸಾಲದಾರರಿಂದ ತ್ವರಿತ ಕ್ರೆಡಿಟ್ ನಿರ್ಧಾರ.'; }
              }
              if (i === 5) {
                if (strong) { if (!strong.dataset.origText) strong.dataset.origText = strong.textContent; strong.textContent = 'ಡಿಸ್ಬರ್ಸಲ್ ಮತ್ತು ವಿತರಣೆ'; }
                if (desc) { if (!desc.dataset.origText) desc.dataset.origText = desc.textContent; desc.textContent = 'ಸಾಲವು ವಿತರಿಸಲ್ಪಟ್ಟಾಗ, ವಾಹನದ ವರ್ಗಾವಣೆ ಮಾಡಿ ಮತ್ತು ನಿಮಗೆ ವಿತರಿಸಲಾಗುತ್ತದೆ.'; }
              }
            }

            // partners alt texts (generate per-index Kannada labels)
            document.querySelectorAll('.partners .partner img').forEach(function (img, idx) {
              const alt = 'ಭಾಗೀದಾರ ' + (idx + 1) + ' ಲೋಗೋ';
              setAlt(img, alt);
            });

            // small CTA / note
            const note = document.querySelector('.process p');
            if (note) {
              if (!note.dataset.origText) note.dataset.origText = note.textContent;
              note.textContent = 'ವೈಯಕ್ತಿಕ EMI ಯೋಜನೆಗಳಿಗಾಗಿ, ನಮ್ಮ ಶೋರೂಮ್‌ಗೆ preferred ವಾಹನ ID ಅನ್ನು ತಂದುಕೊಳ್ಳಿ ಅಥವಾ ನಮ್ಮ ಫೈನಾನ್ಸ್ ಪಾಲುದಾರರಿಂದ ಕರೆ ವಿನಂತಿ ಮಾಡಿ.';
            }
          } else {
            // restore original English texts if stored (steps need traversal too)
            try {
              const hdr = document.querySelector('.finance-hero h1'); if (hdr && hdr.dataset && hdr.dataset.origText) hdr.textContent = hdr.dataset.origText;
              const p = document.querySelector('.finance-hero p'); if (p && p.dataset && p.dataset.origText) p.textContent = p.dataset.origText;
              const ph2 = document.querySelector('.process h2'); if (ph2 && ph2.dataset && ph2.dataset.origText) ph2.textContent = ph2.dataset.origText;
            } catch (e) {}
            for (let i = 1; i <= 5; i++) {
              try {
                const stepEl = document.querySelector('.process .step:nth-of-type(' + i + ')');
                if (!stepEl) continue;
                const strong = stepEl.querySelector('strong');
                const desc = strong && strong.parentElement ? strong.parentElement.querySelector('div') : null;
                if (strong && strong.dataset && strong.dataset.origText) strong.textContent = strong.dataset.origText;
                if (desc && desc.dataset && desc.dataset.origText) desc.textContent = desc.dataset.origText;
              } catch (e) {}
            }

            // restore partner alts
            document.querySelectorAll('.partners .partner img').forEach(function (img) {
              try {
                if (img && img.dataset && img.dataset.origAlt !== undefined) img.setAttribute('alt', img.dataset.origAlt);
              } catch (e) {}
            });

            // restore note
            const note = document.querySelector('.process p');
            if (note && note.dataset && note.dataset.origText) note.textContent = note.dataset.origText;
          }
        }
      } catch (e) {}
    };
  } catch (e) {}

  window.i18n = {
    getPreferred: getPreferred,
    setPreferred: setPreferred,
    applyPreferred: applyPreferred,
  };

  // Auto-apply when i18n is loaded if translatePage already exists
  try {
    applyPreferred();
  } catch (e) {}

  // Re-apply translations after DOMContentLoaded to avoid timing/race issues
  try {
    if (typeof window !== 'undefined' && document && document.readyState !== 'complete') {
      document.addEventListener('DOMContentLoaded', function () {
        try { applyPreferred(); } catch (e) {}
      });
    }
  } catch (e) {}

  // Observe DOM changes and re-apply translations (debounced) to catch dynamically inserted nav/menu
  try {
    if (typeof MutationObserver !== 'undefined') {
      let timer = null;
      const mo = new MutationObserver(function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          try {
            applyPreferred();
          } catch (e) {}
        }, 150);
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
})();
