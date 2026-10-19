#!/bin/sh
# Install the anonymous public-calendar reader outside the web root.
# Run after publishing the schedule page. No MCP token or admin cookie is needed.
set -eu
TASK_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ALVA_HOST=alva@85.198.108.229
ssh "$ALVA_HOST" 'mkdir -p /home/alva/site-tools /home/alva/site-backups'
rsync -rlt "$TASK_ROOT/scripts/sync-public-calendar.py" "$ALVA_HOST:/home/alva/site-tools/sync-public-calendar.py"
ssh "$ALVA_HOST" 'chmod 750 /home/alva/site-tools/sync-public-calendar.py && python3 /home/alva/site-tools/sync-public-calendar.py --output /var/www/alva.club/data/calendar.json'
ssh "$ALVA_HOST" "python3 - <<'PY'
import subprocess
result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
if result.returncode not in (0, 1):
    raise SystemExit('Cannot read crontab')
lines = [line for line in result.stdout.splitlines() if '# ALVA_PUBLIC_CALENDAR' not in line]
lines.append('*/5 * * * * /usr/bin/python3 /home/alva/site-tools/sync-public-calendar.py --output /var/www/alva.club/data/calendar.json >> /home/alva/site-backups/calendar-sync.log 2>&1 # ALVA_PUBLIC_CALENDAR')
subprocess.run(['crontab', '-'], input='\n'.join(lines) + '\n', text=True, check=True)
print('Public calendar sync installed: every 5 minutes')
PY"
