#!/usr/bin/env python3
"""Aggregate anonymous passpot Nginx JSONL events into one dashboard JSON."""

from __future__ import annotations

import argparse
import gzip
import grp
import json
import math
import os
import re
import tempfile
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone, tzinfo
from pathlib import Path
from typing import Any, Iterable, Iterator, Mapping
from urllib.parse import unquote_plus

EVENT_NAMES = {
    "page_view",
    "article_read",
    "search_success",
    "search_no_results",
    "search_error",
    "music_play",
    "watch_interaction",
    "not_found",
    "client_error",
}
ARTICLE_DEPTHS = (25, 50, 75, 100)
SESSION_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
CONTROL_PATTERN = re.compile(r"[\x00-\x1f\x7f]")
DEFAULT_LOG_GLOB = "/var/log/nginx/passpot-metrics.log*"
DEFAULT_OUTPUT = "/var/lib/passpot/metrics.json"
SITE_TIMEZONES = {
    "Asia/Shanghai": timezone(timedelta(hours=8), "Asia/Shanghai"),
    "UTC": timezone.utc,
}


def decode_argument(value: Any, maximum_encoded_length: int = 1024) -> str | None:
    if not isinstance(value, str) or len(value) > maximum_encoded_length:
        return None
    try:
        return unquote_plus(value, encoding="utf-8", errors="strict")
    except (UnicodeDecodeError, ValueError):
        return None


def normalize_path(value: Any) -> str | None:
    decoded = decode_argument(value)
    if decoded is None:
        return None
    path = decoded.split("?", 1)[0].split("#", 1)[0]
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]
    if (
        not path.startswith("/")
        or len(path) > 256
        or CONTROL_PATTERN.search(path)
    ):
        return None
    return path


def normalize_query(value: Any) -> str | None:
    decoded = decode_argument(value, maximum_encoded_length=512)
    if decoded is None:
        return None
    normalized = " ".join(decoded.split())[:64]
    return normalized or None


def normalize_value(value: Any) -> str | None:
    decoded = decode_argument(value, maximum_encoded_length=256)
    if decoded is None:
        return None
    normalized = " ".join(decoded.split())[:64]
    return normalized or None


def normalize_integer(
    value: Any, minimum: int, maximum: int
) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        parsed = value
    elif isinstance(value, str) and value.isascii() and value.isdigit():
        parsed = int(value)
    else:
        return None
    return parsed if minimum <= parsed <= maximum else None


def parse_timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str) or len(value) > 40:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed


def normalize_event(record: Any) -> dict[str, Any] | None:
    if not isinstance(record, Mapping):
        return None

    event = record.get("event")
    if event not in EVENT_NAMES:
        return None

    timestamp = parse_timestamp(record.get("time"))
    path = normalize_path(record.get("path"))
    session = decode_argument(record.get("session"), maximum_encoded_length=128)
    if (
        timestamp is None
        or path is None
        or path == "/dashboard"
        or session is None
        or SESSION_PATTERN.fullmatch(session) is None
    ):
        return None

    normalized: dict[str, Any] = {
        "time": timestamp,
        "event": event,
        "path": path,
        "session": session,
    }

    if event == "article_read":
        depth = normalize_integer(record.get("depth"), 25, 100)
        if depth not in ARTICLE_DEPTHS:
            return None
        normalized["depth"] = depth

    if event in {"search_success", "search_no_results"}:
        duration = normalize_integer(record.get("durationMs"), 0, 120_000)
        result_count = normalize_integer(record.get("resultCount"), 0, 10_000)
        if duration is not None:
            normalized["durationMs"] = duration
        if result_count is not None:
            normalized["resultCount"] = result_count

    if event == "search_no_results":
        query = normalize_query(record.get("query"))
        if query is None:
            return None
        normalized["query"] = query
        normalized["resultCount"] = 0

    value = normalize_value(record.get("value"))
    if value is not None:
        normalized["value"] = value

    return normalized


def iter_jsonl(paths: Iterable[Path]) -> Iterator[Any]:
    for path in sorted(set(paths), key=lambda item: str(item)):
        if not path.is_file():
            continue
        opener = gzip.open if path.suffix == ".gz" else open
        try:
            with opener(path, "rt", encoding="utf-8", errors="replace") as stream:
                for line in stream:
                    try:
                        yield json.loads(line)
                    except (json.JSONDecodeError, TypeError):
                        continue
        except (OSError, EOFError):
            continue


def percentile(values: list[int], fraction: float) -> int:
    if not values:
        return 0
    ordered = sorted(values)
    index = max(0, math.ceil(len(ordered) * fraction) - 1)
    return ordered[index]


def counter_rows(
    counter: Counter[str], key: str, limit: int = 10
) -> list[dict[str, Any]]:
    return [
        {key: name, "count": count}
        for name, count in counter.most_common(limit)
    ]


def percentage(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100, 1)


