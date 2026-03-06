// review.js - handles opening modal, collecting form data and submitting to backend
(function () {
  const API_BASE ="https://alfa-motors-9bk6.vercel.app/api/reviews";

  function createModal() {
    if (document.getElementById("review-modal")) return;

    const modal = document.createElement("div");
    modal.id = "review-modal";
    modal.style.position = "fixed";
    modal.style.left = 0;
    modal.style.top = 0;
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.display = "none";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.background = "rgba(0,0,0,0.6)";
    modal.style.zIndex = 10000;

    modal.innerHTML = `
<div style="background:#fff;border-radius:10px;padding:20px;max-width:480px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
  <button id="review-close" style="float:right;background:#ef4444;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer">&times;</button>
  <h3 style="margin-top:0">Leave a review</h3>
  <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
    <div id="review-stars" aria-label="rating" role="radiogroup">
      <button class="star" data-value="1">★</button>
      <button class="star" data-value="2">★</button>
      <button class="star" data-value="3">★</button>
      <button class="star" data-value="4">★</button>
      <button class="star" data-value="5">★</button>
    </div>
    <small id="review-rating-text" style="color:#444">5</small>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
  <input id="review-name" placeholder="Your name" style="padding:10px;border:1px solid #ddd;border-radius:6px" />
  <input id="review-email" placeholder="Your email (optional)" style="padding:10px;border:1px solid #ddd;border-radius:6px" />
    <textarea id="review-message" placeholder="Your message" rows="4" style="padding:10px;border:1px solid #ddd;border-radius:6px"></textarea>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button id="review-submit" style="background:#10b981;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Send</button>
      <button id="review-cancel" style="background:#e5e7eb;border:none;padding:8px 14px;border-radius:6px;cursor:pointer">Cancel</button>
    </div>
    <div id="review-status" style="color:#111;min-height:20px"></div>
  </div>
</div>
`;

    document.body.appendChild(modal);

    // style stars
    modal.querySelectorAll(".star").forEach((btn) => {
      btn.style.fontSize = "22px";
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.color = "#d1d5db";
    });

    // default rating
    let currentRating = 5;

    function updateStars(rating) {
      currentRating = rating;
      modal.querySelectorAll(".star").forEach((s) => {
        s.style.color =
          Number(s.dataset.value) <= rating ? "#f59e0b" : "#d1d5db";
      });
      const text = modal.querySelector("#review-rating-text");
      if (text) text.textContent = rating;
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideModal();
    });

    modal.querySelector("#review-close").addEventListener("click", hideModal);
    modal.querySelector("#review-cancel").addEventListener("click", hideModal);

    modal.querySelectorAll(".star").forEach((s) => {
      s.addEventListener("click", () => updateStars(Number(s.dataset.value)));
    });

    modal
      .querySelector("#review-submit")
      .addEventListener("click", async () => {
        const name = document.getElementById("review-name").value.trim();
        const email = document.getElementById("review-email").value.trim();
        const message = document.getElementById("review-message").value.trim();
        const status = document.getElementById("review-status");

        if (!name || !message) {
          status.textContent = "Please fill name and message (email optional)";
          status.style.color = "#ef4444";
          return;
        }

        status.textContent = "Sending...";
        status.style.color = "#111";

        try {
          // build payload and include email only if provided
          const payload = { name, message, rating: currentRating };
          if (email) payload.email = email;

          const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (res.ok) {
            status.textContent = "Thank you for your review!";
            status.style.color = "#10b981";
            setTimeout(hideModal, 1200);
            // clear
            document.getElementById("review-name").value = "";
            document.getElementById("review-email").value = "";
            document.getElementById("review-message").value = "";
          } else {
            status.textContent = (data && data.message) || "Failed to send";
            status.style.color = "#ef4444";
          }
        } catch (err) {
          status.textContent = "Network error";
          status.style.color = "#ef4444";
        }
      });

    function hideModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }

    function showModal() {
      modal.style.display = "flex";
      updateStars(5);
      document.body.style.overflow = "hidden";
    }

    // expose for other scripts
    window.ReviewModal = { show: showModal };
  }

  // create modal at load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createModal);
  } else {
    createModal();
  }

  // install click handler for any element with .footer-stars class
  function attachFooterButtons() {
    document.querySelectorAll(".footer-stars").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (!window.ReviewModal) return;
        window.ReviewModal.show();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachFooterButtons);
  } else {
    attachFooterButtons();
  }

  // Fetch reviews and render into homepage testimonials container
  async function fetchAndRenderReviews() {
    try {
      const container = document.querySelector(".testimonials-container");
      if (!container) return; // not on homepage

      const res = await fetch(API_BASE);
      if (!res.ok) return; // keep existing static testimonials on error
      const payload = await res.json();
      if (!payload || !payload.data || !Array.isArray(payload.data)) return;

      const reviews = payload.data;
      if (!reviews.length) return; // nothing to do

      // helper: create star icons according to rating (max 5)
      function createStars(rating) {
        const div = document.createElement("div");
        div.className = "rating";
        div.setAttribute("itemprop", "reviewRating");
        div.setAttribute("itemscope", "");
        div.setAttribute("itemtype", "https://schema.org/Rating");

        const meta = document.createElement("meta");
        meta.setAttribute("itemprop", "ratingValue");
        meta.content = String(rating || 5);
        div.appendChild(meta);

        const full = Math.floor(rating || 5);
        const half = (rating || 0) - full >= 0.5;
        for (let i = 0; i < full; i++) {
          const iEl = document.createElement("i");
          iEl.className = "fas fa-star";
          div.appendChild(iEl);
        }
        if (half) {
          const iEl = document.createElement("i");
          iEl.className = "fas fa-star-half-alt";
          div.appendChild(iEl);
        }
        const remaining = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < remaining; i++) {
          const iEl = document.createElement("i");
          iEl.className = "fas fa-star";
          iEl.style.opacity = "0.3";
          div.appendChild(iEl);
        }
        return div;
      }

      function timeAgo(dateStr) {
        const d = new Date(dateStr);
        if (!d || isNaN(d)) return "";
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} minutes ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} days ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} months ago`;
        const years = Math.floor(months / 12);
        return `${years} years ago`;
      }

      // clear container and rebuild
      container.innerHTML = "";

      reviews.forEach((r) => {
        // normalize fields from different backends (SQL or legacy API)
        const reviewerName =
          r.name || r.userName || r.user || r.user_name || "Anonymous";
        const messageText = r.message || r.comment || r.body || "";
        const ratingValue = r.rating || r.stars || 5;
        const createdAtVal = r.createdAt || r.created_at || r.date || null;

        const div = document.createElement("div");
        div.className = "testimonial";
        div.setAttribute("itemscope", "");
        div.setAttribute("itemtype", "https://schema.org/Review");

        div.innerHTML = `
          <div class="quote-icon">
            <i class="fas fa-quote-right" aria-hidden="true"></i>
          </div>
        `;

        const header = document.createElement("div");
        header.className = "testimonial-header";

        const img = document.createElement("img");
        img.src = "./assets/person.jpg";
        img.alt = reviewerName || "Reviewer";
        img.className = "user-avatar";
        img.width = 60;
        img.height = 60;
        img.loading = "lazy";

        const info = document.createElement("div");
        info.className = "user-info";

        const h3 = document.createElement("h3");
        h3.className = "user-name";

        // Structured data: author should be a Person object, not a plain string.
        const authorScope = document.createElement("span");
        authorScope.setAttribute("itemprop", "author");
        authorScope.setAttribute("itemscope", "");
        authorScope.setAttribute("itemtype", "https://schema.org/Person");
        const authorName = document.createElement("span");
        authorName.setAttribute("itemprop", "name");
        authorName.textContent = reviewerName;
        authorScope.appendChild(authorName);
        h3.appendChild(authorScope);

        const loc = document.createElement("p");
        loc.className = "user-location";
        loc.textContent = r.location || ""; // optional

        info.appendChild(h3);
        info.appendChild(loc);
        // rating
        const ratingEl = createStars(ratingValue || 5);
        info.appendChild(ratingEl);

        header.appendChild(img);
        header.appendChild(info);

        const quote = document.createElement("div");
        quote.className = "quote";
        quote.setAttribute("itemprop", "reviewBody");
        quote.textContent = messageText || "";

        const footer = document.createElement("div");
        footer.className = "testimonial-footer";

        const dateSpan = document.createElement("span");
        dateSpan.className = "testimonial-date";
        
        const proof = document.createElement("span");
        proof.className = "social-proof";

        footer.appendChild(dateSpan);
        footer.appendChild(proof);

        // metadata
        // itemReviewed must be an object (Thing) — represent as Organization with a name
        const reviewedDiv = document.createElement("div");
        reviewedDiv.setAttribute("itemprop", "itemReviewed");
        reviewedDiv.setAttribute("itemscope", "");
        reviewedDiv.setAttribute("itemtype", "https://schema.org/Organization");
        const reviewedName = document.createElement("meta");
        reviewedName.setAttribute("itemprop", "name");
        reviewedName.content = "Alfa Motors World";
        reviewedDiv.appendChild(reviewedName);

        const metaDate = document.createElement("meta");
        metaDate.setAttribute("itemprop", "datePublished");
        metaDate.content = createdAtVal
          ? new Date(createdAtVal).toISOString().split("T")[0]
          : "";

        div.appendChild(header);
        div.appendChild(quote);
        div.appendChild(footer);
        div.appendChild(reviewedDiv);
        div.appendChild(metaDate);

        container.appendChild(div);
      });

      // update nav dots
      const nav = document.querySelector(".testimonial-nav");
      if (nav) {
        nav.innerHTML = "";
        reviews.forEach((_, i) => {
          // create a real button so it's keyboard accessible
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "testimonial-dot" + (i === 0 ? " active" : "");
          dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
          // mark current state for assistive tech
          dot.setAttribute("aria-current", i === 0 ? "true" : "false");
          nav.appendChild(dot);
        });
      }
    } catch (err) {
      // ignore errors and keep static testimonials
      console.error("Failed to load reviews", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchAndRenderReviews);
  } else {
    fetchAndRenderReviews();
  }
})();
