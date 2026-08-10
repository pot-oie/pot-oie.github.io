import { randomizeEditionMedia } from "./space/randomizeEditionMedia";

type Mode = "abstract" | "detail";
type Phase = "idle" | "covering" | "revealing";
type SpaceState = { mode: Mode; chapter: number; phase: Phase };
type HistoryMode = "push" | "replace" | "none";
type TransitionDirection = "lr" | "rl" | "bt" | "tb" | "diag-up" | "diag-down";
type ChapterRuntime = { id: string; name: string; summary: string; action: string; color: string; direction: TransitionDirection; rotation: number };

const TRAVEL: Record<TransitionDirection, [string, string, string]> = {
  lr: ["translate3d(-250vmax,-50%,0)", "translate3d(-50%,-50%,0)", "translate3d(150vmax,-50%,0)"],
  rl: ["translate3d(150vmax,-50%,0)", "translate3d(-50%,-50%,0)", "translate3d(-250vmax,-50%,0)"],
  bt: ["translate3d(-50%,150vmax,0)", "translate3d(-50%,-50%,0)", "translate3d(-50%,-250vmax,0)"],
  tb: ["translate3d(-50%,-250vmax,0)", "translate3d(-50%,-50%,0)", "translate3d(-50%,150vmax,0)"],
  "diag-up": ["translate3d(-190vmax,150vmax,0)", "translate3d(-50%,-50%,0)", "translate3d(150vmax,-190vmax,0)"],
  "diag-down": ["translate3d(150vmax,-190vmax,0)", "translate3d(-50%,-50%,0)", "translate3d(-190vmax,150vmax,0)"],
};

function parseHash(chapters: readonly ChapterRuntime[]): Omit<SpaceState, "phase"> {
  const raw = window.location.hash.slice(1);
  const detail = raw.endsWith("-detail");
  const id = detail ? raw.slice(0, -7) : raw;
  const chapter = chapters.findIndex((item) => item.id === id);
  return chapter < 0 ? { mode: "abstract", chapter: 0 } : { mode: detail ? "detail" : "abstract", chapter };
}

function waitFor(animation: Animation, timeout: number): Promise<void> {
  return Promise.race([
    animation.finished.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeout)),
  ]);
}

