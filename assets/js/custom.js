/* caleb.rocks — site behaviour (vanilla JS, no dependencies)
   Replaces the template's jQuery + AOS stack:
   - fixed header state on scroll
   - scroll-spy for the pill nav
   - scroll-to-top corner button
   - scroll-reveal driven by the existing data-aos / data-aos-delay attributes
   - contact form success note when redirected back with ?sent=1
*/
(function () {
  "use strict";

  /* JS is running — removes the no-js guard so [data-aos] reveals can engage
     (see the custom layer in styles.css). */
  document.documentElement.classList.remove("no-js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Fixed header after 60px ---- */
  var header = document.querySelector("header.header");

  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle("fixed-header", window.scrollY >= 60);
  }

  /* ---- Scroll-spy: highlight the nav link for the section in view ---- */
  var sections = document.querySelectorAll("section[id]");

  function navHighlighter() {
    var scrollY = window.pageYOffset;

    sections.forEach(function (current) {
      var sectionTop = current.offsetTop - 120;
      var sectionBottom = sectionTop + current.offsetHeight;
      var link = document.querySelector('.navbar-collapse a[href*="#' + current.id + '"]');
      if (!link) return;

      if (scrollY > sectionTop && scrollY <= sectionBottom) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function onScroll() {
    onHeaderScroll();
    navHighlighter();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Scroll to top corner button ---- */
  var topBtn = document.getElementById("scrollToTopBtn");

  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  /* ---- Scroll-reveal (drop-in for AOS) ----
     Adds .aos-animate to [data-aos] elements as they enter the viewport.
     CSS lives in the caleb.rocks custom layer of styles.css. */
  var revealEls = document.querySelectorAll("[data-aos]");

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add("aos-animate");
    });
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
          if (delay) {
            el.style.transitionDelay = delay + "ms";
          }
          el.classList.add("aos-animate");
          observer.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Contact form: show success note after FormSubmit redirect (?sent=1) ---- */
  var formSuccess = document.getElementById("form-success");

  if (formSuccess && window.location.search.indexOf("sent=1") !== -1) {
    formSuccess.classList.remove("d-none");

    if (history.replaceState) {
      history.replaceState(null, "", window.location.pathname);
    }

    formSuccess.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "center"
    });
  }
})();
