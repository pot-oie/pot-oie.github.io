export function initMathScrollHints(): void {
  const installDragScroll = (el: HTMLElement): void => {
    if (el.dataset.dragScrollInstalled === "true") return;

    let isPointerDown = false;
    let hasDragged = false;
    let startX = 0;
    let startScrollLeft = 0;

    const stopDrag = (): void => {
      isPointerDown = false;
      hasDragged = false;
      el.classList.remove("math-dragging");
    };

    el.addEventListener("pointerdown", (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;

      isPointerDown = true;
      hasDragged = false;
      startX = event.clientX;
      startScrollLeft = el.scrollLeft;
      el.setPointerCapture(event.pointerId);
    });

    el.addEventListener("pointermove", (event: PointerEvent) => {
      if (!isPointerDown || event.pointerType !== "mouse") return;

      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) > 3) {
        hasDragged = true;
        el.classList.add("math-dragging");
      }

      if (hasDragged) {
        el.scrollLeft = startScrollLeft - deltaX;
        event.preventDefault();
      }
    });

    el.addEventListener("pointerup", stopDrag);
    el.addEventListener("pointercancel", stopDrag);
    el.addEventListener("lostpointercapture", stopDrag);

    el.dataset.dragScrollInstalled = "true";
  };

  const updateHints = (): void => {
    const containers =
      document.querySelectorAll<HTMLElement>(".prose-ink .katex-display");

    containers.forEach((el: HTMLElement) => {
      const isScrollable: boolean = el.scrollWidth > el.clientWidth + 5;
      const isAtEnd: boolean =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;

      el.classList.toggle("math-scrollable", isScrollable);
      el.classList.toggle("math-scroll-end", isScrollable && isAtEnd);

      if (!isScrollable) {
        el.dataset.hasHint = "false";
        if (
          el.nextElementSibling?.classList.contains("scroll-hint-tail")
        ) {
          el.nextElementSibling.remove();
        }
        return;
      }

      installDragScroll(el);

      if (el.dataset.hasHint === "true") return;

      const hint: HTMLDivElement = document.createElement("div");
      hint.className = "scroll-hint-tail";
      hint.innerHTML = `
        <span class="arrow">←</span>
        <span>滑动查看</span>
        <span class="arrow">→</span>
      `;

      el.dataset.hasHint = "true";
      el.after(hint);

      el.addEventListener(
        "scroll",
        () => {
          const atEnd =
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
          el.classList.toggle("math-scroll-end", atEnd);
        },
        { passive: true },
      );
    });
  };

  requestAnimationFrame(updateHints);
  window.setTimeout(updateHints, 250);
  document.fonts?.ready.then(updateHints).catch(() => {});
}
