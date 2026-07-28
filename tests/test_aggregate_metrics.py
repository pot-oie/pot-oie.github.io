import gzip
import importlib.util
import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "analytics" / "aggregate_metrics.py"
SPEC = importlib.util.spec_from_file_location("aggregate_metrics", MODULE_PATH)
assert SPEC and SPEC.loader
aggregate_metrics = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(aggregate_metrics)
SHANGHAI = timezone(timedelta(hours=8), "Asia/Shanghai")


class AggregateMetricsTest(unittest.TestCase):
    def test_fixture_aggregation_and_invalid_record_filtering(self):
        fixture = (
            ROOT / "tests" / "fixtures" / "metrics" / "passpot-metrics.log"
        )
        payload = aggregate_metrics.aggregate_records(
            aggregate_metrics.iter_jsonl([fixture]),
            now=datetime.fromisoformat("2026-07-29T12:00:00+08:00"),
            period_days=30,
            site_timezone=SHANGHAI,
        )

        self.assertEqual(payload["pageViews"], 3)
        self.assertEqual(payload["sessions"], 2)
        self.assertEqual(payload["searches"], 3)
        self.assertEqual(payload["searchSuccesses"], 1)
        self.assertEqual(payload["noResultSearches"], 1)
        self.assertEqual(payload["searchErrors"], 1)
        self.assertEqual(payload["topPages"][0], {
            "path": "/blog/example",
            "count": 1,
        })
        self.assertEqual(payload["topNoResultQueries"][0], {
            "query": "graph neural network",
            "count": 1,
        })
        self.assertEqual(payload["readingDepth"]["articlePageViews"], 2)
        self.assertEqual(payload["readingDepth"]["completedReads"], 1)
        self.assertEqual(payload["readingDepth"]["completionRate"], 50.0)
        self.assertEqual(payload["searchDurationMs"], {
            "average": 200,
            "p50": 100,
            "p95": 300,
        })
        self.assertEqual(payload["notFound"]["total"], 1)
        self.assertEqual(payload["clientErrors"]["total"], 1)
        self.assertEqual(len(payload["dailyTrend"]), 30)

    def test_reads_rotated_gzip_and_writes_atomically(self):
        record = {
            "time": "2026-07-27T10:00:00+08:00",
            "event": "page_view",
            "path": "%2Fmusic",
            "session": "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
            "query": "",
            "durationMs": "",
            "resultCount": "",
            "depth": "",
            "value": "",
        }

        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            rotated = root / "passpot-metrics.log.2.gz"
            with gzip.open(rotated, "wt", encoding="utf-8") as stream:
                stream.write(json.dumps(record) + "\n")

            payload = aggregate_metrics.aggregate_records(
                aggregate_metrics.iter_jsonl([rotated]),
                now=datetime.fromisoformat("2026-07-29T12:00:00+08:00"),
                period_days=30,
                site_timezone=SHANGHAI,
            )
            output = root / "var" / "metrics.json"
            aggregate_metrics.write_atomic(payload, output)

            self.assertEqual(json.loads(output.read_text())["pageViews"], 1)
            self.assertEqual(output.stat().st_mode & 0o777, 0o640)
            self.assertFalse(list(output.parent.glob("*.tmp")))


if __name__ == "__main__":
    unittest.main()