export function initializeSpaceEdition(): void {
  const rootElement = document.querySelector<HTMLElement>("[data-space-edition]");
  if (!rootElement || rootElement.dataset.initialized === "true") return;
  const root = rootElement;
  const views = [...root.querySelectorAll<HTMLElement>("[data-space-view]")];
  const rail = root.querySelector<HTMLOListElement>("[data-abstract-rail]");
  const abstractExhibition = root.querySelector<HTMLElement>("[data-abstract-exhibition]");
  const colophon = root.querySelector<HTMLElement>(".space-colophon");
  const skipControl = root.querySelector<HTMLElement>(".space-skip");
  const railSteps = [...root.querySelectorAll<HTMLElement>("[data-space-step]")];
  const plane = root.querySelector<HTMLElement>("[data-transition-plane]");
  const chrome = root.querySelector<HTMLElement>("[data-stage-chrome]");
  const positionLabel = root.querySelector<HTMLElement>("[data-chapter-position]");
  const nameLabel = root.querySelector<HTMLElement>("[data-chapter-name]");
  const detailKicker = root.querySelector<HTMLElement>("[data-detail-kicker]");
  const detailLabel = root.querySelector<HTMLElement>("[data-detail-label]");
  const openButton = root.querySelector<HTMLButtonElement>('[data-space-action="open"]');
  const liveStatus = root.querySelector<HTMLElement>("[data-space-status]");
  const previewAudio = root.querySelector<HTMLAudioElement>("[data-space-audio]");
  const skipLink = root.querySelector<HTMLAnchorElement>(".space-skip a");
  const chapterControls = [...root.querySelectorAll<HTMLButtonElement>('[data-space-action="chapter"]')];
  const controls = [...root.querySelectorAll<HTMLButtonElement>("button[data-space-action]")];
  if (views.length !== 10 || railSteps.length !== 5 || chapterControls.length !== 5 || !rail || !abstractExhibition || !colophon || !skipControl || !plane || !chrome || !positionLabel || !nameLabel || !detailKicker || !detailLabel || !openButton || !liveStatus || !previewAudio || !("IntersectionObserver" in window)) return;

  const chapters = chapterControls.map((control) => ({
    id: control.dataset.chapterId ?? "",
    name: control.dataset.chapterName ?? "",
    summary: control.dataset.chapterSummary ?? "",
    action: control.dataset.chapterAction ?? "",
    color: control.dataset.transitionColor ?? "",
    direction: control.dataset.transitionDirection as TransitionDirection,
    rotation: Number(control.dataset.transitionRotation),
  }));
  if (chapters.some((chapter) => !chapter.id || !chapter.name || !chapter.summary || !chapter.action || !chapter.color || !(chapter.direction in TRAVEL) || !Number.isFinite(chapter.rotation))) return;

  const transitionPlane = plane;
  const stageChrome = chrome;
  const chapterPosition = positionLabel;
  const chapterName = nameLabel;
  const detailActionKicker = detailKicker;
  const detailActionLabel = detailLabel;
  const openDetailButton = openButton;
  const statusRegion = liveStatus;
  const audioPlayer = previewAudio;
  const backgroundSurfaces = [skipControl, abstractExhibition, colophon];
  let state: SpaceState = { ...parseHash(chapters), phase: "idle" };
  let pendingEscape = false;
  let activeTrack = -1;
  let latestTarget: number | null = null;
  let observer: IntersectionObserver | null = null;
  let observerSuspended = false;
  let suppressObserver = false;
  let railScrollPosition = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const viewFor = (mode: Mode, chapter: number) => views.find((view) => view.dataset.spaceView === mode && Number(view.dataset.chapter) === chapter);
  const hashFor = (mode: Mode, chapter: number) => `#${chapters[chapter].id}${mode === "detail" ? "-detail" : ""}`;

  function setBackgroundInactive(inactive: boolean): void {
    for (const surface of backgroundSurfaces) {
      surface.inert = inactive;
      if (inactive) surface.setAttribute("aria-hidden", "true");
      else surface.removeAttribute("aria-hidden");
    }
  }

  function pauseAudio(resetSelection = false): void {
    audioPlayer.pause();
    root.querySelectorAll<HTMLElement>("[data-track-row]").forEach((row) => row.removeAttribute("data-playing"));
    root.querySelectorAll<HTMLButtonElement>("[data-track-play]").forEach((button) => {
      button.querySelector("span")!.textContent = "▶";
      button.setAttribute("aria-label", `播放 ${button.closest("[data-track-row]")?.querySelector(".track-info strong")?.textContent ?? "试听"}`);
    });
    if (resetSelection) activeTrack = -1;
  }

  function scrollToStep(chapter: number): void {
    suppressObserver = true;
    railSteps[chapter].scrollIntoView({ block: "start", behavior: "auto" });
    window.setTimeout(() => { suppressObserver = false; }, 80);
  }

  function suspendRail(): void {
    if (observerSuspended) return;
    railScrollPosition = window.scrollY;
    observerSuspended = true;
    observer?.disconnect();
    document.documentElement.style.overflow = "hidden";
  }

  function resumeRail(restorePosition = true): void {
    document.documentElement.style.overflow = "";
    if (restorePosition) window.scrollTo({ top: railScrollPosition, behavior: "auto" });
    observerSuspended = false;
    observeRail();
  }

  function render(nextState: Omit<SpaceState, "phase">, focus = true): void {
    state.mode = nextState.mode;
    state.chapter = nextState.chapter;
    for (const view of views) {
      const active = view.dataset.spaceView === state.mode && Number(view.dataset.chapter) === state.chapter;
      view.hidden = !active;
      view.inert = !active;
      view.setAttribute("aria-hidden", String(!active));
    }
    stageChrome.hidden = state.mode === "detail";
    setBackgroundInactive(state.mode === "detail");
    root.dataset.mode = state.mode;
    root.dataset.chapter = String(state.chapter);
    const chapter = chapters[state.chapter];
    chapterPosition.textContent = `${String(state.chapter + 1).padStart(2, "0")} / 05`;
    chapterName.textContent = chapter.name;
    detailActionKicker.textContent = `CONCRETE SPACE ${String(state.chapter + 1).padStart(2, "0")}`;
    detailActionLabel.textContent = chapter.action;
    if (skipLink) skipLink.href = hashFor("detail", state.chapter);
    root.querySelectorAll<HTMLButtonElement>('[data-space-action="chapter"]').forEach((button, index) => button.setAttribute("aria-current", index === state.chapter ? "page" : "false"));
    if (state.mode !== "detail" || state.chapter !== 2) pauseAudio();
    if (focus && state.mode === "detail") viewFor("detail", state.chapter)?.querySelector<HTMLElement>("h2, [data-space-action=close]")?.focus({ preventScroll: true });
  }

  function setBusy(busy: boolean): void {
    root.toggleAttribute("aria-busy", busy);
    controls.forEach((control) => { if (busy) control.disabled = true; });
    if (!busy) controls.forEach((control) => control.disabled = false);
  }

  async function transition(initialDestination: Omit<SpaceState, "phase">, historyMode: HistoryMode, options: { alignRail?: boolean; restoreFocus?: boolean } = {}): Promise<void> {
    if (state.phase !== "idle" || (state.mode === initialDestination.mode && state.chapter === initialDestination.chapter)) return;
    const oldMode = state.mode;
    const oldView = viewFor(state.mode, state.chapter);
    if (!oldView) return;
    let destination = initialDestination;
    if (destination.mode === "detail" && oldMode === "abstract") suspendRail();
    state.phase = "covering";
    setBusy(true);
    try {
      let preset = chapters[destination.chapter];
      if (reducedMotion.matches) {
        await waitFor(oldView.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 80, fill: "forwards" }), 180);
      } else {
        const travel = TRAVEL[destination.mode === "detail" && preset.direction === "diag-up" ? "diag-down" : preset.direction];
        const rotate = ` rotate(${preset.rotation}deg)`;
        transitionPlane.style.backgroundColor = preset.color;
        transitionPlane.style.transform = travel[0] + rotate;
        transitionPlane.hidden = false;
        oldView.animate([{ opacity: 1, transform: "translate3d(0,0,0)" }, { opacity: 0.7, transform: "translate3d(-8px,0,0)" }], { duration: 280, fill: "forwards", easing: "cubic-bezier(.55,.05,.75,.45)" });
        await waitFor(transitionPlane.animate([{ transform: travel[0] + rotate }, { transform: travel[1] + rotate }], { duration: 280, fill: "forwards", easing: "cubic-bezier(.55,.05,.75,.45)" }), 380);
      }

      if (destination.mode === "abstract" && latestTarget !== null) destination = { mode: "abstract", chapter: latestTarget };
      latestTarget = null;
      preset = chapters[destination.chapter];
      if (options.alignRail && destination.mode === "abstract") scrollToStep(destination.chapter);
      if (oldMode === "detail" && destination.mode === "abstract") resumeRail(true);
      if (historyMode === "push") history.pushState({ space: true, detailEntry: true }, "", hashFor(destination.mode, destination.chapter));
      if (historyMode === "replace") history.replaceState({ space: true }, "", hashFor(destination.mode, destination.chapter));
      render(destination, false);
      const newView = viewFor(destination.mode, destination.chapter)!;
      state.phase = "revealing";

      if (reducedMotion.matches) {
        newView.style.opacity = "0";
        await waitFor(newView.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: "forwards" }), 220);
      } else {
        const travel = TRAVEL[destination.mode === "detail" && preset.direction === "diag-up" ? "diag-down" : preset.direction];
        const rotate = ` rotate(${preset.rotation}deg)`;
        newView.animate([{ opacity: 0.75, transform: "translate3d(8px,0,0)" }, { opacity: 1, transform: "translate3d(0,0,0)" }], { duration: 320, fill: "forwards", easing: "cubic-bezier(.2,.7,.25,1)" });
        await waitFor(transitionPlane.animate([{ transform: travel[1] + rotate }, { transform: travel[2] + rotate }], { duration: 320, fill: "forwards", easing: "cubic-bezier(.2,.7,.25,1)" }), 420);
      }

      if (destination.mode === "detail") newView.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
      if (options.restoreFocus) openDetailButton.focus({ preventScroll: true });
      statusRegion.textContent = destination.mode === "detail" ? `${preset.name} 具象空间已打开` : `${preset.name}，${preset.summary}`;
    } finally {
      transitionPlane.hidden = true;
      transitionPlane.getAnimations().forEach((animation) => animation.cancel());
      views.forEach((view) => { view.style.opacity = ""; view.style.transform = ""; view.getAnimations().forEach((animation) => animation.cancel()); });
      state.phase = "idle";
      setBusy(false);
      if (pendingEscape && state.mode === "detail") {
        pendingEscape = false;
        void closeDetail();
      } else {
        pendingEscape = false;
        const target = latestTarget;
        latestTarget = null;
        if (state.mode === "abstract" && target !== null && target !== state.chapter) void transition({ mode: "abstract", chapter: target }, "replace");
      }
    }
  }

  function observeRail(): void {
    if (observerSuspended) return;
    observer?.disconnect();
    observer = new IntersectionObserver((entries) => {
      if (observerSuspended || suppressObserver || state.mode !== "abstract") return;
      const candidate = entries.filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.56).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!candidate) return;
      const chapter = Number((candidate.target as HTMLElement).dataset.spaceStep);
      if (!Number.isInteger(chapter) || chapter === state.chapter) return;
      latestTarget = chapter;
      if (state.phase === "idle") {
        const target = latestTarget;
        latestTarget = null;
        void transition({ mode: "abstract", chapter: target }, "replace");
      }
    }, { threshold: [0, 0.56, 1] });
    railSteps.forEach((step) => observer?.observe(step));
  }

  function requestChapter(chapter: number): void {
    if (state.mode !== "abstract" || chapter < 0 || chapter >= chapters.length || chapter === state.chapter) return;
    latestTarget = chapter;
    if (state.phase === "idle") {
      latestTarget = null;
      void transition({ mode: "abstract", chapter }, "replace", { alignRail: true });
    }
  }

  function closeDetail(): Promise<void> | void {
    if (state.mode !== "detail") return;
    if (state.phase !== "idle") { pendingEscape = true; return; }
    if (history.state?.detailEntry) { history.back(); return; }
    return transition({ mode: "abstract", chapter: state.chapter }, "replace", { restoreFocus: true });
  }

  function revisitFirstChapter(): void {
    if (state.mode !== "abstract" || state.phase !== "idle") return;
    latestTarget = null;
    scrollToStep(0);
    render({ mode: "abstract", chapter: 0 }, false);
    history.replaceState({ space: true }, "", hashFor("abstract", 0));
    viewFor("abstract", 0)?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    statusRegion.textContent = "LEARNING，展览从第一幕重新开始";
  }

  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    const action = button.dataset.spaceAction;
    if (action === "chapter") requestChapter(Number(button.dataset.targetChapter));
    if (action === "open" && state.mode === "abstract" && state.phase === "idle") void transition({ mode: "detail", chapter: state.chapter }, "push");
    if (action === "close") void closeDetail();
    if (action === "revisit") revisitFirstChapter();
  });

  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-track-play]");
    if (!button || state.phase !== "idle") return;
    const index = Number(button.dataset.trackPlay);
    if (activeTrack === index && !audioPlayer.paused) { pauseAudio(); return; }
    pauseAudio();
    activeTrack = index;
    audioPlayer.src = button.dataset.preview ?? "";
    const row = root.querySelector<HTMLElement>(`[data-track-row="${index}"]`);
    void audioPlayer.play().then(() => {
      row?.setAttribute("data-playing", "true");
      button.querySelector("span")!.textContent = "Ⅱ";
      button.setAttribute("aria-label", `暂停 ${row?.querySelector("strong")?.textContent ?? "试听"}`);
    }).catch(() => {
      button.disabled = true;
      button.setAttribute("aria-label", "试听暂不可用");
      button.querySelector("span")!.textContent = "×";
    });
  });

  audioPlayer.addEventListener("ended", () => pauseAudio());
  audioPlayer.addEventListener("error", () => pauseAudio());
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseAudio(); });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.mode === "detail") { event.preventDefault(); void closeDetail(); }
    if (state.mode !== "abstract") return;
    if (event.key === "ArrowLeft") { event.preventDefault(); requestChapter(state.chapter - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); requestChapter(state.chapter + 1); }
  });
  window.addEventListener("popstate", () => {
    const destination = parseHash(chapters);
    if (destination.mode === "detail" && state.mode === "abstract") suspendRail();
    void transition(destination, "none", { alignRail: destination.mode === "abstract" && state.mode === "abstract", restoreFocus: destination.mode === "abstract" });
  });
  window.addEventListener("hashchange", () => {
    const destination = parseHash(chapters);
    if (window.location.hash !== hashFor(destination.mode, destination.chapter)) history.replaceState({ space: true }, "", hashFor(destination.mode, destination.chapter));
    if (destination.mode === "detail" && state.mode === "abstract") suspendRail();
    void transition(destination, "none", { alignRail: destination.mode === "abstract" && state.mode === "abstract", restoreFocus: destination.mode === "abstract" });
  });

  try {
    root.dataset.initialized = "true";
    randomizeEditionMedia(root);
    rail.hidden = false;
    root.dataset.enhanced = "true";
    const initial = parseHash(chapters);
    scrollToStep(initial.chapter);
    railScrollPosition = window.scrollY;
    render(initial, false);
    history.replaceState({ space: true }, "", hashFor(initial.mode, initial.chapter));
    if (initial.mode === "detail") suspendRail(); else observeRail();
  } catch {
    delete root.dataset.enhanced;
    document.documentElement.style.overflow = "";
    const activeObserver = observer as IntersectionObserver | null;
    activeObserver?.disconnect();
    rail.hidden = true;
    setBackgroundInactive(false);
    views.forEach((view) => { view.hidden = false; view.inert = false; view.removeAttribute("aria-hidden"); });
  }
}