def aggregate_records(
    records: Iterable[Any],
    *,
    now: datetime,
    period_days: int = 30,
    site_timezone: tzinfo,
) -> dict[str, Any]:
    local_now = now.astimezone(site_timezone)
    first_date = local_now.date() - timedelta(days=period_days - 1)
    window_start = datetime.combine(
        first_date, datetime.min.time(), tzinfo=site_timezone
    )

    page_views = 0
    article_page_views = 0
    searches = 0
    search_successes = 0
    no_result_searches = 0
    search_errors = 0
    not_found = 0
    client_errors = 0
    sessions: set[str] = set()
    top_pages: Counter[str] = Counter()
    top_no_result_queries: Counter[str] = Counter()
    top_not_found_paths: Counter[str] = Counter()
    top_client_errors: Counter[str] = Counter()
    reading_depth: Counter[int] = Counter()
    search_durations: list[int] = []
    daily_page_views: Counter[str] = Counter()
    daily_searches: Counter[str] = Counter()
    daily_no_results: Counter[str] = Counter()
    daily_sessions: defaultdict[str, set[str]] = defaultdict(set)

    for raw_record in records:
        record = normalize_event(raw_record)
        if record is None:
            continue

        event_time = record["time"].astimezone(site_timezone)
        if event_time < window_start or event_time > local_now:
            continue
        date_key = event_time.date().isoformat()
        event = record["event"]

        if event == "page_view":
            page_views += 1
            sessions.add(record["session"])
            top_pages[record["path"]] += 1
            daily_page_views[date_key] += 1
            daily_sessions[date_key].add(record["session"])
            if record.get("value") == "article":
                article_page_views += 1
        elif event == "article_read":
            reading_depth[record["depth"]] += 1
        elif event in {
            "search_success",
            "search_no_results",
            "search_error",
        }:
            searches += 1
            daily_searches[date_key] += 1
            if event == "search_success":
                search_successes += 1
            elif event == "search_no_results":
                no_result_searches += 1
                daily_no_results[date_key] += 1
                top_no_result_queries[record["query"]] += 1
            else:
                search_errors += 1
            if "durationMs" in record:
                search_durations.append(record["durationMs"])
        elif event == "not_found":
            not_found += 1
            top_not_found_paths[record["path"]] += 1
        elif event == "client_error":
            client_errors += 1
            top_client_errors[record.get("value", "unknown")] += 1

    daily_trend = []
    for offset in range(period_days):
        date_key = (first_date + timedelta(days=offset)).isoformat()
        daily_trend.append(
            {
                "date": date_key,
                "pageViews": daily_page_views[date_key],
                "sessions": len(daily_sessions[date_key]),
                "searches": daily_searches[date_key],
                "noResultSearches": daily_no_results[date_key],
            }
        )

    depth_rows = [
        {
            "depth": depth,
            "count": reading_depth[depth],
            "rate": percentage(reading_depth[depth], article_page_views),
        }
        for depth in ARTICLE_DEPTHS
    ]

    return {
        "version": 1,
        "generatedAt": now.astimezone(timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z"),
        "periodDays": period_days,
        "windowStart": window_start.isoformat(timespec="seconds"),
        "pageViews": page_views,
        "sessions": len(sessions),
        "searches": searches,
        "searchSuccesses": search_successes,
        "noResultSearches": no_result_searches,
        "searchErrors": search_errors,
        "searchSuccessRate": percentage(search_successes, searches),
        "noResultRate": percentage(no_result_searches, searches),
        "topPages": counter_rows(top_pages, "path"),
        "topNoResultQueries": counter_rows(
            top_no_result_queries, "query", limit=20
        ),
        "dailyTrend": daily_trend,
        "readingDepth": {
            "articlePageViews": article_page_views,
            "completedReads": reading_depth[100],
            "completionRate": percentage(
                reading_depth[100], article_page_views
            ),
            "byDepth": depth_rows,
        },
        "searchDurationMs": {
            "average": (
                round(sum(search_durations) / len(search_durations))
                if search_durations
                else 0
            ),
            "p50": percentile(search_durations, 0.5),
            "p95": percentile(search_durations, 0.95),
        },
        "notFound": {
            "total": not_found,
            "topPaths": counter_rows(top_not_found_paths, "path"),
        },
        "clientErrors": {
            "total": client_errors,
            "topValues": counter_rows(top_client_errors, "value"),
        },
    }


def expand_log_globs(patterns: Iterable[str]) -> list[Path]:
    paths: set[Path] = set()
    for pattern in patterns:
        pattern_path = Path(pattern)
        paths.update(pattern_path.parent.glob(pattern_path.name))
    return sorted(paths, key=lambda item: str(item))


def write_atomic(
    payload: Mapping[str, Any],
    output_path: Path,
    *,
    group: str | None = None,
) -> None:
    parent_existed = output_path.parent.exists()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if not parent_existed:
        output_path.parent.chmod(0o750)

    group_id = grp.getgrnam(group).gr_gid if group else -1
    temporary_name = ""
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8",
            dir=output_path.parent,
            prefix=f".{output_path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary:
            temporary_name = temporary.name
            json.dump(
                payload,
                temporary,
                ensure_ascii=False,
                indent=2,
                sort_keys=False,
            )
            temporary.write("\n")
            temporary.flush()
            os.fsync(temporary.fileno())

        os.chmod(temporary_name, 0o640)
        if group:
            os.chown(temporary_name, -1, group_id)
        os.replace(temporary_name, output_path)
    finally:
        if temporary_name and os.path.exists(temporary_name):
            os.unlink(temporary_name)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--log-glob",
        action="append",
        default=[],
        help=f"JSONL log glob; repeatable (default: {DEFAULT_LOG_GLOB})",
    )
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument("--period-days", type=int, default=30)
    parser.add_argument("--timezone", default="Asia/Shanghai")
    parser.add_argument(
        "--group",
        help="Set the output file group, for example www-data",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if not 1 <= args.period_days <= 366:
        raise SystemExit("--period-days must be between 1 and 366")

    patterns = args.log_glob or [DEFAULT_LOG_GLOB]
    paths = expand_log_globs(patterns)
    site_timezone = SITE_TIMEZONES.get(args.timezone)
    if site_timezone is None:
        raise SystemExit(
            f"unsupported --timezone: {args.timezone}; "
            f"choose one of {', '.join(SITE_TIMEZONES)}"
        )

    payload = aggregate_records(
        iter_jsonl(paths),
        now=datetime.now(timezone.utc),
        period_days=args.period_days,
        site_timezone=site_timezone,
    )
    write_atomic(payload, Path(args.output), group=args.group)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
