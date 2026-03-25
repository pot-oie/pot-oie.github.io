type Point = { x: number; y: number };

type MenuOptions = {
  containerId: string;
  hoverDelay?: number;
  showTriangleGuide?: boolean;
};

type OptionCard = {
  title: string;
  desc: string;
};

const EXTRA_TAGS: string[] = [
  "新品首发",
  "口碑榜",
  "直播同款",
  "高性价比",
  "官方补贴",
  "以旧换新",
  "学生专享",
  "企业采购",
];

const EXTRA_CARDS: OptionCard[] = [
  { title: "百元以内好物", desc: "日常刚需高频购" },
  { title: "周末折扣专场", desc: "限时折扣实时更新" },
  { title: "人气热卖榜", desc: "近 7 天成交趋势" },
  { title: "新品体验区", desc: "新款抢先看" },
  { title: "品牌旗舰店", desc: "官方售后更放心" },
  { title: "跨店满减组合", desc: "凑单建议更省心" },
];

const clearActive = (items: NodeListOf<HTMLLIElement>): void => {
  items.forEach((item) => item.classList.remove("active"));
};

const getMenuItems = (container: HTMLDivElement): NodeListOf<HTMLLIElement> => {
  return container.querySelectorAll<HTMLLIElement>(".modern-main-menu li");
};

const appendExtraSubmenuOptions = (container: HTMLDivElement): void => {
  const subMenus = container.querySelectorAll<HTMLElement>(".modern-sub-menu");

  subMenus.forEach((subMenu) => {
    if (subMenu.dataset.enhanced === "true") return;

    const moreTagSection = document.createElement("div");
    moreTagSection.className = "sub-menu-section";

    const moreTagTitle = document.createElement("h5");
    moreTagTitle.textContent = "更多筛选";
    moreTagSection.appendChild(moreTagTitle);

    const tagWrap = document.createElement("div");
    tagWrap.className = "option-tags";

    EXTRA_TAGS.forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.className = "option-tag";
      tagEl.textContent = tag;
      tagWrap.appendChild(tagEl);
    });

    moreTagSection.appendChild(tagWrap);

    const moreCardSection = document.createElement("div");
    moreCardSection.className = "sub-menu-section";

    const moreCardTitle = document.createElement("h5");
    moreCardTitle.textContent = "精选清单";
    moreCardSection.appendChild(moreCardTitle);

    const cardGrid = document.createElement("div");
    cardGrid.className = "option-grid";

    EXTRA_CARDS.forEach((card) => {
      const cardEl = document.createElement("div");
      cardEl.className = "option-card";

      const titleEl = document.createElement("strong");
      titleEl.textContent = card.title;
      const descEl = document.createElement("span");
      descEl.textContent = card.desc;

      cardEl.appendChild(titleEl);
      cardEl.appendChild(descEl);
      cardGrid.appendChild(cardEl);
    });

    moreCardSection.appendChild(cardGrid);

    subMenu.appendChild(moreTagSection);
    subMenu.appendChild(moreCardSection);
    subMenu.dataset.enhanced = "true";
  });
};

const getLeftWidth = (container: HTMLDivElement): number => {
  const cssValue = window
    .getComputedStyle(container)
    .getPropertyValue("--menu-left-width")
    .trim();
  const parsed = Number.parseFloat(cssValue);

  return Number.isFinite(parsed) ? parsed : 220;
};

const updateContainerHeight = (
  container: HTMLDivElement,
  activeRow: HTMLLIElement | null,
): void => {
  const menuList = container.querySelector<HTMLElement>(".modern-main-menu");
  const menuHeight = menuList?.scrollHeight ?? 0;
  const activePanel = activeRow?.querySelector<HTMLElement>(".modern-sub-menu");
  const panelHeight = activePanel?.scrollHeight ?? 0;
  const nextHeight = Math.max(menuHeight, panelHeight, 280);

  container.style.height = `${nextHeight}px`;
};

