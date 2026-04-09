const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const navLinks = [...document.querySelectorAll(".site-nav a"), ...document.querySelectorAll(".header-cta")];
const revealNodes = document.querySelectorAll(".reveal");
const statementText = document.querySelector(".statement__text");
const paintSection = document.querySelector("[data-paint-section]");
const paintLines = statementText ? [...statementText.querySelectorAll("[data-paint-line]")] : [];
const video = document.querySelector("[data-video]");
const videoToggles = document.querySelectorAll("[data-video-toggle]");
const filmFrame = document.querySelector(".film-frame");
const preloader = document.querySelector("[data-preloader]");
const loaderGrid = document.querySelector("[data-loader-grid]");
const sectorNodes = document.querySelectorAll(".vector-sector");
const sections = document.querySelectorAll("main .section");
const scrollVector = document.querySelector("[data-scroll-vector]");

const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const updatePaintText = () => {
  if (!statementText || !paintSection || !paintLines.length) return;

  if (mediaQuery.matches) {
    statementText.style.setProperty("--paint-progress", "1");
    paintLines.forEach((line) => {
      line.style.setProperty("--fill-percent", "100%");
      line.style.setProperty("--line-progress", "1");
    });
    return;
  }

  const rect = paintSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const start = viewportHeight * 0.56;
  const end = viewportHeight * 0.12;
  const travel = Math.max(rect.height - (start - end), 1);
  const progress = Math.min(Math.max((start - rect.top) / travel, 0), 1);

  statementText.style.setProperty("--paint-progress", progress.toFixed(4));

  paintLines.forEach((line, index) => {
    const lineProgress = Math.min(Math.max((progress - index * 0.26) / 0.58, 0), 1);
    line.style.setProperty("--fill-percent", `${(lineProgress * 100).toFixed(2)}%`);
    line.style.setProperty("--line-progress", lineProgress.toFixed(4));
  });
};

const updateScrollState = () => {
  const scrollTop = window.scrollY;
  header?.classList.toggle("is-scrolled", scrollTop > 24);

  if (scrollVector && !mediaQuery.matches) {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
    scrollVector.style.setProperty("--vector-progress", progress.toFixed(4));
  }

  updatePaintText();
};

let isTickingScroll = false;
const handleScroll = () => {
  if (isTickingScroll) return;
  isTickingScroll = true;
  window.requestAnimationFrame(() => {
    updateScrollState();
    isTickingScroll = false;
  });
};

const buildLoaderGrid = () => {
  if (!loaderGrid) return;

  const totalMarks = window.innerWidth < 860 ? 16 : 32;
  loaderGrid.innerHTML = "";

  for (let index = 0; index < totalMarks; index += 1) {
    const mark = document.createElement("div");
    mark.className = "loader-asterisk";

    for (let arm = 0; arm < 8; arm += 1) {
      const segment = document.createElement("span");
      segment.className = "loader-asterisk__arm";
      segment.style.setProperty("--rotation", `${arm * 45}deg`);
      segment.style.setProperty("--delay", `${(index * 0.08 + arm * 0.06) % 1.8}s`);
      mark.append(segment);
    }

    loaderGrid.append(mark);
  }
};

const releasePreloader = () => {
  document.body.classList.add("is-ready");
};

const initPreloader = () => {
  buildLoaderGrid();

  if (!preloader) {
    releasePreloader();
    return;
  }

  const minimumDelay = mediaQuery.matches ? 240 : 1650;
  window.setTimeout(releasePreloader, minimumDelay);
};

window.addEventListener("scroll", handleScroll, { passive: true });

window.addEventListener("load", () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  initPreloader();
  updateScrollState();
});
window.addEventListener("resize", () => {
  buildLoaderGrid();
  updateScrollState();
});

if (menuToggle && menu) {
  const setMenuState = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("is-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      setMenuState(false);
    }
  });
}

if (revealNodes.length && !mediaQuery.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target === statementText) {
          statementText.classList.add("is-visible");
        }
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
  statementText?.classList.add("is-visible");
}

if (sectorNodes.length && !mediaQuery.matches) {
  const sectorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        sectorObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  sectorNodes.forEach((node) => sectorObserver.observe(node));
} else {
  sectorNodes.forEach((node) => node.classList.add("is-visible"));
}

if (sections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-current", entry.isIntersecting);
        if (entry.isIntersecting && scrollVector) {
          scrollVector.dataset.section = entry.target.id || "section";
        }
      });
    },
    {
      threshold: 0.34,
      rootMargin: "-16% 0px -30% 0px",
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

if (video && filmFrame) {
  const syncVideoUI = () => {
    const isPlaying = !video.paused;
    filmFrame.classList.toggle("is-playing", isPlaying);
    videoToggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(isPlaying));
      if (toggle.classList.contains("film-frame__toggle")) {
        toggle.textContent = isPlaying ? "Pause Film" : "Play Film";
      }
      if (toggle.classList.contains("film-frame__play")) {
        toggle.setAttribute("aria-label", isPlaying ? "Pause film" : "Play film");
      }
    });
  };

  const togglePlayback = async () => {
    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
      syncVideoUI();
    } catch (error) {
      syncVideoUI();
    }
  };

  videoToggles.forEach((toggle) => toggle.addEventListener("click", togglePlayback));
  video.addEventListener("play", syncVideoUI);
  video.addEventListener("pause", syncVideoUI);
  syncVideoUI();

  if (!mediaQuery.matches) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
          syncVideoUI();
        });
      },
      {
        threshold: 0.45,
      },
    );

    videoObserver.observe(video);
  }
}
