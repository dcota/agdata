document.addEventListener("DOMContentLoaded", () => {
  // Back to Top Button
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTop.style.opacity = "1";
      backToTop.style.visibility = "visible";
    } else {
      backToTop.style.opacity = "0";
      backToTop.style.visibility = "hidden";
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Init AOS for scroll animations (sections, cards, etc.)
  if (window.AOS) {
    AOS.init({
      duration: 900,
      easing: "ease-out",
      once: false, // re-animate when re-entering viewport
      mirror: true, // also animate on scroll-up
    });
  }

  // Simple form handler (placeholder)
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Obrigado! A sua mensagem foi enviada.");
    });
  }

  // --- SVG line-draw animation controlled entirely in JS ---

  const wrappers = document.querySelectorAll(".svg-wrapper");

  // Prepare each line: get length, store it, and reset dashoffset
  wrappers.forEach((wrapper) => {
    const lines = wrapper.querySelectorAll(".svg-line");
    lines.forEach((line) => {
      let length = 700;
      try {
        if (typeof line.getTotalLength === "function") {
          length = line.getTotalLength();
        }
      } catch (err) {
        // keep default
      }
      line.dataset.length = String(length);
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    });
  });

  function animateLine(line, durationMs) {
    const totalLength = parseFloat(line.dataset.length || "700");
    // Reset offset
    line.style.strokeDashoffset = totalLength;

    // Cancel previous animation if any
    if (line._animFrameId) {
      cancelAnimationFrame(line._animFrameId);
    }

    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / durationMs, 1);
      // smoothstep easing
      const eased = t * t * (3 - 2 * t);
      line.style.strokeDashoffset = totalLength * (1 - eased);
      if (t < 1) {
        line._animFrameId = requestAnimationFrame(step);
      }
    }

    line._animFrameId = requestAnimationFrame(step);
  }

  function animateWrapper(wrapper) {
    const lines = wrapper.querySelectorAll(".svg-line");
    const baseDuration = 3500; // ms
    const stagger = 150; // ms between each path

    lines.forEach((line, index) => {
      const delay = index * stagger;
      setTimeout(() => {
        animateLine(line, baseDuration);
      }, delay);
    });
  }

  function resetWrapper(wrapper) {
    const lines = wrapper.querySelectorAll(".svg-line");
    lines.forEach((line) => {
      const length = parseFloat(line.dataset.length || "700");
      if (line._animFrameId) {
        cancelAnimationFrame(line._animFrameId);
      }
      line.style.strokeDashoffset = length;
    });
  }

  // Observer to trigger/retrigger the icon animations on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wrapper = entry.target;
        if (entry.isIntersecting) {
          animateWrapper(wrapper);
        } else {
          resetWrapper(wrapper);
        }
      });
    },
    {
      threshold: 0.4, // trigger when ~40% of wrapper is visible
    }
  );

  wrappers.forEach((wrapper) => observer.observe(wrapper));
  // ---------------------------
  // PLANET ICON LINE-DRAW
  // ---------------------------

  // Get all planet wrappers
  const planetWrappers = document.querySelectorAll(".planet-svg-wrapper");

  // Prepare stroke lengths for each icon path
  planetWrappers.forEach((wrapper) => {
    const parts = wrapper.querySelectorAll("path, circle");
    parts.forEach((part) => {
      let len = 700;
      try {
        if (typeof part.getTotalLength === "function") {
          len = part.getTotalLength();
        }
      } catch (e) {}
      part.dataset.length = len;
      part.style.strokeDasharray = len;
      part.style.strokeDashoffset = len;
    });
  });

  // Animate a single planet line
  function animatePlanetLine(part, duration) {
    const totalLength = parseFloat(part.dataset.length || "700");
    part.style.strokeDashoffset = totalLength;

    if (part._animFrame) cancelAnimationFrame(part._animFrame);

    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t * t * (3 - 2 * t);
      part.style.strokeDashoffset = totalLength * (1 - eased);
      if (t < 1) part._animFrame = requestAnimationFrame(step);
    }
    part._animFrame = requestAnimationFrame(step);
  }

  // Animate all parts inside one wrapper
  function animatePlanetWrapper(wrapper) {
    const parts = wrapper.querySelectorAll("path, circle");
    const duration = 2800; // ms
    const stagger = 120; // ms

    parts.forEach((part, index) => {
      setTimeout(() => animatePlanetLine(part, duration), index * stagger);
    });
  }

  // Reset for replay
  function resetPlanetWrapper(wrapper) {
    const parts = wrapper.querySelectorAll("path, circle");
    parts.forEach((part) => {
      const len = parseFloat(part.dataset.length || "700");
      if (part._animFrame) cancelAnimationFrame(part._animFrame);
      part.style.strokeDashoffset = len;
    });
  }

  // Observer to replay on each scroll
  const planetObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wrapper = entry.target;
        if (entry.isIntersecting) {
          animatePlanetWrapper(wrapper);
        } else {
          resetPlanetWrapper(wrapper);
        }
      });
    },
    { threshold: 0.4 }
  );

  // Start observing
  planetWrappers.forEach((wrapper) => planetObserver.observe(wrapper));
  // Counter animation
  const counters = document.querySelectorAll(".impact-number");
  let counterStarted = false;

  function animateCounters() {
    if (counterStarted) return; // prevent retriggering

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");
      let count = 0;
      const increment = target / 50; // speed here

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.textContent = Math.floor(count);
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target;
        }
      };

      updateCount();
    });

    counterStarted = true;
  }

  // Trigger when section enters viewport
  const statsSection = document.querySelector("#impact-stats");
  const observerStats = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateCounters();
    });
  });
  observerStats.observe(statsSection);

  // Optional: fade-in timeline items on scroll
  const tlItems = document.querySelectorAll(".timeline-item");
  const tlObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          tlObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  tlItems.forEach((item) => {
    item.classList.add("before-visible");
    tlObserver.observe(item);
  });
});
