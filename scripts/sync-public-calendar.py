#!/usr/bin/env python3
"""Copy only the anonymous public School Master calendar into a static JSON feed.
No admin sessions, MCP tokens, user accounts, or private lesson events are used.
"""
import argparse
from datetime import datetime
from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

SOURCE = 'https://academy.alva.club/event-calendar'
ZONE = ZoneInfo('Europe/Moscow')


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.ignore = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.ignore += 1
        if tag in ('p', 'br', 'div', 'li'): self.parts.append(' ')
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.ignore: self.ignore -= 1
    def handle_data(self, text):
        if not self.ignore: self.parts.append(text)


def plain(value, limit=1000):
    parser = TextOnly(); parser.feed(str(value or ''))
    return re.sub(r'\s+', ' ', ''.join(parser.parts)).strip()[:limit]


def extract_array(page, name):
    for script in re.findall(r'<script\b[^>]*>(.*?)</script>', page, re.S | re.I):
        if 'new CalendarWidget(' not in script: continue
        match = re.search(r'\bconst\s+' + re.escape(name) + r'\s*=\s*', script)
        if not match: continue
        value, _ = json.JSONDecoder().raw_decode(script[match.end():].lstrip())
        if isinstance(value, list): return value
    raise ValueError('Calendar JSON array not found: ' + name)


def category(title):
    value = title.lower()
    for words, kind in [(('первый шаг', 'первого шага'), 'firststep'), (('энийог', 'йог'), 'eniyoga'), (('круг',), 'circle'), (('школ', 'ступен'), 'school'), (('открыт', 'эфир', 'вебинар', 'марафон'), 'open')]:
        if any(word in value for word in words): return kind
    return 'other'


def normalize(page):
    if 'Вы вошли под администратором' in page:
        raise ValueError('Refusing an authenticated administrator calendar')
    raw_events = extract_array(page, 'events')
    tags = {str(t.get('id')): plain(t.get('title'), 100) for t in extract_array(page, 'tags') if isinstance(t, dict)}
    result = []
    for event in raw_events:
        if not isinstance(event, dict) or 'isLessonOpenEvent' in event: continue
        if event.get('status', 1) not in (1, '1', True): continue
        if any(event.get(field) for field in ('groups', 'access_groups', 'access_group', 'memberships', 'access_planes')): continue
        title = plain(event.get('title'), 250)
        if not title: continue
        try: start = datetime.strptime(str(event.get('date', '')), '%d.%m.%Y %H:%M').replace(tzinfo=ZONE)
        except ValueError: continue
        tag = tags.get(str(event.get('tag_id')), '')
        result.append({'id': 'sm-' + sha256((str(event.get('id', '')) + title + start.isoformat()).encode()).hexdigest()[:16], 'title': title, 'start': start.isoformat(), 'category': category(tag + ' ' + title), 'description': plain(event.get('text'), 700), 'url': SOURCE, 'actionLabel': 'Открыть в календаре школы', 'public': True, 'status': 'published'})
    return sorted(result, key=lambda e: e['start'])


def download():
    error = None
    for attempt in range(3):
        try:
            request = Request(SOURCE, headers={'User-Agent': 'AlvaPublicCalendar/1.0', 'Accept': 'text/html'})
            with urlopen(request, timeout=10) as response:
                actual = urlsplit(response.url)
                if actual.scheme != 'https' or actual.hostname != 'academy.alva.club': raise ValueError('Unexpected calendar redirect')
                content = response.read(4_000_001)
                if len(content) > 4_000_000: raise ValueError('Calendar response is too large')
                return content.decode('utf-8')
        except Exception as exc:
            error = exc
            if attempt < 2: time.sleep(.5)
    raise error


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        events = normalize(download())
        data = {'version': 1, 'source': SOURCE, 'updatedAt': datetime.now(ZONE).isoformat(timespec='seconds'), 'timezone': 'Europe/Moscow', 'events': events}
        args.output.parent.mkdir(parents=True, exist_ok=True)
        temporary = args.output.with_name(args.output.name + '.tmp')
        temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        os.chmod(temporary, 0o640); os.replace(temporary, args.output)
        print('Public calendar updated:', len(events), 'events')
    except Exception as exc:
        # Keep the last successful feed on network or schema failures.
        print('Calendar sync failed; previous feed retained:', type(exc).__name__, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
