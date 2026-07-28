# Passpot Metrics Server Setup

These files are reference configuration for manual installation over VS Code
SSH. They are not part of the static-site deployment and do not connect to or
modify the server automatically.

## Files

- `nginx-http.conf`: event-only JSONL log format and in-memory IP rate limit.
- `nginx-server.conf`: the write-only event endpoint and Basic Auth-protected
  aggregate JSON endpoint.
- `passpot-metrics.cron`: aggregation every ten minutes.
- `nginx-logrotate.conf`: 30 daily rotations for Nginx logs.
- `scripts/analytics/aggregate_metrics.py`: the standard-library aggregator
  installed separately from `dist/`.

The aggregate must stay at `/var/lib/passpot/metrics.json`. The GitHub Actions
deployment uses `rsync --delete` on `/var/www/passpot`, so placing the file
inside the static deployment directory would delete it.

## Manual installation

Run these commands from a checked-out copy of the repository on the server, or
copy the referenced files to equivalent paths:

```sh
sudo install -d -o root -g www-data -m 0750 /var/lib/passpot
sudo install -d -o root -g root -m 0755 /usr/local/lib/passpot
sudo install -o root -g root -m 0755 \
  scripts/analytics/aggregate_metrics.py \
  /usr/local/lib/passpot/aggregate_metrics.py
sudo install -o root -g root -m 0644 \
  ops/passpot-metrics/passpot-metrics.cron \
  /etc/cron.d/passpot-metrics
```

Generate the first aggregate before enabling the JSON route:

```sh
sudo /usr/bin/python3 /usr/local/lib/passpot/aggregate_metrics.py \
  --log-glob '/var/log/nginx/passpot-metrics.log*' \
  --output /var/lib/passpot/metrics.json \
  --period-days 30 \
  --timezone Asia/Shanghai \
  --group www-data
sudo -u www-data test -r /var/lib/passpot/metrics.json
```

Copy the directives in `nginx-http.conf` and `nginx-server.conf` into their
documented scopes. The collector location already in production can remain
unchanged. The exact `/dashboard/metrics.json` location must be added even when
the Dashboard HTML is already protected, so the aggregate cannot be fetched
without Basic Auth.

Then validate and reload:

```sh
sudo nginx -t
sudo systemctl reload nginx
curl -i -u 'DASHBOARD_USER:DASHBOARD_PASSWORD' \
  https://passpot.cn/dashboard/metrics.json
```

## Log rotation and retention

Ubuntu's packaged `/etc/logrotate.d/nginx` normally matches
`/var/log/nginx/*.log`, which already includes `passpot-metrics.log`. Do not add
a second logrotate stanza for the same file. Replace the existing stanza with
`nginx-logrotate.conf`, or minimally change its existing `rotate` value to `30`
while retaining the distro's `prerotate` and `postrotate` hooks. This keeps 30
daily raw files; the aggregator reads the current file plus plain and `.gz`
rotations.

Changing the wildcard stanza to the supplied configuration also retains every
other Nginx `*.log` for 30 rotations. If that is undesirable, list the
non-metrics logs explicitly in the distro stanza and place
`/var/log/nginx/passpot-metrics.log` in its own equivalent stanza.

Validate the installed configuration without rotating immediately:

```sh
sudo logrotate --debug /etc/logrotate.d/nginx
```

## Operational checks

```sh
sudo tail -n 5 /var/log/nginx/passpot-metrics.log
sudo journalctl -u cron --since '30 minutes ago'
sudo stat /var/lib/passpot/metrics.json
```

The JSON file should update within ten minutes. The Dashboard displays a stale
warning when `generatedAt` is more than two hours old.
