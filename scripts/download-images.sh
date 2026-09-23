#!/bin/sh
# Скачивает все картинки с telegra.ph в папку images/tg/ и переключает
# страницы на локальные копии. Запускать один раз из папки сайта:
#   sh download-images.sh
set -e
mkdir -p images/tg
for u in $(grep -oh 'https://telegra.ph/file/[a-z0-9]*\.\(jpg\|png\)' *.html | sort -u); do
  f="images/tg/$(basename "$u")"
  [ -f "$f" ] || curl -sSL -o "$f" "$u" && echo "ok  $f"
done
for h in *.html; do
  sed -i.bak 's#https://telegra.ph/file/#images/tg/#g' "$h" && rm -f "$h.bak"
done
echo "Готово: картинки в images/tg/, ссылки в HTML заменены на локальные."
