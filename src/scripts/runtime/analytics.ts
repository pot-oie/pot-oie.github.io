export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "article_read",
  "search_success",
  "search_no_results",
  "search_error",
  "music_play",
  "watch_interaction",
  "not_found",
  "client_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export interface AnalyticsMetricInput {
  event: string;
  path?: unknown;
  query?: unknown;
  durationMs?: unknown;
  resultCount?: unknown;
  depth?: unknown;
  value?: unknown;
}

export interface NormalizedAnalyticsEvent {
  event: AnalyticsEventName;
  path: string;
  session: string;
  query?: string;
  durationMs?: number;
  resultCount?: number;
  depth?: 25 | 50 | 75 | 100;
  value?: string;
}

interface AnalyticsState {
  installed: boolean;
  sessionId: string;
  lastPagePath: string | null;
  activeArticlePath: string | null;
  articleDepths: Set<number>;
  sentAt: number[];
  clientErrorCount: number;
  scrollFrame: number | null;
}

type AnalyticsWindow = Window & {
  __potAnalytics?: AnalyticsState;
};

const METRICS_ENDPOINT = "/__metrics";
const SESSION_STORAGE_KEY = "pot-analytics-session-v1";
const DEBUG_STORAGE_KEY = "pot-search-debug";
const DASHBOARD_PATH = "/dashboard";
const MAX_EVENTS_PER_MINUTE = 20;
const MAX_CLIENT_ERRORS_PER_SESSION = 5;
const ARTICLE_DEPTHS = [25, 50, 75, 100] as const;
const EVENT_NAMES = new Set<string>(ANALYTICS_EVENT_NAMES);
const CLIENT_ERROR_NAMES = new Set([
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "AggregateError",
]);

export function normalizeMetricPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    const url = new URL(value, "https://passpot.invalid");
    let path = url.pathname || "/";
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (
      path.length > 256 ||
      !path.startsWith("/") ||
      /[\u0000-\u001f\u007f]/.test(path)
    ) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}

export function normalizeSearchQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 64);
  return normalized || null;
}

function normalizeSession(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length < 16 ||
    value.length > 64 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    return null;
  }
  return value;
}

function normalizeInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number | undefined {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    return undefined;
  }
  return parsed;
}

function normalizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 64);
  return normalized || undefined;
}

export function getSearchOutcomeEvent(
  resultCount: number,
): "search_success" | "search_no_results" {
  return resultCount > 0 ? "search_success" : "search_no_results";
}

export function shouldTrackPageView(
  previousPath: string | null,
  nextPath: string,
): boolean {
  return previousPath !== nextPath;
}

export function normalizeAnalyticsEvent(
  input: AnalyticsMetricInput,
  context: { path: unknown; session: unknown },
): NormalizedAnalyticsEvent | null {
  if (!EVENT_NAMES.has(input.event)) return null;

  const event = input.event as AnalyticsEventName;
  const path = normalizeMetricPath(input.path ?? context.path);
  const session = normalizeSession(context.session);
  if (!path || !session || path === DASHBOARD_PATH) return null;

  const normalized: NormalizedAnalyticsEvent = { event, path, session };

  if (event === "article_read") {
    const depth = normalizeInteger(input.depth, 25, 100);
    if (!ARTICLE_DEPTHS.includes(depth as (typeof ARTICLE_DEPTHS)[number])) {
      return null;
    }
    normalized.depth = depth as 25 | 50 | 75 | 100;
  }

  if (event === "search_success" || event === "search_no_results") {
    normalized.durationMs = normalizeInteger(input.durationMs, 0, 120_000);
    normalized.resultCount = normalizeInteger(input.resultCount, 0, 10_000);
  }

  if (event === "search_no_results") {
    const query = normalizeSearchQuery(input.query);
    if (!query) return null;
    normalized.query = query;
    normalized.resultCount = 0;
  }

  if (
    event === "search_error" ||
    event === "music_play" ||
    event === "watch_interaction" ||
    event === "client_error" ||
    event === "page_view"
  ) {
    normalized.value = normalizeValue(input.value);
  }

  return normalized;
}

function createSessionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function getSessionId(): string {
  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.__potAnalytics?.sessionId) {
    return analyticsWindow.__potAnalytics.sessionId;
  }

  try {
    const existing = normalizeSession(
      window.sessionStorage.getItem(SESSION_STORAGE_KEY),
    );
    if (existing) return existing;

    const created = createSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return createSessionId();
  }
}

function getState(): AnalyticsState {
  const analyticsWindow = window as AnalyticsWindow;
  if (!analyticsWindow.__potAnalytics) {
    analyticsWindow.__potAnalytics = {
      installed: false,
      sessionId: getSessionId(),
      lastPagePath: null,
      activeArticlePath: null,
      articleDepths: new Set(),
      sentAt: [],
      clientErrorCount: 0,
      scrollFrame: null,
    };
  }
  return analyticsWindow.__potAnalytics;
}

