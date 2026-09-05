/* caleb.rocks — site behaviour (vanilla JS, no dependencies)
   Replaces the template's jQuery + AOS stack:
   - fixed header state on scroll
   - scroll-spy for the pill nav (section offsets cached — reading offsetTop
     on every scroll event forced a layout per event, which WebKit punishes)
   - scroll-to-top corner button
   - scroll-reveal driven by the existing data-aos / data-aos-delay attributes
   - contact form success note when redirected back with ?sent=1
   - ?debug=1 diagnostic banner (installs first, survives later errors)
*/
(function () {
  "use strict";

  /* No-op unless the debug banner is active (reassigned below). Lets us
     timestamp each startup phase anywhere in the script. */
  var dbgPhase = function () {};

  /* ---- Debug banner (?debug=1) — installs FIRST so it survives later errors ----
     On-device diagnostics for load problems. Add ?debug=1 to any page URL:
     - JS errors (with source line) and failed resources, as they happen
     - phase timestamps through script startup (a long gap between two phase
       lines names the exact operation that froze the main thread)
     - readyState / visibility transitions (catches a locked phone mid-test)
     - a 2s sampler for up to 2 minutes: if sample timestamps GAP while the
       spinner hangs, the main thread is starved; if samples run steadily and
       name a PENDING resource, the load event is waiting on that fetch
     - full navigation timing and a reveal census once loaded
     Dormant otherwise; vanilla ES5, no dependencies. */
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

    dbgPhase = function (name) {
      dbgLog("phase → " + name);
    };

    /* Pending = referenced by the document but not yet in resource timing.
       Icon links (favicon / apple-touch-icon) are counted separately, not
       flagged: WebKit fetches them out-of-process where resource timing
       can't see them. */
    var dbgPending = function () {
      var finished = {};
      var pending = [];
      var iconLinks = 0;

      performance.getEntriesByType("resource").forEach(function (r) {
        finished[r.name] = true;
      });

      document
        .querySelectorAll("script[src], link[href], img[src]")
        .forEach(function (n) {
          var url = n.src || n.href;
          if (!url || String(url).indexOf("data:") === 0) return;

          if (n.tagName === "LINK") {
            var rel = (n.getAttribute("rel") || "").toLowerCase();
            if (rel.indexOf("canonical") !== -1) return; /* never fetched */
            if (
              rel.indexOf("stylesheet") === -1 &&
              rel.indexOf("preload") === -1
            ) {
              iconLinks += 1; /* favicon, apple-touch-icon, etc */
              return;
            }
          }

          if (n.tagName === "IMG" && n.getAttribute("loading") === "lazy") {
            return; /* below-fold lazy images are correctly unfetched */
          }

          if (!finished[url]) {
            pending.push(
              n.tagName.toLowerCase() + " " + String(url).split("/").pop()
            );
          }
        });

      return { pending: pending, iconLinks: iconLinks };
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

    document.addEventListener("readystatechange", function () {
      dbgLog("readyState → " + document.readyState);
    });

    document.addEventListener("DOMContentLoaded", function () {
      dbgPhase("DOMContentLoaded");
    });

    document.addEventListener("visibilitychange", function () {
      dbgLog("visibility → " + document.visibilityState);
    });

    window.addEventListener("load", function () {
      var nav = performance.getEntriesByType("navigation")[0];

      dbgLog(
        "LOAD FIRED — " +
          performance.getEntriesByType("resource").length +
          " resources done"
      );

      if (nav) {
        dbgLog(
          "nav: ttfb " +
            Math.round(nav.responseStart) +
            "ms, responseEnd " +
            Math.round(nav.responseEnd) +
            "ms, domInteractive " +
            Math.round(nav.domInteractive) +
            "ms, loadEventStart " +
            Math.round(nav.loadEventStart) +
            "ms"
        );
      }

      window.setTimeout(function () {
        var total = document.querySelectorAll("[data-aos]").length;
        var animated = document.querySelectorAll("[data-aos].aos-animate")
          .length;
        var p = dbgPending();
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
              : "off") +
            (p.iconLinks ? ", icon links never fetched: " + p.iconLinks : "")
        );
      }, 2000);
    });

    var dbgSamples = 0;
    var dbgSteady = 0;
    var dbgLastKey = "";

    var dbgSampler = window.setInterval(function () {
      dbgSamples += 1;
      if (document.readyState === "complete") dbgSteady += 1;

      var p = dbgPending();
      var res = performance.getEntriesByType("resource").length;
      var key = document.readyState + "/" + res + "/" + p.pending.join(",");

      if (key !== dbgLastKey || dbgSamples % 10 === 0) {
        dbgLog(
          "sample " +
            dbgSamples +
            " [" +
            document.readyState +
            ", " +
            res +
            " res]" +
            (p.pending.length ? " PENDING: " + p.pending.join(", ") : "") +
            (p.iconLinks ? " (icon links: " + p.iconLinks + ")" : "")
        );
        dbgLastKey = key;
      }

      if (dbgSteady >= 3 || dbgSamples >= 60) {
        window.clearInterval(dbgSampler);
      }
    }, 2000);
  }

  /* JS is running — removes the no-js guard so [data-aos] reveals can engage
     (see the custom layer in styles.css). */
  document.documentElement.classList.remove("no-js");
  dbgPhase("no-js removed");

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var rAF =
    window.requestAnimationFrame ||
    function (fn) {
      window.setTimeout(fn, 16);
    };

  /* ---- Scroll-reveal (drop-in for AOS) ----
     Adds .aos-animate to [data-aos] elements as they enter the viewport.
     Rect-sweep based (getBoundingClientRect inside a rAF-gated scroll
     handler) rather than IntersectionObserver — IO callback delivery is
     broken or delayed on some iOS Safari builds, which left sections
     permanently hidden. CSS lives in the caleb.rocks custom layer. */
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

  /* ---- Fixed header after 60px ---- */
  var header = document.querySelector("header.header");

  function onHeaderScroll() {
    if (!header) return;
    header.classList.toggle("fixed-header", window.scrollY >= 60);
  }

  /* ---- Scroll-spy: highlight the nav link for the section in view ----
     Section offsets are measured once and re-measured on resize / after
     layout settles — NOT on every scroll event (forced layout per event
     made scrolling jank-heavy in WebKit with the full stylesheet). */
  var sections = document.querySelectorAll("section[id]");
  var sectionOffsets = [];

  function measureSections() {
    dbgPhase("pre-measure-sections");
    sectionOffsets = [];

    sections.forEach(function (current) {
      sectionOffsets.push({
        top: current.offsetTop - 120,
        bottom: current.offsetTop - 120 + current.offsetHeight,
        link: document.querySelector(
          '.navbar-collapse a[href*="#' + current.id + '"]'
        )
      });
    });

    dbgPhase("post-measure-sections");
  }

  function navHighlighter() {
    var scrollY = window.pageYOffset;

    sectionOffsets.forEach(function (s) {
      if (!s.link) return;
      if (scrollY > s.top && scrollY <= s.bottom) {
        s.link.classList.add("active");
      } else {
        s.link.classList.remove("active");
      }
    });
  }

  /* At most one batched pass per animation frame: writes first, then reads */
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    rAF(function () {
      ticking = false;
      onHeaderScroll();
      navHighlighter();
      sweepReveals();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  function settleLayout() {
    measureSections();
    sweepReveals();
  }

  window.addEventListener("resize", settleLayout, { passive: true });
  window.addEventListener("load", settleLayout);

  /* ---- Startup: ALL layout-touching work is deferred out of parse time ----
     Forcing a layout synchronously mid-parse (offsetTop / rect reads while
     the parser is still building the document) froze the main thread for
     ~68 seconds on iOS WebKit with the full page. The first sweep, the
     section measuring, and the first scroll pass now run in a rAF after
     DOMContentLoaded, and again once fonts/images have settled. */
  function startBehaviour() {
    measureSections();

    dbgPhase("pre-initial-sweep");
    if (prefersReducedMotion) {
      revealAll();
    } else {
      sweepReveals();
    }
    dbgPhase("post-initial-sweep");

    onScroll();

    window.setTimeout(settleLayout, 300);
    window.setTimeout(settleLayout, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      rAF(startBehaviour);
    });
  } else {
    rAF(startBehaviour);
  }
  dbgPhase("startup deferred (DOMContentLoaded + rAF)");

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

  dbgPhase("script end");
})();