export const initClickMenu = ({ containerId }: MenuOptions): void => {
  const container = document.getElementById(containerId) as HTMLDivElement | null;
  if (!container) return;

  appendExtraSubmenuOptions(container);

  const items = getMenuItems(container);
  let activeRow: HTMLLIElement | null = null;

  updateContainerHeight(container, activeRow);

  items.forEach((item) => {
    item.addEventListener("click", (event: MouseEvent) => {
      event.stopPropagation();
      clearActive(items);
      item.classList.add("active");
      activeRow = item;
      updateContainerHeight(container, activeRow);
    });
  });

  document.addEventListener("click", (event: MouseEvent) => {
    if (!container.contains(event.target as Node)) {
      clearActive(items);
      activeRow = null;
      updateContainerHeight(container, activeRow);
    }
  });

  window.addEventListener("resize", () => {
    updateContainerHeight(container, activeRow);
  });
};

export const initRawMenu = ({ containerId }: MenuOptions): void => {
  const container = document.getElementById(containerId) as HTMLDivElement | null;
  if (!container) return;

  appendExtraSubmenuOptions(container);

  const items = getMenuItems(container);
  let activeRow: HTMLLIElement | null = null;

  const activate = (row: HTMLLIElement): void => {
    if (activeRow) activeRow.classList.remove("active");
    row.classList.add("active");
    activeRow = row;
    updateContainerHeight(container, activeRow);
  };

  updateContainerHeight(container, activeRow);

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      activate(item);
    });
  });

  container.addEventListener("mouseleave", () => {
    if (activeRow) activeRow.classList.remove("active");
    activeRow = null;
    updateContainerHeight(container, activeRow);
  });

  window.addEventListener("resize", () => {
    updateContainerHeight(container, activeRow);
  });
};

export const initDelayMenu = ({
  containerId,
  hoverDelay = 260,
}: MenuOptions): void => {
  const container = document.getElementById(containerId) as HTMLDivElement | null;
  if (!container) return;

  appendExtraSubmenuOptions(container);

  const items = getMenuItems(container);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let activeRow: HTMLLIElement | null = null;

  const activate = (row: HTMLLIElement): void => {
    if (activeRow) activeRow.classList.remove("active");
    row.classList.add("active");
    activeRow = row;
    updateContainerHeight(container, activeRow);
  };

  updateContainerHeight(container, activeRow);

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        activate(item);
      }, hoverDelay);
    });

    item.addEventListener("mouseleave", () => {
      clearTimeout(timer);
    });
  });

  container.addEventListener("mouseleave", () => {
    clearTimeout(timer);
    if (activeRow) activeRow.classList.remove("active");
    activeRow = null;
    updateContainerHeight(container, activeRow);
  });

  window.addEventListener("resize", () => {
    updateContainerHeight(container, activeRow);
  });
};

const sign = (p1: Point, p2: Point, p3: Point): number => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

const isPointInTriangle = (
  pt: Point,
  v1: Point,
  v2: Point,
  v3: Point,
): boolean => {
  const d1 = sign(pt, v1, v2);
  const d2 = sign(pt, v2, v3);
  const d3 = sign(pt, v3, v1);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
};