function isWithinClientRateLimit(state: AnalyticsState): boolean {
  const now = Date.now();
  state.sentAt = state.sentAt.filter((timestamp) => now - timestamp < 60_000);
  if (state.sentAt.length >= MAX_EVENTS_PER_MINUTE) return false;
  state.sentAt.push(now);
  return true;
}

function buildMetricsUrl(metric: NormalizedAnalyticsEvent): string {
  const params = new URLSearchParams({
    event: metric.event,
    path: metric.path,
    session: metric.session,
  });

  if (metric.query) params.set("query", metric.query);
  if (metric.durationMs != null) {
    params.set("duration_ms", String(metric.durationMs));
  }
  if (metric.resultCount != null) {
    params.set("result_count", String(metric.resultCount));
  }
  if (metric.depth != null) params.set("depth", String(metric.depth));
  if (metric.value) params.set("value", metric.value);

  return `${METRICS_ENDPOINT}?${params.toString()}`;
}

function sendMetric(metric: NormalizedAnalyticsEvent) {
  const state = getState();
  if (!isWithinClientRateLimit(state)) return;

  const url = buildMetricsUrl(metric);
  let sent = false;
  if (typeof navigator.sendBeacon === "function") {
    sent = navigator.sendBeacon(url);
  }

  if (!sent) {
    void fetch(url, {
      method: "POST",
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Analytics must never interrupt the reading experience.
    });
  }

  try {
    if (window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1") {
      console.info("[analytics]", metric);
    }
  } catch {
    // Debug logging is optional when storage is unavailable.
  }
}

export function trackAnalyticsEvent(input: AnalyticsMetricInput): boolean {
  if (typeof window === "undefined") return false;
  const metric = normalizeAnalyticsEvent(input, {
    path: window.location.pathname,
    session: getState().sessionId,
  });
  if (!metric) return false;
  sendMetric(metric);
  return true;
}

function getVisiblePageDepth(): number {
  const pageHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  );
  if (pageHeight <= 0) return 0;
  return Math.min(100, ((window.scrollY + window.innerHeight) / pageHeight) * 100);
}

function reportArticleDepth() {
  const state = getState();
  state.scrollFrame = null;
  if (!state.activeArticlePath) return;

  const visibleDepth = getVisiblePageDepth();
  for (const depth of ARTICLE_DEPTHS) {
    if (visibleDepth < depth || state.articleDepths.has(depth)) continue;
    state.articleDepths.add(depth);
    trackAnalyticsEvent({
      event: "article_read",
      path: state.activeArticlePath,
      depth,
    });
  }
}

function scheduleArticleDepthCheck() {
  const state = getState();
  if (state.scrollFrame != null) return;
  state.scrollFrame = window.requestAnimationFrame(reportArticleDepth);
}

function describeClientError(event: ErrorEvent | PromiseRejectionEvent): string {
  if (event instanceof ErrorEvent) {
    if (event.error instanceof Error && event.error.name) {
      return CLIENT_ERROR_NAMES.has(event.error.name)
        ? event.error.name
        : "custom_error";
    }
    return "window_error";
  }

  if (event.reason instanceof Error && event.reason.name) {
    return CLIENT_ERROR_NAMES.has(event.reason.name)
      ? event.reason.name
      : "custom_error";
  }
  return "unhandled_rejection";
}

function reportClientError(event: ErrorEvent | PromiseRejectionEvent) {
  const state = getState();
  if (state.clientErrorCount >= MAX_CLIENT_ERRORS_PER_SESSION) return;
  state.clientErrorCount += 1;
  trackAnalyticsEvent({
    event: "client_error",
    value: describeClientError(event),
  });
}

function installGlobalListeners() {
  const state = getState();
  if (state.installed) return;
  state.installed = true;

  window.addEventListener("scroll", scheduleArticleDepthCheck, {
    passive: true,
  });
  window.addEventListener("resize", scheduleArticleDepthCheck, {
    passive: true,
  });
  window.addEventListener("error", reportClientError);
  window.addEventListener("unhandledrejection", reportClientError);
}

export function installAnalytics() {
  installGlobalListeners();

  const state = getState();
  const path = normalizeMetricPath(window.location.pathname);
  const main = document.querySelector<HTMLElement>("main[data-analytics-page-kind]");
  if (!path || !main) {
    state.activeArticlePath = null;
    return;
  }
  if (path === DASHBOARD_PATH) {
    state.lastPagePath = path;
    state.activeArticlePath = null;
    return;
  }

  if (!shouldTrackPageView(state.lastPagePath, path)) {
    scheduleArticleDepthCheck();
    return;
  }

  state.lastPagePath = path;
  state.articleDepths = new Set();
  const pageKind = main.dataset.analyticsPageKind;
  state.activeArticlePath = pageKind === "article" ? path : null;

  trackAnalyticsEvent({
    event: "page_view",
    path,
    value: pageKind === "article" ? "article" : undefined,
  });

  if (pageKind === "not-found") {
    trackAnalyticsEvent({ event: "not_found", path });
  }

  scheduleArticleDepthCheck();
}
