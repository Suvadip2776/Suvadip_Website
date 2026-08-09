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

  /* ---- Reveal-on-scroll for the timeline ---- */
  var tlItems = document.querySelectorAll(".tl-item");
  if (tlItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      tlItems.forEach(function (el) {
        el.classList.add("in-view");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      tlItems.forEach(function (el) {
        observer.observe(el);
      });
    }
  }
})();