export const initTriangleMenu = ({
  containerId,
  hoverDelay = 280,
  showTriangleGuide = false,
}: MenuOptions): void => {
  const container = document.getElementById(containerId) as HTMLDivElement | null;
  if (!container) return;

  appendExtraSubmenuOptions(container);

  const items = getMenuItems(container);
  let activeRow: HTMLLIElement | null = null;
  let mouseLocs: Point[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let movingToSubmenu = false;
  let guideLayer: SVGSVGElement | null = null;
  let guidePolygon: SVGPolygonElement | null = null;
  let guideLabel: HTMLDivElement | null = null;

  const hideGuide = (): void => {
    if (!showTriangleGuide || !guideLayer || !guideLabel) return;
    guideLayer.classList.remove("visible");
    guideLabel.classList.remove("visible");
  };

  const ensureGuide = (): void => {
    if (!showTriangleGuide || guideLayer) return;

    guideLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    guideLayer.classList.add("triangle-guide-layer");
    guideLayer.setAttribute("aria-hidden", "true");
    guideLayer.setAttribute("focusable", "false");

    guidePolygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    guidePolygon.classList.add("triangle-guide-polygon");
    guideLayer.appendChild(guidePolygon);

    guideLabel = document.createElement("div");
    guideLabel.classList.add("triangle-guide-label");
    guideLabel.textContent = "安全三角区";

    container.appendChild(guideLayer);
    container.appendChild(guideLabel);
  };

  const renderGuide = (
    anchor: Point,
    topLeft: Point,
    bottomLeft: Point,
    isVisible: boolean,
  ): void => {
    if (!showTriangleGuide) return;

    ensureGuide();
    if (!guideLayer || !guidePolygon || !guideLabel) return;

    const rect = container.getBoundingClientRect();
    const pageLeft = rect.left + window.scrollX;
    const pageTop = rect.top + window.scrollY;

    const a = { x: anchor.x - pageLeft, y: anchor.y - pageTop };
    const t = { x: topLeft.x - pageLeft, y: topLeft.y - pageTop };
    const b = { x: bottomLeft.x - pageLeft, y: bottomLeft.y - pageTop };

    guideLayer.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    guideLayer.setAttribute("width", `${rect.width}`);
    guideLayer.setAttribute("height", `${rect.height}`);
    guidePolygon.setAttribute("points", `${a.x},${a.y} ${t.x},${t.y} ${b.x},${b.y}`);

    guideLabel.style.left = `${Math.max(t.x + 10, getLeftWidth(container) + 10)}px`;
    guideLabel.style.top = `${Math.max(10, Math.min(a.y - 12, rect.height - 34))}px`;

    guideLayer.classList.toggle("visible", isVisible);
    guideLabel.classList.toggle("visible", isVisible);
  };

  const activate = (row: HTMLLIElement): void => {
    if (activeRow) activeRow.classList.remove("active");
    activeRow = row;
    activeRow.classList.add("active");
    updateContainerHeight(container, activeRow);
  };

  updateContainerHeight(container, activeRow);

  document.addEventListener("mousemove", (event: MouseEvent) => {
    mouseLocs.push({ x: event.pageX, y: event.pageY });
    if (mouseLocs.length > 2) mouseLocs.shift();

    if (!activeRow) {
      movingToSubmenu = false;
      hideGuide();
      return;
    }

    const prevLoc: Point = mouseLocs[0] ?? { x: event.pageX, y: event.pageY };
    const curLoc: Point = mouseLocs[1] ?? prevLoc;

    const containerRect = container.getBoundingClientRect();
    const submenuLeft = containerRect.left + getLeftWidth(container) + window.scrollX;

    const topLeft: Point = {
      x: submenuLeft,
      y: containerRect.top + window.scrollY,
    };
    const bottomLeft: Point = {
      x: submenuLeft,
      y: containerRect.bottom + window.scrollY,
    };

    movingToSubmenu = isPointInTriangle(curLoc, prevLoc, topLeft, bottomLeft);
    renderGuide(prevLoc, topLeft, bottomLeft, movingToSubmenu);
  });

  items.forEach((item) => {
    item.addEventListener("mouseenter", (event: MouseEvent) => {
      if (!activeRow) {
        activate(item);
        return;
      }

      if (item === activeRow) return;

      const containerRect = container.getBoundingClientRect();
      const submenuLeft = containerRect.left + getLeftWidth(container) + window.scrollX;

      const topLeft: Point = {
        x: submenuLeft,
        y: containerRect.top + window.scrollY,
      };
      const bottomLeft: Point = {
        x: submenuLeft,
        y: containerRect.bottom + window.scrollY,
      };

      const prevLoc: Point = mouseLocs[0] ?? { x: event.pageX, y: event.pageY };
      const curLoc: Point = { x: event.pageX, y: event.pageY };
      const nextInTriangle = isPointInTriangle(curLoc, prevLoc, topLeft, bottomLeft);

      if (movingToSubmenu || nextInTriangle) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (item.matches(":hover")) {
            activate(item);
          }
        }, hoverDelay);
      } else {
        clearTimeout(timeoutId);
        activate(item);
      }
    });
  });

  container.addEventListener("mouseleave", () => {
    clearTimeout(timeoutId);
    if (activeRow) activeRow.classList.remove("active");
    activeRow = null;
    movingToSubmenu = false;
    hideGuide();
    updateContainerHeight(container, activeRow);
  });

  window.addEventListener("resize", () => {
    hideGuide();
    updateContainerHeight(container, activeRow);
  });
};
