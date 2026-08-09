(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Typewriter effect (hero tagline) ---- */
  var typewriterEl = document.querySelector("[data-typewriter]");
  if (typewriterEl) {
    var phrases = null;
    try {
      phrases = JSON.parse(typewriterEl.getAttribute("data-typewriter"));
    } catch (e) {
      phrases = null;
    }

    if (phrases && phrases.length) {
      if (reduceMotion) {
        typewriterEl.textContent = phrases[0];
      } else {
        runTypewriter(typewriterEl, phrases);
      }
    }
  }

  function runTypewriter(el, phrases) {
    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typeDelay = 45;
    var deleteDelay = 25;
    var holdDelay = 1700;

    function tick() {
      var current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, holdDelay);
          return;
        }
        setTimeout(tick, typeDelay);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, typeDelay);
          return;
        }
        setTimeout(tick, deleteDelay);
      }
    }

    tick();
  }

  /* ---- Theme toggle ---- */
  var root = document.documentElement;
  var toggleBtn = document.querySelector("[data-theme-toggle]");

  function effectiveTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function syncToggleButton() {
    if (!toggleBtn) return;
    var theme = effectiveTheme();
    toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    toggleBtn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  syncToggleButton();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* localStorage unavailable (private browsing, etc.) — theme just won't persist */
      }
      syncToggleButton();
    });
  }

  /* ---- Nav shadow on scroll ---- */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    var ticking = false;
    function updateNavShadow() {
      nav.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    }
    updateNavShadow();
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(updateNavShadow);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---- Back to top ---- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    var btTicking = false;
    function updateBackToTop() {
      backToTop.classList.toggle("visible", window.scrollY > 480);
      btTicking = false;
    }
    updateBackToTop();
    window.addEventListener(
      "scroll",
      function () {
        if (!btTicking) {
          requestAnimationFrame(updateBackToTop);
          btTicking = true;
        }
      },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---- Publication topic filter ---- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length) {
    var entries = document.querySelectorAll(".entry[data-tags]");
    var pubSections = document.querySelectorAll(".pub-section");

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        var filter = btn.getAttribute("data-filter");

        entries.forEach(function (entry) {
          var tags = (entry.getAttribute("data-tags") || "").split(/\s+/);
          var show = filter === "all" || tags.indexOf(filter) !== -1;
          entry.classList.toggle("hidden", !show);
        });

        pubSections.forEach(function (section) {
          var anyVisible = Array.prototype.some.call(
            section.querySelectorAll(".entry[data-tags]"),
            function (e) {
              return !e.classList.contains("hidden");
            }
          );
          section.classList.toggle("hidden", !anyVisible);
        });
      });
    });
  }
})();
