# Anonymous Analytics

This document defines the anonymous analytics pipeline shared by the browser,
Nginx, the standard-library Python aggregator, and the private static
Dashboard.

## Architecture

The public site remains fully static:

1. `src/scripts/runtime/analytics.ts` sends bounded anonymous events to
   `POST /__metrics`.
2. Nginx returns `204` and writes selected query arguments as one JSON object
   per line in `/var/log/nginx/passpot-metrics.log`.
3. `scripts/analytics/aggregate_metrics.py` reads the current and rotated
   JSONL/JSONL `.gz` files, validates every record, and aggregates the most
   recent 30 calendar days.
4. Cron atomically replaces `/var/lib/passpot/metrics.json` every ten minutes.
5. The static `/dashboard` page fetches `/dashboard/metrics.json`, an exact
   Nginx alias protected by Basic Auth.

There is no database, server-side application runtime, resident Node process,
or third-party analytics identity.

## Privacy Boundary

- No IP is written to the metrics log. Nginx uses the address only as the
  in-memory `limit_req` key.
- User-Agent, Cookie, full referrer, and device fingerprints are not collected.
- `session` is a random ID in `sessionStorage`. It ends with the browser tab and
  is not designed as a person or cross-device identity.
- The UI calls this value an “访问会话”, never an exact unique visitor.
- Raw search text leaves the browser only for `search_no_results`. Whitespace is
  normalized and text is truncated to 64 characters in both browser and
  aggregator validation.
- Successful searches send only final visible result count and duration.
- Client errors send a bounded error class such as `TypeError`, never the full
  message or stack.
- `/dashboard` produces no analytics events and is excluded from sitemap and
  Pagefind content.
- Raw logs default to 30 daily rotations.

## Event Contract

Every request is an empty POST. Fields are encoded with `URLSearchParams`:

- `event`
- `path`
- `session`
- `query`
- `duration_ms`
- `result_count`
- `depth`
- `value`

Accepted events:

- `page_view`: one per actual route entry; `value=article` marks article views.
- `article_read`: at most one event for each of 25, 50, 75, and 100 percent per
  article route entry.
- `search_success`: one final event when visible result count is positive.
- `search_no_results`: one final event when visible result count is zero; this
  is the only event that contains `query`.
- `search_error`: one final event for initialization or query failure.
- `not_found`: emitted on the marked static 404 page.
- `client_error`: capped at five per tab session and limited to error class.
- `music_play` and `watch_interaction`: reserved in the validated contract for
  later producers; the initial implementation does not emit them.

The browser caps all accepted events at 20 per rolling minute per tab, under the
server limit of 30 requests per minute plus burst. Scroll listening is passive
and only checks the four fixed reading thresholds; it does not upload continuous
scroll positions.

## Browser Lifecycle

`GlobalRuntime.astro` calls `installAnalytics()` on initial load and
`astro:page-load`. Global listeners have a window-level guard. Consecutive
delivery for the same normalized path does not repeat `page_view`, while real
navigation to a different route and later return does.

`BaseLayout.astro` places `data-analytics-page-kind` on `main`. The presence of
article SEO context resolves to `article`; `404.astro` explicitly uses
`not-found`; other pages use `default`.

`pot-search-debug=1` remains an optional localStorage development switch. It
prints the final sanitized event object. Analytics data itself is never written
to localStorage.

## Aggregation Contract

The Python script:

- reads `/var/log/nginx/passpot-metrics.log*`, including `.gz` files;
- decodes URL-encoded Nginx argument values;
- ignores malformed JSON, unknown events, invalid timestamps, missing/invalid
  sessions, Dashboard events, paths over 256 characters, queries over 64
  characters after normalization, and invalid required depths;
- ignores invalid optional numeric fields outside their allowed ranges;
- uses an Asia/Shanghai 30-calendar-day window by default;
- writes UTF-8 JSON through a temporary file, `fsync`, permission update, and
  `os.replace`.

The aggregate contains generation time and period; page views and访问会话;
search outcomes, rates, and duration average/P50/P95; popular pages and
no-result queries; zero-filled daily rows; reading depth and completion rate;
and 404/client-error summaries.

The script uses only the Python standard library.

## Server Operations

All copyable server snippets and manual commands are under
`ops/passpot-metrics/`. The canonical paths are:

- raw log: `/var/log/nginx/passpot-metrics.log`
- installed aggregator: `/usr/local/lib/passpot/aggregate_metrics.py`
- aggregate: `/var/lib/passpot/metrics.json`
- cron: `/etc/cron.d/passpot-metrics`
- Basic Auth file: `/etc/nginx/.htpasswd-dashboard`

Never place the aggregate under `/var/www/passpot`; deployment uses
`rsync --delete`.

## Tests

- `tests/analytics.test.ts` covers browser-side normalization, whitelist,
  privacy rules, final search outcome selection, and page-load deduplication.
- `tests/test_aggregate_metrics.py` and the JSONL fixture cover invalid records,
  URL decoding, the 30-day window, aggregation, gzip rotation, and atomic
  output.
- `npm test` runs both suites.
