const SERIES_NAV_STATE_PREFIX = "pot-series-nav-sections-v1";
const SERIES_NAV_SCROLL_STATE_PREFIX = "pot-series-nav-scroll-v1";

function updateSideScrollFade(element: HTMLElement) {
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  const threshold = 2;

  element.classList.toggle("has-top-fade", element.scrollTop > threshold);
  element.classList.toggle(
    "has-bottom-fade",
    maxScrollTop - element.scrollTop > threshold,
  );
}

function initSideScrollFades() {
  document.querySelectorAll(".side-scroll-fade").forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    updateSideScrollFade(element);

    if (element.dataset.scrollFadeInitialized === "true") return;
    element.dataset.scrollFadeInitialized = "true";
    element.addEventListener(
      "scroll",
      () => updateSideScrollFade(element),
      { passive: true },
    );
  });
}

function getSeriesSectionStorageKey(seriesKey: string) {
  return `${SERIES_NAV_STATE_PREFIX}:${seriesKey}`;
}

function getSeriesScrollStorageKey(seriesKey: string, surfaceKey: string) {
  return `${SERIES_NAV_SCROLL_STATE_PREFIX}:${seriesKey}:${surfaceKey}`;
}

function readSeriesSectionState(seriesKey: string): Record<string, boolean> {
  try {
    const storedValue = localStorage.getItem(
      getSeriesSectionStorageKey(seriesKey),
    );
    if (!storedValue) return {};

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!parsedValue || typeof parsedValue !== "object") return {};

    return Object.entries(parsedValue).reduce<Record<string, boolean>>(
      (state, [key, value]) => {
        if (typeof value === "boolean") state[key] = value;
        return state;
      },
      {},
    );
  } catch {
    return {};
  }
}

function writeSeriesSectionState(
  seriesKey: string,
  state: Record<string, boolean>,
) {
  try {
    localStorage.setItem(
      getSeriesSectionStorageKey(seriesKey),
      JSON.stringify(state),
    );
  } catch {
    // Storage can be unavailable in restricted browser modes; keep native details behavior.
  }
}

function readSeriesScrollPosition(seriesKey: string, surfaceKey: string) {
  try {
    const storedValue = localStorage.getItem(
      getSeriesScrollStorageKey(seriesKey, surfaceKey),
    );
    const scrollTop = Number(storedValue);
    return Number.isFinite(scrollTop) && scrollTop > 0 ? scrollTop : 0;
  } catch {
    return 0;
  }
}

function writeSeriesScrollPosition(
  seriesKey: string,
  surfaceKey: string,
  scrollTop: number,
) {
  try {
    localStorage.setItem(
      getSeriesScrollStorageKey(seriesKey, surfaceKey),
      String(Math.max(0, Math.round(scrollTop))),
    );
  } catch {
    // Storage can be unavailable in restricted browser modes; keep native scroll behavior.
  }
}

function restoreSeriesScrollPosition(element: HTMLElement) {
  const seriesKey = element.dataset.seriesKey;
  const surfaceKey = element.dataset.seriesScrollSurface;
  if (!seriesKey || !surfaceKey) return;

  const storedScrollTop = readSeriesScrollPosition(seriesKey, surfaceKey);
  if (storedScrollTop <= 0) return;

  requestAnimationFrame(() => {
    element.scrollTop = storedScrollTop;
    updateSideScrollFade(element);
  });
}

function syncSeriesSectionOpenState(
  seriesKey: string,
  sectionKey: string,
  isOpen: boolean,
) {
  document
    .querySelectorAll(
      `[data-series-section][data-series-key="${CSS.escape(seriesKey)}"][data-series-section-key="${CSS.escape(sectionKey)}"]`,
    )
    .forEach((element) => {
      if (!(element instanceof HTMLDetailsElement)) return;
      if (element.open !== isOpen) element.open = isOpen;
    });
}

function initSeriesSectionState() {
  document.querySelectorAll("[data-series-section]").forEach((element) => {
    if (!(element instanceof HTMLDetailsElement)) return;

    const seriesKey = element.dataset.seriesKey;
    const sectionKey = element.dataset.seriesSectionKey;
    if (!seriesKey || !sectionKey) return;

    const state = readSeriesSectionState(seriesKey);
    if (sectionKey in state) {
      element.open = state[sectionKey];
    }

    if (element.dataset.seriesStateInitialized === "true") return;
    element.dataset.seriesStateInitialized = "true";

    element.addEventListener("toggle", () => {
      const latestSeriesKey = element.dataset.seriesKey;
      const latestSectionKey = element.dataset.seriesSectionKey;
      if (!latestSeriesKey || !latestSectionKey) return;

      const nextState = readSeriesSectionState(latestSeriesKey);
      nextState[latestSectionKey] = element.open;
      writeSeriesSectionState(latestSeriesKey, nextState);
      syncSeriesSectionOpenState(
        latestSeriesKey,
        latestSectionKey,
        element.open,
      );
    });
  });
}

