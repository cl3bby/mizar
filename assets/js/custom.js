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

  /* ---- Debug banner (?debug=1) — installs FIRST so it survives later errors ----
     On-device diagnostics for load problems. Add ?debug=1 to any page URL:
     logs JS errors (with source line), failed resources, a reveal census
     (catches the "blank sections" failure), and a watchdog naming anything
     still stalled after 15s. Dormant otherwise; vanilla ES5, no dependencies. */
  if (window.location.search.indexOf("debug=1") !== -1) {
    var dbgBox = document.createElement("div");
    var dbgLines = [];

    dbgBox.setAttribute(
      "style",
      "position:fixed;top:0;left:0;right:0;z-index:2147483647;" +
        "background:#111;color:#7cff7c;font:11px/1.5 monospace;" +
        "padding:8px 10px;max-height:45%;overflow:auto;white-space:pre-wrap;" +
        "word-break:break-all;border-bottom:2px solid #7cff7c"
    );

    var dbgLog = function (msg) {
      dbgLines.push("[" + Math.round(performance.now()) + "ms] " + msg);
      dbgBox.textContent = dbgLines.join("\n");
    };

    window.addEventListener(
      "error",
      function (e) {
        if (e.target && e.target !== window) {
          var el = e.target;
          var url = el.src || el.href || "";
          dbgLog(
            "RESOURCE FAILED: " +
              (el.tagName || "?").toLowerCase() +
              " " +
              String(url).split("/").pop()
          );
        } else {
          dbgLog(
            "JS ERROR: " +
              (e.message || "unknown") +
              (e.filename
                ? " @" + String(e.filename).split("/").pop() + ":" + e.lineno
                : "")
          );
        }
      },
      true
    );

    document.body.appendChild(dbgBox);
    dbgLog("debug active — " + navigator.userAgent);

    window.addEventListener("load", function () {
      dbgLog(
        "LOAD FIRED — " +
          performance.getEntriesByType("resource").length +
          " resources done"
      );

      /* Reveal census, 2s after load: if animated stays 0 while elements
         exist, the scroll-reveal never engaged — the blank-sections bug. */
      window.setTimeout(function () {
        var total = document.querySelectorAll("[data-aos]").length;
        var animated = document.querySelectorAll("[data-aos].aos-animate").length;
        dbgLog(
          "reveal census: " +
            animated +
            "/" +
            total +
            " animated, IO " +
            ("IntersectionObserver" in window ? "available" : "MISSING") +
            ", reduced-motion " +
            (window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "on"
              : "off")
        );
      }, 2000);
    });

    window.setTimeout(function () {
      if (document.readyState === "complete") return;
      var finished = {};
      var pending = [];

      performance.getEntriesByType("resource").forEach(function (r) {
        finished[r.name] = true;
      });

      document
        .querySelectorAll("script[src], link[href], img[src]")
        .forEach(function (n) {
          var url = n.src || n.href;
          if (url && !finished[url] && String(url).indexOf("data:") !== 0) {
            pending.push(
              (n.tagName || "?").toLowerCase() + " " + String(url).split("/").pop()
            );
          }
        });

      dbgLog(
        "STILL WAITING after 15s — stalled: " +
          (pending.length ? pending.join(", ") : "(nothing identifiable)")
      );
    }, 15000);
  }

  /* JS is running — removes the no-js guard so [data-aos] reveals can engage
     (see the custom layer in styles.css). */
  document.documentElement.classList.remove("no-js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll-reveal (drop-in for AOS) ----
     Adds .aos-animate to [data-aos] elements as they enter the viewport.
     Rect-sweep based (getBoundingClientRect on the existing scroll handler)
     rather than IntersectionObserver — IO callback delivery is broken or
     delayed on some iOS Safari builds, which left sections permanently
     hidden. CSS lives in the caleb.rocks custom layer of styles.css. */
  var revealEls = document.querySelectorAll("[data-aos]");

  function revealAll() {
    revealEls.forEach(function (el) {
      el.classList.add("aos-animate");
    });
  }

  function sweepReveals() {
    if (!revealEls || !revealEls.length) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;

    revealEls.forEach(function (el) {
      if (el.classList.contains("aos-animate")) return;

      var rect = el.getBoundingClientRect();
      if (rect.top >= vh - 40 || rect.bottom <= 40) return;

      var delay = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
      if (delay) {
        el.style.transitionDelay = delay + "ms";
      }
      el.classList.add("aos-animate");
    });
  }

  if (prefersReducedMotion) {
    revealAll();
  } else {
    sweepReveals();
    /* Re-sweep after fonts/images settle, in case layout shifted */
    window.setTimeout(sweepReveals, 300);
    window.setTimeout(sweepReveals, 1200);
    window.addEventListener("resize", sweepReveals, { passive: true });
  }

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
    sweepReveals();
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
