import contextlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('public_calendar', Path(__file__).resolve().parents[1] / 'scripts/sync-public-calendar.py')
SYNC = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SYNC)


def page(events, tags=None):
    return '<script>const events = ' + json.dumps(events).replace('</', '<\\/') + '; const tags = ' + json.dumps(tags or []) + '; new CalendarWidget(1, events, tags, true);</script>'


class PublicCalendarTests(unittest.TestCase):
    def test_only_anonymous_public_events_are_exported(self):
        event = {'id': 1, 'title': '<b>Круг</b>', 'date': '21.10.2026 18:00', 'text': '<p>Встреча</p><script>secret()</script>', 'tag_id': 2}
        result = SYNC.normalize(page([event, dict(event, id=2, groups=[99]), dict(event, id=3, isLessonOpenEvent=True), dict(event, id=4, status=0), dict(event, id=5, date='invalid')], [{'id': 2, 'title': 'Круги'}]))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['title'], 'Круг')
        self.assertEqual(result[0]['description'], 'Встреча')
        self.assertEqual(result[0]['category'], 'circle')
        self.assertEqual(result[0]['start'], '2026-10-21T18:00:00+03:00')
        self.assertNotIn('groups', result[0])

    def test_admin_calendar_is_rejected(self):
        with self.assertRaises(ValueError):
            SYNC.normalize('Вы вошли под администратором' + page([]))

    def test_changed_platform_schema_is_not_treated_as_empty(self):
        with self.assertRaises(ValueError):
            SYNC.normalize('<html>Maintenance</html>')

    def test_network_failure_keeps_previous_feed(self):
        with tempfile.TemporaryDirectory() as folder:
            dest = Path(folder) / 'calendar.json'
            dest.write_text('{"previous":true}')
            with patch.object(SYNC, 'download', side_effect=OSError), patch.object(sys, 'argv', ['sync', '--output', str(dest)]), contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(SYNC.main(), 1)
            self.assertEqual(dest.read_text(), '{"previous":true}')

    def test_success_writes_versioned_feed(self):
        with tempfile.TemporaryDirectory() as folder:
            dest = Path(folder) / 'calendar.json'
            with patch.object(SYNC, 'download', return_value=page([])), patch.object(sys, 'argv', ['sync', '--output', str(dest)]), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(SYNC.main(), 0)
            data = json.loads(dest.read_text())
            self.assertEqual(data['version'], 1)
            self.assertEqual(data['events'], [])
            self.assertEqual(dest.stat().st_mode & 0o777, 0o640)


if __name__ == '__main__':
    unittest.main()
