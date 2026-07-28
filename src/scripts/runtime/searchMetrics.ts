const SEARCH_METRICS_STORAGE_KEY = "pot-search-metrics-v1";

interface SearchMetricRecord {
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
}
interface SearchMetricStore {
  version: 1;
  total: number;
  byEvent: Record<string, number>;
  noResultQueries: string[];
  errors: string[];
  recent: SearchMetricRecord[];
  updatedAt: number;
}

type SearchMetricApi = {
  read: () => SearchMetricStore;
  clear: () => void;
};

type MetricsWindow = Window & {
  __potSearchMetricsInstalled?: boolean;
  __potSearchMetrics?: SearchMetricApi;
};

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

function createEmptyMetricStore(): SearchMetricStore {
  return {
    version: 1,
    total: 0,
    byEvent: {},
    noResultQueries: [],
    errors: [],
    recent: [],
    updatedAt: Date.now(),
  };
}

function readMetricStore(): SearchMetricStore {
  const raw = window.localStorage.getItem(SEARCH_METRICS_STORAGE_KEY);
  if (!raw) return createEmptyMetricStore();

  try {
    const parsed = JSON.parse(raw) as Partial<SearchMetricStore>;
    return {
      ...createEmptyMetricStore(),
      ...parsed,
      byEvent: parsed.byEvent || {},
      noResultQueries: parsed.noResultQueries || [],
      errors: parsed.errors || [],
      recent: parsed.recent || [],
    };
  } catch {
    return createEmptyMetricStore();
  }
}

function writeMetricStore(store: SearchMetricStore) {
  window.localStorage.setItem(
    SEARCH_METRICS_STORAGE_KEY,
    JSON.stringify(store),
  );
}

function pushUnique(items: string[], value: string, max: number) {
  const next = [value, ...items.filter((item) => item !== value)];
  return next.slice(0, max);
}

export function installSearchMetrics() {
  const metricsWindow = window as MetricsWindow;
  if (metricsWindow.__potSearchMetricsInstalled) return;
  metricsWindow.__potSearchMetricsInstalled = true;

  metricsWindow.__potSearchMetrics = {
    read: () => readMetricStore(),
    clear: () => writeMetricStore(createEmptyMetricStore()),
  };

  window.addEventListener("pot:search-metric", (event: Event) => {
    const customEvent = event as CustomEvent<SearchMetricRecord>;
    const detail = customEvent.detail;
    if (!detail || !detail.event) return;

    const store = readMetricStore();
    store.total += 1;
    store.byEvent[detail.event] = (store.byEvent[detail.event] || 0) + 1;
    store.updatedAt = Date.now();

    const query =
      typeof detail.payload?.query === "string"
        ? detail.payload.query.trim()
        : "";

    if (detail.event === "search_no_results" && query) {
      store.noResultQueries = pushUnique(
        store.noResultQueries,
        query,
        30,
      );
    }

    if (detail.event === "search_error") {
      const reason =
        typeof detail.payload?.reason === "string"
          ? detail.payload.reason
          : "unknown_error";
      store.errors = pushUnique(store.errors, reason, 20);
    }

    store.recent = [detail, ...store.recent].slice(0, 50);
    writeMetricStore(store);

    if (window.localStorage.getItem("pot-search-debug") === "1") {
      console.info("[search-metrics-store]", store);
    }
  });
}