function initSeriesScrollState() {
  document
    .querySelectorAll("[data-series-scroll-surface]")
    .forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const seriesKey = element.dataset.seriesKey;
      const surfaceKey = element.dataset.seriesScrollSurface;
      if (!seriesKey || !surfaceKey) return;

      restoreSeriesScrollPosition(element);

      if (element.dataset.seriesScrollInitialized === "true") return;
      element.dataset.seriesScrollInitialized = "true";

      let pendingFrame = 0;
      element.addEventListener(
        "scroll",
        () => {
          if (pendingFrame) return;

          pendingFrame = window.requestAnimationFrame(() => {
            pendingFrame = 0;
            const latestSeriesKey = element.dataset.seriesKey;
            const latestSurfaceKey = element.dataset.seriesScrollSurface;
            if (!latestSeriesKey || !latestSurfaceKey) return;

            writeSeriesScrollPosition(
              latestSeriesKey,
              latestSurfaceKey,
              element.scrollTop,
            );
          });
        },
        { passive: true },
      );
    });
}

function initMobileReadingNav() {
  document.querySelectorAll("[data-mobile-reading-nav]").forEach((nav) => {
    if (!(nav instanceof HTMLElement)) return;
    if (nav.dataset.initialized === "true") return;
    nav.dataset.initialized = "true";

    const triggers = Array.from(
      nav.querySelectorAll("[data-mobile-panel-trigger]"),
    ).filter((trigger): trigger is HTMLButtonElement => {
      return trigger instanceof HTMLButtonElement;
    });
    const panels = Array.from(
      nav.querySelectorAll("[data-mobile-panel]"),
    ).filter((panel): panel is HTMLElement => panel instanceof HTMLElement);

    const setActivePanel = (nextPanel: string | null) => {
      nav.dataset.activePanel = nextPanel ?? "";

      triggers.forEach((trigger) => {
        const isActive = trigger.dataset.mobilePanelTrigger === nextPanel;
        trigger.setAttribute("aria-expanded", String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.mobilePanel === nextPanel;
        panel.classList.toggle("is-active", isActive);
        if (isActive) restoreSeriesScrollPosition(panel);
        updateSideScrollFade(panel);
      });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const targetPanel = trigger.dataset.mobilePanelTrigger;
        if (!targetPanel) return;

        const nextPanel =
          nav.dataset.activePanel === targetPanel ? null : targetPanel;
        setActivePanel(nextPanel);
      });
    });

    setActivePanel(null);
  });
}

let activeTocObserver: IntersectionObserver | null = null;

function initTableOfContents() {
  activeTocObserver?.disconnect();
  // 滚动监听高亮
  // 观察正文中的标题元素
  activeTocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        if (!id) return;

        // 同时选中“顶部折叠目录”和“右侧悬浮目录”里的对应链接
        const links = document.querySelectorAll(
          `.toc-link[data-slug="${id}"]`,
        );

        if (entry.isIntersecting) {
          // 移除所有高亮
          document.querySelectorAll(".toc-link").forEach((l) => {
            l.classList.remove(
              "text-vermilion",
              "font-bold",
              "border-vermilion",
              "scale-105",
              "origin-left",
            );
            l.classList.add("border-transparent");
          });

          // 添加当前高亮
          links.forEach((link) => {
            link.classList.remove("border-transparent");
            link.classList.add(
              "text-vermilion",
              "font-bold",
              "border-vermilion",
              "scale-105",
              "origin-left",
            );
          });
        }
      });
    },
    { rootMargin: "-100px 0px -66% 0px" },
  );

  document.querySelectorAll("h2[id], h3[id]").forEach((h) => {
    activeTocObserver?.observe(h);
  });

  // 点击平滑滚动逻辑
  const links = document.querySelectorAll(".toc-link");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetHash = link.getAttribute("href");
      if (!targetHash || !targetHash.startsWith("#")) return;

      // 用 getElementById 避免 querySelector 对数字开头 id 的选择器兼容问题
      const rawId = decodeURIComponent(targetHash.slice(1));
      const targetElement = document.getElementById(rawId);

      if (targetElement) {
        // 使用 window.lenis
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(targetElement, {
            offset: -80,
            duration: 1.2,
          });
        } else {
          // 原生降级
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
        history.pushState(null, "", targetHash);
      }
    });
  });
}

export function initTechnicalReadingNavigation() {
  initSideScrollFades();
  initSeriesSectionState();
  initSeriesScrollState();
  initMobileReadingNav();
  initTableOfContents();
}
