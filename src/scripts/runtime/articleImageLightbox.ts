type ArticleImageLightboxWindow = Window & {
  __potImageLightboxInstalled?: boolean;
  __potImageLightbox?: {
    close: () => void;
    handleWheel: (event: WheelEvent) => void;
    navigate: (delta: number) => void;
    zoomBy: (delta: number) => void;
    resetZoom: () => void;
  };
};

export function initArticleImageLightbox(): void {
  const lightboxWindow = window as ArticleImageLightboxWindow;
  const overlayId = "article-image-lightbox";
  const minScale = 1;
  const maxScale = 5;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTranslateX = 0;
  let dragStartTranslateY = 0;
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let pinchStartMidX = 0;
  let pinchStartMidY = 0;
  let pinchStartTranslateX = 0;
  let pinchStartTranslateY = 0;
  let lastTapAt = 0;
  let hasMoved = false;
  let activeImage: HTMLImageElement | null = null;
  let activeTriggerImage: HTMLImageElement | null = null;
  let activeIndex = -1;
  let imageLoadToken = 0;
  let lightboxItems: HTMLImageElement[] = [];
  const activePointers = new Map<number, { x: number; y: number }>();

  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

  const getDistance = (
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): number => Math.hypot(a.x - b.x, a.y - b.y);

  const getMidpoint = (
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): { x: number; y: number } => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const clampTranslate = (): void => {
    if (!activeImage || scale <= minScale) {
      translateX = 0;
      translateY = 0;
      return;
    }

    const maxX = (activeImage.clientWidth * (scale - 1)) / 2 + 80;
    const maxY = (activeImage.clientHeight * (scale - 1)) / 2 + 80;
    translateX = clamp(translateX, -maxX, maxX);
    translateY = clamp(translateY, -maxY, maxY);
  };

  const applyImageTransform = (withTransition = false): void => {
    if (!activeImage) return;

    clampTranslate();
    activeImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    activeImage.classList.toggle("is-zoomed", scale > 1.01);
    activeImage.classList.toggle("is-transforming", !withTransition);
    updateControls();
  };

  const resetImageTransform = (): void => {
    scale = minScale;
    translateX = 0;
    translateY = 0;
    activePointers.clear();

    if (!activeImage) return;
    activeImage.style.transform = "";
    activeImage.classList.remove("is-zoomed", "is-transforming");
    updateControls();
  };

  const zoomTo = (
    nextScale: number,
    centerX?: number,
    centerY?: number,
    withTransition = false,
  ): void => {
    if (!activeImage) return;

    const previousScale = scale;
    scale = clamp(nextScale, minScale, maxScale);

    if (
      typeof centerX === "number" &&
      typeof centerY === "number" &&
      previousScale > 0
    ) {
      const rect = activeImage.getBoundingClientRect();
      const imageCenterX = rect.left + rect.width / 2;
      const imageCenterY = rect.top + rect.height / 2;
      const scaleRatio = scale / previousScale;
      translateX -= (centerX - imageCenterX) * (scaleRatio - 1);
      translateY -= (centerY - imageCenterY) * (scaleRatio - 1);
    }

    if (scale <= minScale + 0.01) {
      scale = minScale;
      translateX = 0;
      translateY = 0;
    }

    applyImageTransform(withTransition);
  };

  const isLightboxImage = (img: HTMLImageElement): boolean =>
    !img.closest(".not-prose") && !img.closest("a");

  const refreshLightboxItems = (): void => {
    lightboxItems = Array.from(
      document.querySelectorAll<HTMLImageElement>(".prose-ink img"),
    ).filter(isLightboxImage);
  };

  const updateControls = (): void => {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;

    overlay.classList.toggle("has-multiple", lightboxItems.length > 1);

    overlay
      .querySelectorAll<HTMLButtonElement>(
        "[data-lightbox-action='prev'], [data-lightbox-action='next']",
      )
      .forEach((button) => {
        button.disabled = lightboxItems.length <= 1;
      });

    const zoomOut = overlay.querySelector<HTMLButtonElement>(
      "[data-lightbox-action='zoom-out']",
    );
    const zoomReset = overlay.querySelector<HTMLButtonElement>(
      "[data-lightbox-action='zoom-reset']",
    );
    const zoomIn = overlay.querySelector<HTMLButtonElement>(
      "[data-lightbox-action='zoom-in']",
    );

    if (zoomOut) zoomOut.disabled = scale <= minScale + 0.01;
    if (zoomReset) zoomReset.disabled = scale <= minScale + 0.01;
    if (zoomIn) zoomIn.disabled = scale >= maxScale - 0.01;
  };

  const ensureOverlay = (): HTMLElement => {
    const existing = document.getElementById(overlayId);
    if (existing) return existing;

    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.className = "article-image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    overlay.innerHTML = `
      <div class="article-image-lightbox__topbar" aria-label="大图工具">
        <button class="article-image-lightbox__tool" type="button" data-lightbox-action="zoom-out" aria-label="缩小" title="缩小"><span aria-hidden="true">−</span></button>
        <button class="article-image-lightbox__tool" type="button" data-lightbox-action="zoom-reset" aria-label="重置缩放" title="重置缩放"><span aria-hidden="true">1:1</span></button>
        <button class="article-image-lightbox__tool" type="button" data-lightbox-action="zoom-in" aria-label="放大" title="放大"><span aria-hidden="true">+</span></button>
        <a class="article-image-lightbox__tool article-image-lightbox__original" data-lightbox-action="original" href="#" target="_blank" rel="noopener noreferrer" aria-label="打开原图" title="打开原图"><span aria-hidden="true">原图</span></a>
      </div>
      <button class="article-image-lightbox__close" type="button" aria-label="关闭大图"><span aria-hidden="true">×</span></button>
      <button class="article-image-lightbox__nav article-image-lightbox__nav--prev" type="button" data-lightbox-action="prev" aria-label="上一张" title="上一张"><span aria-hidden="true">‹</span></button>
      <button class="article-image-lightbox__nav article-image-lightbox__nav--next" type="button" data-lightbox-action="next" aria-label="下一张" title="下一张"><span aria-hidden="true">›</span></button>
      <div class="article-image-lightbox__status" role="status" aria-live="polite" hidden>图片加载中</div>
      <figure class="article-image-lightbox__figure">
        <img class="article-image-lightbox__image" alt="" />
        <figcaption class="article-image-lightbox__caption"></figcaption>
      </figure>
    `;
    document.body.append(overlay);
    return overlay;
  };

  const closeLightbox = (): void => {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    if (!overlay.classList.contains("is-open")) return;

    resetImageTransform();
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    document.documentElement.classList.remove("article-lightbox-open");
    (window as any).lenis?.start?.();

    if (
      activeTriggerImage &&
      document.contains(activeTriggerImage) &&
      typeof activeTriggerImage.focus === "function"
    ) {
      activeTriggerImage.focus({ preventScroll: true });
    }
    activeTriggerImage = null;
  };

  const setLightboxImage = (
    overlay: HTMLElement,
    img: HTMLImageElement,
  ): void => {
    const overlayImage = overlay.querySelector<HTMLImageElement>(
      ".article-image-lightbox__image",
    );
    const caption = overlay.querySelector<HTMLElement>(
      ".article-image-lightbox__caption",
    );
    const originalLink = overlay.querySelector<HTMLAnchorElement>(
      "[data-lightbox-action='original']",
    );
    const status = overlay.querySelector<HTMLElement>(
      ".article-image-lightbox__status",
    );

    if (!overlayImage || !caption) return;

    const src = img.currentSrc || img.src;
    const alt = img.alt || "";
    const loadToken = imageLoadToken + 1;
    imageLoadToken = loadToken;

    activeImage = overlayImage;
    activeTriggerImage = img;
    activeIndex = lightboxItems.indexOf(img);
    resetImageTransform();
    installImageGestureListeners(overlayImage);

    overlay.classList.add("is-loading");
    overlay.classList.remove("has-load-error");
    if (status) {
      status.textContent = "图片加载中";
      status.hidden = false;
    }

    overlayImage.onload = (): void => {
      if (imageLoadToken !== loadToken) return;
      overlay.classList.remove("is-loading");
      if (status) status.hidden = true;
    };
    overlayImage.onerror = (): void => {
      if (imageLoadToken !== loadToken) return;
      overlay.classList.remove("is-loading");
      overlay.classList.add("has-load-error");
      if (status) {
        status.textContent = "图片加载失败";
        status.hidden = false;
      }
    };

    overlayImage.src = src;
    overlayImage.alt = alt;
    caption.textContent = alt;
    caption.hidden = alt.trim().length === 0;
    if (originalLink) originalLink.href = src;

    if (overlayImage.complete && overlayImage.naturalWidth > 0) {
      requestAnimationFrame(() => overlayImage.onload?.(new Event("load")));
    }

    updateControls();
  };

  const openLightbox = (img: HTMLImageElement): void => {
    const overlay = ensureOverlay();

    refreshLightboxItems();
    setLightboxImage(overlay, img);

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.removeAttribute("inert");
    document.documentElement.classList.add("article-lightbox-open");
    (window as any).lenis?.stop?.();

    overlay
      .querySelector<HTMLButtonElement>(".article-image-lightbox__close")
      ?.focus();
  };

  const navigateLightbox = (delta: number): void => {
    const overlay = document.getElementById(overlayId);
    if (!overlay?.classList.contains("is-open")) return;
    if (lightboxItems.length <= 1) return;

    const nextIndex =
      (activeIndex + delta + lightboxItems.length) % lightboxItems.length;
    const nextImage = lightboxItems[nextIndex];
    if (nextImage) setLightboxImage(overlay, nextImage);
  };

  const zoomBy = (delta: number): void => {
    if (!activeImage) return;
    const rect = activeImage.getBoundingClientRect();
    zoomTo(
      scale + delta,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      true,
    );
  };

  const resetZoom = (): void => {
    zoomTo(minScale, undefined, undefined, true);
  };

  const getActivePointerList = (): { x: number; y: number }[] =>
    Array.from(activePointers.values());

  const startPinch = (): void => {
    const pointers = getActivePointerList();
    if (pointers.length < 2) return;

    pinchStartDistance = getDistance(pointers[0], pointers[1]);
    pinchStartScale = scale;
    const midpoint = getMidpoint(pointers[0], pointers[1]);
    pinchStartMidX = midpoint.x;
    pinchStartMidY = midpoint.y;
    pinchStartTranslateX = translateX;
    pinchStartTranslateY = translateY;
  };

  const installImageGestureListeners = (
    overlayImage: HTMLImageElement,
  ): void => {
    if (overlayImage.dataset.gesturesInstalled === "true") return;

    overlayImage.addEventListener("pointerdown", (event: PointerEvent) => {
      activeImage = overlayImage;
      hasMoved = false;
      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      overlayImage.setPointerCapture(event.pointerId);

      if (activePointers.size >= 2) {
        startPinch();
        return;
      }

      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartTranslateX = translateX;
      dragStartTranslateY = translateY;
    });

    overlayImage.addEventListener("pointermove", (event: PointerEvent) => {
      if (!activePointers.has(event.pointerId)) return;

      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (activePointers.size >= 2) {
        event.preventDefault();
        hasMoved = true;
        const pointers = getActivePointerList();
        const nextDistance = getDistance(pointers[0], pointers[1]);
        const midpoint = getMidpoint(pointers[0], pointers[1]);

        if (pinchStartDistance > 0) {
          scale = clamp(
            pinchStartScale * (nextDistance / pinchStartDistance),
            minScale,
            maxScale,
          );
          translateX =
            pinchStartTranslateX + (midpoint.x - pinchStartMidX);
          translateY =
            pinchStartTranslateY + (midpoint.y - pinchStartMidY);
          applyImageTransform(false);
        }
        return;
      }

      const dx = event.clientX - dragStartX;
      const dy = event.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

      if (scale > minScale) {
        event.preventDefault();
        translateX = dragStartTranslateX + dx;
        translateY = dragStartTranslateY + dy;
        applyImageTransform(false);
      }
    });

    const releasePointer = (event: PointerEvent): void => {
      activePointers.delete(event.pointerId);

      if (activePointers.size >= 2) {
        startPinch();
        return;
      }

      const pointers = getActivePointerList();
      if (pointers.length === 1) {
        dragStartX = pointers[0].x;
        dragStartY = pointers[0].y;
        dragStartTranslateX = translateX;
        dragStartTranslateY = translateY;
      }

      if (
        event.pointerType === "touch" &&
        !hasMoved &&
        Date.now() - lastTapAt < 280
      ) {
        zoomTo(
          scale > minScale ? minScale : 2.5,
          event.clientX,
          event.clientY,
          true,
        );
        lastTapAt = 0;
        return;
      }

      if (event.pointerType === "touch" && !hasMoved) {
        lastTapAt = Date.now();
      }

      applyImageTransform(true);
    };

    overlayImage.addEventListener("pointerup", releasePointer);
    overlayImage.addEventListener("pointercancel", releasePointer);
    overlayImage.addEventListener("lostpointercapture", releasePointer);

    overlayImage.addEventListener("dblclick", (event: MouseEvent) => {
      event.preventDefault();
      zoomTo(
        scale > minScale ? minScale : 2.5,
        event.clientX,
        event.clientY,
        true,
      );
    });

    overlayImage.dataset.gesturesInstalled = "true";
  };

  const handleWheel = (event: WheelEvent): void => {
    const overlay = document.getElementById(overlayId);
    if (!overlay?.classList.contains("is-open") || !activeImage) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target?.closest(".article-image-lightbox")) return;

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.18 : 0.18;
      zoomTo(scale * (1 + delta), event.clientX, event.clientY, false);
      return;
    }

    if (scale > minScale) {
      event.preventDefault();
      translateX -= event.deltaX;
      translateY -= event.deltaY;
      applyImageTransform(false);
    }
  };

  const installGlobalListeners = (): void => {
    if (lightboxWindow.__potImageLightboxInstalled) return;

    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const overlay = target?.closest<HTMLElement>(
        ".article-image-lightbox",
      );
      if (!overlay) return;

      const action = target?.closest<HTMLElement>(
        "[data-lightbox-action]",
      );
      if (action) {
        const actionName = action.dataset.lightboxAction;
        if (actionName === "original") return;

        event.preventDefault();
        if (actionName === "prev") {
          lightboxWindow.__potImageLightbox?.navigate(-1);
        } else if (actionName === "next") {
          lightboxWindow.__potImageLightbox?.navigate(1);
        } else if (actionName === "zoom-out") {
          lightboxWindow.__potImageLightbox?.zoomBy(-0.5);
        } else if (actionName === "zoom-in") {
          lightboxWindow.__potImageLightbox?.zoomBy(0.5);
        } else if (actionName === "zoom-reset") {
          lightboxWindow.__potImageLightbox?.resetZoom();
        }
        return;
      }

      if (
        target?.closest(".article-image-lightbox__close") ||
        target === overlay
      ) {
        lightboxWindow.__potImageLightbox?.close();
      }
    });

    document.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        lightboxWindow.__potImageLightbox?.handleWheel(event);
      },
      { passive: false },
    );

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      const overlay = document.getElementById(overlayId);
      const isOpen = overlay?.classList.contains("is-open") ?? false;
      if (!isOpen) return;

      if (event.key === "Escape") {
        lightboxWindow.__potImageLightbox?.close();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        lightboxWindow.__potImageLightbox?.navigate(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        lightboxWindow.__potImageLightbox?.navigate(1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        lightboxWindow.__potImageLightbox?.zoomBy(0.5);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        lightboxWindow.__potImageLightbox?.zoomBy(-0.5);
      } else if (event.key === "0") {
        event.preventDefault();
        lightboxWindow.__potImageLightbox?.resetZoom();
      }
    });

    document.addEventListener("astro:before-swap", () => {
      lightboxWindow.__potImageLightbox?.close();
    });
    lightboxWindow.__potImageLightboxInstalled = true;
  };

  lightboxWindow.__potImageLightbox = {
    close: closeLightbox,
    handleWheel,
    navigate: navigateLightbox,
    zoomBy,
    resetZoom,
  };
  installGlobalListeners();

  document
    .querySelectorAll<HTMLImageElement>(".prose-ink img")
    .forEach((img) => {
      if (img.dataset.lightboxInstalled === "true") return;
      if (!isLightboxImage(img)) return;

      img.dataset.lightboxEnabled = "true";
      img.dataset.lightboxInstalled = "true";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute(
        "aria-label",
        img.alt ? `查看大图：${img.alt}` : "查看大图",
      );

      img.addEventListener("click", () => openLightbox(img));
      img.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openLightbox(img);
      });
    });
}
